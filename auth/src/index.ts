// Imports and Package Declarations
import mongoose from 'mongoose';
import app from './app';

// Function Definitions
const checkEnvVariablesDefined = async() => {
    if(!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined');
    if(!process.env.MONGO_URI) throw new Error('MONGO_URI must be defined');
}

const startDB = async() => {

    await checkEnvVariablesDefined();

    try {

        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to DB successfully')
        
    } catch (err: any) {
        throw new Error(err);
    }

    // Listen to port
    app.listen(3000, () => {
        console.log('Listening on port 3000!!!!');
    })
}

startDB();


