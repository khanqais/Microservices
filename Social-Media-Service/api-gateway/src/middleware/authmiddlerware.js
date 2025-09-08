
const logger=require('../utils/logger')
const jwt=require('jsonwebtoken')
const validate=(req,res,next)=>{
    const authHeader=req.headers['authorization']
    const token=authHeader && authHeader.split(" ")[1];
    if(!token){
        logger.warn('Access attempted without valid token')
        return res.status(400).json({
            message:'Authentication required',
            success:false
        })
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
         if(err){
            logger.warn('Invalid')
        return res.status(429).json({
            message:'Invalid token',
            success:false
        })
         }
         req.user=user 
         next()
    })

}

module.exports=validate