const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI 버전
    info: {
      title: 'Node.js API with Swagger',
      version: '1.0.0',
      description: '이 API 문서는 Swagger를 사용하여 자동 생성되었습니다.',
    },
    servers: [
      {
        url: 'http://localhost:8000', // 서버 주소 (배포 후 수정 가능)
      },
    ],
  },
  apis: ['./routes/*.js'], // API 문서화할 파일들
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
