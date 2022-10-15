// Imports and Package Declarations
import express , {Request , Response} from 'express'
import { Order, OrderStatus } from '../models/order';
import { NotFoundError , requireAuth , UnauthorizedError } from '@aoctickets/common';
import OrderCancelledPublisher from '../events/publisher/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

// Variable Declarations
const router = express.Router();

// Routes
router.delete('/api/orders/:orderId', requireAuth,  async (req: Request, res:Response) => {

   // Check for requested resource ( ie. ticket ) with parsed id 
   const order = await Order.findById(req.params?.orderId).populate('ticket')
    
   // Return 404 error if not found
   if(!order) throw new NotFoundError();

   // Return 401 if requested resource not belonging to user making request
   if(order?.userId !== req.currentUser?.id) throw new UnauthorizedError();

   // Update order status to be cancelled    
   order.status = OrderStatus.Cancelled

   // Re-save order
   await order.save()    

   // DONE: Implement publishing of order cancelled event for consumption by other services  
   new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order?.id,
      version: order?.version,
      ticket: {
         id: order?.ticket?.id
      }
   })
   
   // Return requested resource
   res.status(204).send(order)

});

// Exports
export default router