const mongoose = require('mongoose')

const SaleSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }, 
    products:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        }, 
        quantity:{
            type:Number,
            required:true,
            min:1
        }, 
        price:{
            type:Number,
            required:true
        }
    }], 
    total_amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['completed', 'pending', 'cancelled'],
        default: 'completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps:true})

module.exports = mongoose.model('Sale', SaleSchema)