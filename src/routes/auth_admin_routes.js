const express = require('express')
const {admin_login_controller} = require('../controllers/auth_admin_controller')

const router = express.Router()

router.post('/login', admin_login_controller)

module.exports = router