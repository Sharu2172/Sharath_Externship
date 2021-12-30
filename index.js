// import modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('morgan');

// Custom variables declaration
const app = express();
const PORT = process.env.PORT || 3000;
const user = require(`${__dirname}/routes/user/index.js`);
const auth = require(`${__dirname}/routes/auth/index.js`);

// Middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', user);
app.use('/auth', auth);

app.all('*', (req, res, next) => {
    return res.sendStatus(404);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})