'use strict';

const mysql = require('mysql2');

// For runing more query at the same time
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node_complete',
    // password: 'oyin090577'
});
module.exports = pool.promise();