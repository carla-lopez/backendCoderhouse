const express = require ('express');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const app= express();
const PORT= 8080;

//Middleware para el manejo de datos en formato JSON

app.use(express.json());


class ProductManager{
    constructor(){
        this.products= [];
        this.carts= []; //array para almacenar carritos
        this.productFileName = 'productos.json';
        this.cartFileName= 'carrito.json';
        this.loadProductsFromFile();
        this.loadCartsFromFile();
    }

    addProduct(productData){
        const {title,description,price,thumbnail,code,stock} = productData;
        if(!this.isProductValid(productData)){ //verifico si el producto es valido
            console.log('Error: el producto es invalido');
            return;
        }

        if (this.isCodeDuplicate(code)) { //verifico si ya existe un producto en la lista con el mismo código
            console.log(`Error: El producto con el código ${code} ya existe`);
            return;
        }

        const newProduct = {
            id: this.generateProductId(),
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        this.products.push(newProduct);
        console.log(`Productos con id ${newProduct.id} adherido satisfactoriamente`);

        this.saveProductsToFile(); //guardar los productos en el archivo despues de agregar uno nuevo
    }

    getProducts() {
        this.loadProductsFromFile(); //cargar productos desde el archivo antes de devolverlos
        return this.products;
    }

    getProductsById(id){
        this.loadProductsFromFile(); //Cargar productos desde el archivo antes de buscar
        const product = this.products.find((p) => p.id === id);

        if(!product){
            console.log('Error: Producto no encontrado');
            return null;
        }

        return product;
    }
    
    updateProduct(id,updatedFields){
        this.loadProductsFromFile();//cargar productos desde el archivo antes de actualizar

        const productIndex= this.products.findIndex((p) => p.id === id);

        if(productIndex === -1){
            console.log('Error: producto no encontrado');
            return;
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            ...updatedFields,
            id,//Mantener el mismo ID original
        };

        this.saveProductsToFile(); //Guardar los productos actualizados en el archivo
        console.log(`Producto con id ${id} actualizado satisfactoriamente.`);
    }

    deleteProduct(id){
        this.loadProductsFromFile(); //Cargar productos desde el archivo antes de eliminar

        const productIndex = this.products.findIndex((p) => p.id === id);

        if(productIndex === -1){
            console.log('Error : producto no encontrado');
            return;
        }

        this.products.splice(productIndex,1);

        this.saveProductsToFile(); //guardar los productos actualizados (con el producto eliminado) en el archivo
        console.log(`Producto con id ${id} eliminado satisfactoriamente.`);
    }

    saveProductsToFile() {
        try {
            const data = JSON.stringify(this.products , null , 2);
            fs.writeFileSync(this.path + this.fileName, data); // usar this.path para guardar el archivo en la ruta especificada
            console.log('Productos guardados en el archivo satisfactoriamente');
        } catch(error){
            console.log('Error al guardar los productos en el archivo:',error.message);
        }
    }

    loadProductsFromFile() {
        try {
            const data = fs.readFileSync(this.path + this.fileName , 'utf-8');
            this.products = JSON.parse(data);
            console.log('Productos cargados desde el archivo satisfactoriamente');
        } catch(error) {
            if(error.code === 'ENOENT') {
                //si el archivo no existe, no hay productos guardados aun
                console.log('El archivo de productos no existe. Se creara un nuevo al guardar el primer producto ');
            }else {
                console.log('Error al cargar los productos desde el archivo:',error.message);
            }
        }
    }

    generateProductId() {
        let id= 1;

        if(this.products.length > 0) {
            const lastProduct = this.products[this.products.length - 1];
            id = lastProduct.id + 1 ;
        }

        return id;
    }

    isProductValid(product) {
        return (
            product.title &&
            product.description &&
            product.price &&
            product.thumbnail &&
            product.code &&
            product.stock !== undefined
        );
    }

    isCodeDuplicate(code){
        return this.products.some((p) => p.code === code);
    }

    //Metodos para el manejo de carritos

    //metodo para obtener un carrito por su id
    getCartById(id) {
        return this.carts.find((cart)=> cart.id === id);
    }

    //Metodo para guardar los carritos en el archivo
    saveCartsToFile(){
        try {
            const data= JSON.stringify(this.carts,null,2);
            fs.writeFileSync(this.cartFileName,data);
            console.log('Carritos guardados en el archivo satisfactoriamente');
        }catch(error){
            console.log('Error al guardar los carritos en el archivo',error.message);
        }
    }

    //Metodo para cargar los carritos desde el archivo
    loadCartsFromFile(){
        try {
            const data= fs.readFileSync(this.cartFileName, 'utf-8');
            this.carts = JSON.parse(data);
            console.log('Carritos cargados desde el archivo satisfactoriamente');
        }catch(error){
            if(error.code=== 'ENOENT') {
                //Si el archivo no existe,no hay carritos guardados aun
                console.log('El archivo de carritos no existe.Se creara uno nuevo al guardar el primer carrito');
            }else{
                console.log('Error al cargar los carritos desde el archivo',error.message)
            }
        }
    }

    //Metodo para crear un nuevo carrito
    createCart(){
        const newCart = {
            id: uuidv4(),
            products: [],
        };
        this.carts.push(newCart);
        this.saveCartsToFile();
        return newCart;
    }

    //Metodo para agregar un producto al carrito
    addToCart(cartId,productId,quantity) {
        const cart= this.getCartById(cartId);
        if(!cart){
            throw new Error('Carrito no encontrado');
        }

        const product = this.products.find((p) => p.id === productId);
        if(!product){
            throw new Error('Producto no encontrado')
        }

        const existingCartItem = cart.products.find((item) => item.product.id === productId);
        if(existingCartItem){
            existingCartItem.quantity += quantity;
        }else{
            cart.products.push({product,quantity});
        }

        this.saveCartsToFile();
        return cart;
    }



}

const productManager = new ProductManager();

//Rutas para /api/products

const productsRouter = express.Router();

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
//Ruta para crear un nuevo carrito
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
});


//Agregar el router de productos a la aplicacion


app.use('/api/products',productsRouter);

//agregar el router de carritos a la aplicacion


//Iniciar el servidor
app.listen(PORT,()=> {
    console.log('Servidor express escuchado en http://localhost:${PORT}');
});
