const router = require('express').Router();
const jwt = require('jsonwebtoken');

const axios = require('axios');

const AWS = require('aws-sdk');
const elasticsearch = require('elasticsearch');
const awsHttpClient = require('http-aws-es');

const Database = require('../storage/Mongo');
const db = new Database();

const config = require('../config.json');

const client = new elasticsearch.Client({
    host: config.amazon.elasticsearch.url,
    connectionClass: awsHttpClient,
    awsConfig: new AWS.Config({
        credentials: new AWS.Credentials(config.amazon.elasticsearch.accessKey, config.amazon.elasticsearch.accessSecret),
        region: 'us-east-2'
    })
});

router.get('/search', async (req, res) => {
    const queryString = req.query;

    const search = await client.search({
        index: 'auctions',
        body: queryString.query,
        size: queryString.limit || 50,
        from: queryString.skip || 0
    });

    res.json({ success: true, data: search });
});

router.get('/individual/:id', async (req, res) => {
    const id = req.params.id;

    const search = await client.get({
        index: 'auctions',
        id
    });

    res.json({ success: true, data: search });
});

router.get('/flipper', async (req, res) => {
    res.send('I LOOK LIKE DABABY');
});

module.exports = router;