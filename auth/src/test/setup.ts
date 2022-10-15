// Imports and Package Declarations
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import app from '../app'
import request from 'supertest'


// Variable Declarations
let mongoDbServer : any;

// Global Function Additions
declare global {
    var signUp: () => Promise<string[]>;
}


// Global Function Definitions
global.signUp = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password
        })
        .expect(201)
    
    const cookie = response.get('Set-Cookie');

    return cookie;
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


