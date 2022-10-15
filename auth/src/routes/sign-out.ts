// Imports and Package Declarations
import express from 'express'

// Variable Declarations
const router = express.Router();

// Routes
router.post('/', (req, res) => {
    
    // Empty the cookie session
    req.session = null;

    // Return empty object
    res.send({});
})

// Exports
export default router
