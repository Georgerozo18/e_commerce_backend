const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const path = require('path')

const auth_routes = require('./routes/auth_routes')
const auth_admin_routes = require('./routes/auth_admin_routes')
const category_routes = require('./routes/categories_routes')
const user_routes = require('./routes/users_routes')
const product_routes = require('./routes/products_routes')
const sale_routes = require('./routes/sales_routes')
const checkout_routes = require('./routes/checkout_routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin:process.env.FRONTEND_ORIGIN,
    credentials: true // Permitir el envío de cookies o credenciales
}))

const uploadsDir = path.join(__dirname, '../uploads')
console.log("Uploads Directory:", uploadsDir)
app.use('/uploads', express.static(uploadsDir))

app.use('/api/v1/auth', auth_routes)
app.use('/api/v1/auth_admin', auth_admin_routes)
app.use('/api/v1/categories', category_routes)
app.use('/api/v1/products', product_routes)
app.use('/api/v1/users', user_routes)
app.use('/api/v1/sales', sale_routes)
app.use('/api/v1/checkout', checkout_routes)

module.exports = app