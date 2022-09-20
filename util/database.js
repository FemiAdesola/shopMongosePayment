'use strict';
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;
const mongoConnect = (cbData) => {
    
        .then(result => {
            console.log('Connected');
            db = result.db();
            cbData()
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
};

const getDb = () => {
    if (db) {
        return db
    }
    throw 'No database found'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
