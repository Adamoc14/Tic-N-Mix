// Imports and Package Declarations
import express , {Request , Response} from 'express'
import Ticket from '../models/ticket';
import { NotFoundError } from '@aoctickets/common';

// Variable Declarations
const router = express.Router();

// Routes
router.get('/api/tickets/:id', async (req: Request, res:Response) => {

    // Check for requested resource ( ie. ticket ) with parsed id 
    const ticket = await Ticket.findById(req.params?.id)
    
    // Return 404 error if not found
    if(!ticket) throw new NotFoundError();
    
    // Return requested resource
    res.status(200).send(ticket)

});

// Exports
export default router