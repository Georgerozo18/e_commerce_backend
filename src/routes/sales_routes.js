const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_all_sales,
    get_sale_by_id,
    create_sale,
    update_sale,
    delete_sale,
    get_sales_stats,
} = require('../controllers/sale_controller')
const check_admin = require('../middleware/check_admin')

const router = express.Router()

// Protected private routes
router.get('/', authenticate_token, check_admin, get_all_sales)
router.get('/stats', authenticate_token, check_admin, get_sales_stats)
router.get('/:id', authenticate_token, check_admin, get_sale_by_id)
router.post('/', authenticate_token, check_admin, create_sale)
router.patch('/:id', authenticate_token, check_admin, update_sale)
router.delete('/:id', authenticate_token, check_admin, delete_sale)

module.exports = router