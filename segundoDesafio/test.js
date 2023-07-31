const ProductManager = require('./segundoDesafio');
const filePath = './segundoDesafio.js';
const productManager = new ProductManager(filePath);

//Ejemplo de agregar un producto

const newProduct= {
    title: 'Producto de prueba',
    description: 'Descripcion del producto de prueba',
    price: 15.99,
    thumbnail: '/Randy.jpg',
    code: 'LORDE20',
    stock: 50,
};

productManager.addProduct(newProduct);

//ejemplo de obtener la lista de productos

const allProducts = productManager.getProducts();
console.log('Lista de productos:',allProducts);

//ejemplo de buscar un producto por ID

const productIdToFind = 1; //cambia el id por el que desees bucar
const foundProduct = productManager.getProductById(productIdToFind);
console.log('Producto encontrado',foundProduct);

//Ejemplo de actualizar un producto

const productIdToUpdate= 2; //Cambiar por el id por el que desees actualizar
const updatedFields = {
    title: 'Producto actualizado',
    price: 30.99,
};

productManager.updateProduct(productIdToUpdate, updatedFields);

//ejemplo de eliminar un producto

const productIdToDelete = 3;//cambiar el id por el que desees eliminar
productManager.deleteProduct(productIdToDelete);