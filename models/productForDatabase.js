'use strict';

// for database
const db = require('../util/database')

// const Cart = require('./cart')

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    // save method and edit method
    save() {
       return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)',
        [this.title,this.price ,this.imageUrl,this.description]);
    };

    // delete method
    static deleteById(id) {
        
    }

    static fetchAll() {
      return  db.execute('SELECT * FROM products');
    };

    // to find product by id
    static findById(id) {
       return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    };

};
