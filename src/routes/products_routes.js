// products_routes.js
const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_product_by_id,
    get_all_products,
    create_product,
    update_product,
    delete_product,
    upload_product_image,
    upload_product_model
} = require('../controllers/product_controller')
const check_admin = require('../middleware/check_admin')
const upload = require('../middleware/file_upload')

const router = express.Router()

// Protected private routes
router.get('/', get_all_products)
router.get('/:id', get_product_by_id)
router.post('/', authenticate_token, check_admin, create_product)
router.post('/:id/upload_image', authenticate_token, check_admin, upload.single('file'), upload_product_image)
router.post('/:id/upload_model', authenticate_token, check_admin, upload.single('file'), upload_product_model)
router.patch('/:id', authenticate_token, check_admin, update_product)
router.delete('/:id', authenticate_token, check_admin, delete_product)

module.exports = router