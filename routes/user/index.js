const express = require('express');
const req = require('express/lib/request');
const router = express.Router();
const User = require(`${__dirname}/../../schema/user`);
const joi = require('joi').extend(require('@joi/date'));
const { sendVerification, forgotPassword } = require('../../controllers/mail');
const { encrypt, decrypt } = require('../../helper/cryptr');

router.get('/', async (req, res) => {
    try {
        let query = {};
        if (req.query.username) {
            query.username = req.query.username;
        }
        if (req.query.email) {
            query.email = req.query.email;
        }
        const data = await User.find(query, { hash: 0 }).limit(100);
        if (data) {
            for (let i = 0; i < data.length; i++) {
                data[i]._id = encrypt(data[i]._id);
            }
            return res.status(200).json(data);
        } else {
            return res.status(200).json({ message: 'No data found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Cannot get user data now. Try again later...' });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: decrypt(id) }, { _id: 0, hash: 0 });
        if (user) {
            return res.status(200).json({ message: 'User found', user });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ messgae: 'Cannot get user details. Try again later ...' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await joi.assert(req.body, joi.object({
            username: joi.string().alphanum().min(3).max(30),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),
        }));
        let verify = false;
        let query = {};
        if (req.body.email) {
            const email = await User.exists({ email: req.body.email });
            if (email) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            query.email_verified = false;
            query.email = req.body.email;
            verify = true;
        }
        if (req.body.username) {
            const username = await User.exists({ username: req.body.username });
            if (username) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            query.username = req.body.username;
        }
        query.updated_at = new Date();

        console.log(query);

        const user = await User.updateOne({ _id: decrypt(req.params.id) }, { $set: query });
        console.log(user);
        if (user.modifiedCount === 1) {
            if (verify) {
                const response = await User.findOne({ _id: decrypt(req.params.id) }, { hash: 1 });
                console.log(response);
                await sendVerification(req.body.email, encrypt(response.hash));
                return res.status(200).json({ message: 'Email verification link sent successfully' });
            } else {
                return res.status(200).json({ message: "Username modified sucessfully." });
            }
        } else if (user.matchedCount === 0) {
            return res.status(400).json({ message: "Invalid user id." });
        } else {
            return res.status(400).json({ message: "Cannot modify data." });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ messgae: 'Cannot get user details. Try again later ...' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        await joi.assert(req.body, joi.object({
            username: joi.string().alphanum().min(3).max(30).required(),
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }).required(),
            password: joi.string().required(),
        }));

        const second = await User.exists({ usernmae: req.body.username, email: req.body.email });
        if (second === true) {
            return res.status(400).json({
                message: "Username or Email already exists."
            });
        }

        let newUser = new User();

        newUser.username = req.body.username;
        newUser.email = req.body.email;
        newUser.setPassword(req.body.password);
        await sendVerification(req.body.email, encrypt(newUser.hash));
        await newUser.save();
        return res.status(201).json({ message: "User added successfully." });
    } catch (e) {
        console.error(e);
        const message = (e.message) ? e.message : 'Cannot register user now. Try again later....';
        res.status(500).json({ status: 'error', message });
    }
});

router.get('/email_verify/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await User.updateOne({ hash: decrypt(id) }, { $set: { email_verified: true } });
        if (data.modifiedCount === 1) {
            return res.status(200).json({ message: "Email verified successfully." });
        } else if (data.matchedCount === 0) {
            return res.status(400).json({ message: "Invalid verification link." });
        } else {
            return res.status(400).json({ message: "Email already verified." });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Cannot verify email now. Try again later....' });
    }
})

router.post('/email_verify', async (req, res) => {
    try {
        const email = req.body.email;
        const data = await User.findOne({ email: email });
        if (data) {
            const id = encrypt(data.hash);
            await sendVerification(email, id);
            return res.status(200).json({ message: "Email verification link sent successfully." });
        } else {
            return res.status(400).json({ message: "Email not found." });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 'error', message: 'Cannot send verification email now. Try again later....' });
    }
})

router.post('/forgot_password', async (req, res) => {
    try {
        await joi.assert(req.body, joi.object({
            email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }).required(),
        }));
        const data = await User.findOne({ email: req.body.email });
        if (data) {
            const id = encrypt(data.hash);
            await forgotPassword(req.body.email, id);
            return res.status(200).json({ message: "Password reset link sent successfully." });
        } else {
            return res.status(400).json({ message: "Email not found." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Cannot send password reset mail. Try again later...' });
    }
});

module.exports = router;