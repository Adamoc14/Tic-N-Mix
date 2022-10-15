// Imports and Package Declarations
import { Listener , OrderCancelledEvent , EventTypes, NotFoundError } from "@aoctickets/common";
import { queueGroupName } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket";
import TicketUpdatedPublisher from "../publisher/ticket-updated-publisher";

// Order cancelled event listener class declaration
class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    readonly channel = EventTypes.OrderCancelled;
    queueGroupName = queueGroupName
    async onMessage(data: OrderCancelledEvent['data'] , msg: Message) {

        /*
            Order Cancelled Event Flow in Tickets Service
            1. Retrieve the incoming data (ie. ticket id)
            2. Find the ticket by id, user is trying to cancel 
                - If found, continue
                - If not, error
            3. Mark ticket as not reserved (ie. orderId: undefined)
            4. Save the ticket
            5. Publish ticket updated event to sync version numbers with other services
            6. Acknowledge the successful transmission of message to event bus 
        */

        const { ticket: { id:ticketId = ''} } = data
        const existingTicket = await Ticket.findById(ticketId)

        if(!existingTicket) throw new NotFoundError();

        existingTicket.set( { orderId: undefined })
        await existingTicket.save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: existingTicket?.id,
            price: existingTicket?.price,
            title: existingTicket?.title,
            version: existingTicket?.version,
            userId: existingTicket?.userId,
            orderId: existingTicket?.orderId,
        })

        msg.ack()


    }
}

// Exports
export default OrderCancelledListener