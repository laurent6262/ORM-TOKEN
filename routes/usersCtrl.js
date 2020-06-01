// les imports

var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// les constantes

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

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
        
        if ( email == null || username == null || password == null )
        {
            return res.status(400).json({'error': 'il manque des paramètres'});
        }

        if ( username.length >=13 || username.length <=4) {
            return res.status(400).json({'error': 'le pseudo doit contenir entre 5 et 12 caractères'});
        }

        if (!EMAIL_REGEX.test(email)){
            return res.status(400).json({'error': "l' adresse email n'est pas valide"});
        }

        if (!PASSWORD_REGEX.test(password)){
            return res.status(400).json({'error': "Mot de passe invalide, sa longueur doit être entre 4 et 8 caractères avec au moins 1 chiffre"});
        }

        // les waterfalls

        asyncLib.waterfall
        ([
           
            function(cb)
            {
                // nous recherchons un utilisateur par son email

                models.User.findOne(
                {
                    attributes: ['email'],
                    where: {email: email}
                })

                .then(function(userFound)
                {
                    // null signifie qu'il n'y a pas eu d'erreur et userFoun est le résultat de la recherche 
                    cb(null, userFound);
                    
                })
            
                .catch(function(err)
                {
                     return res.status(500).json({'error': "impossible de vérifier l'utilisateur"});
                });
            },

            function(userFound,cb){
                
                if(!userFound)
                {
                    
                    bcrypt.hash(password,5, function(err,bcryptedPassword)
                    {
                        cb(null,userFound,bcryptedPassword);
                    });
                } 
                else
                {
                    return res.status(409).json({'error': "l'utilisateur existe déjà"});
                }
            },

            function(userFound,bcryptedPassword,cb)
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
                    cb(newUser);
                       
                })

                .catch (function(err)
                {
                    return res.status(500).json({'error': "impossible d'ajouter l'utilisateur"});
                })
            }
       
        ], function(newUser)
            { 
                if (newUser)
                {
                    return res.status(201).json({ 'userId': newUser.id })
                }
                else
                {
                    return res.status(500).json({'error': "impossible d'ajouter l'utilisateur"});
                }
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
        
        asyncLib.waterfall
        ([
            function(done)
            {
                
                models.User.findOne(
                {
                    where: {email: email}
                })

                .then(function(userFound)
                {
                    done (null,userFound);
                })

                .catch(function(err)
                {
                    return res.status(500).json({'error': "impossible de vérifier l'utilisateur"});
                })
            },

            function(userFound,done)
            {
                if (userFound)
                {

                   bcrypt.compare(password,userFound.password, function(errBcrypt,resBcrypt)
                   {
                        if(resBcrypt)
                        {
                            var result =
                                {
                                    statusCode : 200,
                                    userid: userFound.id,
                                    token: jwtUtils.generateTokenForUser(userFound)
                                }

                                done(result);
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
           }],function(result){
                 
                 return res.status(result.statusCode).json({'userId': result.userid, 'token': result.token});
           
            }

        )
    },
    getUserProfile: function(req,res){
        //getting auth header
        
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        console.log(userId);
        
        if(userId <0){
            return res.status(400).json({'erreur': 'token invalide'});
        }

        models.User.findOne(
            {
                attributes: ['id','email','username','bio'],
                where: {id: userId}
            
            }).then(function(user)
            {
                if(user){
                    res.status(201).json(user); 
                } else {
                    res.status(404).json({'erreur': 'utilisateur non trouvé'});
                }
            }).catch(function(err)
            {
                return res.status(500).json({'error': "impossible de récupérer l'utilisateur"});
            })
    },
    updateUserProfile: function(req,res){
        //getting auth header
        
        var headerAuth = req.headers['Authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        

        // les paramètres
        
        var bio=req.body.bio;

        asyncLib.waterfall
        ([
            function(done)
            {
                
                models.User.findOne(
                {
                    attributes: ['id','bio'],
                    where: {id: userId}
                })

                .then(function(userFound)
                {
                    done (null,userFound);
                })

                .catch(function(err)
                {
                    return res.status(500).json({'error': "impossible de vérifier l'utilisateur"});
                })
            },

            function(userFound,done)
            {
                if (userFound)
                {
                   
                   userFound.update({
                       bio: (bio ? bio : userFound.bio)
                    }).then(function(){
                        done(userFound);
                    }).catch(function(err) {
                        return res.status(500).json({'error': "mise à jour utilisateur impossible"});
                    });
                } else
                {
                    return res.status(404).json({'error': "l'utilisateur n' existe pas dans la base de données"});
                }       
            }], function(userFound) {
                if(userFound){
                    res.status(201).json(userFound);
                } else {
                    return res.status(500).json({'error': "mise à jour profile utilisateur impossible"});
                }

            })

    }


}
