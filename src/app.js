const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth_routes')
const categoryRoutes = require('./routes/categories_routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/categories', categoryRoutes)

module.exports = app