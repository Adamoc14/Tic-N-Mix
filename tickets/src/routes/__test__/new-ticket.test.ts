// Imports and Package Declarations
import request from "supertest";
import app from "../../app";
import Ticket from '../../models/ticket';
import { natsWrapper } from "../../nats-wrapper";

// Variables for test process
const title = 'concert';
const price = 85.00;

// Tests
it('should return status code other than 404 for /api/tickets endpoint' , async() => {

    const response = await request(app)
    .post('/api/tickets')
    .send({})

    expect(response?.statusCode).not.toEqual(404);
});


it('should return 401 with no authentication' , async() => {

    return request(app)
    .post('/api/tickets')
    .send({})
    .expect(401)

});

it('should return status code other than 401 with authentication' , async() => {

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({})
    
    expect(response?.statusCode).not.toEqual(401)
});


it('should return 400 if invalid details are provided' , async() => {

    await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title: '',
        price
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        price
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title: '',
        price: -10
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price: '75.00'
    })
    .expect(400)

    

});

it('should return 201 on ticket creation success' , async() => {

    // Check to identify ticket creation
    let tickets = await Ticket.find({});
    expect(tickets?.length).toEqual(0)

    await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price,
    })
    .expect(201)

    tickets = await Ticket.find({});
    expect(tickets?.length).toEqual(1)
    expect(tickets[0]?.title).toEqual(title)

});

it('should return ticket response object including emitted details' , async() => {

    // Ticket shouldn't have _v
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price
    })
    .expect(201)

    expect(response.body?.__v).toBeUndefined();
})

it('should return ticket response object with changed id property' , async() => {

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price
    })
    .expect(201)

    expect(response.body?._id).toBeUndefined();
    expect(response.body?.id).toBeDefined();
})

it('publishes a ticket created event' , async() => {

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price
    })
    .expect(201)

    expect(natsWrapper?.client?.publish)?.toHaveBeenCalled();

})
