'use strict';

// get orders
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'You Login',
        isAuthenticated: req.isLoggedIn
    });
    
};

// psot orders
exports.postLogin = (req, res, next) => {
    req.isLoggedIn = true
    res.redirect('/')
    
};