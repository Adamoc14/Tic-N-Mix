// Imports and Package Declarations
import mongoose from 'mongoose';
import app from './app';
import ChargeCreatedListener from './events/listener/charge-created-listener';
import ExpirationCompleteListener from './events/listener/expiration-complete-listener';
import TicketCreatedListener from './events/listener/ticket-created-listener';
import TicketUpdatedListener from './events/listener/ticket-updated-listener';
import { natsWrapper } from './nats-wrapper';

// Function Definitions
const checkEnvVariablesDefined = async() => {
    if(!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined');
    if(!process.env.MONGO_URI) throw new Error('MONGO_URI must be defined');
    if(!process.env.NATS_URL) throw new Error('NATS_URL must be defined');
    if(!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID must be defined');
    if(!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID must be defined');
}

const startDB = async() => {

    await checkEnvVariablesDefined();

    try {

        // Connect to Nats
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID!, 
            process.env.NATS_CLIENT_ID!,
            process.env.NATS_URL!
        )
        console.log('Connected to Nats successfully')
        
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to DB successfully')

        // Listen for close of service
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        // Close NATS
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        })

        // Set up Listeners
        new TicketCreatedListener(natsWrapper.client)?.listen();
        new TicketUpdatedListener(natsWrapper.client)?.listen();
        new ExpirationCompleteListener(natsWrapper.client)?.listen();
        new ChargeCreatedListener(natsWrapper.client)?.listen();

        
    } catch (err: any) {
        throw new Error(err);
    }

    // Listen to port
    app.listen(3000, () => {
        console.log('Listening on port 3000!!!!');
    })
}

startDB();


