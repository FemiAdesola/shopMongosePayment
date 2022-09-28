'use strict';
// for generate password 
const crypto = require('crypto');

const bcrypt = require('bcryptjs');

// nodemailer
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgridTransport({
   auth:{
    api_key: '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'
    }
}))

//  check validator
const { validationResult } = require('express-validator/check');

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
    // for checking validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422)
            .render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg
            });
    }
        //
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

// reset password
exports.getPasswordReset = (req, res, next) => {
    // error message for view page
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/passwordReset', {
        path: '/reset',
        pageTitle: 'Reset Password ',
        errorMessage: message
    });
};

// for post reset password
exports.postPasswordReset = (req, res, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if (error) {
            console(error);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with this email ');
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
            })
            .then(result => {
                res.redirect('/');
                // sending mail 
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'moysem11@gmail.com',
                    subject: 'Password was reset successful!!!',
                    html: `
                    <h4> You requested for password reset !</h4>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password. </p>
                    <p>Your have one hour to reset your password </p>
                    `
                });
            })
            .catch(err => {
                console.log(err);
            });
    });
};


// For creating new password
exports.getNewPassword = (req, res, next) => {
    // for requesting token 
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        // gt means greater than 
        resetTokenExpiration: { $gt: Date.now() }
    })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/newPassword', {
                path: '/new-password',
                pageTitle: 'New Password ',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken:token
            });
        })
        .catch(error => console.log(error));
};

// for posting new password
exports.postNewPassword = (req, res, next) => {
    // for receiving new password
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hashSync(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined; 
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(error => console.log(error));
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