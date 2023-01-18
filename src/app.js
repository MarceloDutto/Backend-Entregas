import express from 'express';
import routes from './routes/index.js';

const port = 8080;

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}));

routes(app);

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})
