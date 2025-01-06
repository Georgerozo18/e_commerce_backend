const app = require('./src/app')
const connectDB = require('./src/config/data_base')

const port = process.env.PORT || 3001

const startServer = async () => {
    try {
        await connectDB()

        app.listen(port, () => {
            console.log(`Server running on port ${port}`)
        })
    } catch (error) {
        console.error('Error starting the server:', error)
    }
}

startServer()