module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://rorygarcia@192.168.0.13/writual',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://rorygarcia@192.168.0.13/writual-test'
}
