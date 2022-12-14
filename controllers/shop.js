'use strict';
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const PDFDocument = require('pdfkit');

const Product = require('../models/product');

const Order = require('../models/order');

// for pagination 
const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
        // with pagination
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return  Product.find()
        // for pagination skip and limit could be found in mongodb and mongoose
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                //
        })
        // 
        .then(products => {
             res.render('shop/productList', {
                prod: products,
                pageTitle: 'All Product Items',
                path: '/products',
                
                 // for pagination
                 currentPage:page,
                 hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                 hasPreviousPage: page > 1,
                 nextPage: page + 1,
                 previousPage: page - 1,
                 lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
                 //
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
            });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};

exports.getIndex = (req, res, next) => {
    // for pagination
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return  Product.find()
        // for pagination skip and limit could be found in mongodb and mongoose
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                //
        })
        // 
        .then(products => {
             res.render('shop/index', {
                prod: products,
                pageTitle: 'Shop',
                 path: '/',
                
                 // for pagination
                 currentPage:page,
                 hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                 hasPreviousPage: page > 1,
                 nextPage: page + 1,
                 previousPage: page - 1,
                 lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
                 //
            });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
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
    const prodId = req.body.productId;
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

//  postOrder
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
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(15).
                    text(
                    prod.product.title +
                    ' - ' +
                    prod.quantity +
                    ' * ' + '???' +
                    prod.product.price
                );
            });
            pdfDoc.fontSize(20).text('------------------------------------------');
            pdfDoc.fontSize(20).text('Total price: ???' + totalPrice);
            pdfDoc.fontSize(20).text('------------------------------------------');
            pdfDoc.end();
           
            })
        .catch(error => next(error));
}


exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(userCheckoutProducts => {
            const productsByUser = userCheckoutProducts.cart.items;
            let total=0;
            productsByUser.forEach(p => {
                total += p.quantity * p.productId.price
            });
            
            res.render('shop/checkout', {
                path: '/checkout',
                pageTitle: 'Checkout',
                products: productsByUser,
                totalSum: total,
                // // stripe
                // sessionId:session.id
            });
        })
        
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        }); 
    
};


// getCheckoutSuccess
exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(userCartProducts => {
            const productsByUser = userCartProducts.cart.items
                .map(i => {
                    return {
                        quantity: i.quantity,
                        product: {...i.productId._doc}
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
