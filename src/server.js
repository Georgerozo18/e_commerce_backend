const app = require('./app')
const connectDB = require('./config/data_base')
const seedUsers = require('./utils/seed_users')
const seedCategories = require('./utils/seed_categories')
const seedProducts = require('./utils/seed_products')

const port = process.env.PORT || 3001

const startServer = async () => {
    try {
        await connectDB()
        
        await seedUsers()
        await seedCategories()
        await seedProducts()

        app.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    } catch (error) {
        console.error('Error starting the server:', error)
    }
}

startServer()