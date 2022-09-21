'use strict';
const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/editProduct', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing:false
    });
};

exports.postAddProduct = (req, res, next) => {
    // console.log(req.body)
    // for the data folder, we pass what we pass in the contructor inside product.js 
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    // for database sequ...
    const product = new Product({
        title:title,
        imageUrl:imageUrl,
        price:price,
        description:description,
    });
    product.save()
    .then(result => {
        // console.log(result);
        console.log('Created product');
        res.redirect('/admin/products');
     })
    .catch(error => (console.log(error)));
};


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
                product: prodEdit
            });
        })
        .catch(error=>console.log(error)); 
};

exports.postEditProduct = (req, res, next)=>{
    const prodId = req.body.productID;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const productUpdate = new Product(
        updatedTitle,
        updatedImageUrl,
        updatedPrice,
        updatedDescription,
        prodId
    )
    productUpdate
        .save()
        .then(result => {
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(error => console.log(error));
    
};


exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then((products) => {
            res.render('admin/products', {
            prod: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
        })
        .catch(error =>{
            console.log(error)
        });
};

exports.postDeleteProduct = (req, res, next) => {
    // productDeleteId from delete section in admin product.ejs 
    const prodDeleteId = req.body.productDeleteId;
    Product.deleteById(prodDeleteId)
        .then(() => {
            console.log('PRODUCT DELETED');
            res.redirect('/admin/products');
        })
        .catch(error=> console.log(error));
};
