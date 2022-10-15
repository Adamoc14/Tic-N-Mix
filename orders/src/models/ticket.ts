// Imports and Package Declarations
import mongoose from "mongoose";
import { Order , OrderStatus } from './order'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

/*
    Interfaces for process
    1. Interface to describe ticket attributes to create new Ticket
    2. Interface to describe the resulting new ticket attributes
    3. Interface to describe properties & methods of a Ticket Model template
*/
interface TicketAttrs {
    id: string,
    title: string,
    price: number,
}

interface TicketDoc extends mongoose.Document {
    title: string,
    price: number,
    version: number,
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
    findLastEventProcessedMatchingId(event : { id: string , version: number}) : Promise<TicketDoc | null>
}


// Schema Definitions
const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
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
    return new Ticket({
        _id: attrs?.id,
        title: attrs?.title,
        price: attrs?.price
    });
}
ticketSchema.statics.findLastEventProcessedMatchingId = (event : { id: string , version: number}) => {
    return Ticket.findOne({
        _id: event?.id,
        version: event?.version - 1
    })
}

ticketSchema.methods.isReserved = async function() {

    // Value of this === ticket itself
    const existingOrder = await Order.findOne({
        ticket: this?.id,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })

    /* 
        REVIEW: !!existingOrder

        NOTE: Null is treated as false(y), existingOrder is treated as true w/ value

        If existingOrder is null = false
        - !existingOrder returns true
        - !!existingOrder returns false again as overall return value

        if existingOrder is not null = true
        - !existingOrder returns false
        - !!existingOrder returns true again as overall return value

        Same as existingOrder ? true : false
    */
    return !!existingOrder
}

// Model Definition
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

// Export
export { Ticket , TicketDoc }