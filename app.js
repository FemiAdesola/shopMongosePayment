'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error')

// for database
// const db = require('./util/database');
const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');

// from express
const app = express();

// db.execute('SELECT * FROM products')
//     .then(result => {
//         console.log(result[0], result[1]);
//     })
//     .catch(error => {
//         console.log(error);
//     });

// by using ejs engine
app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// for user
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user; 
            next();
        })
        .catch(error =>console.log(error));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// This form a one to many relationship
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

// this function create appropriate table
sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
       return User.findByPk(1);
        // console.log(result);
    })
    .then(user => {
        if (!user) {
           return User.create({name:'Femi', email:'ade@oyin.com'})
        }
        return user;
    })
    .then(user => {
        // console.log(user);
        app.listen(3000);
    })
    .catch(error => {
        console.log(error);
    });


