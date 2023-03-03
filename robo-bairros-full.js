/**
 * SITE COM OS CEPS: https://www.qualocep.com/cep/rj/rio-de-janeiro/
 * SITE COM OS BAIRROS: https://www.estadosecapitaisdobrasil.com/lista-dos-bairros-do-rio-de-janeiro/
 */

const puppeteer = require("puppeteer");
const { createBairrosDb } = require("./Util.js");
const baseURL = "http://localhost:3333";
const pageURL = "https://www.qualocep.com/cep/rj/rio-de-janeiro/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Iniciei");

  await page.goto(pageURL);
  console.log("Fui para a url!");

  const linksCat = await page.$$eval("ul.col-lg-12 li a", (el) => {
    return el.map((link) => {
      let objTmp = {};
      objTmp["bairro"] = link.innerText.replace("cep de ", "");
      objTmp["bairro_link"] = link.href;
      return objTmp;
    });
  });

  for (const datas of linksCat) {
    // createBairrosDb(baseURL, datas);
  }

  await browser.close();
})();

async function updateBairrosDb() {
  const bairros = [
    "Acari",
    "Anchieta",
    "Barros Filho",
    "Bento Ribeiro",
    "Campinho",
    "Cavalcanti",
    "Cascadura",
    "Coelho Neto",
    "Colégio",
    "Cordovil",
    "Costa Barros",
    "Engenheiro Leal",
    "Engenho da Rainha",
    "Guadalupe",
    "Honório Gurgel",
    "Inhaúma",
    "Irajá",
    "Jardim América",
    "Madureira",
    "Marechal Hermes",
    "Oswaldo Cruz",
    "Parada de Lucas",
    "Parque Anchieta",
    "Parque Colúmbia",
    "Pavuna",
    "Penha",
    "Penha Circular",
    "Quintino Bocaiuva",
    "Ricardo de Albuquerque",
    "Rocha Miranda",
    "Tomás Coelho",
    "Turiaçu",
    "Vaz Lobo",
    "Vicente de Carvalho",
    "Vigário Geral",
    "Vila da Penha",
    "Vila Kosmos",
    "Vista Alegre",
  ];

  for (const bairro of bairros) {
    const zona = "Zona Norte";
    const subzona = "Zona Norte";
    await fetch(`${baseURL}/bairros/update`, {
      method: "POST",
      body: JSON.stringify({ zona, subzona, bairro }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((json) => console.log(json));
  }
}
