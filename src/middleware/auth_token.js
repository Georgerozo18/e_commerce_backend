const jwt = require('jsonwebtoken')

const authenticate_token = (request, response, next)=>{
    const auth_header = request.headers['authorization']
    const token = auth_header && auth_header.split(' ')[1]
    
    if(token===null) return response.sendStatus(401)

    jwt.verify(token, process.env.JWT_SECRET, (error, user)=>{
        if(error) return response.sendStatus(403)
        request.user = user
        next()
    })
}

module.exports = authenticate_token