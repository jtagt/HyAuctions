const config = require('./config.json');

const _ = require('lodash');

const Database = require('./storage/Mongo');
const db = new Database();

const Auction = require('./types/Auction');
const Queue = require('./utils/Queue');

const Hypixel = require('./HypixelAPI');
const hypixel = new Hypixel();

const express = require('express');
const AWS = require('aws-sdk');
const elasticsearch = require('elasticsearch');
const awsHttpClient = require('http-aws-es');

const StatsUtils = require('./utils/StatsUtils');
const stats = new StatsUtils();

const app = express();

const auctionEndQueue = new Queue(config.auctionQueueUrl, config.accessKeyId, config.secretAccessKey, 'us-east-2');
const auctionUpdateQueue = new Queue(config.auctionUpdateQueueUrl, config.accessKeyId, config.secretAccessKey, 'us-east-2');

const client = new elasticsearch.Client({
    host: config.amazon.elasticsearch.url,
    connectionClass: awsHttpClient,
    awsConfig: new AWS.Config({
        credentials: new AWS.Credentials(config.amazon.elasticsearch.accessKey, config.amazon.elasticsearch.accessSecret),
        region: 'us-east-2'
    }),
    maxRetries: 10
});

const auctionList = new Map();
const priceList = new Map();
let queue = [];
const indexQueue = [];

let cancelled = false;
let auctionPages = 1;
let auctionPaused = true;

let auctionSeen = [];

const processAuctions = (data, page) => {
    data.auctions.forEach(a => {
        auctionSeen.push(a.uuid);

        if (a.end <= Date.now()) return;

        const auction = auctionList.get(a.uuid);
        if (auction) {
            if (!auction.firstIndex) {
                indexQueue.push(auction.id);
                auction.indexed();

                if (auctionPaused) startAuctionQueue();
            }

            if (auction.bids.length > a.bids.length) {
                auctionUpdateQueue.send({ type: 'auctionBidsUpdate', auctionBidsBefore: auction.bids, auctionBidsNow: a.bids, auction: a });
                indexQueue.push(auction.id);

                if (auctionPaused) startAuctionQueue();
            }

            return auction.update(a);
        }

        auctionList.set(a.uuid, new Auction(a));
    });

    if (page === auctionPages) {
        const cachedAuctions = Array.from(auctionList).map(a => (a[0]));
        const cancelledBins = _.difference(cachedAuctions, auctionSeen);
        cancelledBins.forEach(a => {
            const auction = auctionList.get(a);

            if (!auction.auction.bids.length) return auctionList.delete(a);

            auctionEndQueue.send(auction.auction);
            //auctionUpdateQueue.send({ type: 'auctionEnd', auction: a });

            client.delete({ index: 'auctions', id: a }).catch(e => { });

            auctionList.delete(a);
        });


        auctionSeen = [];
        setTimeout(() => fetchAuctions(), 10000);
    }
};

const clearAuctions = async () => {
    await client.indices.delete({ index: 'auctions' });
    await client.indices.create({ index: 'auctions' });
}

const processAllAuctions = () => {
    const auctions = Array.from(auctionList).filter(a => a[1].auction.end <= Date.now()).map(a => ({ ...a[1] }));
    auctions.forEach(a => {
        if (a.auction.end <= Date.now()) {
            auctionEndQueue.send(a.auction);
            //auctionUpdateQueue.send({ type: 'auctionEnd', auction: a });

            client.delete({ index: 'auctions', id: a.id }).catch(e => { });

            auctionList.delete(a.id);
        }
    });
}

const fetchAuctions = async () => {
    for (let i = 0; i <= auctionPages; i++) {
        const auctionPage = await hypixel.getAuctionPage(i);
        if (!auctionPage.success) continue;

        auctionPages = auctionPage.totalPages - 1;
        processAuctions(auctionPage, auctionPage.page);
    };
};

//auction queue

const startAuctionQueue = async () => {
    auctionPaused = false;

    const auctions = indexQueue.splice(0, 250);

    const final = [];

    await Promise.all(auctions.map(async a => {
        const auctionCached = auctionList.get(a);
        if (!auctionCached) return;

        await auctionCached.getItemData();

        if (!auctionCached.getIndexData()) return;

        final.push({ index: { _index: 'auctions', _id: auctionCached.id } });
        final.push(auctionCached.getIndexData());

        return;
    }));

    await client.bulk({
        refresh: true,
        body: final
    }).catch(e => { });

    dequeueAuction();
};

