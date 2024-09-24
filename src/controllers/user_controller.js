const bcrypt = require('bcrypt')
const User = require('../models/user_model')

const get_user_by_id = async (request, response)=>{
    try{
        const user = await User.findById(request.params.id)
        if(!user) return response.status(404).json({message:'user not found'})

        response.status(200).json(user)
    } catch(error){
        response.status(500).json({ message: 'Server error' })
    }
}

const get_all_users = async (request, response)=>{
    try{
        const users = await User.find()

        response.status(200).json(users)
    } catch(error){
        response.status(500).json({message: 'Server error'})
    }
}

const create_user = async (request, response)=>{
    const { username, password, fullname, status, role } = request.body

    // Validar que los campos requeridos estén presentes
    if(!username || !password || !fullname || !status || !role){
        return response.status(400).json({
            messsage: 'username, password, fullname, status, and role are required'
        })
    }

    try{
        const hashed_password = await bcrypt.hash(password, 10)
        const new_user = new User({
            username, 
            password:hashed_password, 
            fullname, 
            status, 
            role
        })
        await new_user.save()
        response.status(201).json(new_user)
    } catch(error){
        if(error.code === 11000){
            return response.status(400).json({
                message:'username must be unique'
            })
        }
        response.status(500).json({
            message:'Server error'
        })
    }
}

const update_user = async(request, response)=>{
    const { username, password, fullname, status, role } = request.body

    // Crear un objeto de actualización solo con los campos presentes en la solicitud
    const update_fields = {}
    if(username) update_fields.username = username
    if(password) update_fields.password = await bcrypt.hash(password, 10)
    if(fullname) update_fields.fullname = fullname
    if(status) update_fields.status = status
    if(role) update_fields.role = role

    // Verificar que al menos un campo se esté actualizando
    if(Object.keys(update_fields).length === 0){
        return response.status(400).json({
            message:'At least one field must be provided'
        })
    }

    try{
        const updated_user = await User.findByIdAndUpdate(
            request.params.id,
            update_fields, 
            {new:true, runValidators:true}
        )
        if(!updated_user){
            return response.status(404).json({
                message: 'User not found'
            })
        }

        response.status(200).json(updated_user)
    }catch(error){
        response.status(500).json({
            message:'Server error'
        })
    }
}

const delete_user = async(request, response)=>{
    try {
        const deleted_user = await User.findByIdAndDelete(request.params.id)

        if(!deleted_user){
            return response.status(404).json({
                message:'User not found'
            })
        }

        response.status(200).json({
            message:'User deleted successfully'
        })
    } catch (error) {
        response.status(500).json({ message: 'Server error' })
    }
}

module.exports = { 
    get_user_by_id, 
    get_all_users,
    create_user,
    update_user,
    delete_user
}