// Imports and Package Declarations
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

// Variable Declarations
const scryptAsync = promisify(scrypt);

export class PasswordHasher {
    static async hash(password: string){

        // Variables for process
        const salt = randomBytes(8).toString('hex');
        const buf = (await scryptAsync(password , salt, 64)) as Buffer;

        // return hashed password
        return `${buf.toString('hex')}.${salt}`;

    }
    static async compare(storedPassword: string, inputtedPassword: string){

        /*
            Password Compare
            1. Check request for inputted password, deal with errors in input
            2. Find user with respective email, obtain db hashed password
            3. Hash inputted password (ie. with same salt acting as encryption key)
            4. Hashed inputted password equal to db hashed password for that user ?

            (Note: Db Password needs the salt removed before comparison can take place )
        */

        // Variables for process
        const [hashedPassword , salt] = storedPassword.split('.');
        const buf = (await scryptAsync(inputtedPassword , salt, 64)) as Buffer;

        // Return verdict
        return buf.toString('hex') === hashedPassword;
    }
}