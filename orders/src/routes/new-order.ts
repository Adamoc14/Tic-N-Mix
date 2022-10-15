// Imports and Package Declarations
import express , { Request , Response } from 'express'
import { NotFoundError, requireAuth , validateRequest, OrderStatus, BadRequestError } from '@aoctickets/common'
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import OrderCreatedPublisher from '../events/publisher/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';


// Variable Declarations
const router = express.Router();
const EXPIRATION_SECONDS_WINDOW = 1 * 60;

// Routes
router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('Valid ticket id must be provided')
], validateRequest, async (req: Request, res:Response) => {

    /*
        Order Creation Flow

        1. Retrieve the requested ticket id
        2. Find the ticket by id, user is trying to order 
            - If found, continue
            - If not, error
        3. Ensure ticket isn't already reserved (ie. associated with another order and status !== Cancelled ) by another user
            - If yes, error
            - If no, continue
        4. Calculate an expiration date for order
        5. Save order to DB
        6. Obtain ticket details for other services consumption
        7. DONE: Publish order created event 
        8. Return 201 w/ created order
    */

    const { ticketId } = req.body
    const existingTicket = await Ticket.findById(ticketId)

    if(!existingTicket) throw new NotFoundError();

    const isReserved = await existingTicket.isReserved();
    if(isReserved) throw new BadRequestError('Ticket is already reserved');

    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + EXPIRATION_SECONDS_WINDOW);

    const newOrder = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expirationDate,
        ticket: existingTicket
    })

    await newOrder.save()

    const { id , price } = existingTicket

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: newOrder?.id,
        version: newOrder?.version,
        status: newOrder?.status,
        userId: newOrder?.userId,
        expiresAt: newOrder?.expiresAt?.toISOString(),
        ticket: {
            id,
            price
        }
    })

    res.status(201).send(newOrder);

});

// Exports
export default router