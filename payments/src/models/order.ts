// Imports and Package Declarations
import mongoose from 'mongoose'
import { OrderStatus } from '@aoctickets/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

/*
    Interfaces for process
    1. Interface to describe order attributes to create new Order
    2. Interface to describe properties & methods of a Order Model template
    3. Interface to describe the resulting new order attributes
*/

interface OrderAttrs{
    id: string,
    status: OrderStatus,
    version: number,
    userId: string,
    price: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc
}

interface OrderDoc extends mongoose.Document {
    userId: string
    status: OrderStatus,
    price: number
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
    price: {
        type: Number,
        required: true
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
    return new Order({
        _id: attrs?.id,
        status: attrs?.status,
        version: attrs?.version,
        price: attrs?.price,
        userId: attrs?.userId
    });
}

// Model Definition
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

// Exports
export { OrderStatus , Order}
