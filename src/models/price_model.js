const mongoose = require('mongoose')

const PriceSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true })

module.exports = mongoose.model('Price', PriceSchema)