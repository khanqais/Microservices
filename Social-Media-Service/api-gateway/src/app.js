require('dotenv').config()
const express=require('express')
const app=express()
const cors=require('cors')
const Redis=require('ioredis')
const helmet=require('helmet')
const rateLimit=require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const PORT=process.env.PORT || 3000
const RedisClient=new Redis(process.env.REDIS_URL)
const logger=require('./utils/logger')
const proxy=require('express-http-proxy')
const validate = require('./middleware/authmiddlerware')

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

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});


const proxyOption={
    proxyReqPathResolver:(req)=>{
        return req.originalUrl.replace(/^\/v1/,"/api")
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`Proxy error:${err.message}`)
        res.status(500).json({
            message:"Internal Server error"
        })
    }
}
// api-gateway -> /v1/auth/register -> 3000 this will point to identity-service -> /api/auth/register -> 3001
app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOption,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"]="application/json"
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from identity service :${proxyRes.statusCode}`)
        return proxyResData
    }
}))


//setting up proxy for out post-service
app.use(
  "/v1/post",
  validate,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

//setting up proxy for out media-service
app.use(
  "/v1/media",
  validate,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
    parseReqBody: false,
  })
);


app.listen(PORT,()=>{
    logger.info(`API GATEWAY is running on port: ${PORT}`)
    logger.info(`Identity Service is running on port: ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`Post Service is running on port: ${process.env.POST_SERVICE_URL}`)
    logger.info(`Media Service is running on port: ${process.env.MEDIA_SERVICE_URL}`)
    logger.info(`Redis Url is running on port: ${process.env.REDIS_URL}`)
})







