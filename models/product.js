'use strict';
const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;
class Product {
    constructor(title, imageUrl, price, description) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }
    save() {
        const db = getDb();
        return db
            .collection('products')
            .insertOne(this)
            .then(result => {
                console.log(result);
            })
            .catch(error => console.log(error));
    }
    static fetchAll() {
        const db = getDb();
        return db
            .collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => {
                console.log(err);
            });
    }
    // to find product by id
    static findById(prodId) {
        const db = getDb();
        return db
            .collection('products')
            .find({ _id: new mongodb.ObjectId(prodId) })
            .next()
            .then(productSingle => {
                console.log(productSingle);
                return productSingle;
            })
            .catch(err => {
                    console.log(err);
            });
        
    };
}





module.exports = Product;