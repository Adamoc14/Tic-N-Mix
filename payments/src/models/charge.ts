// Imports and Package Declarations
import mongoose from 'mongoose'

/*
    Interfaces for process
    1. Interface to describe order attributes to create new Order
    2. Interface to describe properties & methods of a Order Model template
    3. Interface to describe the resulting new order attributes
*/

interface ChargeAttrs {
    orderId: string,
    stripeId: string
}

interface ChargeDoc extends mongoose.Document {
    orderId: string,
    stripeId: string
}

interface ChargeModel extends mongoose.Model<ChargeDoc> {
    build(attrs: ChargeAttrs): ChargeDoc 
}

// Schema Definitions
const chargeSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    },
}, {
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id
                delete ret._id
                delete ret.__v
            }
        }
    }
);

chargeSchema.statics.build = (attrs: ChargeAttrs) => {
    return new Charge({
        orderId: attrs?.orderId,
        stripeId: attrs?.stripeId
    });
}

// Model Definition
const Charge = mongoose.model<ChargeDoc, ChargeModel>('Charge', chargeSchema);

// Exports
export {  Charge }