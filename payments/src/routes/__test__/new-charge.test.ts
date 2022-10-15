// Imports and Package Declarations
import { OrderStatus } from '@aoctickets/common'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../../app'
import { Charge } from '../../models/charge'
import { Order } from '../../models/order'
import { stripe } from '../../stripe'

// Variable Declarations
const price = 85.00
const token = "tok_visa"
const mockToken = '5db38s93j3io865'
const mockUserId = "6282383sdhs8"

// Function Definitions
const createOrder =  async() => {
    const newOrder = Order.build({
        status: OrderStatus.Created,
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 85.00,
        userId: new mongoose.Types.ObjectId().toHexString()
    })

    await newOrder.save()

    return newOrder
}

// Mock Implementations
jest.mock('../../stripe')

// Tests
it('should return status code other than 404 for POST: /api/payments endpoint', async() => {

    const {statusCode } = await  request(app)
    .post('/api/payments')
    .send({})
    
    expect(statusCode).not.toEqual(404)
})
it('should return 401 if no authentication provided', async() => {

    return request(app)
    .post('/api/payments')
    .send({})
    .expect(401)
})
it('should return status code other than 401 if no authentication provided', async() => {

    const {statusCode} = await request(app)
    .post('/api/payments')
    .set('Cookie', signUp())
    .send({})

    expect(statusCode).not.toEqual(401)

})
it('should return 400 for invalid details provided', async() => {

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp())
    .send({})
    .expect(400)

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp())
    .send({
        orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(400)

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp())
    .send({
        token,
        orderId: "63734bedjjs"
    })
    .expect(400)
    
})
it('should return 404 if requested resource(ie. order) is not found', async() => {

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp())
    .send({
        orderId: new mongoose.Types.ObjectId().toHexString(),
        token
    })
    .expect(404)

})
it('should return 401 and disallow users pay for order they don\'t own', async() => {

    const newOrder = await createOrder()

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp(mockUserId))
    .send({
        orderId: newOrder?.id,
        token
    })
    .expect(401)

    expect(mockUserId).not.toEqual(newOrder?.userId)

})
it('should return 400 if requested order status is cancelled', async() => {

    const newOrder = await createOrder()
    newOrder.set({ status: OrderStatus.Cancelled })
    await newOrder.save()
    

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', signUp(newOrder?.userId))
    .send({
        orderId: newOrder?.id,
        token
    })

    expect(response?.statusCode).toEqual(400)
    expect(newOrder?.status).not.toEqual(OrderStatus?.Created)



})

it('should return 400 if payment request not verified by Stripe (ie. invalid token provided)', async() => {

    const newOrder = await createOrder()

    const response = await request(app)
    .post('/api/payments')
    .set('Cookie', signUp(newOrder?.userId))
    .send({
        orderId: newOrder?.id,
        token: mockToken
    })
    
    const chargeOptions = (stripe.charges.create as jest.Mock)?.mock?.calls[0][0]

    expect(response?.statusCode).toEqual(400)
    expect(chargeOptions?.source).not.toEqual(token)
    expect(chargeOptions?.source).toEqual(mockToken)

})


it('should create a new charge object in payments.charges collection', async() => {
    const newOrder = await createOrder()

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp(newOrder?.userId))
    .send({
        orderId: newOrder?.id,
        token
    })
    .expect(204)

    const { id:stripeId } = await (stripe.charges.create as jest.Mock)?.mock?.results[0]?.value;
    const existingCharge = await Charge.findOne({
        orderId: newOrder?._id,
        stripeId,
      });
     
    expect(existingCharge).not.toBeNull();
    expect(existingCharge?.orderId).toEqual(newOrder?.id);
    expect(existingCharge?.stripeId).toEqual(stripeId);


})

it('should return 204, call stripe mock to fulfil payment', async() => {

    const newOrder = await createOrder()

    await request(app)
    .post('/api/payments')
    .set('Cookie', signUp(newOrder?.userId))
    .send({
        orderId: newOrder?.id,
        token
    })
    .expect(204)

    const chargeOptions = (stripe.charges.create as jest.Mock)?.mock?.calls[0][0]
    expect(chargeOptions?.source).toEqual(token)
    expect(chargeOptions?.amount).toEqual(85 * 100)
    expect(chargeOptions?.currency).toEqual('eur')
    
})

it('should publish new charge to charge:created channel on successful creation', async() => {



})
