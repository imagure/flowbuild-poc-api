import { Kafka } from 'kafkajs'
import { envs } from '../configs/env'
import { v4 as uuid } from 'uuid'

const kafka = new Kafka({
  clientId: `flowbuild-api-${uuid()}`,
  brokers: [`${envs.BROKER_HOST}:${envs.BROKER_PORT}`]
})

const producer = kafka.producer()

const connect = async () => {
  await producer.connect()
  return { producer }
}

export {
    connect
}