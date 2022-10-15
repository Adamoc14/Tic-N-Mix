// Imports and Package Declarations
import express, { Request , Response } from 'express'
import { body } from 'express-validator';
import User from '../models/user';
import jwt from 'jsonwebtoken'
import { validateRequest , BadRequestError } from '@aoctickets/common'

// Variable Declarations
const router = express.Router();

// Routes
router.post('/', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({min: 4 , max: 20}).withMessage('Password must be between 4 and 20 characters')
], validateRequest, async (req:Request, res:Response) => {

    // Error check on passed in variables - done in middleware
    
    // Variables for process
    const { email , password } = req.body;
    let newUser = null;

    /*  
        Sign Up Flow
        1. Check for existing user with same email ?
            - Yes, throw error
            - No, continue
        2. Hash password 
        3. Create new User in DB
        4. Generate a web token
        5. Store it on the session object
        6. User is now logged in. Return a cookie with attached JWT
    */ 

    const existingUser = await User.findOne({ email });
    if(existingUser) {
        throw new BadRequestError('Email is in use');
    }

    newUser = User.build({ email , password});
    await newUser.save();

    const userJwt = jwt.sign({
        id: newUser.id,
        email: newUser.email
    }, process.env.JWT_KEY! );

    req.session = { 
        jwt: userJwt 
    };
    
    res.status(201).send(newUser);
    
})

// Exports
export default router
