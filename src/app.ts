import express from 'express';
import config from './config';
import { router } from './api/router';

const PORT = config.port;
const app = express();


app.use(express.json());

for (const route of router) {
  app.use(route.path, route.router);
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
