'use strict';
const bcrypt = require('bcryptjs');

// nodemailer
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgridTransport({
   auth:{
    api_key: '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'
    }
}))


const User = require('../models/user');

// get login
exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[0]
    //     .trim()
    //     .split('=')[1] === 'true';

    // console.log(req.session.isLoggedIn)

    // error message for view page
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        // isAuthenticated: false
         errorMessage: message
    });
    
};

// get sigunp 
exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }   
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    // isAuthenticated: false
    errorMessage: message
  });
};

// post loging
exports.postLogin = (req, res, next) => {
    // to find user by email and password
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(error => {
                            console.log(error);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
                 })
                .catch(error => {
                    console.log(error);
                    res.redirect('/login')
                });
        })
        .catch(error => console.log(error));
};


// post sigunp 
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'E-Mail exists already, please pick a different one.');
        return res.redirect('/signup');
      }
        // for creating hash password we can have nested function here
        return bcrypt
            .hash(password, 12)
            .then(hashPassword => {
                const user = new User({
                    email: email,
                    password: hashPassword,
                    cart: { items: [] }
                });
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                // sending mail 
                return transporter.sendMail({
                    to: email,
                    from: 'moysem11@gmail.com',
                    subject: 'your signup is successful!!!',
                    html: '<h1> You successfully signed up !</h1>'
                });
               
            }).catch(err => {
                console.log(err);
            });
    }) 
    .catch(err => {
      console.log(err);
    });
};



// post logout
exports.postLogout = (req, res, next) => {
    req.session.destroy((error) => {
        console.log(error)
        res.redirect('/')
    })
};




// exports.postLogin = (req, res, next) => {
//     // here we set cookies for global authentication
//     // res.setHeader('set-Cookie', 'loggedIn=true');

//      User.findById('633191025b662a39b90b10c6')
//         .then(user => {
//             req.session.isLoggedIn = true;
//             req.session.user = user;
//             req.session.save(error => {
//                 console.log(error);
//                 res.redirect('/');
//             })
//         })
//         .catch(error => console.log(error));
// }