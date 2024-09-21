const mongoose = require('mongoose')

const StockSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    }, 
    quantity:{
        type:Number,
        required:true,
        min:0
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

module.exports = mongoose.model('Stock', StockSchema)