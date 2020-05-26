// les imports

var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');

// les routes

module.exports = 
{

    register: function(req,res)
    {

        // les paramètres

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var bio = req.body.bio;
        
        if( email == null || username == null || password == null )
        {
            return res.status(400).json({'error': 'il manque des paramètres'});
        }

       
        models.User.findOne(
        {
            attributes: ['email'],
            where: {email: email}
        })

        .then(function(userFound)
        {
            if (!userFound)
            {

                bcrypt.hash(password,5, function(err,bcryptedPassword)
                {
                    
                    var newUser = models.User.create(
                    {
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0
                    })

                    .then(function(newUser)
                    {
                        
                        return res.status(201).json({'userId': newUser.id});
                    })

                    .catch(function(err)
                    {
                        return res.status(500).json({'error': "impossible d'ajouter l'utilisateur"});
                    })

                })

            } else 
            {
                return res.status(409).json({'error': "l'utilisateur existe déjà"});
            }

        })

        .catch (function(err)
        {
            return res.status(500).json({'error': "impossible de vérifier l'utilisateur"});
        });
    },

    login: function(req,res)
    {
           
        // paramètres

        var email = req.body.email;
        var password = req.body.password;

        if( email == null ||  password == null )
        {
            return res.status(400).json({'error': 'il manque des paramètres'});
        }
        
        models.User.findOne(
        {
            where: {email: email}
        })

        .then(function(userFound)
        {
            if (userFound)
            {

                bcrypt.compare(password,userFound.password, function(errBcrypt,resBcrypt)
                {
                    if(resBcrypt)
                    {
                        return res.status(200).json(
                        {
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });

                    }
                    else
                    {
                        return res.status(403).json({'error': "mot de passe incorrect"});
                    }
                    
                })

            }        
            else
            {        
                return res.status(404).json({'error': "l'utilisateur n' existe pas dans la base de données"});
            }
        })

        .catch(function(err)
        {
            return res.status(500).json({'error': "impossible de vérifier l'utilisateur"});
        });

    }
}