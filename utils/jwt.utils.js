// imports

var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = "abcdefghijklmnopqrstuvwxyz123456789";

// exported functions

module.exports = {
    generateTokenForUser: function( userData ) {
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h' 
        });
    },
    parseAuthorization: function(authorization){
        var result = ( authorization != null ) ? authorization.replace('Bearer ',''):null;
        console.log("resultat : "+result);
        return  result
    },
    getUserId: function(authorization){
        var userId = -1;
        var token=module.exports.parseAuthorization(authorization);
        console.log(token);
        if(token!=null){
            console.log("je passe ici");
            try{
                console.log("je passe dans le try");
                var jwtToken=jwt.verify(token,JWT_SIGN_SECRET);
                console.log(jwtToken);
                if(jwtToken!=null) userId=jwtToken.userId;
            } catch(err) {}
        }

        return userId;
    }

    
}