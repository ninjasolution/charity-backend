const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const UserRoleSchema = new mongoose.Schema({
    user: {
      type: Number,
      ref: "User"
    },
    role: {
      type: Number,
      ref: "Role"
    },
  });

  UserRoleSchema.plugin(autoIncrement.plugin, "UserRole")
  const UserRole = connection.model(
    "UserRole",
    UserRoleSchema
  );

  return UserRole;
}
