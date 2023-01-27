import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: `flowbuild-api-${Math.floor(Math.random()*100000)}`,
  brokers: [`${process.env.BROKER_HOST || 'localhost'}:9092`]
})

const producer = kafka.producer()

const connect = async () => {
  await producer.connect()
  return { producer }
}

export {
    connect
}