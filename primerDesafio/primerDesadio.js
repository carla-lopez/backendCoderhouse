class ProductManager {
    constructor(){
        this.products = []
    }
    addProduct(product){ //agrega nuevo producto a la lista de productos
        if(!this.isProductValid(product)){ //verifico si el producto es valido
            console.log('Error: El producto es invalido');
            return;
        }

        if(this.isCodeDuplicate(product.code)){ //veridico si ya existe un producto en la lista con el mismo codigo
            console.log(`Error: El producto con el codigo ${product.code} ya existe`);
            return;
        }

        const newProduct = {
            id: this.generateProductId(),
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail:product.thumbnail,
            code: product.code,
            stock: product.stock
        };

        this.products.push(newProduct);
        console.log(`Productos con id ${newProduct.id} adherido satisfactoriamente`)
    }

    getProducts(){
        return this.products;
    }

    //busco un producto en la lista de productos basandome en su ID.
    getProductsById(id) {
        const product = this.products.find((p) => p.id === id); //uso find para encontrar el primer producto cuyo id coincida con el id buscado

        if(!product) {
            console.log('Error : producto no encontrado');
            return;
        }

        return product;
    }

    isProductValid(product){ // verifico si los datos de un producto son validos antes de agregarlo a la lista de productos
        return(
            product.title &&
            product.description &&
            product.price &&
            product.thumbnail &&
            product.code &&
            product.stock !== undefined
        );
    }

    //verifico si ya existe el producto con el mismo codigo en la lista de productos

    isCodeDuplicate(code){
        return this.products.some((p) => p.code === code);
    }

    //uso generateProductId para , desde la clase ProductManager, generar un nuevo identificador unico para cada producto agregado.

    generateProductId(){
        let id= 1;

        if(this.products.length > 0){
            //si ya existen productos en la lista, obtenemos el ultimo producto
            const lastProduct = this.products[this.products.length - 1];
            //incrementamos el id en 1 a partir del id del ultimo producto
            id= lastProduct.id + 1;
        }

        return id;// devolvemos el id generado
    }


    
}


//ejemplo de uso:

const productManager = new ProductManager();

//agregar productos

productManager.addProduct({
    title:'Producto 1',
    description: ' descripcion producto 1',
    price: 10.00,
    thumbnail: "ruta imagen",
    code:'D1',
    stock: 100
});

productManager.addProduct({
    title:'Producto 2',
    description:'Descripcion producto 2',
    price: 20.00,
    thumbnail:'ruta imagen 2',
    code: 'D2',
    stock: 50
});

//obtener todos los productos

const allProducts = productManager.getProducts();
console.log('Todos los productos', allProducts);

//obtener productos por ID

const productId = 2;
const productById = productManager.getProductsById(productId);
console.log(`Producto con ID ${productId}:`,productById);

