const fs = require("fs");
const fetch = require("node-fetch");

async function downloadImg(urlImg, imgName, pdtId) {
  const response = await fetch(urlImg);
  const buffer = await response.buffer();
  const imageNameClean = imgName.split(".")[0];
  const imageNameExt = imgName.split(".").pop();
  const imageNameNew =
    convertToSlug(imageNameClean) + "." + convertToSlug(imageNameExt);

  const fileWc = "../uploads/images/2022/04";
  fs.writeFile(`${fileWc}/${pdtId}-${imageNameNew}`, buffer, () =>
    console.log(`finished downloading! \n ${fileWc}/${pdtId}-${imageNameNew}`)
  );
}

async function createDataDb(url, obj) {
  await fetch(url + "/products", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((json) => {
      downloadImg(obj.pdt_img_link, obj.pdt_cover, json.productId);
      console.log(json);
    });
}

async function createCategory(url, subcategory) {
  await fetch(`${url}/category/create`, {
    method: "POST",
    body: JSON.stringify({ subcategory }),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

async function createBairrosDb(url, datas) {
  await fetch(`${url}/bairros/create`, {
    method: "POST",
    body: JSON.stringify(datas),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

async function createCepDb(url, datas) {
  await fetch(`${url}/cep/create`, {
    method: "POST",
    body: JSON.stringify(datas),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((json) => console.log(json));
}

/*******************
      UTILS
*******************/

function convertToSlug(Text) {
  return Text.toLowerCase()
    .replace(/ /g, "-")
    .replace("---", "-")
    .replace("--", "-")
    .replace(/[^\w-]+/g, "");
}

function formatDate(date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join("-") +
    " " +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(":")
  );
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

module.exports = {
  convertToSlug,
  formatDate,
  createCategory,
  createDataDb,
  createCepDb,
  createBairrosDb,
};
