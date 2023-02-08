import { FastifyRequest } from "fastify";

export interface Actor {
    id: 'string',
    roles: Array<string>,
    iat: number
}

export interface IActorRequest extends FastifyRequest {
    actor?: Actor
}