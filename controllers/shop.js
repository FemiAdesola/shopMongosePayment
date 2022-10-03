'use strict';
const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');

const Order= require('../models/order');

exports.getProducts = (req, res, next) => {
    // for get all products without repeat the product
    Product.find()
     .then((products) => {
            res.render('shop/productList', {
                prod: products,
                pageTitle: 'All Product Items',
                path: '/products',
                // isAuthenticated: req.session.isLoggedIn
        });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};

exports.getProduct = (req, res, next) => {
    // for get one  product
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(productD => {
            res.render('shop/productDetail', {
                product: productD,
                pageTitle: productD.title,
                path: '/products',
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
             res.render('shop/index', {
                prod: products,
                pageTitle: 'Shop',
                 path: '/',
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(error => console.log(error));
};

exports.getCart = (req, res, next) => {
    // console.log(req.user.cart)
    req.user
        .populate('cart.items.productId')
        .then(userCartProducts => {
            const productsByUser = userCartProducts.cart.items;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: productsByUser,
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        }); 
};

exports.postCart = (req, res, next) => {
    // productId is the name use in productDetail input under form 
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result)
            res.redirect('/cart')
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productCartId;
    req.user
        .deleteItemFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
    
};

// post order
exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(userCartProducts => {
            const productsByUser = userCartProducts.cart.items
                .map(i => {
                    return {
                        quantity: i.quantity,
                        productData: {...i.productId._doc}
                    }
                });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId:req.user
                },
                products: productsByUser
            });
            return order.save();
        })
        .then(result => {
            // this line below clear the cart after order
            return req.user.clearCart();
        })
        .then(() => {
               // redirect to order page
            res.redirect('/orders')
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};


// get orders
exports.getOrders = (req, res, next) => {
    Order.find({
        ' user.userId': req.user._id
    })
    .then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Order',
            orders: orders,
            // isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch(error => {
        const erro = new Error(error);
        error.httpStatusCode = 500;
        return next(erro);
    });
};

// invoice
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);

            // pdf docu from pdfkit to get invoice in pdf format
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(30).text('Invoice', {
                underline: true,
                align:'center'
            });
            pdfDoc.fontSize(20).text('------------------------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                // totalPrice = totalPrice + prod.quantity * prod.productData.price;
                totalPrice += prod.quantity * prod.productData.price;
                pdfDoc.fontSize(15).
                    text(
                    prod.productData.title +
                    ' - ' +
                    prod.quantity +
                    ' * ' + '€' +
                    prod.productData.price
                );
            });
            pdfDoc.fontSize(20).text('------------------------------------------');
            pdfDoc.fontSize(20).text('Total proce: €' + totalPrice);
            pdfDoc.fontSize(20).text('------------------------------------------');
            pdfDoc.end();
            //

            //
            // fs.readFile(invoicePath, (error, data) => {
            //     if (error) {
            //     return next(error);
            //     }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader(
            //     'Content-Disposition',
            //     'inline; filename="' + invoiceName + '"'
            //     );
            //     res.send(data);
            // });
            
            // // for streaming file
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader(
            //     'Content-Disposition',
            //     'inline; filename="' + invoiceName + '"'
            // );
            // file.pipe(res);
            })
        .catch(error => next(error));
}


// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout',
//         // isAuthenticated: req.session.isLoggedIn
//     });
// };


