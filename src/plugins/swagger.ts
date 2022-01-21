import fp from "fastify-plugin";
import swagger from "fastify-swagger";
import { ChallengeSchema } from "../models/ChallengeInfo";
import { GoodiesSchema } from "../models/GoodiesInfo";
import { UserSchema } from "../models/UserInfo";

export interface SwaggerPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SwaggerPluginOptions>(async (fastify, opts) => {
  fastify.register(swagger, {
    routePrefix: "/doc",
    swagger: {
      info: {
        title: "Web BDE Swagger",
        description: "Documentation for the Web BDE application",
        version: "0.1.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "user", description: "User related end-points" },
        { name: "challenge", description: "Challenge related end-points" },
        { name: "goodies", description: "Goodies related end-points" },
      ],
      definitions: {
        User: UserSchema,
        Challenge: ChallengeSchema,
        Goodies: GoodiesSchema,
      },
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header",
        },
      },
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {}
}