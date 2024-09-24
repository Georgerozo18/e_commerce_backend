const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_category_by_id, 
    get_all_categories, 
    create_category ,
    update_category,
    delete_category
} = require('../controllers/category_controller')
const check_admin = require('../middleware/check_admin')

const router = express.Router()

// Protected private routes
router.get('/', get_all_categories)
router.get('/:id', authenticate_token, get_category_by_id)
router.post('/', authenticate_token, check_admin, create_category)
router.patch('/:id', authenticate_token, check_admin, update_category)
router.delete('/:id', authenticate_token, check_admin, delete_category)

module.exports = router