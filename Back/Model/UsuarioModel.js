// models/user.js
const { DataTypes } = require("sequelize");

const sequelize = require("../config/Config_bd");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // No agregar createdAt y updatedAt automáticamente
  }
);

module.exports = User;
