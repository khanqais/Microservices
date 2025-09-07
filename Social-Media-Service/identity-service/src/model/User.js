const mongoose=require('mongoose')
const argon2=require('argon2')
const jwt=require('jsonwebtoken')

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,'PLease provide name'],
        minlength:3,
        maxlength:50,
    },
    
    email:{
        type:String,
        required:[true,'PLease prove email'],
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'please provide valid email'],
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
    
},{
    timestamps:true,
})

UserSchema.pre('save',async function(next){
    try {
        this.password=await argon2.hash(this.password)
    } catch (error) {
        console.log(error);
        
    }
})

UserSchema.methods.comparePassword= async function (pass) {
    try {
        return await argon2.verify(this.password,pass)
    } catch (error) {
        console.log(error);
    }
}
UserSchema.methods.createJWT = function () {
    return jwt.sign(
      { userId: this._id, username: this.username },
      process.env.JWT_SECRET,  
      { expiresIn: process.env.JWT_LIFETIME }
    )
}
UserSchema.index({username:'text'})

const User=mongoose.model('User',UserSchema)
module.exports=User
