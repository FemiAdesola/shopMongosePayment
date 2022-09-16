'use strict';
const Product = require('../models/product');
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
    // for get all products without repeart the product
    Product.findAll()
     .then((products) => {
            res.render('shop/productList', {
            prod: products,
            pageTitle: 'All Product Items',
            path: '/products',
        });
        })
        .catch(error =>
            console.log(error));
};

exports.getProduct = (req, res, next) => {
    // for get one  product
    const prodId = req.params.productId;
    // Product.findAll({ where: { id: prodId } })
    // .then(productD => {
    //         res.render('shop/productDetail', {
    //             product: productD[0],
    //             pageTitle: productD[0].title,
    //             path: '/products'
    //         });
    //     })
    //     .catch(error => console.log(error))
    
    Product.findByPk(prodId)
        .then(productD => {
            res.render('shop/productDetail', {
                product: productD,
                pageTitle: productD.title,
                path: '/products'
            });
        })
        .catch(error => console.log(error))
};


exports.getIndex = (req, res, next) => {
    Product.findAll()
        .then(products => {
             res.render('shop/index', {
                prod: products,
                pageTitle: 'Shop',
                path: '/',
            });
        })
        .catch(error => console.log(error));
};

exports.getCart = (req, res, next) => {
    console.log(req.user.cart)
    req.user.getCart()
        .then(cart => {
            return cart.getProducts()
                .then(cartProducts=> {
                    res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: cartProducts
            });
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error)); 
};

exports.postCart = (req, res, next) => {
    // productId is the name use in productDetail input under form 
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        Cart.addProduct(prodId,product.price)
    });
    console.log(prodId)
    res.redirect('/cart')
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productCartId;
    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Order'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};
