'use strict';
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (cbData) => {
    MongoClient.connect('mongodb+srv://Femi:oyin090577@cluster0.inmteyr.mongodb.net/?retryWrites=true&w=majority')
    .then(result => {
        console.log('Connected');
        cbData(result)
    })
    .catch(error => {
        console.log(error)
    });

}

module.exports = mongoConnect;
