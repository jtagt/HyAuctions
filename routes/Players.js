// USING MULTIPLE API KEYS IS AGAINST THE HYPIXEL CODE OF CONDUCT

/* const router = require('express').Router();
const Mongo = require('../storage/Mongo');

const jwt = require('jsonwebtoken');

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

router.get('/:id/info', async (req, res) => {
    const member = await db.member.findById(decoded.id);
    const id = req.params.id;

    const player = await db.user.findById(id);
    if (!player) return res.json({ success: false, message: 'Player does not exist.' });

    res.json({ success: true, data: player });
});

router.get('/:id/purchases', async (req, res) => {
    const id = req.params.id;

    const limit = parseInt(req.query.limit) || 21;
    const skip = parseInt(req.query.skip) || 0;

    const filter = req.query.filter;
    const name = req.query.name;

    let sort = {

    }

    let query = {
        topBidder: id
    }

    if (filter !== null) {
        switch (parseInt(filter)) {
            case 0:
                sort["end"] = -1
                break;
            case 1:
                sort["end"] = 1
                break;
            case 2:
                sort["highestBidAmount"] = -1
                break;
            case 3:
                sort["highestBidAmount"] = 1
                break;
        }
    }

    if (name) query["itemName"] = new RegExp(name, "gi");

    const purchases = await db.auction.find(query).sort(sort).limit(limit).skip(skip);
    if (!purchases) return res.json({ success: false, message: 'Player does not exist.' });

    res.json({ success: true, data: purchases });
});

router.get('/:id/sales', async (req, res) => {
    const id = req.params.id;

    const limit = parseInt(req.query.limit) || 21;
    const skip = parseInt(req.query.skip) || 0;

    const filter = req.query.filter;
    const name = req.query.name;

    let sort = {

    }

    let query = {
        seller: id
    }

    if (filter !== null) {
        switch (parseInt(filter)) {
            case 0:
                sort["end"] = -1
                break;
            case 1:
                sort["end"] = 1
                break;
            case 2:
                sort["highestBidAmount"] = -1
                break;
            case 3:
                sort["highestBidAmount"] = 1
                break;
        }
    }

    if (name) query["itemName"] = new RegExp(name, "gi");

    const sales = await db.auction.find(query).sort(sort).limit(limit).skip(skip);
    if (!sales) return res.json({ success: false, message: 'Player does not exist.' });

    res.json({ success: true, data: sales });
});

router.get('/:id/stats/items', async (req, res) => {
    const id = req.params.id;

    const purchases = await db.auction.find({ topBidder: id }, { itemName: 1 });
    if (!purchases) return res.json({ success: false, message: 'Player does not exist.' });

    res.json({ success: true, data: purchases });
});

router.get('/:id/stats/io', async (req, res) => {
    const id = req.params.id;

    const purchases = await db.auction.find({ topBidder: id }, { highestBidAmount: 1 });

    const sales = await db.auction.find({ seller: id }, { highestBidAmount: 1 });

    res.json({ success: true, data: { purchases, sales } });
});

router.get('/:id/current', async (req, res) => {
    const search = await client.search({
        index: 'auctions',
        body: {
            query: {
                match: {
                    seller: req.params.id
                }
            }
        }
    });

    res.json({ success: true, data: search });
});

router.get('/:id/profiles', async (req, res) => {
    return res.json({ success: false, message: 'Disabled endpoint.' });

    const id = req.params.id;

    const island = await db.island.find(id, { "banking.balance": 1, _id: 1 });
    if (!island) return res.json({ success: false, message: 'Island does not exist.' });

    res.json({ success: true, data: island });
});

module.exports = router;*/