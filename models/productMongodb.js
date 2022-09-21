'use strict';

const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;
class Product {
    constructor(title, imageUrl, price, description, id, UserId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.UserId = UserId;
    }
    save() {
        const db = getDb();
        let dbOperation;
        if (this._id) {
            // update the product 
            dbOperation = db
                .collection('products')
                .updateOne({_id: this._id}, {$set: this})
        } else {
           dbOperation = db.collection('products')
            .insertOne(this)
        }
        return dbOperation
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

    // delete method
    static deleteById(id) {
         const db = getDb();
        return db
            .collection('products')
            .deleteOne({
                _id: new mongodb.ObjectId(id)
            })
            .then(result => {
                console.log('Deleted')
            })
            .catch(error => {
                console.log(error)
            });
    }
}

module.exports = Product;
