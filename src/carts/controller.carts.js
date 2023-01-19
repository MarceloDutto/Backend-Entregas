import { Router } from 'express';
import fs, { existsSync, promises, writeFile } from 'fs';

const router = Router();
const path = './carts/carts.json';
const productsPath = './products/products.json'
let allCarts = [];

router.get('/:cid', async (req, res) => {
    if(!existsSync(path)) return res.json({message: 'No existe la base de datos'});

    const data = await promises.readFile(path, 'utf-8');
    allCarts = JSON.parse(data);

    const { cid } = req.params;

    const selectedCart = allCarts.find(cart => cart.id === parseInt(cid));
    if(!selectedCart) return res.json({message: 'No existe el carrito'});
    const productsInCart = selectedCart.products;
    
    res.json({productsInCart});
})

router.post('/', async (req, res) => {
    !existsSync(path) ? allCarts = [] : allCarts = JSON.parse(await promises.readFile(path, 'utf-8'));

    const IdArray = allCarts.map(cart => cart.id);
    const maxId = Math.max(...IdArray);

    const cart = {
        id: maxId === -Infinity ? 1 : maxId + 1,
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
    !existsSync(path) ? allCarts = [] : allCarts = JSON.parse(await promises.readFile(path, 'utf-8'));

    const { cid, pid } = req.params;

    const cartIndex = allCarts.findIndex(cart => cart.id === parseInt(cid));
    if(cartIndex === -1) return res.json({message: 'No se encontro el carrito seleccionado'});

    if(!existsSync(productsPath)) return res.json({message: 'No se encontro la base de datos de productos'});

    const data = await promises.readFile(productsPath, 'utf-8');
    const products = JSON.parse(data);
    const selectedProduct = products.find(prod => prod.id === parseInt(pid));
    if(!selectedProduct) return res.json({message: 'No se encontro el producto seleccionado'});

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