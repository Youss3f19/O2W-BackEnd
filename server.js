const express = require('express');
const userApi = require('./routes/users');
const rarityApi = require('./routes/rarity')
const categoryApi = require('./routes/category');
const boxApi = require('./routes/boxes');
const productApi = require('./routes/products');
const giftCardApi = require('./routes/giftCard');
const commandApi = require('./routes/command');
const commentApi = require('./routes/comment');



const cors = require('cors')
require('./config/connect');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());


//les api app
app.use('/user' , userApi);
app.use('/box' , boxApi);
app.use('/rarity' , rarityApi);
app.use('/category' , categoryApi);
app.use('/product' , productApi);
app.use('/command', commandApi);
app.use('/giftCard', giftCardApi);
app.use('/comment', commentApi);

app.use('/uploads', express.static('uploads'));





app.listen( 3000 , ()=>{console.log('server work !');
})