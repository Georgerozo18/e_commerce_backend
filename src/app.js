const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const auth_routes = require('./routes/auth_routes')
const auth_admin_routes = require('./routes/auth_admin_routes')
const category_routes = require('./routes/categories_routes')
const user_routes = require('./routes/user_routes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())

app.use('/api/v1/auth', auth_routes)
app.use('/api/v1/auth_admin', auth_admin_routes)
app.use('/api/v1/categories', category_routes)
app.use('/api/v1/users', user_routes)

module.exports = app