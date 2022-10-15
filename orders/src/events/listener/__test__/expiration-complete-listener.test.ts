// Imports and Package Declarations
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";
import ExpirationCompleteListener from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";
import { OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@aoctickets/common";

// Variable Declarations
const title = 'Justin Bieber Masterclass'
const price = 85.00

// Function Definitions
const setup = async() => {

    /*
        Setup Flow
        1. Create listener instance
        2. Create ticket and order
        3. Create fake data event and message object
        4. Return fake data
    */

   const listener = new ExpirationCompleteListener(natsWrapper?.client);
   const newTicket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title,
        price
   })
   await newTicket.save()

   const newOrder = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: newTicket
    })
    await newOrder.save()

    const fakeData : ExpirationCompleteEvent['data'] = {
        orderId: "5i87a7gjgu98"
    }

    // @ts-ignore
    const fakeMsg : Message = {
        ack: jest.fn()
    }

    return {
        listener,
        newOrder,
        fakeData,
        fakeMsg
    }

}

// Tests
it('should return 404 if event can\'t be found w/ appropriate version and id', async() => {

    const { listener , fakeData , fakeMsg } = await setup()
     
    try {
        await listener.onMessage(fakeData, fakeMsg)
    } catch (error: any) {
        expect(error?.statusCode).toEqual(404);
    } 

})

it('should not acknowledge the successful transmission of message to event bus', async() => {

    const { listener , fakeData , fakeMsg } = await setup()
     
    try {
        await listener.onMessage(fakeData, fakeMsg)
    } catch (error: any) {
    } 

    expect(fakeMsg.ack).not.toHaveBeenCalled()
})

it('should find, update status, and save order to the orders.orders collection', async() => {

    /*
        Find, update status and save order to orders.orders collection Test Flow
        1. Call setup() to obtain fake data for testing
        2. Update orderId to be a mongoose id
        3. Call onMessage() to updated order w/ fake data
        4. Identify was order updated in orders.orders collection
    */

    const { listener , fakeData , fakeMsg , newOrder } = await setup()
    fakeData.orderId = newOrder?.id

    await listener.onMessage(fakeData, fakeMsg)

    const orderFound = await Order.findById(newOrder?.id)

    expect(orderFound?.status).not.toEqual(newOrder?.status)
    
})

it('should publish an expiration complete event to the event bus', async() => {

    /*
        Find, update status and save order to orders.orders collection Test Flow
        1. Call setup() to obtain fake data for testing
        2. Update orderId to be a mongoose id
        3. Call onMessage() to updated order w/ fake data
        4. Identify was event published w/ identical orderId
    */

    const { listener , fakeData , fakeMsg , newOrder } = await setup()
    fakeData.orderId = newOrder?.id

    await listener.onMessage(fakeData, fakeMsg)

    const orderUpdatedData = (natsWrapper?.client?.publish as jest.Mock).mock.calls[0][1]
    const { id } = JSON.parse(orderUpdatedData) 

    expect(id).toEqual(newOrder?.id)
    expect(natsWrapper?.client.publish).toHaveBeenCalled()

    
})

it('should acknowledge the successful transmission of message to event bus', async() => {

    /*
       Acknowledge tickets created in orders.tickets test flow
       1. Call setup() to obtain fake data for testing
       2. Update orderId to be a mongoose id
       3. Call onMessage function w/ fake data above
       4. Identify was ack called
   */

    const { listener , fakeData , fakeMsg , newOrder } = await setup()
    fakeData.orderId = newOrder?.id

    await listener.onMessage(fakeData, fakeMsg)

    expect(fakeMsg.ack).toHaveBeenCalled();
})