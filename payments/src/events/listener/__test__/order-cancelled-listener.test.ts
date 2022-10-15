// Imports and Package Declarations
import { Order , OrderStatus } from "../../../models/order";
import { OrderCancelledEvent} from "@aoctickets/common";
import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import OrderCancelledListener from "../order-cancelled-listener";


// Variable Declarations


// Function Definitions
const setup = async() => {

    /*
       Setup Flow
       1. Create listener instance
       2. Create fake data event and message object
   */

   const listener = new OrderCancelledListener(natsWrapper.client);
   const fakeData: OrderCancelledEvent['data'] = {
       id: new mongoose.Types.ObjectId().toHexString(),
       version: 0,
       ticket: {
           id: new mongoose.Types.ObjectId().toHexString(),
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
it('should return 404 if order can\'t be found in payments.orders collection', async() => {

    const { listener , fakeMsg , fakeData } = await setup()

    try {
        await listener.onMessage(fakeData , fakeMsg);
    } catch (err: any){
        expect(err.statusCode).toEqual(404)
    }

})

it('should successfully cancel a order (ie. status: OrderStatus.Cancelled)', async() => {

    
    // Call setup() to obtain fake data for testing
    const { fakeMsg , fakeData , listener } = await setup()
    
    // Create order
    const newOrder = Order.build({
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 1
    })
    await newOrder.save()
    
    // Utilize order id above for successful request
    fakeData.id = newOrder?.id

    // Call onMessage function w/ fake data above
    await listener.onMessage(fakeData , fakeMsg)

    // Identify was order status updated
    const orderFound = await Order.findById(fakeData?.id)

    expect(orderFound).toBeDefined()
    expect(orderFound?.status).not.toEqual(newOrder?.status)

})

// TODO: Remove this
// it('should publish an updated order event to the event bus', async() => {

//     /*
//         Publish updated order event test flow
//         1. Call setup() to obtain fake data for testing
//         2. Create order
//         3. Utilize id above for successful request
//         4. Call onMessage function w/ fake data above
//         5. Identify was publish event function called
//         6. Identify what arguments were passed into our publish event function
//     */

//     const { listener , fakeData , fakeMsg } = await setup()

//    // Create order
//    const newOrder = Order.build({
//         status: OrderStatus.Created,
//         userId: new mongoose.Types.ObjectId().toHexString(),
//         price: 10,
//         id: new mongoose.Types.ObjectId().toHexString(),
//         version: 1
//     })
//     await newOrder.save()
    
//     fakeData.id = newOrder?.id

//     await listener.onMessage(fakeData , fakeMsg)

    

// })

it('should acknowledge the successful transmission of message to event bus',async() => {

    /*
       Acknowledge orders created in payments.orders test flow
       1. Call setup() to obtain fake data for testing
       2. Create order
       3. Utilize id above for successful request
       4. Call onMessage function w/ fake data above
       5. Identify was ack called
   */

    const { listener , fakeData , fakeMsg } = await setup()

    // Create order
    const newOrder = Order.build({
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 1
    })
    await newOrder.save()
    
    fakeData.id = newOrder?.id

    await listener.onMessage(fakeData , fakeMsg)

    expect(fakeMsg.ack).toHaveBeenCalled();

})
