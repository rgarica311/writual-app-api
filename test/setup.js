require('dotenv').config();
const {expect} = require('chai');
const supertest = require('supertest');

process.env.TZ = 'UCT';
process.env.NODE_ENV = 'test';

process.env.DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://rorygarcia@localhost/writual';

global.expect = expect;
global.supertest = supertest;
