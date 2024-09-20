const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_category_by_id, 
    get_all_categories, 
    create_category ,
    partial_update_category,
    full_update_category,
    delete_category
} = require('../controllers/categories_controller')

const router = express.Router()

// Protected private routes
router.get('/', get_all_categories)
router.get('/:id', authenticate_token, get_category_by_id)
router.post('/create', authenticate_token, create_category)
router.put('/full_update/:id', authenticate_token, full_update_category)
router.patch('/partial_update/:id', authenticate_token, partial_update_category)
router.delete('/delete/:id', authenticate_token, delete_category)

module.exports = router