const router = require('express').Router();
const Mongo = require('../storage/Mongo');

const db = new Mongo();

router.get('/:id/info', async (req, res) => {
    const id = req.params.id;

    const player = await db.user.findById(id);
    if (!player) return res.json({ success: false, message: 'Player does not exist.' });

    res.json({ success: true, data: player });
});

router.get('/:id/profiles', async (req, res) => {
    const id = req.params.id;

    const island = await db.island.findById(id, { "banking.balance": 1, _id: 1 });
    if (!island) return res.json({ success: false, message: 'Island does not exist.' });

    res.json({ success: true, data: sales });
});

module.exports = router;

// CUHUGNSUTER