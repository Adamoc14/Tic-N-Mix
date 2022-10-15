// Imports and Package Declarations
import { Listener , ExpirationCompleteEvent, EventTypes , NotFoundError, OrderStatus } from "@aoctickets/common";
import { queueGroupName } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import OrderCancelledPublisher from "../publisher/order-cancelled-publisher";

// Expiration complete event listener class declaration
class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly channel = EventTypes.ExpirationComplete
    queueGroupName = queueGroupName
    async onMessage(data: ExpirationCompleteEvent['data'] , msg: Message){

        /*
            Expiration complete event listener flow
            1. Obtain incoming data (ie. orderId)
            2. Retrieve order by orderId above
                - If no, error
                - If yes, continue
            3. Check if order is already paid for
                - If yes, return acknowledgment
            4. Mark the order status as cancelled
            5. Re-save order
            6. Publish Order updated event for version syncing w/ other services
            7. Acknowledge the successful transmission of message to event bus
        */

        const { orderId } = data
        const existingOrder = await Order.findById(orderId).populate('ticket')

        if(!existingOrder) throw new NotFoundError();

        if(existingOrder?.status === OrderStatus.Complete) return msg.ack()

        existingOrder.set({ status: OrderStatus.Cancelled })
        await existingOrder.save()

        await new OrderCancelledPublisher(this?.client).publish({
            id: existingOrder?.id,
            version: existingOrder?.version,
            ticket: {
                id: existingOrder?.ticket?.id
            },
        })

        msg.ack()


    }
}

// Exports
export default ExpirationCompleteListener