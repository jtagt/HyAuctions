const AWS = require('aws-sdk');

class Queue {
    constructor(queueUrl, accessKeyId, secretAccessKey, region) {
        this.queueUrl = queueUrl;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.region = region;

        this.sqs = new AWS.SQS({ apiVersion: 'latest', region: this.region, accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey });;
    }

    async send(payload) {
        const promise = new Promise((resolve, reject) => {
            const params = {
                MessageBody: JSON.stringify(payload),
                QueueUrl: this.queueUrl
            };

            this.sqs.sendMessage(params, (err, data) => {
                if (err) reject(err);

                resolve(data);
            });
        });

        return promise;
    }
}

module.exports = Queue;