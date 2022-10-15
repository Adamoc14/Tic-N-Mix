// Imports and Package Declarations
import express , {Request , Response} from 'express'
import { requireAuth , validateRequest } from '@aoctickets/common'
import { body } from 'express-validator';
import Ticket from '../models/ticket';
import TicketCreatedPublisher from '../events/publisher/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';


// Variable Declarations
const router = express.Router();

// Routes
router.post('/', requireAuth, [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').not().isString().isFloat({gt: 0}).withMessage('Price must be above 0 and in decimal format')
], validateRequest, async (req: Request, res:Response) => {

    // Retrieve values from incoming request
    const { title , price } = req.body

    // Make new Ticket
    const newTicket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    })

    // Save to DB
    const { id, title:ticketTitle , price:ticketPrice , version:ticketVersion , userId } = await newTicket.save();

    // Publish ticket created event
    new TicketCreatedPublisher(natsWrapper.client).publish({
        id,
        title: ticketTitle,
        price: ticketPrice,
        userId,
        version: ticketVersion
    })

    // Return 201
    res.status(201).send(newTicket);

});

// Exports
export default router