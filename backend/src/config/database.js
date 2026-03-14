require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: '',
    database: 'tn_grievance_db',
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: console.log,
    timezone: '+05:30'
  }
};
