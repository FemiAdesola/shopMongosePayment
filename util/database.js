// 'use strict';
// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// let _db;
// const mongoConnect = (cbData) => {
//     MongoClient.connect('mongodb+srv://Femi:CwRbXZuHSUaMW9yH@shop.fftoabl.mongodb.net/shop?retryWrites=true&w=majority')
//         .then(result => {
//             console.log('Connected');
//             _db = result.db();
//             cbData()
//         })
//         .catch(error => {
//             console.log(error);
//             throw error;
//         });
// };

// const getDb = () => {
//     if (_db) {
//         return _db;
//     }
//     throw 'No database found'
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
