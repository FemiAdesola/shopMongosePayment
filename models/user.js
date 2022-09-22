'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {type:Schema.Types.ObjectId, ref:'Product', required:true},
            quantity:{type:Number, required:true}
        }]
    },
});

userSchema.methods.addToCart = function(productInCart){
    const cartProductIndex = this.cart.items.findIndex(pro => {
            return pro.productId.toString() === productInCart._id.toString();
        });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: productInCart._id,
            quantity: newQuantity
        });
    }
    const updatedCart = { items: updatedCartItems};
    this.cart=updatedCart; 
    return this.save()
};

// deleteItemFromCart
userSchema.methods.deleteItemFromCart = function (productIdDeleted) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productIdDeleted.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

// clear the cart 
userSchema.methods.clearCart = function () {
    this.cart = {items:[]};
    return this.save();
}

module.exports = mongoose.model('User', userSchema);
