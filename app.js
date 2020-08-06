const express = require('express');
const app = express();
const path = require('path');

const server = require('http').Server(app);

const io = require('socket.io')(server);

const Items = require('./routes/Items');
const Auctions = require('./routes/Auctions');
const Players = require('./routes/Players');
const Users = require('./routes/Users');

app.use('/api/items', Items);
app.use('/api/auctions', Auctions);
app.use('/api/players', Players);
app.use('/api/users', Users);

app.use(express.static(path.join(__dirname, 'static')));
app.use('*', (req, res) => res.sendFile(path.join(__dirname, 'static/index.html')));


server.listen(process.env.PORT || 3000);