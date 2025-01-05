import express from 'express';
import { config } from './config';
import { router } from './api/router';
import { db } from './utils/dbConection';
import cors from 'cors';
import path from 'path';
import athleteRoutes from './api/routes/athletes'; // Corrigindo o caminho
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';

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

// Configurando o middleware para servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

for (const route of router) {
  app.use(route.path, route.router);
}

// Nova rota para atletas
app.use('/api/athletes', athleteRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
