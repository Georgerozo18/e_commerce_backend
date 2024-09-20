const express = require('express')
const authenticate_token = require('../middleware/auth_token')
const { 
    get_all_users,
    get_user_by_id,
    create_user,
    full_update_user,
    partial_update_user,
    delete_user
} = require('../controllers/user_controller')

const router = express.Router()

// Protected private routes
router.get('/', authenticate_token, get_all_users)
router.get('/:id', authenticate_token, get_user_by_id)
router.post('/create', authenticate_token, create_user)
router.put('/full_update/:id', authenticate_token, full_update_user)
router.patch('/partial_update/:id', authenticate_token, partial_update_user)
router.delete('/delete/:id', authenticate_token, delete_user)

module.exports = router