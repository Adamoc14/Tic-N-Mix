// Imports and Package Declarations
import express , { Request, Response} from 'express'
import Ticket from '../models/ticket'

// Variable Declarations
const router = express.Router();

// Routes
router.get('/api/tickets', async (req: Request, res:Response) => {

    // Find all unreserved tickets in DB (ie. orderId: undefined)
    const tickets = await Ticket.find({
        orderId: undefined
    });

    // Return 200
    res.status(200).send(tickets)
});

// Exports
export default router