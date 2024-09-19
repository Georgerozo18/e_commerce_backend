const express = require('express')
const {login_controller, signup_controller} = require('../controllers/auth_controller')
const router = express.Router()

router.post('/login', login_controller)
router.post('/sign_up', signup_controller)

module.exports = router