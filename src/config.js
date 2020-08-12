// to save all the configuration of the application, to keep track the values defined in .env file

module.exports= {
    PORT: process.env.PORT || 9000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://Duy:123@localhost/noteful",
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || "postgresql://Duy:123@localhost/noteful_test"
}

