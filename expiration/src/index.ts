// Imports and Package Declarations
import { natsWrapper } from './nats-wrapper';
import OrderCreatedListener from './events/listener/order-created-listener';

// Function Definitions
const checkEnvVariablesDefined = async() => {
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
        console.log('Connected to Nats successfully!')
        
        // Listen for close of service
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        // Close NATS
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        })

        // Set up listeners
        new OrderCreatedListener(natsWrapper?.client).listen()
        
    } catch (err: any) {
        throw new Error(err);
    }
}

startDB();


