const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Bot Ready.');
});

client.commands = new Discord.Collection();

client.on('message', message => {

});

//client.login();