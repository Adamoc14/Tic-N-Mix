// Imports and Package Declarations
import mongoose from "mongoose";
import { PasswordHasher } from '../helpers/password-hasher'

/*
    Interfaces for process
    1. Interface to describe user attributes to create new User
    2. Interface to describe properties & methods of a User Model template
    3. Interface to describe the resulting new user attributes
*/
interface UserAttrs {
    email: string,
    password: string
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

interface UserDoc extends mongoose.Document {
    email: string,
    password: string
}


// Schema Definitions
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id
                delete ret._id
                delete ret.password
                delete ret.__v
            }
        }
    }
);
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

// Pre Save Hooks
userSchema.pre('save' , async function(done){

    // Identify whether an update or creation is taking place
    if(this.isModified('password')){

        // Hash Password
        const hashedPassword = await PasswordHasher.hash(this.get('password'));

        //  Update password to be saved
        this.set('password', hashedPassword);
    }

    // Continue with save
    done();

});


// Model Definition
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// Export
export default User  