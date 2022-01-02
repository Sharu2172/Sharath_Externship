const Cryptr = require('cryptr');
const dotenv = require('dotenv');
dotenv.config();

const cryptr = new Cryptr(process.env.SECRET_KEY);

module.exports.encrypt = (text) => {
    return cryptr.encrypt(text);
}

module.exports.decrypt = (text) => {
    return cryptr.decrypt(text);
}