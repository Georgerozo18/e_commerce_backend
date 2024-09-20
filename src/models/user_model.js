const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        unique: true
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
    }, 
    role:{
        type:String,
        enum:['admin', 'user'],
        default:'user'
    }
}, {timestamps:true})

module.exports = mongoose.model('User', UserSchema)
