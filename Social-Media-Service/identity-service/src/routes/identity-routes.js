const express=require('express')
const register = require('../controllers/identity-controller')
const UserRoute=express.Router()

UserRoute.post('/register',register)

module.exports=UserRoute