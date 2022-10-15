
// Imports and Package Declarations
import express from 'express';
import 'express-async-errors'
import { NotFoundError , errorHandler } from '@aoctickets/common'
import cookieSession from 'cookie-session';
import newOrderRouter from './routes/new-order';
import showOrderRouter from './routes/show-order';
import showAllOrdersRouter from './routes/show-all-orders';
import deleteOrderRouter from './routes/delete-order';
import { getCurrentUser } from '@aoctickets/common';

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
app.use(getCurrentUser)

// Mounting Routers
app.get('/', (req, res) => res.send('Well'));
app.use(showAllOrdersRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);
app.all('*', async() => {
    throw new NotFoundError();
})

app.use(errorHandler);

// Export 
export default app