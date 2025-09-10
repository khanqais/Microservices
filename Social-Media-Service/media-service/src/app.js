require('dotenv').config()
const express=require('express')
const app=express()
const mongoose=require('mongoose')
const helmet=require('helmet')
const mediaRoutes=require('./Routes/media-routes')
const logger = require('./utils/logger')
const cors=require('cors')
const connectDB=require('./DB/connect')
const { connectRabbitMQ, ConsumeEvent } = require('./utils/rabbitmq')
const { handlePostDeleted } = require("./EventHandler/Media-event");

const PORT=process.env.PORT || 3003


app.use(helmet())
app.use(cors())
app.use(express.json())
app.get('/',(req,res)=>{
    res.send("Hii Mom")
})

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});


app.use('/api/media',mediaRoutes)


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await connectRabbitMQ();

    await ConsumeEvent('post.deleted',handlePostDeleted)

    logger.info("Connected to MongoDB successfully");  
    app.listen(PORT, () => {
        logger.info(`Server is listening on port ${PORT}`);  
    });
  } catch (error) {
    logger.error('Failed to start server:', error); 
  }
};

start();

