
// Imports and Package Declarations
import express from 'express';
import 'express-async-errors'
import { NotFoundError , errorHandler } from '@aoctickets/common'
import cookieSession from 'cookie-session';
import newTicketRouter from './routes/new-ticket';
import showTicketRouter from './routes/show-ticket';
import showAllTicketsRouter from './routes/show-all-tickets';
import updateTicketRouter from './routes/update-ticket';
import { getCurrentUser } from '@aoctickets/common';

// Variable Declarations
const app = express();

// App Configurations
app.set('trust proxy', true)
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
)
app.use(getCurrentUser)

// Mounting Routers
app.get('/', (req, res) => res.send('Well'));
app.use('/api/tickets', newTicketRouter);
app.use(updateTicketRouter);
app.use(showTicketRouter);
app.use(showAllTicketsRouter);
app.all('*', async() => {
    throw new NotFoundError();
})

app.use(errorHandler);

// Export 
export default app