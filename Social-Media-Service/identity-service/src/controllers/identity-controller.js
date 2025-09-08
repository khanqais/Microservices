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
        const token =await user.createJWT(user);

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

const login=async(req,res)=>{
    logger.info("Login endpoint ")
    try {

        const {email,password}=req.body;
        const user= await User.findOne({email})
        if(!user){
            logger.warn("Invalid User")
            return res.status(400).json({
                success:false,
                message:"User Not Existed"
            })
        }
        const IsPassword=await user.comparePassword(password)
        if(!IsPassword){
            logger.warn("Invalid Password")
            return res.status(400).json({
                success:false,
                message:"Password sahi nhi "
            })
        }
        const token =await user.createJWT(user);
        return res.json({
            success:true,
            token
        })


    } catch (error) {
        logger.error('Login error:', error)  
        res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
        
    }
    
}



module.exports={
    login,register
}