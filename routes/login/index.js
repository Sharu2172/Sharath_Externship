const express = require('express');
const router = express.Router();
const { encrypt } = require('../../helper/cryptr');
const UserModel = require('../../schema/user');

router.get('/', (req, res) => {
    res.status(200).json({ status: 'active', message: 'Route is Valid' });
});

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });
        if (user === null) {
            return res.status(400).json({
                message: "User not found. Please Register First..."
            });
        }
        else {
            if (user.validPassword(password)) {
                return res.status(201).json({
                    token: encrypt(user._id),
                    message: "User logged in successfully."
                })
            }
            else {
                return res.status(401).json({
                    message: "Usermail or password not found"
                });
            }
        }
    } catch (err) {
        console.error(err);
        const message = (err.message) ? err.message : 'Cannot register user now. Try again later....';
        res.status(500).json({ status: 'error', message });
    }
});

module.exports = router;