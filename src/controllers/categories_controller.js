const Category = require('../models/category_model')

const get_category_by_id = async (request, response)=>{
    try{
        const category = await Category.findById(request.params.id)
        if(!category) return response.status(404).json({message:'Category not found'})

        response.status(200).json(category)
    } catch(error){
        response.status(500).json({ message: 'Server error' });
    }
}

const get_all_categories = async (request, response)=>{
    try{
        const categories = await Category.find()

        response.status(200).json(categories)
    } catch(error){
        response.status(500).json({message: 'Server error'})
    }
}

const create_category = async (request, response)=>{
    const { name, description } = request.body

    // Validar que los campos requeridos estén presentes
    if(!name || !description){
        return response.status(400).json({
            messsage: 'Name and description are required'
        })
    }
    
     // Verificar si el usuario es un administrador
    if(request.user.role !== 'admin'){
        return response.status(403).json({
            message:'Forbidden: You do not have permission to create categories'
        })
    }

    try{
        const new_category = new Category({name, description})
        await new_category.save()
        response.status(201).json(new_category)
    } catch(error){
        if(error.code = 11000){
            return response.status(400).json({
                message:'Category name must be unique'
            })
        }
        response.status(500).json({
            message:'Server error'
        })
    }
}

module.exports = { 
    get_category_by_id, 
    get_all_categories,
    create_category
}