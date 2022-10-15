// Imports and Package Declarations
import express, { Request, Response } from "express";
import { requireAuth , NotFoundError , BadRequestError, validateRequest, UnauthorizedError, OrderStatus } from "@aoctickets/common";
import { body, validationResult } from "express-validator";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Charge } from "../models/charge";
import ChargeCreatedPublisher from "../events/publisher/charge-created-publisher";
import { natsWrapper } from "../nats-wrapper";

// Variable Declarations
const router = express.Router()

// Routes 
router.post('/api/payments', requireAuth , [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty().isMongoId()
] , validateRequest , async(req: Request, res:Response) => {

    /*
        Create new charge flow
        1. Obtain incoming data (ie. stripe token , orderId)
        2. Find order by id above (ie. payments.orders collection) 
          - If yes, continue
          - If no, 404 error
        3. Ensure requested resource belongs to requested user
          - If yes, continue
          - If no, 401 error
        4. Ensure order status isn't cancelled
          - If no, continue
          - If yes, 400 error
        5. Ensure payment amount matches with order amount due
          - If yes, continue
          - If no, 400 error
        6. Verify payment w/ Stripe API
        7. Create new payment w/ data (ie. orderId , stripe charge id )
        8. Save to DB
        9. Publish charge created event to event bus
        10. Return 201 w/ successfully created charge
    */

    const { token , orderId} = req.body
    const existingOrder = await Order.findById(orderId)

    if(!existingOrder) throw new NotFoundError();

    if(existingOrder?.userId !== req.currentUser?.id) throw new UnauthorizedError();
    
    if(existingOrder?.status === OrderStatus.Cancelled) throw new BadRequestError('Can\'t pay for cancelled order')

    const stripePayment = await stripe.charges.create({
      currency: 'eur',
      amount: existingOrder?.price * 100,
      source: token
    })

    const newCharge = Charge.build({
      orderId,
      stripeId: stripePayment?.id 
    })

    await newCharge.save()

    await new ChargeCreatedPublisher(natsWrapper?.client).publish({
      id: newCharge?.id,
      orderId: newCharge?.orderId,
      stripeId: newCharge?.stripeId
    })


    res.status(204).send()

})

// Exports 
export default router