'use strict';

const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_complete', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
})

module.exports = sequelize;

// const mysql = require('mysql2');

// // For runing more query at the same time
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node_complete',
//     // password: '********'
// });
// module.exports = pool.promise();