// Imports and Package Declarations
import express , {Request , Response} from 'express'
import { Order } from '../models/order';
import { NotFoundError, requireAuth , UnauthorizedError } from '@aoctickets/common';

// Variable Declarations
const router = express.Router();

// Routes
router.get('/api/orders/:orderId', requireAuth ,  async (req: Request, res:Response) => {

    // Check for requested resource ( ie. ticket ) with parsed id 
    const order = await Order.findById(req.params?.orderId).populate('ticket')
    
    // Return 404 error if not found
    if(!order) throw new NotFoundError();

    // Return 401 if requested resource not belonging to user making request
    if(order?.userId !== req.currentUser?.id) throw new UnauthorizedError();
    
    // Return requested resource
    res.status(200).send(order)

});

// Exports
export default router