// Imports and Package Declarations
import { Order } from "../../../models/order";
import OrderCreatedListener from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderStatus} from "@aoctickets/common";
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
it('should successfully create and save a order to payments.orders collection', async() => {

    /*
        Create and Save into orders.orders test flow
        1. Call setup() to obtain fake data for testing
        2. Call onMessage function w/ fake data above
        3. Identify was order created
    */

    const { listener , fakeData , fakeMsg } = await setup()
    await listener.onMessage(fakeData , fakeMsg)
    
    const orderFound = await Order.findById(fakeData?.id);
    expect(orderFound).toBeDefined()
    expect(orderFound?.price).toEqual(fakeData?.ticket?.price)

})

it('should acknowledge the successful transmission of message to event bus', async() => {

    /*
       Acknowledge orders created in payments.orders test flow
       1. Call setup() to obtain fake data for testing
       2. Call onMessage function w/ fake data above
       3. Identify was ack called
   */

    const { listener , fakeData , fakeMsg } = await setup()
    await listener.onMessage(fakeData , fakeMsg)

    expect(fakeMsg.ack).toHaveBeenCalled();
})
