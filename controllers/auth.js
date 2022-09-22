'use strict';

// get orders
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'You Login',
    });
    
};