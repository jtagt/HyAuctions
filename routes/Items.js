// we dont need this


/* const router = require('express').Router();
const Mongo = require('../storage/Mongo');

const StatUtils = require('../utils/StatUtils');
const statUtils = new StatUtils();

const AWS = require('aws-sdk');
const elasticsearch = require('elasticsearch');
const awsHttpClient = require('http-aws-es');

const config = require('../config.json');

const db = new Mongo();

const client = new elasticsearch.Client({
    host: config.amazon.elasticsearch.url,
    connectionClass: awsHttpClient,
    awsConfig: new AWS.Config({
        credentials: new AWS.Credentials(config.amazon.elasticsearch.accessKey, config.amazon.elasticsearch.accessSecret),
        region: 'us-east-2'
    })
});

router.get('/search', async (req, res) => {
    const query = req.query;

    const search = await client.search({
        index: 'items',
        size: 99,
        body: query.name ? {
            query: {
                match: {
                    name: query.name
                }
            }
        } : {}
    });

    if (!search.hits.total.value) return res.json({ success: true, data: [] });
    const results = search.hits.hits;

    res.json({ success: true, data: results });
});

router.get('/all', async (req, res) => {
    const query = await db.item.find({}, { name: 1, _id: 1 }).lean();

    res.json({ success: true, data: query });
});

//add caching here

router.get('/:id/quickStats', async (req, res) => {
    const id = req.params.id;

    const item = await db.item.findById(id);
    if (!item) return res.json({ success: false, message: 'Item does not exist.' });

    const data = await db.auction.find({ itemName: item.name }, { "itemData.quantity": 1, "bids.amount": 1, highestBidAmount: 1 }).sort({ end: -1 }).limit(2500);

    if (!data.length) return res.json({ success: true, data: { averageQuantity: null, totalSales: null, totalBids: null, averageBids: null, median: null, average: null, deviation: null, mode: null, name: item.name, texture: item.texture, tag: item.tag } });
    const resultsQuantity = data.map(q => q.itemData.quantity);
    const averageQuantity = resultsQuantity.reduce((a, b) => a + b) / resultsQuantity.length;

    const bids = data.map(b => b.bids.length);
    const totalBids = bids.reduce((a, b) => a + b);
    const averageBids = totalBids / bids.length;

    const prices = data.map(p => (p.highestBidAmount / p.itemData.quantity));

    const median = statUtils.median(prices);
    const average = statUtils.average(prices);
    const deviation = statUtils.average(statUtils.filterOutliers(prices));
    const mode = statUtils.mode(prices);

    res.json({ success: true, data: { averageQuantity, totalSales: resultsQuantity.length, totalBids, averageBids, median, average, deviation, mode, name: item.name, texture: item.texture, tag: item.tag } });
});

router.get('/:id/recent', async (req, res) => {
    const id = req.params.id;
    const query = req.query;

    const item = await db.item.findById(id);
    if (!item) return res.json({ success: false, message: 'Item does not exist.' });

    const recent = await db.auction.find({ itemName: item.name }).sort({ end: -1 }).limit(parseInt(query.limit) || 100).skip(parseInt(query.skip) || 0);

    res.json({ success: true, data: recent });
});

router.get('/:id/sales', async (req, res) => {
    const id = req.params.id;
    const query = req.query;

    const item = await db.item.findById(id);
    if (!item) return res.json({ success: false, message: 'Item does not exist.' });

    const bigSales = await db.auction.find({ itemName: item.name }, { highestBidAmount: 1, "itemData.quantity": 1, end: 1 }).sort({ end: -1 }).limit(parseInt(query.limit) || 2000);

    const sales = bigSales.map(s => ({ price: s.highestBidAmount / s.itemData.quantity, timestamp: s.end }));

    res.json({ success: true, data: sales });
});

module.exports = router;*/