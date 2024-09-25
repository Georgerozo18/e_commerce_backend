const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { create_checkout } = require('../controllers/checkout_controller')

const router = express.Router()

// Protected private routes
router.post('/', authenticate_token, create_checkout)

module.exports = router