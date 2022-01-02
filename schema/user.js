const mongoose = require('mongoose');
const joi = require('joi').extend(require('@joi/date'));
const joigoose = require("joigoose")(mongoose, null, {
    _id: false,
    timestamps: false,
});
const md5 = require('md5');

const User = joi.object({
    _id: joi.string().default(mongoose.Types.ObjectId()),
    username: joi.string().alphanum().min(3).max(30).required(),
    hash: joi.string(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
    email_verified: joi.boolean().default(false),
    created_at: joi.date().format("YYYY-MM-DD hh:mm:ss").default(new Date()),
    updated_at: joi.date().format("YYYY-MM-DD hh:mm:ss").default(new Date()),
});

const UserSchema = new mongoose.Schema(joigoose.convert(User), {
    _id: false,
    versionKey: false,
});

UserSchema.methods.setPassword = function (password) {
    this.hash = md5(password);
};

UserSchema.methods.validPassword = function (password) {
    var hash = md5(password);
    return this.hash === hash;
};

UserSchema.methods.updateDate = () => {
    return updated_at = new Date();
}

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;