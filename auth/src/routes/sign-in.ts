// Imports and Package Declarations
import express, { Request , Response } from 'express'
import { body } from 'express-validator';
import { PasswordHasher } from '../helpers/password-hasher';
import { validateRequest , BadRequestError } from '@aoctickets/common'
import User from '../models/user';
import jwt from 'jsonwebtoken';

// Variable Declarations
const router = express.Router();

// Routes
router.post('/', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password must be supplied')
], validateRequest, async (req:Request, res:Response) => {

    // Error check on passed in variables - done in middleware

    // Variables for process
    const { email , password } = req.body;

    /*  
        Sign In Flow
        1. Check for existing user with same email ?
            - No, throw error
            - Yes, continue 
        2. Compare password against stored one (ie. use PasswordHasher)
            - If same, continue
            - If not, throw error
        3. Generate a web token
        4. Store it on the session object
        5. User is now logged in. Return a cookie with attached JWT
    */ 

    const existingUser = await User.findOne({ email });
    if(!existingUser) throw new BadRequestError("Invalid credentials: Username doesn't exist");

    if(!await PasswordHasher.compare(existingUser.password , password)) throw new BadRequestError('Invalid credentials');

    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, process.env.JWT_KEY! );

    req.session = { 
        jwt: userJwt 
    };
    
    res.status(200).send(existingUser);

});

// Exports
export default router
