const mongoose = require('mongoose')
const Product = require('../models/product_model')
const Sale = require('../models/sale_model')
const Price = require('../models/price_model')
const { validateProducts } = require('../validators/product_validation')
const { updateStock } = require('./stock_controller')

// Crear una nueva venta para el cliente
const create_checkout = async (request, response) => {
    // console.log(request.body)
    if (!request.user || !request.user.id) {
        return response.status(401).json({
            message: 'Unauthorized, customer information not found'
        })
    }

    const customer = request.user.id
    const { products } = request.body
    let session

    try {
        // Iniciar la sesión si no existe
        if (!session) {
            session = await mongoose.startSession()
        }

        // Iniciar la transacción solo si no está en curso una
        if (!session.inTransaction()) {
            session.startTransaction()
        }

        // Validar productos
        const validatedProducts = validateProducts(products)

        let totalAmount = 0

        const productDetails = await Promise.allSettled(validatedProducts.map(async (item) => {
            await updateStock(item.product, item.quantity, session)
            const product = await Product.findById(item.product).session(session)
            if (!product) throw new Error(`Product with ID ${item.product} not found`)

            const priceData = await Price.findOne({ product: product._id }).session(session)
            if (!priceData || priceData.price == null) {
                throw new Error(`Product with ID ${product._id} has no price`)
            }

            const quantity = parseInt(item.quantity)
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error(`Invalid quantity for product with ID ${item.product}`)
            }

            const price = parseFloat(priceData.price)
            if (isNaN(price) || price < 0) {
                throw new Error(`Price for product with ID ${product._id} is invalid`)
            }

            totalAmount += price * quantity

            return {
                product: product._id,
                quantity: quantity,
                price: price,
            }
        }))

        productDetails.forEach((result, index) => {
            if (result.status === 'rejected') {
                throw new Error(`Error processing product ID ${validatedProducts[index].product}: ${result.reason.message}`)
            }
        })

        // Crear la nueva venta
        const new_sale = new Sale({
            customer,
            products: productDetails.filter(result => result.status === 'fulfilled').map(res => res.value),
            total_amount: totalAmount,
        })

        await new_sale.save({ session })
        await session.commitTransaction()

        response.status(201).json({
            message: 'Sale created successfully',
            sale: new_sale,
        });
    } catch (error) {
        if (session && session.inTransaction()){
            // Asegurarse de abortar la transacción si algo falla
            await session.abortTransaction()
        }
        response.status(500).json({
            message: 'Error creating sale',
            error: error.message,
        });
    } finally {
        if (session) session.endSession()
    }
}

module.exports = { create_checkout }