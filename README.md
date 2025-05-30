# 🚀 Gestor Dojo - Backend

Um backend robusto e moderno desenvolvido com TypeScript, Express e MongoDB, oferecendo uma API RESTful completa com autenticação, upload de arquivos e documentação Swagger.

## ✨ Tecnologias Principais

- **TypeScript** - Linguagem de programação tipada
- **Express.js** - Framework web para Node.js
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação via tokens
- **Swagger** - Documentação da API
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de emails
- **Joi** - Validação de dados

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/PWA_Backend.git
cd PWA_Backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3000
MONGODB_URI=sua_uri_do_mongodb
JWT_SECRET=seu_secret_jwt
```

4. Execute o projeto:
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger UI. Após iniciar o servidor, acesse:
```
http://localhost:3000/api-docs
```

## 🔐 Funcionalidades

- ✅ Autenticação JWT
- ✅ Upload de arquivos
- ✅ Validação de dados
- ✅ Envio de emails
- ✅ Documentação Swagger
- ✅ CORS habilitado
- ✅ Tratamento de erros
- ✅ Tipagem forte com TypeScript

## 🏗️ Estrutura do Projeto

```
src/
├── controllers/    # Controladores da aplicação
├── models/        # Modelos do MongoDB
├── routes/        # Rotas da API
├── middlewares/   # Middlewares personalizados
├── services/      # Lógica de negócios
├── utils/         # Funções utilitárias
└── app.ts         # Arquivo principal
```




## 📧 Contato

Vinicius Jardim - [vpbjardim@gmail.com]


