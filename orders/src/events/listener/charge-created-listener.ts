// Imports and Package Declarations
import { Listener , EventTypes, ChargeCreatedEvent, NotFoundError} from "@aoctickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "../queue-group-name";
import { Order , OrderStatus } from "../../models/order";

// Charge created event listener class declaration
class ChargeCreatedListener extends Listener<ChargeCreatedEvent> {
    readonly channel = EventTypes.ChargeCreated
    queueGroupName = queueGroupName
    async onMessage(data:ChargeCreatedEvent['data'] , msg: Message){

        /*
            Charge created event listener flow
            1. Obtain incoming data (ie. orderId)
            2. Find order by Id in orders.orders collection
             - If yes, continue
             - If no, 401 error
            3. Update order status (ie. status: OrderStatus.Complete)
            4. Re-save to DB
            4. Acknowledge the successful transmission of message to event bus
        */

       const { orderId } = data
       const existingOrder = await Order.findById(orderId);

       if(!existingOrder) throw new NotFoundError();

       existingOrder.set({ status: OrderStatus.Complete })
       await existingOrder.save()


       msg.ack()

    }

}


// Exports
export default ChargeCreatedListener