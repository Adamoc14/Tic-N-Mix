// Imports and Package Declarations
import { Listener , TicketUpdatedEvent , EventTypes, NotFoundError } from "@aoctickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "../queue-group-name";

// Ticket updated event listener class declaration
class TicketUpdatedListener extends Listener< TicketUpdatedEvent>{
    readonly channel = EventTypes.TicketUpdated
    queueGroupName = queueGroupName;
    async onMessage(data: TicketUpdatedEvent['data'] , msg: Message) {
        
        /*
            Ticket Updated Event Flow in Orders Service
            1. Obtain data (ie. id, version) contained in TicketUpdatedEvent message
            2. Obtain ticket in DB
                - If yes, continue
                - If no, error
            3. Obtain new details from message
            4. Updated record in DB
            5. Acknowledge the successful transmission of message to event bus
        */

        let existingTicket = await Ticket.findLastEventProcessedMatchingId(data)

        if(!existingTicket) throw new NotFoundError();

        const { title , price } = data;
        existingTicket.set({
            title,
            price 
        })
        await existingTicket.save()

        msg.ack()
         
    }
}

// Exports
export default TicketUpdatedListener