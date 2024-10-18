const mongoose = require('mongoose')
const Product = require('../models/product_model')
const Sale = require('../models/sale_model')
const Price = require('../models/price_model')
const { validateProducts } = require('../validators/product_validation')
const { updateStock } = require('./stock_controller') // Usa la función existente

// Crear una nueva venta para el cliente
const create_checkout = async (request, response) => {
    if (!request.user || !request.user.id) {
        return response.status(401).json({
            message: 'Unauthorized, customer information not found'
        })
    }

    const customer = request.user.id
    const { products } = request.body
    let session

    try {
        // Iniciar la sesión y la transacción
        session = await mongoose.startSession()
        session.startTransaction()

        // Validar productos
        const validatedProducts = validateProducts(products)

        let totalAmount = 0

        // Procesar cada producto en paralelo con Promise.allSettled
        const productDetails = await Promise.allSettled(validatedProducts.map(async (item) => {
            const productId = item.product // Guardamos el ID del producto

            try {
                // Actualizar stock con la sesión activa
                await updateStock(productId, item.quantity, session)

                // Buscar el producto
                const product = await Product.findById(productId).session(session)
                if (!product) throw new Error(`Product with ID ${productId} not found`)

                // Buscar el precio
                const priceData = await Price.findOne({ product: product._id }).session(session)
                if (!priceData || priceData.price == null) {
                    throw new Error(`Product with ID ${product._id} has no price`)
                }

                const quantity = parseInt(item.quantity)
                if (isNaN(quantity) || quantity <= 0) {
                    throw new Error(`Invalid quantity for product with ID ${productId}`)
                }

                const price = parseFloat(priceData.price)
                if (isNaN(price) || price < 0) {
                    throw new Error(`Price for product with ID ${product._id} is invalid`)
                }

                totalAmount += price * quantity

                // Retornar detalles del producto procesado
                return {
                    product: product._id,
                    quantity: quantity,
                    price: price,
                }
            } catch (err) {
                throw new Error(`Error processing product ID ${productId}: ${err.message}`)
            }
        }))

        // Filtrar y manejar los resultados de Promise.allSettled
        const fulfilledProducts = productDetails
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value)

        // Si algún producto no se procesó correctamente, lanzar error
        if (fulfilledProducts.length !== products.length) {
            const rejectedProducts = productDetails.filter(result => result.status === 'rejected')
            console.error("Errores al procesar los productos:", rejectedProducts.map(result => result.reason.message))
            throw new Error(`Some products failed during processing. Cancelling transaction. Details: ${rejectedProducts.map(result => result.reason.message).join(', ')}`)
        }

        // Crear la nueva venta
        const new_sale = new Sale({
            customer,
            products: fulfilledProducts,
            total_amount: totalAmount,
        })

        // Guardar la venta en la base de datos con la sesión activa
        await new_sale.save({ session })

        // Confirmar la transacción
        await session.commitTransaction()

        response.status(201).json({
            message: 'Sale created successfully',
            sale: new_sale,
        })

    } catch (error) {
        // Manejar errores y abortar la transacción si es necesario
        if (session && session.inTransaction()) {
            await session.abortTransaction()
        }
        response.status(500).json({
            message: 'Error creating sale',
            error: error.message,
        })
    } finally {
        // Finalizar la sesión
        if (session) session.endSession()
    }
}

module.exports = { create_checkout }
