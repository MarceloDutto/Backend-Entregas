import express from 'express';
import routes from './routes/index.js';
import __dirname from './utils.js';

const port = 8080;

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/public'));

routes(app);

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})
