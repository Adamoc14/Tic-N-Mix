// Imports and Package Declarations
import Queue from 'bull'
import ExpirationCompletePublisher from '../events/publisher/expiration-complete-publisher'
import { JobData } from './models/job'
import { natsWrapper } from '../nats-wrapper'

// Variable Declarations
const expirationQueue = new Queue<JobData>('order:expiration', {
    redis: {
        host: process.env?.REDIS_HOST, 
        port: 6379
    }
})

// Function Definitions
expirationQueue.process(async job => {

    // DONE: Implement functionality to publish expiration:complete event
    new ExpirationCompletePublisher(natsWrapper?.client).publish({
        orderId: job?.data?.orderId
    })

})

// Exports
export default expirationQueue