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

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// this function create appropriate table
sequelize.sync()
    .then(result => {
        console.log(result);
        app.listen(3000)
    })
    .catch(error => {
        console.log(error);
    });


