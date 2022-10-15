// Imports and Package Declarations
import { Listener , OrderCancelledEvent , EventTypes, NotFoundError, OrderStatus } from "@aoctickets/common";
import { queueGroupName } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

// Order cancelled event listener class declaration
class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    readonly channel = EventTypes.OrderCancelled;
    queueGroupName = queueGroupName
    async onMessage(data: OrderCancelledEvent['data'] , msg: Message) {

        /*
            Order Cancelled Event Flow in Orders Service
            1. Retrieve the incoming data (ie. order id)
            2. Find the order by id, user is trying to cancel 
                - If found, continue
                - If not, error
            3. Mark order status as cancelled (ie. status: OrderStatus.Cancelled)
            4. Save the order
            5. Acknowledge the successful transmission of message to event bus 
        */

        const { id:orderId , version } = data
        const existingOrder = await Order.findOne({
            _id: orderId,
            version
        })

        if(!existingOrder) throw new NotFoundError();

        existingOrder.set( { status: OrderStatus.Cancelled })
        await existingOrder.save()

        msg.ack()


    }
}

// Exports
export default OrderCancelledListener