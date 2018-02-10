const app     = require('../../../server');
const jwt     = require('jsonwebtoken');
const secrets = require('../../../config/secrets');
const bcrypt  = require('bcrypt');
const User    = require('../../models/User');


module.exports = {

    login: (req, res) => {
        User.findOne({ where: { username: req.body.username } }).then(user => {
            if (user) {
                if(user.validPassword(req.body.password)) {
                    var token = jwt.sign({userId: user.id}, secrets.tokenSecret, {expiresIn: '1h'});
                    res.status(200).json({
                        token: token,
                        user: user
                    });
                } else {
                    res.status(200).json("Invalid username and/or password.");
                }
            } else {
                res.status(200).json("Could not find that user.");
            }
        });
    },

    createUser: (req, res, next) => {
        User.create({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email,
            supervisor: req.body.supervisor,
            role: req.body.role
        }) 
        .then(user => {
            res.status(200).json("You have successfully created a new account!");
        })
        .catch(error => {
            res.status(401).json("There was an unexpected error", error);
        });
    }
}