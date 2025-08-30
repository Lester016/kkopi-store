import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { config } from './config/config';
import invalidJsonErrorHandler from './middleware/invalidJsonErrorHandler';
import { logger } from './middleware/requestLogger';
import router from './routers';
import connectDB from './utils/connectToDb';
import log from './utils/logger';

const app: Express = express();

app.use(
  cors({
    origin: '*', // or '*' in development
    credentials: true,
  })
);
app.use(express.json()); // parser to allows us accept json data like req.body
app.use(logger); // log every request from the api.
app.use(invalidJsonErrorHandler); // middleware to handle invalid json errors

app.get('/ping', (_: Request, res: Response) => {
  res.send({ message: 'pong' });
});

app.use('/api', router);

app.listen(config.port, config.host, () => {
  log.info(`Server is running at http://${config.host}:${config.port}`);
  connectDB(); // Can also be called outsite this method.
});
