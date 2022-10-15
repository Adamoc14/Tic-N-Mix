// Imports and Package Declarations
import { Publisher , EventTypes , TicketUpdatedEvent  } from "@aoctickets/common";

// Class Declarations
class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly channel = EventTypes.TicketUpdated;

}

// Exports 
export default TicketUpdatedPublisher
