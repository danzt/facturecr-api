import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import logger from './logger';
import express from 'express';
import chalk from 'chalk';

import routes from './routes';

const app = express();

// * Application-Level Middleware * //
app.use(logger)

// Third-Party Middleware

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// Built-In Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Routes * //

app.use(['/clients', '/client'], routes.client);
app.use('/countries', routes.country);
app.use('/cantons', routes.county);
app.use('/provinces', routes.province);
app.use('/neighborhoods', routes.neighborhood);
app.use('/districts', routes.district);

// * Start * //

app.listen(process.env.PORT, () =>
  console.log(chalk.bold(chalk.cyan(`FactureCR API listening on port ${process.env.PORT}!`))),
);
