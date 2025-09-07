const logger=require('../utils/logger')
const User=require('../model/User')

const register=async(req,res)=>{
    logger.info('Registration Endpoint hit...')
    try {
        const {email,password,username}=req.body
        let user=await User.findOne({$or:[{email},{username}]})
        if(user){
            return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
        })
        }
        user=new User({username,email,password})
        await user.save()
        logger.warn("User saved successfully",user._id)
        const token = user.createJWT();
        res.status(201).json({
            success:true,
            message:"User Registered Successfully",
            token: token
        })



    } catch (error) {
        logger.error('Registration error:', error)  

        res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
        
    }
}
module.exports=register