// Imports and Package Declarations
import { Publisher , EventTypes , TicketCreatedEvent  } from "@aoctickets/common";

// Class Declarations
class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly channel = EventTypes.TicketCreated;

}

// Exports 
export default TicketCreatedPublisher
