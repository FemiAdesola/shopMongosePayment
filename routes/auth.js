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
router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            // for removing changing the character to lowercase
            .normalizeEmail(),
    body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
    // for triming password by removing excess space
        .trim(),
  ],
    authController.postLogin
);

router.post('/logout', authController.postLogout);

// signup
router.get('/signup', authController.getSignup);
router.post('/signup',
    // about the validation
    check('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail exists already, please pick a different one.');
                    }
                });
        })
    .normalizeEmail(),
    body('password',
        'Please provides a password with only numbers and text and at least 5 characteers'
    )
        .isLength({ min: 5 }).isAlphanumeric().trim(),
    //  for confirm password
    body('confirmPassword').trim().custom((value, { req }) => {
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
