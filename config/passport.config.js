const passport = require("passport");
const User = require("../models/user.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const randomPassword = () => Math.random().toString(36).substring(7)

  
const google = new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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