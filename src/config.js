module.exports = {
  PORT: process.env.PORT || 9000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: 'https://blooming-garden-38714.herokuapp.com/',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://rorygarcia@localhost/writual-test'
}
