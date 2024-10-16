const mongoose = require('mongoose')
const Product = require('../models/product_model')
const Stock = require('../models/stock_model')
const Price = require('../models/price_model')

// Obtener un producto por ID
const get_product_by_id = async (request, response)=>{
    try{
        const product = await Product.findById(request.params.id).populate('category')
        if(!product) return response.status(404).json({message:'product not found'})

        response.status(200).json(product)
    } catch(error){
        response.status(500).json({ message: 'Server error' })
    }
}

// Obtener todos los productos
const get_all_products = async (request, response)=>{
    try{
        const products = await Product.find()
            .populate('category')
            .lean()

        // Obtener información adicional de Stock y Price
        const enriche_products = await Promise.all(products.map(async (product) => {
            const stock = await Stock.findOne({ product: product._id })
            const price = await Price.findOne({ product: product._id })
            
            return {
                ...product,
                stock: stock ? stock.quantity : null, 
                price: price ? price.price : null,
            }
        }))
        response.status(200).json(enriche_products)
    } catch(error){
        response.status(500).json({message: 'Server error'})
    }
}

// Crear un nuevo producto
const create_product = async (request, response)=>{
    console.log(request.body)
    const { name, description, category, price, stock } = request.body

    // Validar que los campos requeridos estén presentes
    if(!name || !description || !category || price === undefined || stock === undefined){
        return response.status(400).json({
            message: 'All fields are required: name, description, category, price, stock'
        })
    }

    // Iniciar una sesión para manejar la transacción
    const session = await mongoose.startSession()
    session.startTransaction()

    try{
        const new_product = new Product({
            name, 
            description, 
            category
        })
        await new_product.save({session})

        // Crear la entrada de stock asociada al producto
        const new_stock = new Stock({
            product:new_product._id,
            quantity:stock
        })
        await new_stock.save({session})

        // Crear la entrada de precio asociada al producto
        const new_price = new Price({
            product:new_product._id,
            price:price
        })
        await new_price.save({session})

        // Confirmar la transacción
        await session.commitTransaction()
        session.endSession()

        return response.status(201).json({
            message:'Product created successfully',
            product:new_product
        })
    } catch(error){
        await session.abortTransaction()
        session.endSession()
        response.status(500).json({
            message: 'Error creating product',
            error: error.message
        })
    }
}

const upload_product_image = async (request, response) => {
    const product_id = request.params.id;
    const image = request.file ? request.file.filename : null;

    if (!image) {
        return response.status(400).json({ message: 'No image file uploaded' });
    }

    try {
        const imageUrl = `http://localhost:3001/uploads/${image}`; // Construir URL completa

        const updated_product = await Product.findByIdAndUpdate(
            product_id,
            { image: imageUrl }, // Guardar URL en lugar del nombre del archivo
            { new: true }
        );

        if (!updated_product) {
            return response.status(404).json({ message: 'Product not found' });
        }

        return response.status(200).json({
            message: 'Image uploaded successfully',
            product: updated_product
        });
    } catch (error) {
        response.status(500).json({ message: 'Error uploading image', error: error.message });
    }
}

const upload_product_model = async (request, response) => {
    const product_id = request.params.id;
    const model = request.file ? request.file.filename : null;

    if (!model) {
        return response.status(400).json({ message: 'No model file uploaded' });
    }

    try {
        const modelUrl = `http://localhost:3001/uploads/${model}`; // Construir URL completa

        const updated_product = await Product.findByIdAndUpdate(
            product_id,
            { model: modelUrl }, // Guardar URL en lugar del nombre del archivo
            { new: true }
        );

        if (!updated_product) {
            return response.status(404).json({ message: 'Product not found' });
        }

        return response.status(200).json({
            message: 'Model uploaded successfully',
            product: updated_product
        });
    } catch (error) {
        response.status(500).json({ message: 'Error uploading model', error: error.message });
    }
}

// Actualizar un producto parcial por ID
const update_product = async(request, response)=>{
    const { name, description, category, price, stock } = request.body

    // Crear un objeto de actualización solo con los campos presentes en la solicitud
    const update_fields = {}
    if(name) update_fields.name = name
    if(description) update_fields.description = description
    if(category) update_fields.category = category

    // Iniciar una sesión para manejar la transacción
    const session = await mongoose.startSession()
    session.startTransaction()

    try{
        const updated_product = await Product.findByIdAndUpdate(
            request.params.id,
            update_fields, 
            {new:true, session}
        )

        if(!updated_product){
            await session.abortTransaction()
            session.endSession()
            return response.status(404).json({
                message: 'Product not found'
            })
        }

        // Si se incluye el stock, actualizar la entrada de stock
        if(stock !== undefined){
            await Stock.findOneAndUpdate(
                {product:update_product._id},
                {quantity:stock},
                {new:true, session}
            )
        }

        // Si se incluye el precio, actualizar la entrada de precio
        if(price !== undefined){
            await Price.findOneAndUpdate(
                {product:update_product._id},
                {price:price},
                {new:true, session}
            )
        }

        await session.commitTransaction()
        session.endSession()

        return response.status(200).json({
            message:'Product updated successfully',
            product:updated_product
        })
    }catch(error){
        await session.abortTransaction()
        session.endSession()
        response.status(500).json({
            message: 'Error updating product',
            error: error.message
        })
    }
}

// Eliminar un producto por ID
const delete_product = async(request, response)=>{
    // Iniciar una sesión para manejar la transacción
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const deleted_product = await Product.findByIdAndDelete(request.params.id, {session})

        if(!deleted_product){
            await session.abortTransaction()
            session.endSession()
            return response.status(404).json({
                message:'Product not found'
            })
        }

        // Eliminar el stock asociado al producto
        await Stock.findOneAndDelete({ product:delete_product._id}, {session})

        // Eliminar el precio asociado al producto
        await Price.findOneAndDelete({product:delete_product._id}, {session})

        await session.commitTransaction()
        session.endSession()

        return response.status(200).json({
            message:'Product, stock, and price deleted successfully',
        })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        response.status(500).json({ 
            message: 'Server error',
            error: error.message
        })
    }
}

module.exports = { 
    get_product_by_id, 
    get_all_products,
    create_product,
    update_product,
    delete_product,
    upload_product_image,
    upload_product_model
}