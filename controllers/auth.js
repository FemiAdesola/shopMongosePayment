'use strict';

// get orders
exports.getLogin = (req, res, next) => {
    const isLoggedIn = req
        .get('Cookie')
        .split(';')[0]
        .trim()
        .split('=')[1] === 'true';
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'You Login',
        isAuthenticated: isLoggedIn
    });
    
};

// psot orders
exports.postLogin = (req, res, next) => {
    // here we set cookies for global authentication
    res.setHeader('set-Cookie', 'loggedIn=true');
    res.redirect('/')
    
};