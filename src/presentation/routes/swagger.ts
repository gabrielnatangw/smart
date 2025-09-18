import { Router } from 'express';

import { specs, swaggerUi } from '../../config/swagger';

const router = Router();

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Documentação da API
 *     description: Interface Swagger UI para explorar e testar a API
 *     tags: [Documentação]
 *     responses:
 *       200:
 *         description: Interface Swagger UI carregada com sucesso
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Backend API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  })
);

/**
 * @swagger
 * /api/docs.json:
 *   get:
 *     summary: Especificação OpenAPI em JSON
 *     description: Retorna a especificação completa da API em formato JSON
 *     tags: [Documentação]
 *     responses:
 *       200:
 *         description: Especificação OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

export default router;
