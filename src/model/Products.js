const mysql = require("mysql2");

const connection = mysql.createPool({
  // const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_aliancadistribuidora",
});
