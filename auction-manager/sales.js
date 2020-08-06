const cluster = require('cluster');
const config = require('./config.json');

const Discord = require('discord.js');
const webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

if (cluster.isWorker) {
    console.log('Worker Ready');

    const express = require('express');
    const app = express();

    const AWS = require('aws-sdk');

    AWS.config.update({ region: 'us-east-2', accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey });

    const sqs = new AWS.SQS({ apiVersion: 'latest' });

    const Database = require('./storage/Mongo');
    const db = new Database();

    const Auction = require('./types/Auction');
    let items = [];

    const checkItem = async (name, data) => {
        if (items.includes(name)) return;

        const item = await db.item.findOne({ name });
        if (!item) await new db.item({ name, ...data }).save();

        items.push(name);
    }

    const getNextMessage = () => {
        const promise = new Promise((resolve, reject) => {
            const params = {
                QueueUrl: config.auctionQueueUrl,
                MaxNumberOfMessages: 10
            };

            sqs.receiveMessage(params, (err, data) => {
                if (err) reject(err);

                resolve(data);
            });
        });

        return promise;
    }

    const removeMessages = Entries => {
        const promise = new Promise((resolve, reject) => {
            const deleteParams = {
                QueueUrl: config.auctionQueueUrl,
                Entries
            };

            sqs.deleteMessageBatch(deleteParams, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    const insertAuction = (auction, highestBid) => {
        const promise = new Promise(async (resolve, reject) => {
            await auction.getItemData();

            db.auction.findByIdAndUpdate(auction.id, { ...await auction.getAuctionData(), topBidder: highestBid.bidder }, { upsert: true }, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    const save = async saleData => {
        const sale = JSON.parse(saleData.Body);
        if (!sale) return;

        const auction = new Auction(sale);
        const highestBid = auction.auction.bids.sort((a, b) => b.amount - a.amount)[0];
        if (!highestBid) return { Id: saleData.MessageId, ReceiptHandle: saleData.ReceiptHandle };

        try {
            await insertAuction(auction, highestBid);

            checkItem(auction.auction.item_name, await auction.getItemData());
        } catch (e) {
            webhook.send(`\`\`\`js\n${e}\`\`\``);
        }

        return { Id: saleData.MessageId, ReceiptHandle: saleData.ReceiptHandle };
    }

    const getNextBatch = async () => {
        const saleData = await getNextMessage();

        if (!saleData.Messages) return;
        if (!saleData.Messages.length) return;

        const auctions = await Promise.all(saleData.Messages.map(async m => await save(m)));
        await removeMessages(auctions);
    };

    setInterval(() => {
        getNextBatch();
    }, 3000);

    app.listen(5004);
}

if (cluster.isMaster) {
    const express = require('express');
    const app = express();

    const cpuCount = require('os').cpus().length;

    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();

        webhook.send(`\`\`\`css\n[MASTER][INFO] Spawned Worker\`\`\``);
    }
    webhook.send(`\`\`\`css\n[MASTER][INFO] All Workers Successfully Launched\`\`\``);

    cluster.on('exit', (worker, code, signal) => {
        webhook.send(`\`\`\`css\n[MASTER][CRITICAL] Worker died with PID: ${worker.id} Code: ${code} Signal: ${signal}\`\`\``);

        const newWorker = cluster.fork();
        webhook.send(`\`\`\`css\n[MASTER][INFO] Successfully restarted ${newWorker.id}\`\`\``);
    });

    app.get('/info', (req, res) => {
        res.json({
            online: true
        });
    });

    app.listen(5003, () => webhook.send(`\`\`\`css\n[MASTER][INFO] Started master web server\`\`\``));
}