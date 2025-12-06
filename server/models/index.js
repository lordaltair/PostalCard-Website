const sequelize = require('../config/db');
const User = require('./User');
const File = require('./File');

User.hasMany(File, { foreignKey: 'userId', onDelete: 'CASCADE' });
File.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    File,
};
