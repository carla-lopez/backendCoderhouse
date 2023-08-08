const express = require('express');
const ProductManager= require('./productManager');

const productsRouter = express.Router();
const productManager= new ProductManager();

//Ruta para obtener todos los productos(con soporte para ?limit)

productsRouter.get('/',async(req,res) => {
    try{
        const limit= parseInt(req.query.limit);
        const products = await productManager.getProducts();

        if(!isNaN(limit)){
            res.json(products.slice(0,limit));
        }else {
            res.json(products);
        }

    }catch(error){
        res.status(500).json({error:'Error al obtener los productos'});
    }
});

//Ruta para obtener un producto por su ID

productsRouter.get('/:pid',async(req,res)=>{
    try{
        const productId = parseInt(req.params.pid);
        const product= await productManager.getProductsById(productId);

        if(!product){
            res.status(404).json({error: 'Producto no encontrado'});
        }else{
            res.json(product);
        }
    }catch(error){
        res.status(500).json({error: 'Error al obtener el producto'});
    }
});

//Ruta para agregar un nuevo producto

productsRouter.post('/',async(req,res)=> {
    try {
        const{title,description,code,price,stock,category,thumbnail} = req.body;
        const newProduct = {
            id: uuidv4(),
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnail,
        };

        await productManager.addProduct(newProduct);
        res.json(newProduct);
    }catch(error){
        res.status(500).json({error: 'Error al agregar el producto'});
    }
});

//Ruta para actualizar un producto por su ID

productsRouter.put('/:pid',async(req,res)=>{
    try {
        const productId = parseInt(req.params.pid);
        const updatedFields= req.body;

        await productManager.updateProduct(productId,updatedFields);
        const updateProduct = await productManager.getProductsById(productId);

        if(!updateProduct){
            res.status(404).json({error: 'Producto no encontrado'});
        }else{
            res.json(updateProduct);
        }
    }catch(error){
        res.status(500).json({error:'Error al actualizar el producto'});
    }
});

//Ruta para eliminar un producto por su ID

productsRouter.delete('/:pid',async(req,res)=>{
    try{
        const productId= parseInt(req.params.pid);
        await productManager.deleteProduct(productId);
        res.json({message: 'Producto eliminado satisfactoriamente'});
    }catch(error){
        res.status(500).json({error:'Error al eliminar el producto'});
    }
});

//Rutas para el manejo de carritos
/*Ruta para crear un nuevo carrito
app.post('api/carts' , (req,res)=> {
    try {
        const newCart = productManager.createCart();
        res.json(newCart);
    }catch(error){
        res.status(500).json({error:'Error al crear el carrito'});
    }
});

//Ruta para obtener un carrito por su ID
app.get('/api/carts/:cid',(req,res)=>{
    try {
        const cartId = req.params.cid;
        const cart = productManager.getCartById(cartId);

        if(!cart){
            res.status(404).json({error: 'Carrito no encontrado'});
        }else{
            res.json(cart);
        }
    }catch(error){
        res.status(500).json({error: 'Error al obtener el carrito'});
    }
});

//Ruta para agregar un producto al carrito
app.post('/api/carts/:cid/product/:pid',(req,res)=>{
    try{
        const cartId = req.params.cid;
        const productId= parseInt(req.params.pid);
        const quantity = parseInt(req.body.quantity);

        const cart= productManager.addToCart(cartId,productId,quantity);
        res.json(cart);
    }catch(error){
        res.status(500).json({error: error.message})
    }
});*/

module.exports = productsRouter;

const socketIO= require('socket.io');

const io = socketIO(server);

io.on('connection',(socket)=>{
    console.log('Un cliente se ha conectado');

    //Emite la lista de productos a los clientes cuando se conecten
    socket.emit('updateProducts',productManager.getProducts());

    //Maneja el evento cuando se crea o elimina un producto
    productManager.on('productUpdated',()=> {
        io.emit('updateProducts',productManager.getProducts());
    });
});