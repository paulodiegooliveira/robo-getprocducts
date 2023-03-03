/**
 * SITE COM OS CEPS: https://www.qualocep.com/cep/rj/rio-de-janeiro/
 * SITE COM OS BAIRROS: https://www.estadosecapitaisdobrasil.com/lista-dos-bairros-do-rio-de-janeiro/
 */

const { log } = require("console");
const puppeteer = require("puppeteer");
const { createCepDb } = require("./Util.js");
const baseURL = "http://localhost:3333";

const limit = 2;
const offset = 6;
(async () => {
  // READ TBL BAIRROS
  const readTblBairros = await fetch(`${baseURL}/bairro/${limit}/${offset}`);
  const responseReadTblBairros = await readTblBairros.json();

  for (const readTblBairrosPagination of responseReadTblBairros) {
    const { bairro, bairro_link } = readTblBairrosPagination;
    const paramBairro = bairro.replace(/-/g, " ");
    // const pageURL = `https://www.qualocep.com/cep/rj/rio-de-janeiro/${paramBairro}/`;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log("Iniciei");

    await page.goto(bairro_link);
    console.log("Fui para a url!");

    // Save DB
    await extractedEvaluateCall(page, paramBairro);

    // Pagination
    await handleHasPagination(page, paramBairro);

    // Close
    await browser.close();
  }
})();

//////////////////////////////////////////
//////////FUNCTIONS //////////////////////
//////////////////////////////////////////

async function extractedEvaluateCall(page, paramBairro) {
  // READ TBL BAIRROS

  console.log(`${baseURL}/bairro-name/${paramBairro}`);

  const responseTblBairros = await fetch(
    `${baseURL}/bairro-name/${paramBairro}`
  );
  const responseTblBairrosJson = await responseTblBairros.json();
  console.log(responseTblBairrosJson);

  if (responseTblBairrosJson) {
    const { id: idBairros } = responseTblBairrosJson;

    //VALIDAR: READ TBL CEPS
    const responseTblCep = await fetch(baseURL + "/cep/" + idBairros + "/1");
    const responseTblCepJson = await responseTblCep.json();

    // VALIDA JÁ CADASTRADO
    if (responseTblCepJson[0]) {
      console.log("Já está cadastrado!");
      return;
    }

    // scrape itens
    const linksCat = await page.$$eval("li.Heading-C > a", (el) => {
      return el.map((link) => {
        let objTmp = {};
        objTmp["cep"] = link.href
          .replace("https://www.qualocep.com/busca-cep/", "")
          .replace("/", "");
        objTmp["address"] = link.innerText.replace("cep da ", "");
        return objTmp;
      });
    });

    // Save DB
    for (const datas of linksCat) {
      datas["id_bairro"] = idBairros;
      console.log(datas);
      createCepDb(baseURL, datas);
    }
  }
}
async function handleHasPagination(page, paramBairro) {
  const hasPagination = await page.$$eval("span.page_link.btn a", (el) =>
    el.map((link) => link.href)
  );
  if (hasPagination) {
    console.log(hasPagination);

    for (const pagination of hasPagination) {
      console.log(pagination);

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(pagination);

      console.log("Fui para a url!" + pagination);

      await extractedEvaluateCall(page, paramBairro);

      await browser.close();
    }
  }
}
