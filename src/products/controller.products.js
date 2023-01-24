import { Router } from 'express';
import fs, { existsSync, promises, writeFile } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import __dirname, { uploader } from '../utils.js';

const router = Router();
const path = __dirname + '/products/products.json';
let allProducts = [];

router.get('/', async (req, res) => {
    if(!existsSync(path)) return res.status(404).json({message: 'No existe la base de datos'});

    try {
        const data = await promises.readFile(path, 'utf-8');
        allProducts = JSON.parse(data);
    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Error al acceder a la base de datos'})
    }
    
    const { limit } = req.query;
    if(!limit) return res.json(allProducts);
    const limitedProducts = allProducts.slice(0, limit);
    res.json(limitedProducts);
});

router.get('/:pid', async (req, res) => {
    if(!existsSync(path)) return res.status(404).json({message: 'No existe la base de datos'});

    try {
        const data = await promises.readFile(path, 'utf-8');
        allProducts = JSON.parse(data);
    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Error al acceder a la base de datos'})
    }

    const { pid } = req.params;
    const productById = allProducts.find(prod => prod.id === pid);
    if(!productById) return res.status(404).json({error: "Producto no encontrado"});
    res.json(productById);
});

router.post('/', uploader.single('file'), async (req, res) => {
    const { title, description, code, price, status=true, stock, category, thumbnails=[] } = req.body;
    if(!title || !description || !code || !price || typeof(status) !== 'boolean' || !stock || !category) return res.status(400).json({message: 'Error en el ingreso de los campos'});

    if(!existsSync(path)) {
        allProducts = []
    } else {
        try {
            const data = await promises.readFile(path, 'utf-8');
            allProducts = JSON.parse(data);
        } catch (error) {
            console.log(error);
            return res.status(404).json({message: 'Error al acceder a la base de datos'})
        }
    }
    
    if(allProducts.find(prod => prod.code === code)) return res.status(400).json({message: 'El producto ya se encuentra ingresado'});
    
    let id;
    let uniqueId = false;
    while (uniqueId === false) {
        id = uuidv4();
        uniqueId = allProducts.forEach(prod => prod.id === id) ? false : true;
    }

    const imgPath = req.file?.path;
    thumbnails.push(imgPath);

    const product = {
        id,
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

router.patch('/:pid', async (req, res) => {
    if(!existsSync(path)) return res.status(404).json({message: 'No existe la base de datos'});

    try {
        const data = await promises.readFile(path, 'utf-8');
        allProducts = JSON.parse(data);
    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Error al acceder a la base de datos'})
    }

    const { pid } = req.params;

    const selectedProduct = allProducts.find(prod => prod.id === pid);
    if(selectedProduct === undefined) return res.status(404).json({message: 'El producto no fue encontrado'});

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
    if(!existsSync(path)) return res.status(404).json({message: 'No existe la base de datos'});

    try {
        const data = await promises.readFile(path, 'utf-8');
        allProducts = JSON.parse(data);
    } catch (error) {
        console.log(error);
        return res.status(404).json({message: 'Error al acceder a la base de datos'})
    }

    const { pid } = req.params;
    const indexById = allProducts.findIndex(prod => prod.id === pid);
    if(indexById === -1) return res.status(404).json({mesagge: 'No se encontró el producto'});
    allProducts.splice(indexById, 1);

    const productStr = JSON.stringify(allProducts, null, 2);
        writeFile(path, productStr, error => {
            if(error) throw error;
        });

    res.json({message: 'Producto eliminado'})
})

export default router;