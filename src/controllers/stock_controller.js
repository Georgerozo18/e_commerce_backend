const Stock = require('../models/stock_model')

const updateStock = async (productId, quantity, session) => {
    const stock_item  = await Stock.findOne({product:productId}).session(session)

    if (!stock_item) {
        throw new Error(`Stock entry for product with ID ${productId} not found`)
    }

    // Verificar si hay suficiente stock
    if (stock_item.quantity < quantity) {
        throw new Error(`Not enough stock for product with ID ${productId}`)
    }

    // Resta la cantidad del stock
    stock_item.quantity -= quantity
    await stock_item.save({ session }) // Guarda el cambio dentro de la sesión de la transacción
}

module.exports = { updateStock }