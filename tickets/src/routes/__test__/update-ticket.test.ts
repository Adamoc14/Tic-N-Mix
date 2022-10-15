// Imports and Package Declarations
import request from "supertest";
import app from "../../app";
import mongoose from 'mongoose';
import Ticket from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

// Variables for test process
const title = "concert"
const price = 85.00
const mockId = new mongoose.Types.ObjectId().toHexString();


// Function Definitions
const createTicket = () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price
    })
}


// Tests
it('should return a status code other than 404 for endpoint', async() => {
    const response = await request(app)
    .put(`/api/tickets/${mockId}`)
    .send({})
    
    expect(response?.statusCode).not.toEqual(404);
})

it('should return 401 when no authorization provided', async() => {

    return request(app)
    .put(`/api/tickets/${mockId}`)
    .send({})
    .expect(401)

})

it('should return a status code other than 401 when authorization provided', async() => {

    const response = await request(app)
    .put(`/api/tickets/${mockId}`)
    .set('Cookie', signUp())
    .send({})
    
    expect(response?.statusCode).not.toEqual(401);

})

it('should return 401 and disallow users updating tickets they don\'t own' , async() => {

    // Create Ticket with '25678399kn53' user ID
    const { body: { id:ticketId , userId}} = await createTicket();
    const mockSecondUserId = '2gh38s3d893gk'

    // Update ticket with different user ID (ie. 2gh38s3d893gk)
    const { body: { errors }} = await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp(mockSecondUserId))
    .send({
        title: "Lewis Capaldi Concert",
        price: 95.00
    })
    .expect(401)

    expect(userId).not.toEqual(mockSecondUserId);
    expect(errors[0]?.message).toEqual("Unauthorized access to requested resource")

} )

it('should return 400 if ticket is reserved' , async() => {

     // Create Ticket
     const {body: { id:ticketId }} = await createTicket();

    // Find Ticket by id
    const existingTicket = await Ticket.findById(ticketId)

    // Reserve ticket
    existingTicket?.set({ orderId: new mongoose.Types.ObjectId().toHexString()})

    // Save Ticket
    await existingTicket?.save()
    
    // Attempt to Update Ticket
    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: "Lewis Capaldi Concert",
        price: 95.00
    })
    .expect(400)

})

it('should return 400 when invalid details provided', async() => {

    // Create Ticket
    const {body: {id:ticketId}} = await createTicket();

    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: '',
        price: 85.00
    })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        price: 85.00
    })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: '',
        price: -10
    })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: 'Ed Sheeran Concert',
    })
    .expect(400)

    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: 'Ed Sheeran Concert',
        price: '75.00'
    })
    .expect(400)
})

it('should return 404 when requested resource ( ie. ticket ) is not found' , async() => {
    await request(app)
    .put(`/api/tickets/${mockId}`)
    .set('Cookie', signUp())
    .send({
        title,
        price
    })
    .expect(404)
})

it('should return 200 on successful update of resource requested (ie. ticket)', async() => {
    
    // Create Ticket
    const {body: { id:ticketId} } = await createTicket();

    // Update Ticket
    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: "Lewis Capaldi Concert",
        price: 95.00
    })
    .expect(200)

    const { body: {title , price} } = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .send({})

    expect(title).toEqual("Lewis Capaldi Concert")
    expect(price).toEqual(95)
})

it('publishes a ticket updated event', async() => {

    // Create Ticket
    const {body: { id:ticketId} } = await createTicket();

    // Update Ticket
    await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set('Cookie', signUp())
    .send({
        title: "Lewis Capaldi Concert",
        price: 105.00
    })
    .expect(200)

    // Check if ticket created event publish function called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

})