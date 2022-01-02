const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');
const res = require('express/lib/response');
dotenv.config();

const validateEmail = async (emailID) => {
    try {
        const URI = `https://emailvalidation.abstractapi.com/v1/?email=${emailID}&api_key=${process.env.EMAIL_API}&auto_correct=false`;
        const response = await axios.get(URI);
        console.log(response.data);
        const data = response.data.deliverability;
        if (data == 'DELIVERABLE') {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return e;
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerification = async (to, code) => {
    try {
        const mailOptions = {
            to,
            subject: 'Verification Link for Externship Module1',
            text: `Please click on the following link to verify your mail account. http://localhost:3000/user/email_verify/${code}`
        };

        const resp = await transporter.sendMail(mailOptions);
        console.log(resp.response);
        return resp.response;
    } catch (e) {
        console.log(e.code);
        const message = (e.message) ? e.message : 'Cannot send email verification now.';
        return message;
    }
}

const forgotPassword = async (to, code) => {
    try {
        const mailOptions = {
            to,
            subject: 'Password Reset Link for Externship Module1',
            text: `Please click on the following link to reset your password. http://localhost:3000/user/forgot_password/${code}`
        };

        const resp = await transporter.sendMail(mailOptions);
        console.log(resp.response);
        return resp.response;
    } catch (e) {
        console.log(e.code);
        const message = (e.message) ? e.message : 'Cannot send email verification now.';
        return message;
    }
}

module.exports = { validateEmail, sendVerification, forgotPassword }