// Imports and Package Declarations
import Ticket from "../ticket";

// Variables for test process
const title = "Harry Styles Wembley Tour"
const price = 85.00

// Tests
it('should implement optimistic concurrency control' , async() => {

    /*  
        Optimistic Concurrency control test flow
        1. Create a ticket
        2. Save ticket to DB
        3. Fetch same ticket twice
        4. Update ticket #1 & #2 copies
        5. Save the ticket #1 copy
        6. Attempt to save second 
        7. Expect error with version numbers being out of sync
    */

   const newTicket = Ticket.build({
        userId: "2653767sulu0",
        title,
        price
   })

   await newTicket.save();

   const ticketCopyOne = await Ticket.findById(newTicket?.id)
   const ticketCopyTwo = await Ticket.findById(newTicket?.id)

   ticketCopyOne!.set({ price : 75.00 })
   ticketCopyTwo!.set({ price: 65.00 })

   await ticketCopyOne!.save();

   await expect(ticketCopyTwo!.save()).rejects.toThrow();
})

it('should increment version number on multiple saves', async() => {
    
    // Create Ticket
    const newTicket = Ticket.build({
        userId: "2653767sulu0",
        title,
        price
    })
    await newTicket.save()

    // Expect version number to Equal 0
    expect(newTicket?.version).toEqual(0)

    // Save a few more times
    await newTicket.save()
    expect(newTicket?.version).toEqual(1)

    await newTicket.save()
    expect(newTicket?.version).toEqual(2)

})