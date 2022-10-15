// Imports and Package Declarations
import { Publisher , EventTypes, ExpirationCompleteEvent } from "@aoctickets/common";

// Class Declarations
class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly channel = EventTypes.ExpirationComplete
}

// Exports
export default ExpirationCompletePublisher