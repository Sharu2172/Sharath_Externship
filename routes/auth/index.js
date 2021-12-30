const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ status: 'active', message: 'Route is Valid' });
});

router.post('/', (req, res) => {
    res.send('Login Page');
});

module.exports = router;