const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
    apps: [
        {
            name: 'postal-card-server',
            script: 'index.js',
            cwd: __dirname,
            env: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 5000,
                FRONTEND_URL: process.env.FRONTEND_URL,
                DB_NAME: process.env.DB_NAME,
                DB_USER: process.env.DB_USER,
                DB_PASS: process.env.DB_PASS,
                DB_HOST: process.env.DB_HOST,
                JWT_SECRET: process.env.JWT_SECRET,
            },
        },
    ],
};
