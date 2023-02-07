import jwt from 'jsonwebtoken'
import { FastifyReply, FastifyRequest } from "fastify"
import { envs } from './configs/env'

export const verifyJWT = (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    const { headers } = request
    const { authorization } = headers as  { authorization: string } 
    
    if(authorization) {
        try {
            const [,token] = authorization.split(' ')
            const [enc_headers, enc_payload] = token.split('.')

            const { alg } = JSON.parse(Buffer.from(enc_headers, 'base64').toString())
            
            if(alg === 'HS256') {
                jwt.verify(token, envs.JWT_SECRET)
                done()
            }
            
            //You may add any other auth logic here
            
        } catch(e) {
            reply.code(401)
            done(new Error('INVALID TOKEN'))
        }
    }

    reply.code(401)
    done(new Error('TOKEN NOT FOUND'))
}