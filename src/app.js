import express from 'express';
import routes from './routes/index.js';
import __dirname from './utils.js';
import morgan from 'morgan';

import * as dotenv from 'dotenv';
dotenv.config()

const port = process.env.PORT;

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/public'));
app.use(morgan('dev'));

routes(app);

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})
