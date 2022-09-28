'use strict'

const authController = require('../controllers/auth');
// for validation 
const { check, body } = require('express-validator/check');

// user
const User = require('../models/user');

const express = require('express');
const router = express.Router();

// login
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

// signup
router.get('/signup', authController.getSignup);
router.post('/signup',
    // about the validation
    check('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .custom((value, { req }) => {
            // if (value === 'ade@yahoo.com') {
            //     throw new Error('This email address is forbidden!')
            // }
            // return true;
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail exists already, please pick a different one.');
                    }
                });
        }),
    body('password',
        'Please provides a password with only numbers and text and at least 5 characteers'
    )
        .isLength({ min: 5 }).isAlphanumeric(),
    //  for confirm password
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password is not match');
        }
        return true;
    }),

    //
    authController.postSignup
);

// reset password 
router.get('/reset', authController.getPasswordReset);
router.post('/reset', authController.postPasswordReset);

// new password
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
