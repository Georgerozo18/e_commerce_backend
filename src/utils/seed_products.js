const Product = require('../models/product_model')
const Category = require('../models/category_model')

const seed_products  = async ()=>{
    try{
        // Obtener todas las categorías
        const categories = await Category.find()

        if (categories.length === 0) {
            console.log('No categories found, skipping product creation')
            return
        }

        const products = [
            {
                name: 'Car 1/18 Model',
                price: 49.99,
                description: 'A detailed 1/18 scale model car.',
                category: categories[0]._id,
                stock: 100, 
            },
            {
                name: 'Car 1/64 Model',
                price: 9.99,
                description: 'A small 1/64 scale model car.',
                category: categories[1]._id,
                stock: 200, 
            },
            {
                name: 'Motorbike 1/43 Model',
                price: 34.99,
                description: 'A collectible motorcycle model.',
                category: categories[2]._id,
                stock: 150,
            }
        ]

        const existing_products = await Product.find({
            name:{$in: products.map(product=>product.name)}
        })

        if (existing_products.length > 0) {
            console.log('Products already exist, skipping creation')
            return
        }

        await Product.insertMany(products)
        console.log('Products created successfully')
    } catch(error){
        console.log('Error creating products:', error)
    } 
}

module.exports = seed_products
