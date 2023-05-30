
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require ("express")
const app = express()
const bcrypt = require ("bcrypt") //allows us key password secure by harshing it
const passport = require ('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const crypto = require('crypto')

const intializePassport = require ('./passport-config')
intializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//using a local variable instead of connecting to a database for this example
const users = []

app.set('view-engine','ejs')

//since we would be getting info from login and register
//we'd set use app.use
app.use(express.urlencoded({extended: false }))
//tells the app to take the forms(email & password) in the req f the app.post mthd

app.use(flash())

const sessionSecret = crypto.randomBytes(64).toString('hex');

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated, (req,res)=>{
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs', {message:req.flash('error') })
})
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req,res)=>{
    //create a new user with the harsh pasword using asynchronous
    try {
        const harshedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now.toString(),
            name: req.body.name,
            email: req.body.email,
            password: harshedPassword
        })
        res.redirect('/login')
    } catch (error) {
        res.redirect('/register')    
    }
  console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}


function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next()
}
app.listen(3000)