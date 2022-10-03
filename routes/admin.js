'use strict'
const express = require('express');
const path = require('path');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('price').isFloat(),
        body('description')
            .isLength({ min: 5, max:500 })
            .trim(),
    ],
    isAuth,
    adminController.postAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product',
      [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('price').isFloat(),
        body('description')
            .isLength({ min: 5, max:500 })
            .trim(),
    ],
    isAuth,
    adminController.postEditProduct
);

router.post('/delete-product',isAuth, adminController.postDeleteProduct);

module.exports = router;
