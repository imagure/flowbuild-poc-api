import jwt, { JwtPayload } from 'jsonwebtoken'
import { FastifyReply } from 'fastify'
import { auth, envs } from '../configs/env'
import { IActorRequest, Actor } from '../types'
import { getClient } from './jwksClients'
import { getPropByPath } from '../utils'

export const verifyJWT = async (
  request: IActorRequest,
  reply: FastifyReply,
  _done: (err?: Error) => void
) => {
  const { headers } = request
  const { authorization } = headers as { authorization: string }

  if (authorization) {
    let token, alg, kid, iss
    try {
      ;[, token] = authorization.split(' ')
      const [enc_headers, enc_payload] = token.split('.')

      ;({ alg, kid } = JSON.parse(
        Buffer.from(enc_headers, 'base64').toString()
      ))
      ;({ iss } = JSON.parse(Buffer.from(enc_payload, 'base64').toString()))
    } catch (err) {
      reply.code(401)
      throw new Error('INVALID TOKEN FORMAT')
    }

    if (alg === 'HS256') {
      try {
        const payload = jwt.verify(token, envs.JWT_SECRET) as JwtPayload
        request.actor = { ...payload, id: payload.actor_id } as Actor
        return
      } catch (err) {
        reply.code(401)
        throw new Error(`${err}`)
      }
    } else if (alg === 'RS256' && iss) {
      try {
        const key = await getClient(iss).getSigningKey(kid)
        const publicKey = key.getPublicKey()
        const payload = jwt.verify(token, publicKey, {
          algorithms: ['RS256'],
        }) as JwtPayload

        const { 'RS-256-ISSUERS': rs256 } = auth
        const { roles: rolesPath, actor_id: actorIdPath } = rs256[iss] as {
          [key: string]: string
        }

        const roles = getPropByPath(payload, rolesPath)
        const actor_id = getPropByPath(payload, actorIdPath)

        if (roles && actor_id) {
          request.actor = { id: actor_id, roles } as Actor
          return
        }
        reply.code(401)
        throw new Error('INVALID TOKEN: COULDNT FETCH ACTOR_ID AND/OR ROLES')
      } catch (err) {
        reply.code(401)
        throw new Error(`${err}`)
      }
    }

    reply.code(401)
    throw new Error('INVALID TOKEN ALGORITHM OR TOKEN FORMAT')
  }

  reply.code(401)
  throw new Error('TOKEN NOT FOUND')
}
