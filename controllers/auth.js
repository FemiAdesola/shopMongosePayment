'use strict';
const User = require('../models/user')

// get login
exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[0]
    //     .trim()
    //     .split('=')[1] === 'true';

    // console.log(req.session.isLoggedIn)

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'You Login',
        isAuthenticated: false
    });
    
};

// post loging
exports.postLogin = (req, res, next) => {
    // here we set cookies for global authentication
    // res.setHeader('set-Cookie', 'loggedIn=true');
    
    User.findById('632af6e411a86492cb452c83')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(error => {
                console.log(error);
                res.redirect('/');
            })
        })
        .catch(error => console.log(error));
};

// post logout
exports.postLogout = (req, res, next) => {
    req.session.destroy((error) => {
        console.log(error)
        res.redirect('/')
    })
};


// get sigunp 
exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

// post sigunp 
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      const user = new User({
        email: email,
        password: password,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
    });
};