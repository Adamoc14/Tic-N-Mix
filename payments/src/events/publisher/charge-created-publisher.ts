// Imports and Package Declarations
import { Publisher , ChargeCreatedEvent , EventTypes } from "@aoctickets/common";

// Class Declaration charge created event publisher for rest of the service
class ChargeCreatedPublisher extends Publisher<ChargeCreatedEvent> {
    readonly channel = EventTypes.ChargeCreated
}

// Exports
export default ChargeCreatedPublisher