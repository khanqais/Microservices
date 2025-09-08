require('dotenv').config()
const express=require('express')
const app=express()
const cors=require('cors')
const Redis=require('ioredis')
const helmet=require('helmet')
const {rateLimit}=require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const PORT=process.env.PORT || 3000
const redisClient=new Redis(process.env.REDIS_URL)
const logger=require('./utils/logger')

app.use(cors())
app.use(helmet())
app.use(express.json())


//rate limiting
const RateLimits=rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`Sensitive Endpoint rate limit exceeded for IP:${req.ip}`)
        res.status(429).json({success:false,message:'Too many request'})
    } ,
    store: new RedisStore({
        sendCommand:(...args)=>RedisClient.call(...args)
    }),                
})

app.use(RateLimits)

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate Limit Exceeded for IP:${req.ip}`)
        res.status(429).json({success:false,message:'Too many request'})
    })
})

// api-gateway -> /v1/auth/register -> 3000 this will point to identity -> /api/auth/register -> 3001


