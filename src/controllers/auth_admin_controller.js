const User = require('../models/user_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const admin_login_controller = async(request, response)=>{
    try{
        const {username, password} = request.body

        if(!username || !password){
            return response.status(400).json({message:'Username and password are required'})
        }

        const admin = await User.findOne({
            username, 
            status:true, 
            role:'admin'
        })

        if(!admin){
            return response.status(400).json({message:'Incorrect username or password'})
        }

        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch){
            return response.status(400).json({message:'Incorrect username or password'})
        }

        const token = jwt.sign({
            id: admin._id,
            username: admin.username,
            fullname: admin.fullname,
            role:admin.role
        }, process.env.JWT_SECRET,{
            expiresIn:'1h'
        })

        response.cookie('accessToken', token,{
            httpOnly:true,
            sameSite:'strict',
            secure:process.env.NODE_ENV === 'production'
        }).json({message:'Admin login successful'})

    } catch(error){
        console.error(error)
        response.status(500).json({message:'Server error'})
    }
}

module.exports = { admin_login_controller }