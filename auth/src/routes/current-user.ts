// Imports and Package Declarations
import express from 'express'
import { getCurrentUser } from '@aoctickets/common'

// Variable Declarations
const router = express.Router();

// Routes
router.get('/', getCurrentUser, (req, res) => {
    
    /*
        Get Current User Flow
        1. Check if JWT has been set 
        - If no, return {currentUser: null}
        - If yes, continue
        2. Decode JWT
        3. Check if it's valid
        - If no, return {currentUser: null}
        - If yes, continue
        4. Return current user with payload included in the JWT 
        ( 
            Note: 
            All this logic has essentially been moved to the getCurrentUser middleware. 
            We now just send back currentUser attached to session object or null
        )
    */

    res.send({ currentUser: req.currentUser || null });
})

// Exports
export default router
