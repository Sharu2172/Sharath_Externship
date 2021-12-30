const express = require('express');
const routes = express.Router();

routes.get('/user', (req, res) => {
    res.send('User Page');
})

module.exports = routes;