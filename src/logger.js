const winston= require('winston')
const { NODE_ENV} = require('./config')

/*WINSTON
    a popular and robust logging lib used to log all failures
    levels of severity: (1)silly (2)debug (3)verbose,info (5)warn (6) error
    INFO.LOG: where the log will be stored
    methods: 
*/ 

const logger= winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({filename:'info.log'})
    ]
})

//Conditional statement here
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}
 
module.exports= logger
