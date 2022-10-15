// Imports and Package Declarations
import Stripe from 'stripe'

// Exporting Stripe client for use in rest of service
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: '2022-08-01'
})