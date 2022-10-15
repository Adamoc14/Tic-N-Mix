// Imports and Package Declarations
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

/*
    Interfaces for process
    1. Interface to describe ticket attributes to create new Ticket
    2. Interface to describe properties & methods of a Ticket Model template
    3. Interface to describe the resulting new ticket attributes
*/
interface TicketAttrs {
    title: string,
    price: number,
    userId: string
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
}

interface TicketDoc extends mongoose.Document {
    title: string,
    price: number,
    version: number
    userId: string,
    orderId?: string,
}

// Schema Definitions
const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
    }
}, {
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id
                delete ret._id
            }
        }
    }
);

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
}

// Model Definition
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

// Export
export default Ticket  