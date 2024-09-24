const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const check_admin = require('../middleware/check_admin')
const { 
    get_all_users,
    get_user_by_id,
    create_user,
    update_user,
    delete_user
} = require('../controllers/user_controller')


const router = express.Router()

// Protected private routes
router.get('/', authenticate_token, check_admin, get_all_users)
router.get('/:id', authenticate_token, check_admin, get_user_by_id)
router.post('/', authenticate_token, check_admin, create_user)
router.patch('/:id', authenticate_token, check_admin, update_user)
router.delete('/:id', authenticate_token, check_admin, delete_user)

module.exports = router