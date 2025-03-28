// models/user.js
const { DataTypes } = require("sequelize");

const sequelize = require("../config/Config_bd.env");
const { table } = require("console");

const User = sequelize.define(
  "Usuario",
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
    tableName: "Usuarios", 
    timestamps: false, 
  }
);

module.exports = User;
