// imports

var express = require("express");
var usersCtrl = require('./routes/usersCtrl');

// routeur

exports.router = ( function() {

    var apiRouter = express.Router();

    // users routes

    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);

    return apiRouter;

})();
