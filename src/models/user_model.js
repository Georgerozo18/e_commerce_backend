const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true
    }, 
    password:{
        type: String,
        required: true,
        trim: true
    }, 
    fullname:{
        type: String,
        required: true,
        trim: true
    }, 
    status:{
        type:Boolean,
        required:true,
        default:true
    }
})

module.exports = mongoose.model('User', UserSchema)
