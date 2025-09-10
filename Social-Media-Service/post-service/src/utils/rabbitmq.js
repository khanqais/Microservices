const amqp=require('amqplib')
const logger=require('./logger')
const { ExceptionHandler } = require('winston')

let connection=null
let channel=null

const EXCHANGE_NAME= 'facebook_events'

async function connectRabbitMQ(){
    try {
        connection=await amqp.connect(process.env.RABBITMQ_URL) 
        channel=await connection.createChannel() 

        await channel.assertExchange(EXCHANGE_NAME,'topic',{durable:false})

        logger.info('connected to rabbit mq')
    } catch (error) {
        logger.error('Error connecting to rabbit mq',error)
    }
}

async function publishEvent(routingKey,message) {
    if(!channel){
        await connectRabbitMQ()
    }
    channel.publish(EXCHANGE_NAME,routingKey,Buffer.from(JSON.stringify(message)))
    logger.info(`Event published: ${routingKey}`)
}
module.exports={connectRabbitMQ,publishEvent}