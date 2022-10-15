// Imports and Package Declarations
import request from "supertest";
import app from "../../app";
import Ticket from "../../models/ticket";


// Variables for test process
let title = "concert"
let price = 85.00
let tickets = [];


// Function Definitions
const createTicket = () => {
    return request(app)
    .post('/api/tickets')
    .set('Cookie', signUp())
    .send({
        title,
        price
    })
    .expect(201)
}

// Tests
it('should return any other status code than 404 for endpoint', async() => {

    return request(app)
    .get('/api/tickets')
    .send({})
    .expect(200)

} )

it('should return 200 on successful request for all tickets', async() => {

    tickets = await Ticket.find({});
    expect(tickets?.length).toEqual(0)

    await createTicket()
    await createTicket()
    await createTicket()

    tickets = await Ticket.find({});

    const { body } = await request(app)
    .get('/api/tickets')
    .send({})
    .expect(200)

    expect(body?.length).toEqual(tickets?.length)

})

