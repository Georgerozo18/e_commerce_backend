const app = require('./app')
const connectDB = require('./config/data_base')
const seedUsers = require('./utils/seed_users')
const seedCategories = require('./utils/seed_categories')

const port = process.env.PORT || 3001

connectDB()

app.listen(port, async () => {
    console.log(`Server running on port ${port}`)

    await seedUsers()
    await seedCategories()
})