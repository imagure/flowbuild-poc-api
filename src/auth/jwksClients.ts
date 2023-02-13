import JwksRsa from 'jwks-rsa'
import jwksClient from 'jwks-rsa'
import { auth } from '@configs/env'

const getClient = (clientIss: string) => {
  const authorizedIssuers = auth['RS-256-ISSUERS']
  const clients = {} as { [key: string]: JwksRsa.JwksClient }
  for (const [iss, data] of Object.entries(authorizedIssuers)) {
    const { certs } = data as { [key: string]: string }
    clients[iss] = jwksClient({
      jwksUri: `${certs}`,
      cache: true,
    })
  }
  return clients[clientIss]
}

export { getClient }
