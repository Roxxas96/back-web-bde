import {
  Accomplishment,
  Challenge,
  Goodies,
  PrismaClient,
  Purchase,
  Session,
  User,
} from "@prisma/client";
import fp from "fastify-plugin";
import { AccomplishmentInfo } from "../../models/AccomplishmentInfo";
import { ChallengeInfo } from "../../models/ChallengeInfo";
import { GoodiesInfo } from "../../models/GoodiesInfo";
import { UserInfo } from "../../models/UserInfo";
import accomplishmentQueries from "./AccomplishmentQueries";
import challengeQueries from "./ChallengeQueries";
import goodiesQueries from "./GoodiesQueries";
import purchaseQueries from "./PurchaseQueries";
import sessionQueries from "./SessionQueries";
import userQueries from "./UserQueries";

export interface DatabasePluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<DatabasePluginOptions>(async (fastify, opts) => {
  const client = new PrismaClient();

  //TODO : Retry connection doesn't work
  //Try Database connection
  const connectionInterval = setInterval(async () => {
    try {
      await client.$connect();
      fastify.log.info("Database connected");
      clearInterval(connectionInterval);
    } catch (err) {
      fastify.log.error(err);
    }
  }, 5000);

  //Disconnect Database on process exit
  fastify.addHook("onClose", async (fastify) => {
    try {
      await fastify.prisma.client.$disconnect();
    } catch (err) {
      fastify.log.error(err);
    }
  });

  //Database queries
  const prisma = {
    client: client,
    user: userQueries(fastify, client),

    session: sessionQueries(fastify, client),

    challenge: challengeQueries(fastify, client),

    accomplishment: accomplishmentQueries(fastify, client),

    goodies: goodiesQueries(fastify, client),

    purchase: purchaseQueries(fastify, client),
  };

  fastify.decorate("prisma", prisma);
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    prisma: {
      client: PrismaClient;
      user: {
        updateUser: (userId: number, userInfo: UserInfo) => Promise<void>;
        createUser: (userInfo: UserInfo) => Promise<void>;
        deleteUser: (userId: number) => Promise<void>;
        getUser: (userId?: number, email?: string) => Promise<User>;
        getManyUser: () => Promise<User[]>;
      };

      session: {
        deleteSession: (token: string) => Promise<void>;
        createSession: (token: string, userId: number) => Promise<void>;
        getSession: (sessionId?: number, jwt?: string) => Promise<Session>;
        getManySession: () => Promise<Session[]>;
      };

      challenge: {
        updateChallenge: (
          challengeInfo: ChallengeInfo,
          challengeId: number
        ) => Promise<void>;
        deleteChallenge: (challengeId: number) => Promise<void>;
        createChallenge: (
          challengeInfo: ChallengeInfo,
          creatorId: number
        ) => Promise<void>;
        getChallenge: (challengeId: number) => Promise<Challenge>;
        getManyChallenge: () => Promise<Challenge[]>;
      };

      accomplishment: {
        updateAccomplishment: (
          accomplishmentId: number,
          accomplishmentInfo?: AccomplishmentInfo,
          validation?: 1 | -1
        ) => Promise<void>;
        deleteAccomplishment: (accomplishmentId: number) => Promise<void>;
        createAccomplishment: (
          accomplishmentInfo: AccomplishmentInfo,
          userId: number,
          challengeId: number
        ) => Promise<void>;
        getAccomplishment: (
          accomplishmentId: number
        ) => Promise<Accomplishment>;
        getManyAccomplishment: (userId?: number) => Promise<Accomplishment[]>;
      };

      goodies: {
        getGoodies: (goodiesId: number) => Promise<Goodies>;
        getManyGoodies: () => Promise<Goodies[]>;
        createGoodies: (
          goodiesInfo: GoodiesInfo,
          creatorId: number
        ) => Promise<void>;
        updateGoodies: (
          goodiesInfo: GoodiesInfo,
          goodiesId: number
        ) => Promise<void>;
        deleteGoodies: (goodiesId: number) => Promise<void>;
      };

      purchase: {
        getPurchase: (purchaseId: number) => Promise<Purchase>;
        getManyPurchase: (userId?: number) => Promise<Purchase[]>;
        createPurchase: (userId: number, goodiesId: number) => Promise<void>;
        deletePurchase: (purchaseId: number) => Promise<void>;
      };
    };
  }
}
