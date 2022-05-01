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
  database: "db_aliancadistribuidora",
});

app.use(express.json());
app.use(cors());

app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  // console.log(req.params);

  // simple query
  connection.query(
    `SELECT * FROM ws_products WHERE pdt_id = ${id}`,
    function (err, results, fields) {
      return res.json(results);
    }
  );

  // return;
});

app.post("/products/", (req, res) => {
  const {
    pdt_code,
    pdt_title,
    pdt_subtitle,
    pdt_cover,
    pdt_content,
    pdt_created,
    pdt_brand,
    pdt_category,
    pdt_subcategory,
    pdt_status,
    pdt_inventory,
    pdt_delivered,
  } = req.body;

  const imageNameClean = pdt_cover.split(".")[0];
  const imageNameExt = pdt_cover.split(".").pop();
  const imageNameNew =
    convertToSlug(imageNameClean) + "." + convertToSlug(imageNameExt);

  let queryInsert = `INSERT INTO ws_products ( pdt_code, pdt_title, pdt_subtitle, pdt_cover, pdt_content, pdt_created, pdt_brand, pdt_category, pdt_subcategory, pdt_status, pdt_inventory, pdt_delivered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    queryInsert,
    [
      pdt_code,
      pdt_title,
      pdt_subtitle,
      imageNameNew,
      pdt_content,
      pdt_created,
      pdt_brand,
      pdt_category,
      pdt_subcategory,
      pdt_status,
      pdt_inventory,
      pdt_delivered,
    ],
    function (err, results, fields) {
      if (err) {
        throw err;
      } else {
        if (results.insertId) {
          const titleSlug = convertToSlug(pdt_title);
          const productId = results.insertId;
          const pdtCode = results.insertId.toString().padStart(4, "0");

          let queryUpdate = `UPDATE 
                              ws_products 
                            SET 
                              pdt_code="${pdtCode}", 
                              pdt_cover='images/2022/04/${productId}-${imageNameNew}',
                              pdt_name='${titleSlug}' 
                            WHERE pdt_id = ${results.insertId}`;
          connection.query(queryUpdate, function (err, results, fields) {
            if (err) {
              throw err;
            } else {
              if (results.affectedRows) {
                // let queryRead = `SELECT * FROM ws_products WHERE pdt_id = ${id}`;
                // connection.query(
                //   queryRead,
                //   function (err, resultsRead, fields) {
                //     // fs.rename( // Renomeia arquivos local
                //     //   "/path/to/Afghanistan.png",
                //     //   "/path/to/AF.png",
                //     //   function (err) {
                //     //     if (err) console.log("ERROR: " + err);
                //     //   }
                //     // );
                console.log({ productId: "ok!", pdtCode, productId });
                return res.json({ results, productId });
                // }
                // );
              }
            }
          });
        }
      }
    }
  );
});

app.post("/category/create", (req, res) => {
  const { subcategory } = req.body;

  let queryInsertCat = `INSERT INTO ws_products_categories ( cat_parent, cat_title, cat_name, cat_created ) VALUES (?, ?, ?, ?)`;
  connection.query(
    queryInsertCat,
    [
      1,
      subcategory,
      convertToSlug(subcategory),
      String(formatDate(new Date())),
    ],
    function (err, results, fields) {
      if (err) {
        throw err;
      } else {
        return res.json({ subcategory: "ok" });
      }
    }
  );
});

// Renomeia imagem no BD
app.put("/products/:id", (req, res) => {
  const { id } = req.params;

  let queryRead = `SELECT * FROM ws_products WHERE pdt_id = ${id}`;
  connection.query(queryRead, function (err, resultsRead, fields) {
    if (resultsRead) {
      const imageName =
        "images/2022/04/" +
        resultsRead[0].pdt_id +
        "-" +
        convertToSlug(resultsRead[0].pdt_title) +
        ".jpg";

      const titleSlug = convertToSlug(resultsRead[0].pdt_title);

      let queryUpdate = `UPDATE ws_products SET pdt_cover='${imageName}', pdt_status=1, pdt_name='${titleSlug}' WHERE pdt_id = ${id}`;
      connection.query(queryUpdate, function (err, results, fields) {
        if (err) {
          throw err;
        } else {
          if (results.affectedRows) {
            let queryRead = `SELECT * FROM ws_products WHERE pdt_id = ${id}`;
            connection.query(queryRead, function (err, resultsRead, fields) {
              // fs.rename( // Renomeia arquivos local
              //   "/path/to/Afghanistan.png",
              //   "/path/to/AF.png",
              //   function (err) {
              //     if (err) console.log("ERROR: " + err);
              //   }
              // );
              return res.json(resultsRead);
            });
          }
        }
      });
    }
  });
});

app.listen(3333, () => {
  console.log("🚀 Server started");
});
