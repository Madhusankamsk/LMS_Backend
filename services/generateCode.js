const { v4: uuidv4 } = require('uuid')

module.exports = {
    generateCode() {
        return uuidv4(); 
    },

    generateEightByteCode() {
        return uuidv4().split('-')[0]; 
    },

    generateFourByteCode() {
        return uuidv4().split('-')[1]; 
    }
};

