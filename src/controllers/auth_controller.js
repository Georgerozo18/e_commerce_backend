const User = require('../models/user_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login_controller = async (request, response) => {
    try {
        const { username, password } = request.body

        if (!username || !password) {
            return response.status(400).json({ message: 'Username and password are required' })
        }

        const user = await User.findOne({ username, status: true, role:'user' })

        if (!user) {
            return response.status(400).json({ message: 'Incorrect username or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return response.status(400).json({ message: 'Incorrect username or password' })
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })

        response.cookie('accessToken', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        }).json({ message: 'Successful login' })

    } catch (error) {
        console.error(error)
        response.status(500).json({ message: 'Server error' })
    }
}

const signup_controller = async (request, response) => {
    try {
        const { username, password, fullname } = request.body

        if (!username || !password || !fullname) {
            return response.status(400).json({ message: 'All fields are required' })
        }

        const user_exists = await User.findOne({ username })
        if (user_exists) {
            return response.status(400).json({ message: 'User already exists' })
        }

        const hash = await bcrypt.hash(password, 10)
        const new_user = new User({ 
            username, 
            password: hash, 
            fullname, 
            role:'user'
        })

        await new_user.save()
        response.status(200).json({ message: 'User created successfully' })

    } catch (error) {
        console.error(error)
        response.status(500).json({ message: 'Server error' })
    }
}

module.exports = { login_controller, signup_controller}