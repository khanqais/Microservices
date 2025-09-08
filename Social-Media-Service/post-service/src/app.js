const express=require('express')
const app=express()
const connectDB = require("./DB/connect");
require('dotenv').config()
const logger=require('./utils/logger')  
const cors=require('cors')
const helmet=require('helmet')

const Redis=require('ioredis')
const RedisClient=new Redis(process.env.REDIS_URL)
const rateLimit = require('express-rate-limit')  
const {RedisStore}=require('rate-limit-redis');
const router = require('./Routes/PostRoute');
const PORT=process.env.PORT || 3002



app.use(helmet())
app.use(cors())
app.use(express.json())


app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});



app.use('/api/post',(req,res,next)=>{
    req.redisClient=RedisClient
    next()
},router)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

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

