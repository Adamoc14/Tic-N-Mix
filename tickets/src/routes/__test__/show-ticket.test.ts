// Imports and Package Declarations
import request from "supertest";
import app from '../../app';
import mongoose from "mongoose";

// Variables for test process
const title = "concert"
const price = 85.00
const mockId = new mongoose.Types.ObjectId().toHexString();

// Tests

it('should return 404 if requested resource(ie. ticket) is not found', async() => {
    await request(app)
    .get(`/api/tickets/${mockId}`)
    .send({})
    .expect(404)
})

it('should return 200 w/ requested resource ( ie. ticket )', async() => {

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({ title , price })

    const { id } = response?.body;
    // console.log(id);

    const singleTicketId = await request(app)
    .get(`/api/tickets/${id}`)
    .send({})
    .expect(200)

    expect(singleTicketId?.body?.title).toEqual(title);
    expect(singleTicketId?.body?.price).toEqual(price);
})


// it('should return 401 if no authorization provided', async() => {
//     await request(app)
//     .post('/api/tickets/khhjgjgj')
//     .send({})
//     .expect(404)
// })

// it('should return status code other than 401 if authorization provided', async() => {
//     await request(app)
//     .post('/api/tickets/123')
//     .set('Cookie', signUp())
//     .send({})
//     .expect(200)
// })