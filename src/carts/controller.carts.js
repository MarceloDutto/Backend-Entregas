import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({message: 'Juan Laurentino empezo la colonia y es re genio'});
})

export default router;