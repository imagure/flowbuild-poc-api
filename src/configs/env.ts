const envs = {
    BROKER_HOST: process.env.BROKER_HOST || 'localhost',
    BROKER_PORT: process.env.BROKER_PORT || '9092',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
}
export {
    envs
}