
// Imports and Package Declarations
import express from 'express';
import currentUserRouter from './routes/current-user';
import signInRouter from './routes/sign-in'
import signOutRouter from './routes/sign-out'
import signUpRouter from './routes/sign-up'
import { NotFoundError , errorHandler } from '@aoctickets/common'
import cookieSession from 'cookie-session';

// Variable Declarations
const app = express();

// App Configurations
app.set('trust proxy', true)
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: false
        // secure: process.env.NODE_ENV !== 'test'
    })
)

// Mounting Routers
app.get('/', (req, res) => res.send('Well'));
app.use('/api/users/currentuser' , currentUserRouter);
app.use('/api/users/signin', signInRouter);
app.use('/api/users/signout', signOutRouter);
app.use('/api/users/signup', signUpRouter);
app.all('*', async() => {
    throw new NotFoundError();
})

app.use(errorHandler);

// Export 
export default app