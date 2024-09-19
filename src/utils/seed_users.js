const bcrypt = require('bcrypt')
const User = require('../models/user_model')

const seed_users = async () => {
    try {
    const count = await User.countDocuments()

    if (!count) {
        const hashAdmin = await bcrypt.hash('Admin_G30RG3', 10)
        const hashStandard = await bcrypt.hash('Standar_G30RG3', 10)

        const users = [
            {
                username: 'admin',
                password: hashAdmin,
                fullname: 'Administrador',
                status: true,
                role:'admin'
            },
            {
                username: 'std',
                password: hashStandard,
                fullname: 'Usuario estándar',
                status: true,
                role:'user'
            },
        ]

    await User.insertMany(users)
    console.log('Default users created')
    } else {
        console.log('Users already exist, skipping creation')
    }
    } catch (error) {
        console.error('Error seeding users:', error)
    }
}

module.exports = seed_users