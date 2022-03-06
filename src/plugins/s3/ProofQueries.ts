import { FastifyInstance } from "fastify";
import * as Minio from "minio";

export function ProofQueries(fastify: FastifyInstance, client: Minio.Client) {
  return {
    putProof: async function (proof: Buffer, accomplishmentId: number) {
      try {
        await client.putObject("proofs", `${accomplishmentId}`, proof);
      } catch (err) {
        fastify.log.error(err);

        throw fastify.httpErrors.internalServerError("Proof upload failed");
      }
    },
    getProof: async function (accomplishmentId: number) {
      let proof;
      try {
        proof = await client.getObject("proofs", `${accomplishmentId}`);
      } catch (err) {
        fastify.log.error(err);

        throw fastify.httpErrors.internalServerError("Proof download failed");
      }
      return proof;
    },
  };
}