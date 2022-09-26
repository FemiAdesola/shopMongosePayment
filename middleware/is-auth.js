'use strict';
// for protecting the pages 
module.exports = (req, res, next) => {
      if (!req.session.isLoggedIn) {
        return res.redirect('/login')
      }
    next ()
}