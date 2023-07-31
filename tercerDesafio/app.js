const express = require('express');
const fs = require('fs');
const ProductManager = require('./tercerDesafio');

const app = express();
const productManager = new ProductManager();

//Endpoint para obtener todos los productos o numero limitado de productos

app.get('/products' , async(req, res) => {
    try{
        const limit = parseInt(req.query.limit);// Obtener el parametro de limite desde el query string
        const products = await productManager.getProducts();

        if(!isNaN(limit)){
            //Si se proporciona un limite valido, devolver solo los primeros "limit" productos
            res.json(products.slice(0,limit));
        }else{
            //Si no se proporciona el limite o es invalido, devolver todos los productos
            res.json(products);
        }
    }catch(error){
        res.status(500).json({error : 'Error al obtener los productos'});
    }
});

//Endpoint para obtener un producto por su ID
app.get('/products/:pid' , async(req,res)=> {
    try {
        const productId = parseInt(req.params.pid);
        const product = await productManager.getProductById(productId);

        if(!product){
            res.status(404).json({error: 'Producto no encontrado'});
        }else{
            res.json(product);
        }
    }catch(error){
        res.status(500).json({error: 'Error al obtener el producto'});
    }
});

const PORT = 3000;
app.listen(PORT,()=>{
    console.log('Servidor express escuchado en http://localhost:${PORT}');
});