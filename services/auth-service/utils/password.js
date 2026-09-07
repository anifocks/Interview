const bcrypt = require("bcryptjs");

function hashPassword(plainPassword) {
    return bcrypt.hashSync(plainPassword, 10);
}

function comparePassword(plainPassword, passwordHash) {
    return bcrypt.compareSync(plainPassword, passwordHash);
}

module.exports = {
    hashPassword,
    comparePassword
};