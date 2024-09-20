const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_product_by_id,
    get_all_products,
    create_product,
    partial_update_product,
    full_update_product,
    delete_product,
} = require('../controllers/product_controller')

const router = express.Router()

// Protected private routes
router.get('/', get_all_products)
router.get('/:id', get_product_by_id)
router.post('/create', authenticate_token, create_product)
router.put('/full_update/:id', authenticate_token, full_update_product)
router.patch('/partial_update/:id', authenticate_token, partial_update_product)
router.delete('/delete/:id', authenticate_token, delete_product)

module.exports = router