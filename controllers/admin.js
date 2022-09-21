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
        description: description,
        userId:req.user
    });
    product.save()
    .then(result => {
        // console.log(result);
        console.log('Created product');
        res.redirect('/admin/products');
     })
    .catch(error => (console.log(error)));
};

// get the product
exports.getProducts = (req, res, next) => {
    Product.find()
        // // for selection certain field
        // .select('title price -_id')
        // .populate('userId', 'name')
        .then((products) => {
            console.log(products)
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
                product: prodEdit
            });
        })
        .catch(error=>console.log(error)); 
};

// edit post product 
exports.postEditProduct = (req, res, next)=>{
    const prodId = req.body.productID;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    
    Product.findById(prodId)
        .then(productUpdate => {
            productUpdate.title = updatedTitle;
            productUpdate.imageUrl=updatedImageUrl;
            productUpdate.price = updatedPrice;
            productUpdate.description = updatedDescription;
            return productUpdate.save()  
        })
        .then(result => {
            console.log('UPDATED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(error => console.log(error));
};

// delete the product
exports.postDeleteProduct = (req, res, next) => {
    // productDeleteId from delete section in admin product.ejs 
    const prodDeleteId = req.body.productDeleteId;
    Product.findByIdAndRemove(prodDeleteId)
        .then(() => {
            console.log('PRODUCT DELETED');
            res.redirect('/admin/products');
        })
        .catch(error=> console.log(error));
};
