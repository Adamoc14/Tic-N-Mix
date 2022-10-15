// Imports and Package Declarations
import request from 'supertest'
import app from '../../app'
import { Ticket } from '../../models/ticket'
import { Order , OrderStatus } from '../../models/order'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'

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
it('should return status code other than 404 for DELETE /api/orders/:orderId endpoint', async() => {

    const { statusCode } = await request(app)
    .delete(`/api/orders/${mockId}`)
    .send({})
    
    expect(statusCode).not.toEqual(404)


})

it('should return 401 if no authentication provided', async() => {
    
    return request(app)
    .delete(`/api/orders/${mockId}`)
    .send({})
    .expect(401)

})

it('should return status code other than 401 if authentication provided', async() => {

    const { statusCode }  = await request(app)
    .delete(`/api/orders/${mockId}`)
    .set('Cookie', signUp())
    .send({})

    expect(statusCode).not.toEqual(401)

})

it('should return 404 if requested resource(ie. order) is not found', async() => {

    return request(app)
    .delete(`/api/orders/${mockId}`)
    .set('Cookie', signUp())
    .send({})
    .expect(404) 

})

it('should return 401 if owner of ticket is not making request', async() => {

     // Create ticket
     const ticket = await createTicket();

     // Create order w/ ticket
     const { body: order } = await request(app)
     .post('/api/orders')
     .set('Cookie', signUp())
     .send({
         ticketId: ticket?.id
     })
     .expect(201)
 
     // Obtain Order
    await request(app)
     .delete(`/api/orders/${order?.id}`)
     .set('Cookie', signUp("56gjhgjhh65757"))
     .send({})
     .expect(401)

})

it('should return 204 w/ successful update of order status to cancelled' , async() => {

    // Create ticket
    const ticket = await createTicket();

    // Create an order w/ ticket
    const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: ticket?.id
    })
    .expect(201)

    // Cancel Order
    await request(app)
    .delete(`/api/orders/${order?.id}`)
    .set('Cookie', signUp())
    .send({})
    .expect(204)

    // Obtain Order
    const cancelledOrder = await Order.findById(order?.id)

    expect(cancelledOrder?.status).toEqual(OrderStatus.Cancelled)
})

// DONE: Implement this functionality and then test
it('publishes a order status cancelled event on successful update' , async() => {

     // Create ticket
     const ticket = await createTicket();

     // Create an order w/ ticket
     const { body: order } = await request(app)
     .post('/api/orders')
     .set('Cookie', signUp())
     .send({
         ticketId: ticket?.id
     })
     .expect(201)
 
     // Cancel Order
     await request(app)
     .delete(`/api/orders/${order?.id}`)
     .set('Cookie', signUp())
     .send({})
     .expect(204)

     expect(natsWrapper?.client?.publish).toHaveBeenCalled()
})