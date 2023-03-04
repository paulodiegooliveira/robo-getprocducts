/**
 * SITE COM OS CEPS: https://www.qualocep.com/cep/rj/rio-de-janeiro/
 * SITE COM OS BAIRROS: https://www.estadosecapitaisdobrasil.com/lista-dos-bairros-do-rio-de-janeiro/
 */

const puppeteer = require("puppeteer");
const { createCepDb } = require("./Util.js");
const baseURL = "http://localhost:3333";

const limit = 50;
const offset = 167;
(async () => {
  // READ TBL BAIRROS
  const readTblBairros = await fetch(`${baseURL}/bairro/${limit}/${offset}`);
  const responseReadTblBairros = await readTblBairros.json();

  // for (let index = 9; index <= 13; index++) {  //Manual
  // console.log(index);  //Manual
  for (const readTblBairrosPagination of responseReadTblBairros) {
    const { bairro, bairro_link } = readTblBairrosPagination;
    const paramBairro = bairro.replace(/-/g, " ").replace("   ", " ");
    // const pageURL = `https://www.qualocep.com/cep/rj/rio-de-janeiro/campo-grande/?page=${index}&`; //Manual

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log("Iniciei");

    // if (!bairro_link) {
    //   continue;
    // }

    // await page.goto(pageURL); //Manual
    await page.goto(bairro_link);
    console.log("Fui para a url!");

    // Save DB
    await extractedEvaluateCall(page, paramBairro, false); // manual ture

    // Pagination
    await handleHasPagination(page, paramBairro);

    // Close
    await browser.close();
  }
  // }  //Manual
})();

//////////////////////////////////////////
//////////FUNCTIONS //////////////////////
//////////////////////////////////////////

async function extractedEvaluateCall(page, paramBairro, paginationValid) {
  // READ TBL BAIRROS

  console.log(`${baseURL}/bairro-name/${paramBairro}`);

  const responseTblBairros = await fetch(
    `${baseURL}/bairro-name/${paramBairro}`
  );
  const responseTblBairrosJson = await responseTblBairros.json();

  console.log("\n##CONSOLE LINHA 54##");
  console.log(responseTblBairrosJson);

  if (responseTblBairrosJson) {
    const { id: idBairros } = responseTblBairrosJson["results"][0];

    //VALIDAR: READ TBL CEPS
    const responseTblCep = await fetch(baseURL + "/cep/" + idBairros + "/1");
    const responseTblCepJson = await responseTblCep.json();

    // VALIDA JÁ CADASTRADO
    if (responseTblCepJson[0] && !paginationValid) {
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
      console.log("\n##CONSOLE LINHA 84##");
      console.log(datas);
      createCepDb(baseURL, datas);
    }
  }
}
async function handleHasPagination(page, paramBairro) {
  const hasPagination = await page.$$eval(".page_link.btn a", (el) =>
    el.map((link) => link.href)
  );

  if (hasPagination) {
    console.log("\n##CONSOLE pagination LINHA 103##");
    console.log(hasPagination);

    for (const pagination of hasPagination) {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(pagination);

      console.log("\n\nFui para a url!" + pagination);

      await extractedEvaluateCall(page, paramBairro, true);

      await browser.close();
    }
  }
}
