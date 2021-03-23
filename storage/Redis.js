// this is funny it sounds like reddit

const redisClustr = require('redis-clustr');
const redisClient = require('redis');

const config = require('../config.json');

const redis = new redisClustr({
    servers: [
        {
            host: config.amazon.elasticache,
            port: 6379
        }
    ],
    createClient: (port, host) => {
        return redisClient.createClient(port, host);
    }
});

class RedisClient {
    constructor() {
        this.client = redis.createClient(6379, config.amazon.elasticache);
    }

    ping() {
        const timestamp = Date.now();

        const promise = new Promise((resolve, reject) => {
            this.client.ping('ping', (err, res) => {
                if (err) reject();

                resolve(Date.now() - timestamp);
            });
        });

        return promise;
    }

    hashGet(hash, k) {
        const promise = new Promise((resolve, reject) => {
            this.client.hget(hash, k, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    }

    //protcol for field itemName:type
    hashSet(hash, k, v) {
        const promise = new Promise((resolve, reject) => {
            this.client.hset(hash, k, v, (err, res) => {
                if (err) reject(err);

                resolve(res === 0 ? false : true);
            });
        });

        return promise;
    }
}

module.exports = RedisClient;