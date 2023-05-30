const LocalStrategy = require('passport-local').Strategy
//to make sure our users password matches we use bcrypt
const bcrypt = require ('bcrypt')

// we'd put all of our passport information 
function intialize(passport,getUserByEmail, getUserbyId) {
    const authenticateUser = async (email, password, done)=>{
        const user = getUserByEmail(email)
        if(user == null) {
            return done(null,false, {message: 'No user with that email' })
        }

        try {
            if ( await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done( null, false, { message: 'Password incorrect'})
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField : 'email'}, 
    authenticateUser))
    passport.serializeUser((user,done) => done(null, user.id))
    passport.deserializeUser((id,done) => { 
       return done(null, getUserbyId(id))
    })
}

module.exports = intialize