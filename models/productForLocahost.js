'use strict';

// for storing data to file 
const fs = require('fs');

// we need path to contruct path into module
const path = require('path');

const Cart = require('./cart')

// fro creating global path function 
const pathFolder = path.join(
    path.dirname(process.mainModule.filename),
     'data',
    'products.json'
);
        
// For creating helper function to get data from folder
const getProductsFromFile = (cbData) => {
    fs.readFile(pathFolder, (error, dataContent) => {
        if (error) {
            return cbData([]);
        }
        else {
            cbData(JSON.parse(dataContent));
        }
    })
};

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
        getProductsFromFile(products => {
            if (this.id) {
                 const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                 const updatedProducts = [...products];
                 updatedProducts[existingProductIndex] = this;
                 fs.writeFile(pathFolder, JSON.stringify(updatedProducts), (error) => {
                    console.log(error)
                });
            } else {
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(pathFolder, JSON.stringify(products), (error) => {
                    console.log(error)
                });
            };
        });
    };

    // delete method
    static deleteById(id) {
        getProductsFromFile(products => {
            const productD = products.find(prod => prod.id === id);
            const updatedProductsDelete= products.filter(prod => prod.id !== id);
            fs.writeFile(pathFolder, JSON.stringify(updatedProductsDelete), error => {
                if (!error) {
                    Cart.deleteProduct(id, productD.price);
                }
            });
        });
    }

    static fetchAll(cbData) {
        getProductsFromFile(cbData);
    };

    // to find product by id
    static findById(id, cbDataD) {
        getProductsFromFile(products => {
            const product = products.find(pathFolder => pathFolder.id === id);
            cbDataD(product)
        });
    };

};
