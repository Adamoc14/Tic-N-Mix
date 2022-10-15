// Imports and Package Declarations
import request from 'supertest'
import app from '../../app'
import mongoose from 'mongoose'
import { Ticket } from '../../models/ticket';

// Variable Declarations

// Function Definitions
const createTicket = async() => {

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Harry Styles Concert',
        price: 85.00,
    })

    await ticket.save()

    return ticket

}

// Tests

it('should return status code other than 404 for api/orders/ endpoint', async() => {

    const response = await request(app)
    .get('/api/orders')
    .send({})
    
    expect(response?.statusCode).not.toEqual(404);

})

it('should return 401 if no authentication provided', async() => {

    await request(app)
    .get('/api/orders')
    .send({})
    .expect(401)

})

it('should return status code other than 401 if authentication provided', async() => {
    
    const response = await request(app)
    .get('/api/orders')
    .set('Cookie', signUp())
    .send({})
    
    expect(response?.statusCode).not.toEqual(401);

})

it('should return 200 on successful request for all orders specific to user', async() => {

    // Create 3 Tickets
    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();
    const ticketThree = await createTicket();

    // Sign in with two users
    const userOne = signUp()
    const userTwo = signUp("56gjhgjhh65757")

    // Create 1 order with user #1
    await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
        ticketId: ticketOne?.id
    })
    .expect(201)

    // Create 2 orders with user #2
    const {body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
        ticketId: ticketTwo?.id
    })
    .expect(201)

    const {body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
        ticketId: ticketThree?.id
    })
    .expect(201)


    // Request orders for user #2
    const { body:userTwoOrders } = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send({})
    .expect(200)

    // Ensure we only get user #2's orders
    expect(userTwoOrders).toHaveLength(2)
    expect(userTwoOrders[0]?.id).toEqual(orderOne?.id)
    expect(userTwoOrders[1]?.id).toEqual(orderTwo?.id)

})

it('should return orders w/ populated tickets reference attribute', async() => {

    // Create Ticket
    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();

    // Create Order - userId: 25678399kn53
    await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: ticketOne?.id
    })
    .expect(201)
    await request(app)
    .post('/api/orders')
    .set('Cookie', signUp())
    .send({
        ticketId: ticketTwo?.id
    })
    .expect(201)

    // Request Orders
    const { body:userOrders } = await request(app)
    .get('/api/orders')
    .set('Cookie', signUp())
    .send({})
    .expect(200)

    expect(userOrders).toHaveLength(2)
    expect(userOrders[0]?.ticket?.id).toBeDefined()
    expect(userOrders[0]?.ticket?.id).toEqual(ticketOne?.id)
    expect(userOrders[1]?.ticket?.id).toEqual(ticketTwo?.id)
})

