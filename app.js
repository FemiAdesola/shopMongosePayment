'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');
// const errorController = require('./controllers/error');

// for database
const mongoConnect = require('./util/database.js');

// from express
const app = express();

// by using ejs engine
app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// for user
app.use((req, res, next) => {
    // User.findById(1)
    //     .then(user => {
    //         req.user = user; 
    //         next();
    //     })
    //     .catch(error =>console.log(error));
})

// app.use('/admin', adminRoutes);
// app.use(shopRoutes);
// app.use(errorController.get404);

mongoConnect((cbData) => {
    console.log(cbData);
    app.listen(3000);
});
