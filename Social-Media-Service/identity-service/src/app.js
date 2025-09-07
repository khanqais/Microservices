const express=require('express')
const app=express()
const connectDB = require("./DB/connect");
require('dotenv').config()
const logger=require('./utils/logger')  
const cors=require('cors')
const helmet=require('helmet')
const {RateLimiterRedis}=require('rate-limiter-flexible')
const Redis=require('ioredis')
const RedisClient=new Redis(process.env.REDIS_URL)
const rateLimit = require('express-rate-limit')  
const {RedisStore}=require('rate-limit-redis');
const register = require('./controllers/identity-controller');
const UserRoute = require('./routes/identity-routes');

app.use(helmet())
app.use(cors())
app.use(express.json())
app.get('/',(req,res)=>{
    res.send("Hii Mom")
})

//Ddos protection
const rateLimiter=new RateLimiterRedis({
    storeClient:RedisClient,
    keyPrefix:'middleware',
    points:10,
    duration:1
})

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate Limit Exceeded for IP:${req.ip}`)
        res.status(429).json({success:false,message:'Too many request'})
    })
})

//IP based rate limiting for sensitive endpoints
const sensitiveEndpointLimiter=rateLimit({
    windowMs: 15*60*1000,
    max: 50,
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

app.use('/api/auth',sensitiveEndpointLimiter)
app.use('/api/auth',UserRoute)

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    logger.info("Connected to MongoDB successfully");  
    app.listen(PORT, () => {
        logger.info(`Server is listening on port ${PORT}`);  
    });
  } catch (error) {
    logger.error('Failed to start server:', error); 
  }
};

start();
