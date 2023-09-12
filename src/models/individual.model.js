const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const RoleSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    user: {
        type: Number,
        ref: "User"
      }
  });

  RoleSchema.plugin(autoIncrement.plugin, "Role")
  const Role = connection.model(
    "Role",
    RoleSchema
  );
  
  return Role;
}
