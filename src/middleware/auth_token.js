const jwt = require('jsonwebtoken')
const refresh_token_controller = require('./refresh_token')

const authenticate_token = async(request, response, next)=>{
    // Obtener el token desde las cookies
    const token = request.cookies['accessToken']
    // console.log('Token:', token)

     // Verificar si el token existe
    if(!token){
        return response.status(401).json({
            message:'Access token missing or invalid'
        })
    } 

    try {
        // Verificar el token con jwt
        const user = await jwt.verify(token, process.env.JWT_SECRET)
        request.user = user
        next()

    } catch(error){
        if(error.name === 'TokenExpiredError'){
            try{
                // Intentar renovar el token
                const new_access_token = await refresh_token_controller(request, response)

                // Verificar el nuevo access token
                const user = await jwt.verify(new_access_token, process.env.JWT_SECRET)
                request.user = user
                next()
                
            } catch(refresh_error){
                return response.status(refresh_error.status || 500).json({ message: refresh_error.message })
            }
        } else {
            return response.status(401).json({ message: 'Invalid token' })
        }
    }
}

module.exports = authenticate_token