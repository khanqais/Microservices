const logger=require('../utils/logger')

const authenticated=(req,res,next)=>{
    const userId=req.headers['x-user-id']
    if(!userId){
        logger.warn(`Access attempted without userId`)
        return res.json({
            success:false,
            message:"Authentication required"
        })
    }
    req.user={userId}
    next()
}

module.exports={authenticated}