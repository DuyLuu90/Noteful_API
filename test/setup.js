/* 
process.env.TZ='UTC'
process.env.NODE_ENV= 'test'
*/
require('dotenv').config() // to make sure the env var are loaded when we run test

const { expect} = require('chai') 
const {describe} = require('mocha')
const supertest= require('supertest')

global.describe=describe
global.expect= expect
global.supertest= supertest