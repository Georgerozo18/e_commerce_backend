const mongoose = require('mongoose')
const Sale = require('../models/sale_model')
const Product = require('../models/product_model')

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
    const { customer, products } = request.body

    // Validar campos requeridos
    if (!customer || !products || !Array.isArray(products) || products.length === 0) {
        return response.status(400).json({
            message: 'All fields are required: customer and products',
        })
    }

    // Iniciar sesión para manejar la transacción
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        let totalAmount = 0

        // Calcular el total de la venta y verificar productos
        const productDetails = await Promise.all(products.map(async (item) => {
            const product = await Product.findById(item.product).session(session)
            if (!product) throw new Error(`Product with ID ${item.product} not found`)
            totalAmount += product.price * item.quantity
            return {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            }
        }))

        // Crear la nueva venta
        const new_sale = new Sale({
            customer,
            products: productDetails,
            totalAmount,
        })

        await new_sale.save({ session })

        // Confirmar la transacción
        await session.commitTransaction()
        session.endSession()

        response.status(201).json({
            message: 'Sale created successfully',
            sale: new_sale,
        })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        response.status(500).json({
            message: 'Error creating sale',
            error: error.message,
        })
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
            let totalAmount = 0

            const productDetails = await Promise.all(products.map(async (item) => {
                const product = await Product.findById(item.product).session(session)
                if (!product) throw new Error(`Product with ID ${item.product} not found`)
                totalAmount += product.price * item.quantity
                return {
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price,
                }
            }))

            sale.products = productDetails
            sale.total_amount = totalAmount
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