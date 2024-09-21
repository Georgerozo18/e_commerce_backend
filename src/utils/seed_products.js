const mongoose = require('mongoose')
const Product = require('../models/product_model')
const Category = require('../models/category_model')
const Price = require('../models/price_model')
const Stock = require('../models/stock_model')

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

        // Iniciar una sesión para manejar la transacción
        const session = await mongoose.startSession()
        session.startTransaction()
        
        try{
            // Crear productos y guardar el resultado
            const created_products = await Product.insertMany(products, {session})

            // Para cada producto, crear su precio y stock
            for(let i = 0; i < created_products.length; i++){
                const product = created_products[i]

                // Crear la entrada de precio para el producto
                const new_price = new Price({
                    product:product._id,
                    price:products[i].price
                })
                await new_price.save({session})

                // Crear la entrada de stock para el producto
                const new_stock = new Stock({
                    product:product._id,
                    quantity:products[i].stock
                })
                await new_stock.save({session})
            }

            // Confirmar la transacción
            await session.commitTransaction()
            console.log('Products, prices, and stock created successfully')
        } catch (error){
            await session.abortTransaction()
            console.log('Error creating products, prices, and stock:', error)
        } finally {
            session.endSession()
        }
    } catch(error){
        console.log('Error creating products:', error)
    } 
}

module.exports = seed_products
