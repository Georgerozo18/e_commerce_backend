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

module.exports = { get_category_by_id };