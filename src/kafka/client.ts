import { Kafka } from 'kafkajs'
import { v4 as uuid } from 'uuid'
import { envs } from '@configs/env'

const kafka = new Kafka({
  clientId: `flowbuild-api-${uuid()}`,
  brokers: [`${envs.BROKER_HOST}:${envs.BROKER_PORT}`],
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: 'client-websocket-consumer-group' })

const connect = async () => {
  await producer.connect()
  await consumer.connect()
  await consumer.subscribe({
    topic: 'process-states-topic',
    fromBeginning: true,
  })

  return { producer, consumer }
}

export { connect }
