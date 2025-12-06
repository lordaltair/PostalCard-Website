const { User, sequelize } = require('./models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const createUser = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const phoneNumber = '09128463045';
        const password = 'password123';

        const existingUser = await User.findOne({ where: { phoneNumber } });
        if (existingUser) {
            console.log('User already exists.');
        } else {
            const user = await User.create({ phoneNumber, password });
            console.log(`User created successfully: ID ${user.id}`);
        }

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await sequelize.close();
        console.log('Done.');
    }
};

createUser();
