console.log(process.jsEngine);
if (!process.env.NODE_ENV) {
   process.env.NODE_ENV = "production"
}
console.log('env:'+ process.env.NODE_ENV);
require('./app');

