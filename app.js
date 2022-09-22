'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

// for database
// const mongoConnect = require('./util/database.js').mongoConnect;
const MONGODB_URL = 'mongodb+srv://Femi:CwRbXZuHSUaMW9yH@shop.fftoabl.mongodb.net/shop';

// User
const User = require('./models/user');

// from express
const app = express();

// for cookies/ seesion
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection:'session'
});

// by using ejs engine
app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// for cookies/ seesion
app.use(session({
    secret: 'the secret',
    resave: false,
    saveUninitialized: false,
    store:store
}));

// for user
// app.use((req, res, next) => {
//     User.findById("632af6e411a86492cb452c83")
//         .then(user => {
//             req.user = user;
//             next();
//         })
//         .catch(error =>console.log(error));
// })




app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// server connection with mongoose 
mongoose.connect(MONGODB_URL)
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
