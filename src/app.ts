import express from 'express';
import {config} from './config';
import { router } from './api/router';
import { db } from './utils/dbConection';
import cors from 'cors';
const PORT = config.port;
const app = express();

db();
app.use(cors());
app.use(express.json());

for (const route of router) {
  app.use(route.path, route.router);
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
