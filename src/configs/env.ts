const envs = {
    SERVER_HOST: process.env.SERVER_HOST || 'localhost',
    SERVER_PORT: parseInt(process.env.SERVER_PORT || '3000', 10),
    BROKER_HOST: process.env.BROKER_HOST || 'localhost',
    BROKER_PORT: process.env.BROKER_PORT || '9092',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
    API_KEY: process.env.API_KEY || '287cb91nbx916bx19c12v619p',
    JWT_SECRET: process.env.JWT_KEY || '12345'
}
export {
    envs
}