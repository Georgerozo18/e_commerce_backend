const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_all_users,
    get_user_by_id,
    create_user,
    update_user,
    delete_user
} = require('../controllers/user_controller')

const router = express.Router()

// Protected private routes
router.get('/', authenticate_token, get_all_users)
router.get('/:id', authenticate_token, get_user_by_id)
router.post('/', authenticate_token, create_user)
router.patch('/:id', authenticate_token, update_user)
router.delete('/:id', authenticate_token, delete_user)

module.exports = router