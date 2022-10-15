// Imports and Package Declarations
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

// Mock Implementations
jest.mock('../nats-wrapper')

// Variable Declarations
let mongoDbServer : any;

// Global Function Additions
declare global {
    var signUp: (id?: string) => string[];
}


// Global Function Definitions
global.signUp = (id: string = '25678399kn53') => {
    
    /*
        Sign Up Flow For Tests on Services other than Auth
        1. Build a JWT Payload {id, email}
        2. Create the JWT
        3. Build Session Object {jwt: ?}
        4. Turn that session into JSON
        5. Take JSON and encode it as base 64
        6. Return string with cookie encoded data

    */
   
    const payload = {
        id,
        email: 'test@test.com'
    }
    const token = jwt.sign(payload, process.env.JWT_KEY!)
    const session = {jwt: token}
    const sessionJSON = JSON.stringify(session);
    const sessionB64 = Buffer.from(sessionJSON).toString('base64')

    return [`session=${sessionB64}`];

}


/* Setup Hooks */

// Before All Tests
beforeAll( async() => {

    // Setup Env variables
    process.env.JWT_KEY = "adam";

    // Setup MongoMemoryServer
    mongoDbServer = await MongoMemoryServer.create();

    // Obtain Server URI
    const mongoDbServerUri = mongoDbServer.getUri();

    // Connect mongoose to it
    await mongoose.connect(mongoDbServerUri);

})


// Before Each Test
beforeEach( async() => {

    // Clear all mock implementations(ie. disallow times called to be carried over )
    jest.clearAllMocks();
    
    // Obtain all collections stored in memory
    const collections = await mongoose.connection.db.collections();

    // Delete all collections
    for (let collection of collections) await collection.deleteMany({});

})


// After all tests
afterAll(async () => {

    // Stop the mongodbserver
    await mongoDbServer.stop();

    // Disconnect mongoose
    await mongoose.connection.close();
})


