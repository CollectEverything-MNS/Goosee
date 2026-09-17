const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../../goosee-vitrine/.env');
const env = fs.existsSync(file) ? require('dotenv').parse(fs.readFileSync(file)) : {};
function database(logicalName) {
  return logicalName === 'vitrine_db' ? env.DB_NAME || logicalName
    : logicalName === 'orchestrator_db' ? env.ORCH_DB_NAME || logicalName : logicalName;
}
function databaseUser(logicalName) {
  return (logicalName === 'orchestrator_db' ? env.ORCH_DB_USER : env.DB_USER) || 'postgres';
}
module.exports = { env, database, databaseUser };
