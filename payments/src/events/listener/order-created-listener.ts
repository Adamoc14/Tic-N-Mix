// Imports and Package Declarations
import { Listener , OrderCreatedEvent , EventTypes, OrderStatus } from "@aoctickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "../queue-group-name";

// Order created event listener class declaration
class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly channel = EventTypes.OrderCreated
    queueGroupName = queueGroupName
    async onMessage(data: OrderCreatedEvent['data'] , msg: Message) {

        /*
            Order created event listener flow
            1. Obtain data contained in OrderCreatedEvent message
            2. Make a order w/ data
            3. Save to order collection in DB
                NOTE: Creating a separate replica ticket DB for payments service
            4. Acknowledge the successful transmission of message to event bus
        */

        const {status , userId , ticket: {price } , id , version} = data

        const newOrder = Order.build({
            status,
            userId,
            price,
            id,
            version
        })

        await newOrder.save()

        msg.ack()
        
    }

}

// Exports 
export default OrderCreatedListener