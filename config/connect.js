const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://yousseflaribi2004:linayoussef@o2w.4sf2v.mongodb.net/?retryWrites=true&w=majority&appName=O2W/O2W")
    .then( 
        ()=>{console.log('Connected to MongoDB Atlas');}
    )
    .catch( (err) => console.error('Could not connect to MongoDB Atlas', err));




module.exports = mongoose;