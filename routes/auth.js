'use strict'

const authController = require('../controllers/auth')

const express = require('express');
const router = express.Router();

// login
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

// signup
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

module.exports = router;
