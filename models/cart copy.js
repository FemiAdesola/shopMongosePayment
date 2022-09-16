const fs = require('fs');
const path = require('path');

const pathFolder = path.join(
    path.dirname(process.mainModule.filename),
     'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // For fetching the perviuos cart
        fs.readFile(pathFolder, (error, dataContent) => {
            let cart = { products: [], totalPrice: 0 }
            if (!error) {
                cart = JSON.parse(dataContent);
            }

            // To analyze the cart => find the existing product
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            // Add new product and increment
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex]= updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + Number(productPrice); 
            fs.writeFile(pathFolder, JSON.stringify(cart), (error) => {
                console.log(error);
            })
        });
    };

    // delete 
    static deleteProduct(id, productPrice) {
        fs.readFile(pathFolder, (error, dataContent) => {
            if (error) {
                return;
            }
            const updatedCart = { ...JSON.parse(dataContent) };
            const productDelete = updatedCart.products.find(
                prod => prod.id === id
            );
            if (!productDelete) {
                return;
            }
            const productQty = productDelete.qty;
            updatedCart.products = updatedCart.products.filter( prod => prod.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            fs.writeFile(pathFolder, JSON.stringify(updatedCart), (error) => {
                console.log(error);
            });
        });
    };

    static getCart(cbData) {
        fs.readFile(pathFolder, (error, dataContent) => {
            const cart = JSON.parse(dataContent);
            if (error) {
                cbData(null)
            } else {
                cbData(cart)
            }
        });
    };
};
