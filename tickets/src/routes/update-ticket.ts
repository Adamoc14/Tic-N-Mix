// Imports and Package Declarations
import express , { Request , Response} from 'express'
import Ticket from '../models/ticket'
import { body } from 'express-validator'
import { 
    validateRequest , 
    NotFoundError , 
    requireAuth,
    UnauthorizedError,
    BadRequestError
} from '@aoctickets/common'
import TicketUpdatedPublisher from '../events/publisher/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper';

// Variable Declarations
const router = express.Router();

// Routes
router.put('/api/tickets/:id' , requireAuth , [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').not().isString().exists().isFloat({gt: 0}).withMessage('Price must be above 0 and in decimal format')
] , validateRequest , async (req: Request, res:Response) => {

    // Check for requested resource ( ie. ticket ) with parsed id 
    const ticket = await Ticket.findById(req.params?.id)
    
    // Return 404 error if not found
    if(!ticket) throw new NotFoundError();
    
    // Disallow editing of reserved ticket
    if(ticket?.orderId) throw new BadRequestError('Can\'t edit a reserved ticket')

    // Disallow ticket non-owners updating tickets 
    if(req.currentUser?.id && ticket.userId && ticket.userId !== req.currentUser.id) throw new UnauthorizedError();


    // Retrieve values from incoming request
    const { title , price } = req.body

    // Update ticket
    ticket.set({
        title,
        price
    })

    // Save to DB
    const {id, title:ticketTitle , price:ticketPrice , version:ticketVersion , userId} = await ticket.save();

    // Publish ticket updated event
    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id,
        title: ticketTitle,
        price: ticketPrice,
        userId,
        version: ticketVersion
    })

    // Return 200 w/ updated ticket
    res.status(200).send(ticket)

});


// Export
export default router