// Imports and Package Declarations
import mongoose from "mongoose";
import { TicketDoc } from './ticket';
import { OrderStatus } from '@aoctickets/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

/*
    Interfaces for process
    1. Interface to describe order attributes to create new Order
    2. Interface to describe properties & methods of a Order Model template
    3. Interface to describe the resulting new order attributes
*/
interface OrderAttrs {
    userId: string
    status: OrderStatus,
    expiresAt: Date,
    ticket: TicketDoc,
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

interface OrderDoc extends mongoose.Document {
    userId: string
    status: OrderStatus,
    expiresAt: Date,
    ticket: TicketDoc,
    version: number
}

// Schema Definitions
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
    }
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

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

// Model Definition
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

// Export
export { Order , OrderStatus } 