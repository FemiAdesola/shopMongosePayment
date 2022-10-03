'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');

const csrf = require('csurf');
const flash = require('connect-flash');

// for file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else{
  
    cb(null, false)
  }
}
//

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

// for database
const MONGODB_URL = 'mongodb+srv://Femi:CwRbXZuHSUaMW9yH@shop.fftoabl.mongodb.net/shop';

// User
const User = require('./models/user');
const { Error } = require('sequelize');

// from express
const app = express();

// for cookies/ seesion
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection:'session'
});

const csrfProtection = csrf();

// by using ejs engine
app.set('view engine', 'ejs');
app.set('views', 'pages');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// for serving inage statically 
app.use('/images', express.static(path.join(__dirname, 'images')));

// for multer || the name image is comming from ejs file 
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));

// for cookies/ seesion
app.use(session({
    secret: 'the secret',
    resave: false,
    saveUninitialized: false,
    store:store
}));


app.use(csrfProtection);
app.use(flash());

// flash and csurf
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // error handling async
      if (!user) {
        return next();
      }
      //
      req.user = user;
      next();
    })
    .catch(error => {
      throw new Error(error)
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

// error 500
app.use((error, req, res, next) => {
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

// server connection with mongoose 
mongoose.connect(MONGODB_URL)
    .then(result => {
        app.listen(3000)
    })
    .catch(error => {
        console.log(error)
    });
