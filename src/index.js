if (!process.env.NODE_ENV) {
   process.env.NODE_ENV = "production"
}
console.log('env:'+ process.env.NODE_ENV);
require('babel-core/register');
require('./app');

