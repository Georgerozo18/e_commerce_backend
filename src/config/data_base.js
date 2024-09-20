const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            serverSelectionTimeoutMS: 30000,
        })
        console.log('MongoDB connected')
    } catch(error){
        console.log('MongoDB connection error', error)
        process.exit(1)
    }
}

module.exports = connectDB