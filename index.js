// import modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('morgan');
const mongoose = require('mongoose');

// Custom variables declaration
const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();
const user = require(`${__dirname}/routes/user/index.js`);
const auth = require(`${__dirname}/routes/auth/index.js`);

// Middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting Routes.
app.get('/ping', (req, res) => {
    return res.status(200).json({ status: 'OK', message: 'Route is Valid.' });
})

app.use('/user', user);

app.use('/login', auth);

app.all('*', (req, res, next) => {
    return res.sendStatus(404);
});

// Connect to moongose and start server if connection sucessful
mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true`
    , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((result) => {
        app.listen(PORT, () => {
            console.log(`MongoDB connection Sucessful\nServer Running on port ${PORT}`);
        });
    })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:\n'));