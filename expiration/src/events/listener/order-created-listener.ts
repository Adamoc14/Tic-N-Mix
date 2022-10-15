// Imports and Package Declarations
import { Listener , OrderCreatedEvent , EventTypes, OrderStatus } from "@aoctickets/common";
import { queueGroupName } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import expirationQueue from "../../queues/expiration-queue";

// Order created event listener class declaration
class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly channel = EventTypes.OrderCreated
    queueGroupName = queueGroupName
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {        
        /*
            Order created event listener flow
            1. Retrieve incoming data (ie. orderId and expiresAt )
            2. Calculate delay (ie. expiration time - current time = diff in ms)
            3. Queue a job w/ orderId obtained
            4. Acknowledge the successful transmission of message to event bus
        */

        const { id:orderId , expiresAt } = data
        const delay = new Date(expiresAt).getTime() - new Date().getTime()

        // TODO: Remove this
        console.log(`Waiting ${delay} ms to process the job`)

        await expirationQueue.add({
            orderId
        }, 
        {
            delay
        }
        )


    }
}

// Exports
export default OrderCreatedListener