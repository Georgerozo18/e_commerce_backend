const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { get_category_by_id } = require('../controllers/categories_controller')

const router = express.Router()

// Protected private routes
router.get('/:id', authenticate_token, get_category_by_id)

module.exports = router