const dequeueAuction = () => {
    if (indexQueue.length !== 0) startAuctionQueue();
    else auctionPaused = true;
};


//item queue

const getPrice = async itemName => {
    const rawSales = await db.auction.find({ itemName }, { highestBidAmount: 1, "itemData.quantity": 1 }).sort({ end: -1 }).limit(2500).lean();
    const filteredSales = rawSales.filter(s => {
        if (isNaN(s.highestBidAmount)) return;
        if (isNaN(s.itemData.quantity)) return;

        return s;
    });

    const sales = filteredSales.map(s => (s.highestBidAmount / s.itemData.quantity));

    let average = 0;
    let averageFiltered = 0;
    let median = 0;
    let min = 0;
    let max = 0;
    let mode = 0;
    let mean = 0;
    let range = 0;

    if (sales.length) {
        average = stats.average(sales);
        averageFiltered = stats.average(stats.filterOutliers(sales));
        median = stats.median(sales);
        min = Math.min(...sales);
        max = Math.max(...sales);
        mode = stats.mode(sales);
        mean = stats.mean(sales);
        range = stats.range(sales);
    }

    return { average, averageFiltered, median, min, max, mode, mean, range, sales: sales.length }
}

const dequeue = () => {
    queue.shift();

    if (queue.length !== 0) startQueue();
};

const startQueue = async () => {
    const item = queue[0];

    await client.delete({ index: 'items', id: item[1]._id.toString() }).catch(e => { });

    const data = await getPrice(item[0]);

    priceList.set(item[0], { itemName: item[0], data });

    await client.index({
        index: 'items',
        id: item[1]._id.toString(),
        body: {
            id: item[1]._id.toString(),
            texture: item[1].texture,
            name: item[1].name,
            tag: item[1].tag,
            stats: data
        }
    }).catch(e => { });;

    if (!cancelled) {
        dequeue();
    }
};

const queueAllItems = async () => {
    cancelled = true;
    queue = [];

    const itemNames = await db.item.find({}, { _id: 1, name: 1, texture: 1, tag: 1 }).lean();
    console.log('Recieved Items');
    itemNames.forEach(i => queue.push([i.name, i]));

    startQueue();
    cancelled = false;
};

clearAuctions();
queueAllItems();
fetchAuctions();
setInterval(() => processAllAuctions(), 10000);
setInterval(() => queueAllItems(), 3600000 * 6);

app.use(express.json());

app.get('/prices', (req, res) => {
    res.json({
        success: true,
        items: priceList.size,
        data: Array.from(priceList).map(a => ({ ...a[1] }))
    });
});

const percentage = (percent, total) => {
    return ((percent / 100) * total);
}

app.post('/cheap', (req, res) => {
    const filterBy = req.body.filterBy;

    let auctions = Array.from(auctionList);
    let auctionsFiltered = auctions.filter(a => a[1].end - Date.now() < (120000 * 2));

    if (req.query.showBin === "true") {
        const binFiltered = auctions.filter(a => a[1].auction.bin === true);

        auctions = [...auctionsFiltered, ...binFiltered].map(a => ({ ...a[1].getAuctionData() }));
    } else {
        if (req.query.noBids === "true") auctionsFiltered = auctionsFiltered.filter(a => a[1].auction.bids.length === 0 && !a[1].auction.bin);

        auctions = auctionsFiltered.map(a => ({ ...a[1].getAuctionData() }));
    }

    const auctionsBelow = auctions.filter(a => {
        const item = priceList.get(a.itemName);
        if (!item) return;
        if (a.end < Date.now()) return;

        const price = a.highestBidAmount > 0 ? ((a.highestBidAmount + percentage(15, a.highestBidAmount)) / a.itemData.quantity) : (a.startingBid / a.itemData.quantity);
        if (price < item.data[filterBy]) {
            if (price - item.data[filterBy] < -50000) return a;
        }

        return;
    });

    const auctionsFinal = auctionsBelow.map(a => ({ comparedTo: (priceList.get(a.itemName).data[filterBy] * a.itemData.quantity), ...a }));

    res.json({ success: true, auctions: auctionsBelow.length, data: auctionsFinal });
});

app.listen(config.port, () => console.log(`Listening on ${config.port}`));