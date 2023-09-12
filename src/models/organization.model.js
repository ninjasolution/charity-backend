const mongoose = require("mongoose");

module.exports = (connection, autoIncrement) => {

  const OrganizationSchema = new mongoose.Schema({
    name: String,
    description: String,
    
  });

  OrganizationSchema.plugin(autoIncrement.plugin, "Organization")
  const Organization = connection.model(
    "Organization",
    OrganizationSchema
  );
  
  return Organization;
}
