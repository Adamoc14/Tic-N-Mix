// Imports and Package Declarations
import { BadRequestError } from "@aoctickets/common"

// Mock up of stripe instance for testing
export const stripe = {
    charges: {
        create: jest.fn().mockImplementation((data) => {
            if(data.source !== 'tok_visa') throw new BadRequestError('Please provide a valid token')
            return {
                id: 'STRIPE_MOCK_ID'
            }
        })
    } 
}