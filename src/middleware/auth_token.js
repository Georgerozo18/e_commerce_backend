const jwt = require('jsonwebtoken')
const refresh_token_controller = require('./refresh_token')

const authenticate_token = async (request, response, next) => {
    // Obtener el token desde las cookies
    const token = request.cookies['accessToken']
    console.log('Token recibido:', token)

    // Verificar si el token existe
    if (!token) {
        console.log('Token no encontrado o inválido')
        return response.status(401).json({
            message: 'Access token missing or invalid'
        })
    }

    try {
        // Verificar el token con jwt
        const user = await jwt.verify(token, process.env.JWT_SECRET)
        console.log('Token válido, usuario:', user)
        request.user = user
        next()

    } catch (error) {
        console.log('Error al verificar token:', error.message)
        if (error.name === 'TokenExpiredError') {
            try {
                console.log('Token expirado, intentando renovar...')
                const new_access_token = await refresh_token_controller(request, response)
                console.log('Nuevo token generado:', new_access_token)

                // Verificar el nuevo access token
                const user = await jwt.verify(new_access_token, process.env.JWT_SECRET)
                console.log('Nuevo token válido, usuario:', user)
                request.user = user
                next()

            } catch (refresh_error) {
                console.log('Error al renovar token:', refresh_error.message)
                return response.status(refresh_error.status || 500).json({ message: refresh_error.message })
            }
        } else {
            return response.status(401).json({ message: 'Invalid token' })
        }
    }
}

module.exports = authenticate_token