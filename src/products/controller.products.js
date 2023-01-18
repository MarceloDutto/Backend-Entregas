import { Router } from 'express';
import fs, { existsSync, promises, writeFile } from 'fs';

const router = Router();
const path = './products/products.json';
let allProducts = [];


router.get('/', async (req, res) => {
    if(!existsSync(path)) return res.json({message: 'No existe la base de datos'});

    const data = await promises.readFile(path, 'utf-8');
    allProducts = JSON.parse(data);

    const { limit } = req.query;
    if(!limit) return res.json(allProducts);
    const limitedProducts = allProducts.slice(0, limit);
    res.json(limitedProducts);
});

router.get('/:pid', async (req, res) => {
    if(!existsSync(path)) return res.json({message: 'No existe la base de datos'});

    const data = await promises.readFile(path, 'utf-8');
    allProducts = JSON.parse(data);

    const { pid } = req.params;
    const productById = allProducts.find(prod => prod.id === parseInt(pid));
    if(!productById) return res.json({error: "Producto no encontrado"});
    res.json(productById);
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status=true, stock, category, thumbnails } = req.body;
    if(!title || !description || !code || !price || !status || !stock || !category) return res.json({message: 'Ingrese los campos obligatorios'});

    !existsSync(path) ? allProducts = [] : allProducts = JSON.parse(await promises.readFile(path, 'utf-8'));
    
    if(allProducts.find(prod => prod.code === code)) return res.json({message: 'El producto ya se encuentra ingresado'});

    const IdArray = allProducts.map(prod => prod.id);
    const maxId = Math.max(...IdArray);

    const product = {
        id: maxId === -Infinity ? 1 : maxId + 1,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    }

    allProducts.push(product);
    const productStr = JSON.stringify(allProducts, null, 2);
    writeFile(path, productStr, error => {
        if(error) throw error;
    });

    res.status(201).json({message: 'El producto fue creado exitosamente'}); 
});

router.put('/:pid', async (req, res) => {
    if(!existsSync(path)) return res.json({message: 'No existe la base de datos'});

    const data = await promises.readFile(path, 'utf-8');
    allProducts = JSON.parse(data);

    const { pid } = req.params;

    const selectedProduct = allProducts.find(prod => prod.id === parseInt(pid));
    if(selectedProduct === undefined) return res.json({message: 'El producto no fue encontrado'});

    const { title, description, code, price, status, stock, category, thumbnails } = req.body; 

    const product = {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    }

    Object.keys(product).forEach(key => {
        if(product[key] && product[key] !== selectedProduct[key]) selectedProduct[key] = product[key];
    })

    const productStr = JSON.stringify(allProducts, null, 2);
        writeFile(path, productStr, error => {
            if(error) throw error;
        });

    res.json({message: 'Producto actualizado'});
});

router.delete('/:pid', async (req, res) => {
    if(!existsSync(path)) return res.json({message: 'No existe la base de datos'});

    const data = await promises.readFile(path, 'utf-8');
    allProducts = JSON.parse(data);

    const { pid } = req.params;
    const indexById = allProducts.findIndex(prod => prod.id === parseInt(pid));
    if(indexById === -1) return res.json({mesagge: 'No se encontró el producto'});
    allProducts.splice(indexById, 1);

    const productStr = JSON.stringify(allProducts, null, 2);
        writeFile(path, productStr, error => {
            if(error) throw error;
        });

    res.json({message: 'Producto eliminado'})
})

export default router;