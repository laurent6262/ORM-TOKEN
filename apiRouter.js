// imports

var express = require("express");
var usersCtrl = require('./routes/usersCtrl');

// routeur

exports.router = ( function() {

    var apiRouter = express.Router();
    
    //console.log("je passe Router");
    //console.log(typeof(apiRouter));

    // users routes

    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);

    return apiRouter;

})();
