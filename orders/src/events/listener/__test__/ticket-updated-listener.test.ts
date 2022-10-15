// Imports and Package Declarations
import { Ticket } from "../../../models/ticket";
import TicketUpdatedListener from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent} from "@aoctickets/common";
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
        2. Create and save ticket
        3. Create fake data event and message object
        4. Return fake data
    */

    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: fakeId,
        title,
        price
    })
    await ticket.save();

    const fakeData : TicketUpdatedEvent['data'] = {
        id: fakeId,
        title: "Michael Bublé World Tour",
        price: 95.00,
        version: ticket?.version + 1,
        userId: fakeId
    }

    // @ts-ignore
    const fakeMessage : Message = {
        ack: jest.fn()
    }

    return {
        listener,
        ticket,
        fakeMessage,
        fakeData
    }

}

// Tests
it('should return 404 if event can\'t be found w/ appropriate version and id', async() => {

    const { listener , fakeData , fakeMessage } = await setup()
    fakeData.version = 10;
     
    try {
        await listener.onMessage(fakeData, fakeMessage)
    } catch (error: any) {
        expect(error?.statusCode).toEqual(404);
    } 

})

it('should not acknowledge the successful transmission of message to event bus', async() => {

    const { listener , fakeData , fakeMessage , ticket } = await setup()
    fakeData.version = 10;
     
    try {
        await listener.onMessage(fakeData, fakeMessage)
    } catch (error: any) {
    } 

    expect(fakeMessage.ack).not.toHaveBeenCalled()
})

it('should find, update, and save a ticket to the orders.tickets collection', async() => {

    /*
        Find, Update and Save ticket to orders.tickets collection Test Flow
        1. Call setup() to obtain fake data for testing
        2. Call onMessage() to updated ticket w/ fake data
        3. Identify was ticket updated in orders.tickets collection
    */

    const { listener , fakeData , fakeMessage , ticket } = await setup()
    await listener.onMessage(fakeData, fakeMessage)

    const ticketFound = await Ticket.findById(ticket?.id)

    expect(ticketFound?.title).not.toEqual(ticket?.title)
    expect(ticketFound?.price).not.toEqual(ticket?.price)
    expect(ticketFound?.version).toEqual(1)
    

})

it('should acknowledge the successful transmission of message to event bus', async() => {

    /*
       Acknowledge tickets created in orders.tickets test flow
       1. Call setup() to obtain fake data for testing
       2. Call onMessage function w/ fake data above
       3. Identify was ack called
   */

    const { listener , fakeData , fakeMessage } = await setup()
    await listener.onMessage(fakeData, fakeMessage)

    expect(fakeMessage.ack).toHaveBeenCalled();
})
