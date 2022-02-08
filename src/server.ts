import express, { Application } from 'express';
import { APP_PORT, DB_URL } from './config';
import { Server } from 'http';
import errorHandler from './middlewares/errorHandler';

// Create server
const app: Application = express();

import routes from './routes';
import { connect, connection } from 'mongoose';
import path from 'path';

// Database connection
connect(DB_URL as string);
const db = connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('DB connected...');
});

global.appRoot = path.resolve(__dirname);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', routes); // Routes

app.use(errorHandler); // Golbal middleware

const server: Server = app.listen(Number(APP_PORT), () =>
  console.log(`Listening... on port ${APP_PORT}`)
);
