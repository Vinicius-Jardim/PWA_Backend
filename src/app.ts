import express from 'express';
import { config } from './config';
import { router } from './api/router';
import { db } from './utils/dbConection';
import cors from 'cors';

const PORT = config.port;
const app = express();

// Configurando o CORS para permitir requisições do frontend em localhost:3000
const corsOptions = {
  origin: 'http://localhost:3000',  // URL do frontend
  credentials: true,                // Permite enviar cookies com as requisições
};

db();
app.use(cors(corsOptions));  // Usando as opções de CORS
app.use(express.json());

for (const route of router) {
  app.use(route.path, route.router);
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
