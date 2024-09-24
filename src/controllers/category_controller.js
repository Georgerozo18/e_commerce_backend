const Category = require('../models/category_model')

const get_category_by_id = async (request, response)=>{
    try{
        const category = await Category.findById(request.params.id)
        if(!category) return response.status(404).json({message:'Category not found'})

        response.status(200).json(category)
    } catch(error){
        response.status(500).json({ message: 'Server error' })
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

    try{
        const new_category = new Category({name, description})
        await new_category.save()
        response.status(201).json(new_category)
    } catch(error){
        if(error.code === 11000){
            return response.status(400).json({
                message:'Category name must be unique'
            })
        }
        response.status(500).json({
            message:'Server error'
        })
    }
}

const update_category = async(request, response)=>{
    const { name, description } = request.body

    // Crear un objeto de actualización solo con los campos presentes en la solicitud
    const update_fields = {}
    if(name) update_fields.name = name
    if(description) update_fields.description = description

    // Verificar que al menos un campo se esté actualizando
    if(Object.keys(update_fields).length === 0){
        return response.status(400).json({
            message:'At least one field (name or description) must be provided'
        })
    }

    try{
        const updated_category = await Category.findByIdAndUpdate(
            request.params.id,
            update_fields, 
            {new:true, runValidators:true}
        )
        if(!updated_category){
            return response.status(404).json({
                message: 'Category not found'
            })
        }

        response.status(200).json(updated_category)
    }catch(error){
        response.status(500).json({
            message:'Server error'
        })
    }
}

const delete_category = async(request, response)=>{
    try {
        const deleted_category = await Category.findByIdAndDelete(request.params.id)

        if(!deleted_category){
            return response.status(404).json({
                message:'Category not found'
            })
        }

        response.status(200).json({
            message:'Category deleted successfully'
        })
    } catch (error) {
        response.status(500).json({ message: 'Server error' })
    }
}

module.exports = { 
    get_category_by_id, 
    get_all_categories,
    create_category,
    update_category,
    delete_category
}