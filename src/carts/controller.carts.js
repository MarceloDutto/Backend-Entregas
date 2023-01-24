import { Router } from 'express';
import fs, { existsSync, promises, writeFile } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import __dirname from '../utils.js';

const router = Router();
const path = __dirname + '/carts/carts.json';
const productsPath = __dirname + '/products/products.json';
let allCarts = [];

router.get('/:cid', async (req, res) => {
    if(!existsSync(path)) return res.status(404).json({message: 'No se encontró la base de datos'});

    try {
        const data = await promises.readFile(path, 'utf-8');
        allCarts = JSON.parse(data);
    } catch {
        console.log(error);
        return res.status(404).json({message: 'Error al acceder a la base de datos'})
    }
    
    const { cid } = req.params;

    const selectedCart = allCarts.find(cart => cart.id === cid);
    if(!selectedCart) return res.status(404).json({message: 'No se encontró el carrito'});
    const productsInCart = selectedCart.products;
    
    res.json({productsInCart});
})

router.post('/', async (req, res) => {

    if(!existsSync(path)) {
        allCarts = []
    } else {
        try {
            const data = await promises.readFile(path, 'utf-8');
            allCarts = JSON.parse(data);
        } catch {
            console.log(error);
            return res.status(404).json({message: 'Error al acceder a la base de datos'})
        }
    }

    let id;
    let uniqueId = false;
    while (uniqueId === false) {
        id = uuidv4();
        uniqueId = allCarts.forEach(prod => prod.id === id) ? false : true;
    }

    const cart = {
        id,
        products: []
    }

    allCarts.push(cart);

    const cartStr = JSON.stringify(allCarts, null, 2);
    writeFile(path, cartStr, error => {
        if(error) throw error;
    });

    res.status(201).json({message: 'Carrito creado'});
})

router.post('/:cid/product/:pid', async (req, res) => {
    const products = [];

    if(!existsSync(path)) {
        allCarts = []
    } else {
        try {
            const data = await promises.readFile(path, 'utf-8');
            allCarts = JSON.parse(data);
        } catch {
            console.log(error);
            return res.status(404).json({message: 'Error al acceder a la base de datos'})
        }
    }

    const { cid, pid } = req.params;

    const cartIndex = allCarts.findIndex(cart => cart.id === cid);
    if(cartIndex === -1) return res.status(404).json({message: 'No se encontro el carrito seleccionado'});

    if(!existsSync(productsPath)) return res.status(404).json({message: 'No se encontro la base de datos de productos'});

    try {
        const data = await promises.readFile(productsPath, 'utf-8');
        products = JSON.parse(data);
    } catch {
        console.log(error);
        return res.status(404).json({message: 'No se pudo acceder a los productos'})
    }
    
    const selectedProduct = products.find(prod => prod.id === pid);
    if(!selectedProduct) return res.status(404).json({message: 'No se encontro el producto seleccionado'});

    const itemIndex = allCarts[cartIndex].products.findIndex(item => item.id === selectedProduct.id)

    if(itemIndex !== -1) {
        allCarts[cartIndex].products[itemIndex].quantity ++;
        res.json({message: 'Producto actualizado'})
    } else {
        const cartItem = {
            id: selectedProduct.id,
            quantity: 1
        }
        allCarts[cartIndex].products.push(cartItem);
        res.json({message: 'Producto agregado al carrito con exito'})
    }

    const cartStr = JSON.stringify(allCarts, null, 2);
    writeFile(path, cartStr, error => {
        if(error) throw error;
    })
})

export default router;