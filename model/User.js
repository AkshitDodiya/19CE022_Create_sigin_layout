const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect("mongodb://localhost:27017/loginDB",{
    useNewUrlParser: true,
    useUnifiedTopology : true
});

const userSchema = new mongoose.Schema({
        username:{
            type : String,
            unique : true,
            required :  true
        },
        email : {
            type : String,
            unique : true,
            required : true
        },
        password : {
            type : String,
            required : true
        }
});

//useful function...
userSchema.pre("save" , function(next){
    if(!this.isModified("password")){
        // check weather we have password or not..
        return next();
    }
    // password is available..
    this.password = bcrypt.hashSync(this.password,12);
    next(); 
});

userSchema.methods.comparePassword = function(plaintext, callback){
    return callback(null, bcrypt.compareSync(plaintext, this.password));
}

const userModel = mongoose.model("LoginUser", userSchema);

module.exports = userModel