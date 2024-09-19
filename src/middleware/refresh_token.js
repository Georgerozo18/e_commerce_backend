const jwt = require('jsonwebtoken')

const refresh_token_controller = (request, response)=>{
    return new Promise((resolve, reject)=>{
        // Obtener el access token desde las cookies
        const refreshToken  = request.cookies['refreshToken']
        console.log('Received refresh token:', refreshToken)
        
        // Verificar si el token existe
        if(!refreshToken){
            return reject({
                status:401,
                message:'Refresh token missing'
            })
        } 

        // Verificar el token y su validez actual
        jwt.verify(refreshToken , process.env.JWT_SECRET, (error, user)=>{
            if(error){
                console.log('Error verifying refresh token:', error)
                return reject({
                    status:403,
                    message:'Invalid refresh token'
                })
            }

            // Generar un nuevo refreshToken si es necesario
            const new_refresh_token = jwt.sign({
                id:user.id,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            }, process.env.JWT_SECRET, { expiresIn: '2m' })

            // Generar un nuevo accessToken
            const new_access_token = jwt.sign({
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            }, process.env.JWT_SECRET, { expiresIn: '1m' })

            // Establecer los nuevos tokens en las cookies
            response.cookie('accessToken', new_access_token, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            })
            response.cookie('refreshToken', new_refresh_token, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            })

            console.log('New access token issued:', new_access_token)
            console.log('New refresh token issued:', new_refresh_token)
            
            resolve(new_access_token)
        })
    })   
}

module.exports = refresh_token_controller 