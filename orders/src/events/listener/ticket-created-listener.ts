// Imports and Package Declarations
import { Listener , TicketCreatedEvent , EventTypes } from "@aoctickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "../queue-group-name";

// Ticket created event listener class declaration
class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    readonly channel = EventTypes.TicketCreated
    queueGroupName = queueGroupName;
    async onMessage(data: TicketCreatedEvent['data'] , msg: Message) {
        
        /*
            Ticket Created Event Flow in Orders Service
            1. Obtain data (ie. title , price) contained in TicketCreatedEvent message
            2. Make a ticket w/ data
            3. Save to tickets collection in DB
                NOTE: Creating a separate replica ticket DB for orders service
            4. Acknowledge the successful transmission of message to event bus
        */

        const { price , title , id } = data
        const newTicket = Ticket.build({
            id,
            title,
            price,
        });
        await newTicket.save();

        msg.ack()
         
    }
}

// Exports
export default TicketCreatedListener