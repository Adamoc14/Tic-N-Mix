// Imports and Package Declarations
import express , { Request , Response} from 'express'
import { requireAuth } from '@aoctickets/common';
import { Order } from '../models/order';


// Variable Declarations
const router = express.Router();


// Routes
router.get('/api/orders', requireAuth , async(req: Request , res: Response) => {

    // Find all orders in DB
    const orders = await Order.find({
        userId: req.currentUser?.id
    }).populate('ticket')

    // Return 200
    res.status(200).send(orders)
})


// Exports
export default router