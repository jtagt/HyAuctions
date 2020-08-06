const config = require('./config.json');

const Database = require('./storage/Mongo');
const db = new Database();

const discord = require('discord.js');
const client = new discord.Client();

const TARGET_GUILD = "guild";
const VERIFY_CHANNEL = "verify";
const PREFIX = "h!";

client.on('ready', () => {
    const memberCount = client.guilds.cache.get(TARGET_GUILD).members.cache.size;

    client.user.setActivity(`${memberCount} members`, { type: 'WATCHING' });
});

const grantFlipper = id => {
    const user = client.users.cache.get(id);

    if (user) {
        const promise = new Promise((resolve, reject) => {
            db.member.findByIdAndUpdate(id, { $set: { inServer: true, username: user.username, tag: user.tag } }, { upsert: true }, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    } else {
        const promise = new Promise((resolve, reject) => {
            db.member.findByIdAndUpdate(id, { $set: { inServer: true } }, { upsert: true }, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    }
}

const removeFlipper = id => {
    const user = client.users.cache.get(id);

    if (user) {
        const promise = new Promise((resolve, reject) => {
            db.member.findByIdAndUpdate(id, { $set: { inServer: false, username: user.username, tag: user.tag } }, { upsert: true }, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    } else {
        const promise = new Promise((resolve, reject) => {
            db.member.findByIdAndUpdate(id, { $set: { inServer: false } }, { upsert: true }, (err, res) => {
                if (err) reject(err);

                resolve(res);
            });
        });

        return promise;
    }
}

client.on('message', async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) {
        if (message.channel.id === VERIFY_CHANNEL && !message.author.bot) {
            message.delete();
        }
    };

    const args = message.content.slice(PREFIX.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    if (command === "verify") {
        if (message.channel.id !== VERIFY_CHANNEL) return message.delete({ reason: 'Wrong channel.' });
        await grantFlipper(message.author.id);

        const verify = await message.channel.send('Granted your access make sure to stay in the server to keep your access.');
        verify.delete({ timeout: 3000 });
        message.delete({ timeout: 3000 });
    }
});

client.on('userUpdate', (old, updated) => {
    db.member.findByIdAndUpdate(updated.id, { $set: { username: updated.username, tag: updated.tag, inServer: client.guilds.cache.get(TARGET_GUILD).members.cache.has(updated.id) } }, (err, res) => {
        return res;
    });
});

client.on('guildMemberRemove', async member => {
    await removeFlipper(member.id);
});

client.login(config.discordToken);