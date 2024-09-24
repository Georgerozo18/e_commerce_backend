const mongoose = require('mongoose')
const Product = require('../models/product_model')
const Sale = require('../models/sale_model')
const Price = require('../models/price_model')
const {validateProducts} = require('../validators/product_validation')

// Obtener una venta por ID
const get_sale_by_id = async (request, response) => {
    try {
        const sale = await Sale.findById(request.params.id).populate('customer products.product')
        if (!sale) return response.status(404).json({ message: 'Sale not found' })

        response.status(200).json(sale)
    } catch (error) {
        response.status(500).json({ message: 'Server error', error: error.message })
    }
}

// Obtener todas las ventas
const get_all_sales = async (request, response) => {
    try {
        const sales = await Sale.find().populate('customer products.product')
        response.status(200).json(sales)
    } catch (error) {
        response.status(500).json({ message: 'Server error', error: error.message })
    }
}

// Crear una nueva venta
const create_sale = async (request, response) => {
    console.log('Request User:', request.user)

    if (!request.user || !request.user.id) {
        return response.status(401).json({
            message: 'Unauthorized, customer information not found'
        })
    }

    const customer = request.user.id
    const { products } = request.body
    let session

    try {
        // Validar productos
        const validatedProducts = validateProducts(products)
        
        session = await mongoose.startSession()
        session.startTransaction()

        let totalAmount = 0

        const productDetails = await Promise.allSettled(validatedProducts.map(async (item) => {
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
        if (session) await session.abortTransaction()
        response.status(500).json({
            message: 'Error creating sale',
            error: error.message,
        });
    } finally {
        if (session) session.endSession()
    }
}

// Actualizar una venta por ID
const update_sale = async (request, response) => {
    const { customer, products, status } = request.body

    // Verificar permisos
    if (request.user.role !== 'admin') {
        return response.status(403).json({
            message: 'Forbidden: You do not have permission to make this action',
        })
    }

    // Iniciar sesión para la transacción
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const sale = await Sale.findById(request.params.id).session(session)
        if (!sale) {
            await session.abortTransaction()
            session.endSession()
            return response.status(404).json({
                message: 'Sale not found',
            })
        }

        // Actualizar campos si están presentes en la solicitud
        if (customer) sale.customer = customer
        if (status) sale.status = status

        if (products && Array.isArray(products) && products.length > 0) {
            let total_amount = 0

            const productDetails = await Promise.all(products.map(async (item) => {
                const product = await Product.findById(item.product).session(session)
                if (!product) throw new Error(`Product with ID ${item.product} not found`)
                total_amount += product.price * item.quantity
                return {
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price,
                }
            }))

            sale.products = productDetails
            sale.total_amount = total_amount
        }

        await sale.save({ session })
        await session.commitTransaction()
        session.endSession()

        response.status(200).json({
            message: 'Sale updated successfully',
            sale,
        })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        response.status(500).json({
            message: 'Error updating sale',
            error: error.message,
        })
    }
}

// Eliminar una venta por ID
const delete_sale = async (request, response) => {
    if (request.user.role !== 'admin') {
        return response.status(403).json({
            message: 'Forbidden: You do not have permission to make this action',
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const sale = await Sale.findById(request.params.id).populate('products.product')

        if (!sale) {
            await session.abortTransaction()
            session.endSession()
            return response.status(404).json({ message: 'Sale not found' })
        }

        // Actualizar el stock de los productos
        for (const item of sale.products) {
            const product = await Product.findById(item.product._id)
            if (product) {
                product.stock += item.quantity // Devolver el stock vendido
                await product.save({ session })
            }
        }

        // Eliminar la venta
        await Sale.findByIdAndDelete(request.params.id, { session })

        await session.commitTransaction()
        session.endSession()

        response.status(200).json({
            message: 'Sale and stock updated successfully',
        })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        response.status(500).json({
            message: 'Error deleting sale',
            error: error.message,
        })
    }
}

module.exports = {
    get_sale_by_id,
    get_all_sales,
    create_sale,
    update_sale,
    delete_sale,
}