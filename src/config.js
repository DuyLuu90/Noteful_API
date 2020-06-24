// to save all the configuration of the application, to keep track the values defined in .env file

module.exports= {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
    DB_URL: process.env.DATABASE_URL,
    TEST_DB_URL: process.env.TEST_DATABASE_URL
}