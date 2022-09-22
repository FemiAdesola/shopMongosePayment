'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

// for database
const mongoConnect = require('./util/database.js').mongoConnect;

// User
const User = require('./models/user');

// from express
const app = express();

// by using ejs engine
app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// for user
app.use((req, res, next) => {
    User.findById("632af6e411a86492cb452c83")
        .then(user => {
            req.user = user;
            next();
        })
        .catch(error =>console.log(error));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// server connection with mongoose 
mongoose.connect('mongodb+srv://Femi:CwRbXZuHSUaMW9yH@shop.fftoabl.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        // to avoid duplicate 
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Femi',
                    email: 'Ade@yahoo.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000)
    })
    .catch(error => {
        console.log(error)
    });
