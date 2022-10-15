// Imports and Package Declarations
import { Publisher , EventTypes, OrderCancelledEvent } from "@aoctickets/common";

// Class Declarations
class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly channel = EventTypes.OrderCancelled;
}

// Exports
export default OrderCancelledPublisher