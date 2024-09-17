const Category = require('../models/category_model')

const seed_categories = async ()=>{
    try{
        const count = await Category.countDocuments()

        if(count===0){
            const categoies = [
                {
                    name:'Scale 1/18 Cars',
                    description:'collection cars approximately 28 cm wide, opening doors and movement on the steering wheel',
                },
                {
                    name:'Scale 1/64 Cars',
                    description:'collection cars approximately 7cm wide, like hotweels style',
                },
                {
                    name:'Scale 1/43 Motorbikes',
                    description:'Collectible motorcycles approximately 10 cm wide, some moving parts.',
                }
            ]

            await Category.insertMany(categoies)
            console.log('Basic categories created')
        } else {
            console.log('Categories already exist, skipping creation')
        }
    } catch(error){
        console.log('Error creating categories:', error)
    } 
}

module.exports = seed_categories
