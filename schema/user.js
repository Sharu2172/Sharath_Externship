const mongoose = require('mongoose');
const joi = require('joi').extend(require('@joi/date'));
const joigoose = require("joigoose")(mongoose, null, {
    _id: false,
    timestamps: false,
});

const User = joi.object({
    _id: joi.string().defualt(mongoose.Types.ObjectId()),
    username: joi.string(),
    hash: joi.string(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
    email_verified: joi.boolean().default(false),
    created_at: joi.date().default(new Date().now()),
    updated_at: joi.date().default(new Date().now()),
});

const mongooseSchema = new mongoose.Schema(joigoose.convert(User), {
    _id: false,
    versionKey: false,
});

const UserModel = mongoose.model("user", mongooseSchema);

module.exports = { User, UserModel };