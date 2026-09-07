const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signToken(user) {
    const options = {};

    if (env.jwtExpiresIn && env.jwtExpiresIn !== "0") {
        options.expiresIn = env.jwtExpiresIn;
    }

    return jwt.sign(
        {
            userId: user.UserId,
            role: user.Role,
            name: user.FullName
        },
        env.jwtSecret,
        options
    );
}

function verifyToken(token) {
    return jwt.verify(token, env.jwtSecret);
}

module.exports = {
    signToken,
    verifyToken
};