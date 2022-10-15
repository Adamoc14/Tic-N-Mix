// Imports and Package Declarations
import { Publisher , OrderCreatedEvent , EventTypes } from "@aoctickets/common";

// Class Declarations
class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly channel = EventTypes.OrderCreated;
}

// Exports
export default OrderCreatedPublisher