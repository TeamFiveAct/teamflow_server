const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    info: {
      title: 'Node.js API with Swagger',
      version: '1.0.0',
      description: 'TeamFlow 홈페이지의 Swagger 입니다.',
    },
    servers: [
      {
        url: 'http://localhost:8000', // 서버 주소 (배포 후 수정 가능)
      },
    ],
    components: {
      securitySchemes: {
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid', // Express의 기본 세션 쿠키 이름 (수정 가능)
          description: '세션 기반 인증을 위한 쿠키',
        },
      },
    },
    security: [
      {
        CookieAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // API 문서화할 파일들
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
