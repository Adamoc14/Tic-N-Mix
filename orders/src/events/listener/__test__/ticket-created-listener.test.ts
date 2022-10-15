// Imports and Package Declarations
import { Ticket } from "../../../models/ticket";
import TicketCreatedListener from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent} from "@aoctickets/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

// Variables Declarations
const title = 'Harry Styles concert'
const price = 85.00
const fakeId = new mongoose.Types.ObjectId().toHexString()

// Function Definitions
const setup = async() => {

    /*
        Setup Flow
        1. Create listener instance
        2. Create fake data event and message object
    */

    const listener = new TicketCreatedListener(natsWrapper.client);
    const fakeData : TicketCreatedEvent['data'] = {
        id: fakeId,
        title,
        price,
        version: 0,
        userId: fakeId
    }

    // @ts-ignore
    const fakeMessage : Message = {
        ack: jest.fn()
    }
    
    return {
        listener,
        fakeMessage,
        fakeData
    }

}

// Tests
it('should successfully create and save a ticket to orders.tickets collection', async() => {

    /*
        Create and Save into orders.tickets test flow
        1. Call setup() to obtain fake data for testing
        2. Call onMessage function w/ fake data above
        3. Identify was ticket created
    */

    const { listener , fakeData , fakeMessage } = await setup()
    await listener.onMessage(fakeData , fakeMessage)
    
    const ticketFound = await Ticket.findById(fakeData?.id);
    expect(ticketFound).toBeDefined()
    expect(ticketFound?.title).toEqual(fakeData?.title)
    expect(ticketFound?.price).toEqual(fakeData?.price)

})

it('should acknowledge the successful transmission of message to event bus', async() => {

    /*
       Acknowledge tickets created in orders.tickets test flow
       1. Call setup() to obtain fake data for testing
       2. Call onMessage function w/ fake data above
       3. Identify was ack called
   */

    const { listener , fakeData , fakeMessage } = await setup()
    await listener.onMessage(fakeData , fakeMessage)

    expect(fakeMessage.ack).toHaveBeenCalled();
})
