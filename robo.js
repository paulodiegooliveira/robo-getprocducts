const puppeteer = require("puppeteer");
// var escapeFile = require("escape-filename");
const fs = require("fs");
const fetch = require("node-fetch");
const { convertToSlug, formatDate } = require("./Util.js");
const baseURL = "http://localhost:3333";

const pageURL = "https://galvanotek.com.br/produtos/linha/flv/13/";
// const category = 35; [descartáveis]
const subcategory = 4;

// const pageURL = "https://galvanotek.com.br/produtos/linha/flv/13/"; [ERROR]
// const subcategory = 52;

/**
 * DOWNLOAD SINGLE IMAGE
 */
async function downloadImg(urlImg, imgName, pdtId) {
  const response = await fetch(urlImg);
  const buffer = await response.buffer();
  const imageNameClean = imgName.split(".")[0];
  const imageNameExt = imgName.split(".").pop();
  const imageNameNew =
    convertToSlug(imageNameClean) + "." + convertToSlug(imageNameExt);

  const fileWc =
    "/Applications/XAMPP/xamppfiles/htdocs/sites/wc_aliancadistribuidora/uploads/images/2022/04";

  fs.writeFile(`${fileWc}/${pdtId}-${imageNameNew}`, buffer, () =>
    console.log("finished downloading!")
  );
}

/**
 * DOWNLOAD MULTIPLE IMAGES .splice(0, 2)
 */
async function downloadThumb(urlImg, imgName, pdtId) {
  const response = await fetch(urlImg);
  const buffer = await response.buffer();
  const imageNameExt = imgName.split(".").pop();
  const imageName = convertToSlug(imgName) + "." + imageNameExt;

  fs.writeFile(`./uploads/${pdtId}-${imageName}`, buffer, () =>
    console.log("finished downloading!")
  );
}

async function createDataDb(url, obj) {
  await fetch(url + "/products", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((json) =>
      downloadImg(obj.pdt_img_link, obj.pdt_cover, json.productId)
    );
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Iniciei");

  // await page.goto("https://galvanotek.com.br/produtos");
  await page.goto(pageURL);
  console.log("Fui para a url!");

  const links = await page.$$eval("a.linkFullDiv", (el) =>
    el.map((link) => link.href)
  );
  console.log("Entrei links", links);

  for (const link of links) {
    await page.goto(link);
    await page.waitForSelector("img.lazyloaded");
    console.log("\n\nEntrei link", link);

    // // $$eva -> Array de imagens
    // const images = await page.$$eval(".carousel-item.pt-2 > img", (el) =>
    //   el.map((link) => link.getAttribute("data-src"))
    // );

    /*  Não quebra o codigo
    const sellImg = await page.evaluate(() => {
      const el = document.querySelector(".carousel-item.pt-2 > img");
      if (!el) return null;
      return el.getAttribute("data-src");
    });*/

    // $eva -> Uma imagem
    // const image = await page.$eval("img.lazyloaded", (element) =>
    //   element.getAttribute("src")
    // );

    /**
     * Se entrar no FOR ele pega até 3 primeiras imagens, mas não pega todas
     */
    // for (const image of images) {
    // console.log(images.splice(0, 1));
    // console.log(images);
    // }

    // DESCOMENTAR -----------------------------
    // const titles = await page.$eval(".extra", (element) =>
    //   element.innerText.split("\n")
    // );

    // const Descriptions = await page.$eval(
    //   ".extra",
    //   (element) => element.innerText
    // );

    // let obj = {
    //   pdt_title: titles[0],
    //   pdt_subtitle: titles[0],
    //   pdt_cover: images[0].split("/").pop(),
    //   pdt_content: Descriptions,
    //   pdt_created: String(formatDate(new Date())),
    //   pdt_brand: 1,
    //   pdt_category: 1,
    //   pdt_subcategory: subcategory,
    //   pdt_status: 0,
    //   pdt_inventory: 10000000,
    //   pdt_delivered: 0,
    //   pdt_img_link: images[0],
    // };
    // DESCOMENTAR -----------------------------

    const images = await page.evaluate(() => {
      const el = document.querySelector(".carousel-item.pt-2 > img");
      if (!el) return null;
      return el.getAttribute("data-src");
    });

    const titles = await page.evaluate(() => {
      const el = document.querySelector(".extra");
      if (!el) return null;
      return el.innerText.split("\n");
    });

    const Descriptions = await page.evaluate(() => {
      const el = document.querySelector(".extra");
      if (!el) return null;
      return el.innerText;
    });

    if (images) {
      let obj = {
        pdt_title: titles ? titles[0] : "",
        pdt_subtitle: titles ? titles[0] : "",
        pdt_cover: images ? images.split("/").pop() : "",
        pdt_content: Descriptions ? Descriptions : "",
        pdt_created: String(formatDate(new Date())),
        pdt_brand: 1,
        pdt_category: 1,
        pdt_subcategory: 10,
        pdt_status: 1,
        pdt_inventory: 10000000,
        pdt_delivered: 0,
        pdt_img_link: images,
      };

      console.log(obj);
      // createDataDb(baseURL, obj);
    }
  }

  await browser.close();
})();
