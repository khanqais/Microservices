const express=require('express')
const {register,login} = require('../controllers/identity-controller')
const UserRoute=express.Router()

UserRoute.post('/register',register)
UserRoute.post('/login',login)

module.exports=UserRoute