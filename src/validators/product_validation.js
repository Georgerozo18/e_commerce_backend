const validateProducts = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error('Products must be a non-empty array')
    }

    return products.map((item) => {
        if (!item.product || !item.quantity) {
            throw new Error('Each product must have a product ID and a quantity')
        }

        return {
            product: item.product,
            quantity: item.quantity,
        }
    })
}

module.exports = { validateProducts }