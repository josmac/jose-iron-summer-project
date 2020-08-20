const passport = require("passport");
const User = require("../models/user.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const randomPassword = () => Math.random().toString(36).substring(7)

  
const google = new GoogleStrategy(
    {
    clientID: "678813995057-51i2ro7leudcdhc3j304uand0t1flclu.apps.googleusercontent.com",
    clientSecret: "MGiwv2dGsgsuf_Q9spIA4032",
    callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, next) => {

        User.findOne({ "social.google": profile.id })
            .then(user => {
                if (user) {
                    next(null, user);
                } else {
                    const newUser = new User({
                        name: profile.displayName,
                        email: profile._json.email,
                        avatar: profile._json.picture,
                        password: profile.provider + randomPassword(),
                        social: {
                            google: profile.id,
                        },
                        activation: {
                            active: true
                        }
                    });
                    newUser
                        .save()
                        .then((user) => {
                            next(null, user);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    }
);

passport.use(google)

module.exports = passport.initialize()