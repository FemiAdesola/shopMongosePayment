'use strict';
const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;
class User  {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }
    save() {
        const db = getDb();
        return db.collection('user')
            .insertOne(this)
            .then()
            .catch(error => {
                console.log(error)
            });
    }

    // for adding product to cart
    addToCart(productInCart) {
        // const cartProduct = this.cart.items
        //     .findIndex(pro => {
        //         return pro._id === productInCart._id;
        //     });

        // productInCart.quantity = 1;
        const updatedCart = { items: [{ productId: new ObjectId(productInCart._id), quantity: 1 }] };
        const db = getDb();
        return db.collection('users')
            .updateOne(
                { _id: new ObjectId(this._id) },
                {$set: {cart:updatedCart}}
            )
            .then(userCart => {
                // console.log(user);
                return userCart;
            })
            .catch(error => {
                console.log(error)
            });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({
                _id: new ObjectId(userId)
            })
            .then(user => {
                // console.log(user);
                return user;
            })
            .catch(error => {
                console.log(error)
            });
        
    }
};

module.exports = User;
