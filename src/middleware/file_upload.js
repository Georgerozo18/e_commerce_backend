// file_upload.js
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadsDir = path.join(__dirname, '../../uploads')


if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configuración de multer para guardar archivos en una carpeta 'uploads'
const storage = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, uploadsDir)
    },
    filename: function(request, file, callback) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname)
        callback(null, uniqueSuffix)
    }
})

// Filtrar archivos para aceptar solo imágenes y modelos GLB
const fileFilter = (request, file, callback) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'model/gltf-binary',
        'application/octet-stream', 
        'application/gltf-binary' 
    ]
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true)
    } else {
        console.log('File type not allowed:', file.mimetype) 
        callback(new Error('File type not allowed'), false)
    }
}

const upload = multer({ storage, fileFilter })

// Exportar el middleware
module.exports = upload