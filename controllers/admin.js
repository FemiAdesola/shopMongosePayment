'use strict';
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Product = require('../models/product');

// delete function path from util folder
const fileHelper = require('../util/file');
const { file } = require('pdfkit');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/editProduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors:[]
    });
};

exports.postAddProduct = (req, res, next) => {
   const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
  
    // setup image
    if (!image) {
        return res.status(422).render('admin/editProduct', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError:true,
            product: {
                title:title,
                price:price,
                description: description,
            },
            errorMessage: 'Attached file is not an image',
            validationErrors:[]
        }); 
    }


// erroe validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/editProduct', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError:true,
            product: {
                title:title,
                imageUrl:imageUrl,
                price:price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors:errors.array()
        }); 
    }
    // render path to database
    const imageUrl = image.path;

    // for database sequ...
    const product = new Product({
        title:title,
        imageUrl:imageUrl,
        price:price,
        description: description,
        userId:req.user
    });
    product.save()
    .then(result => {
        // console.log(result);
        console.log('Created product');
        res.redirect('/admin/products');
     })
    .catch(error => {
        const erro = new Error(error);
        error.httpStatusCode = 500;
        return next(erro);
    });
};

// get the product
exports.getProducts = (req, res, next) => {
    Product.find({
        // line below ( userId: req.user._id) restrict the amount of product we can see by each user
        userId: req.user._id
    })
        .then((products) => {
            console.log(products)
            res.render('admin/products', {
                prod: products,
                pageTitle: 'Admin Products',
                path: '/admin/products',
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};

// edit product
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/')
    };
    // ProductId is the name we use in admin routes (router.get('/edit-product/:productId')
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(prodEdit => {
            if (!prodEdit) {
                return res.redirect('/')
            }
            res.render('admin/editProduct', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: prodEdit,
                hasError: true,
                errorMessage: null,
                validationErrors:[]
                // isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};

// edit post product 
exports.postEditProduct = (req, res, next)=>{
    const prodId = req.body.productID;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.file;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    

// error validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/editProduct', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError:true,
            product: {
                title:updatedTitle,
                price:updatedPrice,
                description: updatedDescription,
                _id:prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors:errors.array()
        }); 
    }

    Product.findById(prodId)
        .then(productUpdate => {
            //  the if line restrict to user 
            if (productUpdate.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            productUpdate.title = updatedTitle;
            if (updatedImageUrl) {
                // File Helper
                fileHelper.deleteFile(productUpdate.imageUrl);
                    //
                productUpdate.imageUrl=updatedImageUrl.path;
            }
            
            productUpdate.price = updatedPrice;
            productUpdate.description = updatedDescription;
            return productUpdate
                .save()
                .then(result => {
                    console.log('UPDATED PRODUCT');
                    res.redirect('/admin/products');
                });
        })
        .catch(error => {
            const erro = new Error(error);
            error.httpStatusCode = 500;
            return next(erro);
        });
};



// delete the product
exports.deleteProduct = (req, res, next) => {
    // // productDeleteId from delete section in admin product.ejs 
    // const prodDeleteId = req.body.productDeleteId;
    const prodDeleteId = req.params.productDeleteId;
    // for delete file saving path 
    Product.findById(prodDeleteId)
        .then(product => {
            if (!product) {
                return next(new Error('product not found'));
            }
            fileHelper.deleteFile(product.imageUrl);
             // Product.findByIdAndRemove(prodDeleteId)
            return Product.deleteOne({ _id: prodDeleteId, userId: req.user._id });
        })
         .then(() => {
            console.log('PRODUCT DELETED');
            // res.redirect('/admin/products');
             res.status(200).json({message:'sucess!!!'});
        })
        .catch(error => {
            // const erro = new Error(error);
            // error.httpStatusCode = 500;
            // return next(erro);
            res.status(500).json({ message:'Delete product failed'})
        });
       
};



// // delete the product
// exports.postDeleteProduct = (req, res, next) => {
//     // productDeleteId from delete section in admin product.ejs 
//     const prodDeleteId = req.body.productDeleteId;

 
//         Product.deleteOne({ _id: prodDeleteId, userId: req.user._id })
       
//          .then(() => {
//             console.log('PRODUCT DELETED');
//             res.redirect('/admin/products');
//         })
//         .catch(error => {
//             const erro = new Error(error);
//             error.httpStatusCode = 500;
//             return next(erro);
//         });
       
// };
