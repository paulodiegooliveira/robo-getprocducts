const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const { convertToSlug, formatDate } = require("../Util");
const connection = mysql.createPool({
  // const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_cep",
});

app.use(express.json());
app.use(cors());

/// BAIRRO ////////////////////////////////////
/// BAIRRO ////////////////////////////////////
/// BAIRRO ////////////////////////////////////

// READ - All
app.get("/bairro/:limit?/:offset?", (req, res) => {
  const { limit, offset } = req.params;
  const limitQuery = limit ? ` LIMIT ${limit}` : "";
  const offsetQuery = offset ? ` OFFSET ${offset}` : "";

  connection.query(
    `SELECT * FROM bairros ${limitQuery} ${offsetQuery}`,
    function (err, results, fields) {
      if (err) return res.json(err);
      if (res) return res.json(results);
    }
  );
});

// READ - lista bairro por name
app.get("/bairro-name/:bairro", (req, res) => {
  const { bairro } = req.params;
  // console.log(req.params);

  // simple query
  connection.query(
    `SELECT * FROM bairros WHERE bairro = '${bairro}'`,
    // `SELECT * FROM bairros WHERE bairro LIKE '%${bairro}%'`,
    function (err, results, fields) {
      if (results) return res.json({ results });
    }
  );
});

// CREATE
app.post("/bairros/create", (req, res) => {
  const { bairro, bairro_link } = req.body;

  console.log("\n##CONSOLE: SERVER - LINHA 54##");
  console.log(req.body);

  let queryInsertCat = `INSERT INTO bairros ( bairro, bairro_link, created_at ) VALUES (?, ?, ?)`;
  connection.query(
    queryInsertCat,
    [bairro, bairro_link, String(formatDate(new Date()))],
    function (err, results, fields) {
      if (err) {
        throw err;
      } else {
        return res.json(req.body);
      }
    }
  );
});

// UPDATE
app.post("/bairros/update", (req, res) => {
  const { zona, subzona, bairro } = req.body;

  let queryRead = `SELECT * FROM bairros WHERE bairro LIKE '${bairro}%'`;

  connection.query(queryRead, function (err, resultsRead, fields) {
    if (resultsRead) {
      let queryUpdate = `UPDATE bairros SET zona='${zona}', subzona='${subzona}' WHERE bairro LIKE '${bairro}%'`;

      connection.query(queryUpdate, function (err, results, fields) {
        if (err) {
          throw err;
        } else {
          if (results.affectedRows) {
            let queryRead = `SELECT * FROM bairros WHERE bairro LIKE '${bairro}%'`;
            connection.query(queryRead, function (err, resultsRead, fields) {
              return res.json(resultsRead);
            });
          }
        }
      });
    } else {
      return res.json({ err: "Sem resultado" });
    }
  });
});

/// CEP ////////////////////////////////////
/// CEP ////////////////////////////////////
/// CEP ////////////////////////////////////
// lista ceps por id do bairro
app.get("/cep/:idbairro/:limit?", (req, res) => {
  const { idbairro, limit } = req.params;
  const limitQuery = limit ? ` LIMIT ${limit}` : "";
  // console.log(req.params);

  // simple query
  connection.query(
    `SELECT * FROM ceps WHERE id_bairro = ${idbairro} ${limitQuery}`,
    function (err, results, fields) {
      if (err) return res.json(err);
      if (results) return res.json(results);
    }
  );
});

// lista cep por name
app.get("/cep/:cep", (req, res) => {
  const { cep } = req.params;

  // simple query
  connection.query(
    `SELECT * FROM ceps WHERE cep = ${cep}`,
    function (err, results, fields) {
      return res.json(results);
    }
  );

  // return;
});

app.post("/cep/create", (req, res) => {
  const { cep, address, id_bairro } = req.body;

  console.log("\n##CONSOLE: SERVER - LINHA 136##");
  console.log(req.body);

  let queryInsertCat = `INSERT INTO ceps ( cep, address, id_bairro, created_at ) VALUES (?, ?, ?, ?)`;
  connection.query(
    queryInsertCat,
    [cep, address, id_bairro, String(formatDate(new Date()))],
    function (err, results, fields) {
      if (err) {
        throw err;
      } else {
        return res.json(req.body);
      }
    }
  );
});

////////////////////////////////////////////
app.listen(3333, () => {
  console.log("🚀 Server started");
});
