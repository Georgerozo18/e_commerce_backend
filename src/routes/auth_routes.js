const express = require('express')
const {
    login_controller, 
    signup_controller,
    validate_session_controller,
    logout_controller
} = require('../controllers/auth_controller')
const router = express.Router()

router.get('/validate', validate_session_controller)
router.post('/login', login_controller)
router.get('/logout', logout_controller)
router.post('/sign_up', signup_controller)

module.exports = router