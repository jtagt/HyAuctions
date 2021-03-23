const router = require('express').Router();
const Mongo = require('../storage/Mongo');

const { Client, types: { AUTHORIZATION } } = require('../discord-oauth');
const jwt = require('jsonwebtoken');

const config = require('../config.json');
const db = new Mongo();

const oauthClient = new Client(config.id, config.authSecret);
const auth = oauthClient.create(AUTHORIZATION, {
    scopes: ['identify'],
    redirect: config.callbackUrl,
    returnUrl: config.returnUrl
});

router.get('/', async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.json({ success: false, message: 'Must provide an auth token.' });

    let decoded;

    try {
        decoded = jwt.verify(authorization, config.secret);
    } catch (e) {
        return res.status(401).json({ success: false, message: "Invalid token." });
    }

    const member = await db.member.findById(decoded.id);
    if (!member) return res.json({ success: false, message: 'Member does not exist.' });

    res.json({ success: true, data: member });
});

router.get('/auth', (req, res) => {
    const url = auth.generate().url;
    res.redirect(url);
});

router.get('/callback', async (req, res) => {
    const data = await auth.callback(req.query);

    if (data.error) return res.redirect('/');

    const auth_token = jwt.sign({ id: data.bearer.user.id }, config.secret);
    const user = data.bearer.user;

    let userData = await db.member.findById(user.id);
    if (!userData) await new db.member({ _id: user.id, username: user.username, tag: user.discriminator }).save();

    if (userData) await db.member.findByIdAndUpdate(user.id, { $set: { username: user.username, tag: user.discriminator } }, (err, res) => { return res });
    const auth_token = "set token here, setting multiple is against the rules!"
    res.redirect(`${config.rootDomain}/auth?token=${auth_token}`);
});

module.exports = router;