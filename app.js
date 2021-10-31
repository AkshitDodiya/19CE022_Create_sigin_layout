const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

//database
var User = require("./model/User");

const app = express();
const port = 3000;
const hbs = require('express-handlebars');
// set app view - engine

app.set('view engine', 'hbs');
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout : 'index',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
}));
// middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    key : "user_id",
    secret : "RandomSecretKey",
    resave: false,
    saveUninitialized : false,  // session save but not initialized but that condtion i won't save the session  
    cookie : {
        expires : 60000 ,
    }
})); 

//verify session and cookie
var sessionChecker = (req,res,next)=>{
    if(req.session.user && req.cookies.user_id){
        res.redirect('/dashboard');
    }else{
        next();
    }
}

app.get('/',sessionChecker , (req,res)=>{
    res.redirect('/login'); 
})
// app.get('/', (req,res)=>{
//     if(req.session.user && req.cookies.user_id){
//         res.render('dashboard',{title : "Dashboard"});
//     }else{
//         res.redirect('/login');
//     }
// })

app.route('/login')
.get(sessionChecker , (req,res)=>{
    res.render('login', {title :"Login Page"})
})
.post(async (req,res)=>{
    console.log(req.body);
    var username = req.body.username;
    password = req.body.password;

    try{
        var user =await User.findOne({username : username}).exec();
        if(!user){
            console.log("User not found");
            res.redirect('/login');
        }
        else{
            // found user...
            console.log("User found");
            user.comparePassword(password , (error, match)=>{
                if(!match){
                    res.redirect('/login');
                    console.log("pass not matched...");
                }
                else{
                    console.log("Password matched...");
                    req.session.user = user;
                    res.redirect('/dashboard');
                }
            });
        }

    }catch(error){
        console.log("FOUND ERRROR!!!!!!!!!!");
        console.log(error);
    }
})

app.route('/signup')
.get(sessionChecker , (req,res)=>{
    res.render('register', {title :"Sign Up"})
})
.post((req,res)=>{
    // console.log("get data: ")
    // console.log(req.body);
    var user = new User ({
        username : req.body.username,
        email : req.body.email,
        password : req.body.password
    });
    user.save((err,doc)=>{
        if(err){
            console.log(err);
            res.send("<h1>Something went Wrong !!</h1>");
        }
        else{
            req.session.user = doc
            console.log('redirect to dashboard...');
            res.redirect('/dashboard');
        }
    })
})

app.get('/dashboard', (req,res)=>{
    if(req.session.user && req.cookies.user_id){
        res.render('dashboard',{title : "Dashboard"});
    }else{
        res.redirect('/login');
    }
})

app.get('/logout' , (req,res)=>{
    if(req.session.user && req.cookies.user_id){
        res.clearCookie("user_id");
        // console.log("logout :  found cookie...");
        res.redirect('/');
    }else{
        // console.log("already logout....");
        res.redirect('/login');
    }
});

app.use(function(req,res,next){
    res.status(404).send("<h1>404 Sorry page not found..</h1>")
})

//routes....

app.listen(port, () => console.log(`App listening to port ${port}`));