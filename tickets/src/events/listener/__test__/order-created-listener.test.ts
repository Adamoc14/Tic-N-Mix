// Imports and Package Declarations
import Ticket from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@aoctickets/common";
import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import OrderCreatedListener from "../order-created-listener";


// Variable Declarations


// Function Definitions
const setup = async() => {

     /*
        Setup Flow
        1. Create listener instance
        2. Create fake data event and message object
    */

    const listener = new OrderCreatedListener(natsWrapper.client);
    const fakeData: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 95.00
        }
    }

    // @ts-ignore
    const fakeMsg : Message = {
        ack: jest.fn()
    }

    return {
        listener,
        fakeData,
        fakeMsg
    }


}

// Tests

it('should return 404 if ticket can\'t be found in ticket.tickets collection', async() => {

    const { listener , fakeMsg , fakeData } = await setup()

    try {
        await listener.onMessage(fakeData , fakeMsg);
    } catch (err: any){
        expect(err.statusCode).toEqual(404)
    }

})

it('should successfully reserve a ticket by setting it\'s orderId', async() => {

    
    // Call setup() to obtain fake data for testing
    const { fakeMsg , fakeData , listener } = await setup()
    
    // Create ticket
    const newTicket = Ticket.build({
        title: 'Harry Styles Global Tour',
        price: 100.00,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await newTicket.save()
    
    // Utilize ticket id above for successful request
    fakeData.ticket.id = newTicket?.id

    // Call onMessage function w/ fake data above
    await listener.onMessage(fakeData , fakeMsg)

    // Identify was ticket reserved
    const ticketFound = await Ticket.findById(fakeData?.ticket?.id)

    expect(ticketFound?.orderId).toBeDefined()
    

})

it('should publish an updated ticket event to the event bus', async() => {

    /*
        Publish updated ticket event test flow
        1. Call setup() to obtain fake data for testing
        2. Create ticket
        3. Utilize id above for successful request
        4. Call onMessage function w/ fake data above
        5. Identify was publish event function called
        6. Identify what arguments were passed into our publish event function
    */

    const { listener , fakeData , fakeMsg } = await setup()

    const newTicket = Ticket.build({
        title: 'Harry Styles Global Tour',
        price: 100.00,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await newTicket.save()
    
    fakeData.ticket.id = newTicket?.id

    await listener.onMessage(fakeData , fakeMsg)

    const ticketUpdatedData = (natsWrapper?.client?.publish as jest.Mock).mock.calls[0][1]
    const { id:ticketId , price:ticketPrice , title:ticketTitle , orderId:ticketOrderId } = JSON.parse(ticketUpdatedData) 

    expect(natsWrapper?.client?.publish).toHaveBeenCalled();
    expect(ticketId).toEqual(newTicket?.id)
    expect(ticketPrice).toEqual(newTicket?.price)    
    expect(ticketTitle).toEqual(newTicket?.title)    
    expect(ticketOrderId).toEqual(fakeData?.id)

})

it('should acknowledge the successful transmission of message to event bus',async() => {

    /*
       Acknowledge tickets created in orders.tickets test flow
       1. Call setup() to obtain fake data for testing
       2. Create ticket
       3. Utilize id above for successful request
       4. Call onMessage function w/ fake data above
       5. Identify was ack called
   */

    const { listener , fakeData , fakeMsg } = await setup()

    const newTicket = Ticket.build({
        title: 'Harry Styles Global Tour',
        price: 100.00,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await newTicket.save()
    
    fakeData.ticket.id = newTicket?.id

    await listener.onMessage(fakeData , fakeMsg)

    expect(fakeMsg.ack).toHaveBeenCalled();

})
