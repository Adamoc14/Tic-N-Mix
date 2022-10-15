// Imports and Package Declarations
import request from 'supertest'
import app from '../../app'
import mongoose from 'mongoose'
import { Order , OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

// Variable Declarations
const mockId = new mongoose.Types.ObjectId().toHexString();

// Function Definitions
const createTicket = async() => {

    const ticket = Ticket.build({
        id: mockId,
        title: 'Harry Styles Concert',
        price: 85.00,
    })

    await ticket.save()

    return ticket

}

// Tests
it('should return status code other than 404 for /api/orders endpoint', async() => {
    
    const response = await request(app)
    .post('/api/orders')
    .send({})

    expect(response?.statusCode).not.toEqual(404);

})

it('should return 401 for no authentication provided', async() => {

    return request(app)
    .post('/api/orders')
    .send({})
    .expect(401)
})

it('should return status code other than 401 for authentication provided', async() => {

    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({})

    expect(response?.statusCode).not.toEqual(401)

})

it('should return 400 for invalid details provided', async() => {

    return request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({})
    .expect(400)

})


it('should return 404 if requested resource(ie. ticket) is not found', async() => {

    return request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: mockId
    })
    .expect(404)


})

it('should return 400 if requested resource (ie.ticket) is already reserved by another order', async() => {

    // Create Ticket
    const newTicket = await createTicket();

    // Create Order
    const newOrder = Order.build({
        userId: "ghgg35786",
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: newTicket
    })

    await newOrder.save()

    // Create another order with ticket Id
    await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: newTicket?.id
    })
    .expect(400)

})


it('should return 201 on order creation success', async() => {

    // Check to identify ticket creation
    let orders = await Order.find({});
    expect(orders?.length).toEqual(0)

     // Create Ticket
     const ticket = await createTicket();

    // Reserve Ticket with order
    await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: ticket?.id
    })
    .expect(201)

    orders = await Order.find({});
    expect(orders?.length).toEqual(1)

})

it('should return order response object including emitted details', async() => {

    // Create Ticket
    const ticket = await createTicket();

    // Reserve Ticket with order
    const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: ticket?.id
    })
    .expect(201)

    expect(body._v).toBeUndefined();

})

it('should return order response object with changed id property', async() => {

    // Create Ticket
    const ticket = await createTicket();

    // Reserve Ticket with order
    const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: ticket?.id
    })
    .expect(201)

    expect(body._id).toBeUndefined();
    expect(body.id).toBeDefined();

})

// DONE: Implement this functionality and then test
it('publishes a order created event' , async() => {
 
    // Create Ticket
    const ticket = await createTicket();
 
     // Reserve Ticket with order
     await request(app)
     .post('/api/orders')
     .set('Cookie', signUp())
     .send({
         ticketId: ticket?.id
     })
     .expect(201)

     expect(natsWrapper?.client?.publish).toHaveBeenCalled()
})
