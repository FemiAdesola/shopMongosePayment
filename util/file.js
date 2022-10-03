'use strict';
const fs = require('fs');

const deleteFile = (filePath) => {
    // by using unlink method it delete file and method
    fs.unlink(filePath, (error) => {
        if (error) {
            throw (error)
        }
    });
};
exports.deleteFile = deleteFile;
