const Product = require('../models/product_model')

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
        const products = await Product.find().populate('category')
        response.status(200).json(products)
    } catch(error){
        response.status(500).json({message: 'Server error'})
    }
}

// Crear un nuevo producto
const create_product = async (request, response)=>{
    const { name, price, description, category, stock } = request.body

     // Verificar si el usuario es un administrador
    if(request.user.role !== 'admin'){
        return response.status(403).json({
            message:'Forbidden: You do not have permission to make this action'
        })
    }

    if (typeof stock !== 'number') {
        return response.status(400).json({
            message: 'Stock must be a number'
        })
    }

    // Validar que los campos requeridos estén presentes
    if(!name || !price || !description || !category || !stock){
        return response.status(400).json({
            message: 'All fields are required'
        })
    }

    try{
        const new_product = new Product({
            name, 
            price,
            description, 
            category, 
            stock
        })
        await new_product.save()
        response.status(201).json(new_product)
    } catch(error){
        response.status(500).json({
            message: 'Server error',
            error: error.message
        })
    }
}

// Actualizar un producto completo por ID
const full_update_product = async(request, response)=>{
    const { name, price, description, category, stock  } = request.body

    // Verificar si el usuario es un administrador
    if(request.user.role !== 'admin'){
        return response.status(403).json({
            message:'Forbidden: You do not have permission to make this action'
        })
    }

    if (typeof stock !== 'number') {
        return response.status(400).json({
            message: 'Stock must be a number'
        })
    }

    // Validar que los campos requeridos estén presentes
    if (!name || !price || !description || !category || !stock ) {
        return response.status(400).json({
            message: 'All fields are required'
        })
    }

    try{
        const updated_product = await Product.findByIdAndUpdate(
            request.params.id,
            { name, price, description, category },
            {new:true, runValidators:true}
        )
        if(!updated_product){
            return response.status(404).json({
                message: 'Product not found'
            })
        }

        response.status(200).json(updated_product)
    }catch(error){
        response.status(500).json({
            message:'Server error',
        })
    }
}

// Actualizar un producto parcial por ID
const partial_update_product = async(request, response)=>{
    const { name, price, description, category, stock } = request.body

    // Verificar si el usuario es un administrador
    if (request.user.role !== 'admin') {
        return response.status(403).json({
            message: 'Forbidden: You do not have permission to make this action'
        })
    }

    // Crear un objeto de actualización solo con los campos presentes en la solicitud
    const update_fields = {}
    if(name) update_fields.name = name
    if(price) update_fields.price = price
    if(description) update_fields.description = description
    if(category) update_fields.category = category
    if (stock) update_fields.stock = stock

    // Verificar que al menos un campo se esté actualizando
    if(Object.keys(update_fields).length === 0){
        return response.status(400).json({
            message:'At least one field must be provided'
        })
    }

    try{
        const updated_product = await Product.findByIdAndUpdate(
            request.params.id,
            update_fields, 
            {new:true, runValidators:true}
        )
        if(!updated_product){
            return response.status(404).json({
                message: 'Product not found'
            })
        }

        response.status(200).json(updated_product)
    }catch(error){
        response.status(500).json({
            message:'Server error'
        })
    }
}
// Eliminar un producto por ID
const delete_product = async(request, response)=>{
    // Verificar si el usuario es un administrador
    if (request.user.role !== 'admin') {
        return response.status(403).json({
            message: 'Forbidden: You do not have permission to make this action'
        })
    }

    try {
        const deleted_product = await Product.findByIdAndDelete(request.params.id)

        if(!deleted_product){
            return response.status(404).json({
                message:'Product not found'
            })
        }

        response.status(200).json({
            message:'Product deleted successfully',
            product: deleted_product
        })
    } catch (error) {
        response.status(500).json({ message: 'Server error' })
    }
}

module.exports = { 
    get_product_by_id, 
    get_all_products,
    create_product,
    full_update_product,
    partial_update_product,
    delete_product
}