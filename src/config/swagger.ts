import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PWA Backend API',
      version: '1.0.0',
      description: 'API documentation for PWA Backend',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    './src/api/routes/*.ts',
    './src/models/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export default specs; 