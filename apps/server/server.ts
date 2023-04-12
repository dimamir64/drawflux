import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import { mountRoutes } from './routes/index.js';
import { getClient, query } from './db/index.js';
import queries from './db/queries/index.js';
import jobs from './db/jobs.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mountRoutes(app);

await (async () => {
  const client = await getClient();

  try {
    await query(queries.createPageTable);
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
})();

jobs.deleteExpiredPages.start();

const port = process.env.PORT || 7456;

app.listen(Number(port), '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`App is listening on http://localhost:${port}`);
});
