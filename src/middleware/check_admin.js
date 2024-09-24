const check_admin = (request, response, next) => {
    if (request.user.role !== 'admin') {
        return response.status(403).json({ message: 'Forbidden: Admins only' })
    }
    next()
}