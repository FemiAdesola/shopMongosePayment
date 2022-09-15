'use strict';
const Product = require('../models/product');
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
    // for get all products without repeart the product
    Product.fetchAll()
     .then(([rows, fieldData]) => {
            res.render('shop/productList', {
            prod: rows,
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
    Product.findById(prodId)
        .then(([productD]) => {
            res.render('shop/productDetail', {
                product: productD[0],
                pageTitle: productD.title,
                path: '/products'
            });
        })
        .catch(error => console.log(error))
       
    // res.redirect('/');
};


exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render('shop/index', {
                prod: rows,
                pageTitle: 'Shop',
                path: '/',
            });
        })
        .catch(error =>
            console.log(error));
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for (products of products) {
                const cartProductData = cart.products.find(
                    prod => prod.id === products.id
                );
                if (cartProductData) {
                    cartProducts.push(
                        {
                            productData: products,
                            qty: cartProductData.qty
                        });
                }
            }
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts
            });
        });
    });
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
