const puppeteer = require("puppeteer");
// var escapeFile = require("escape-filename");
const fs = require("fs");
const fetch = require("node-fetch");
const { convertToSlug, formatDate } = require("./Util.js");
const baseURL = "http://localhost:3333";
const pageURL = "https://galvanotek.com.br/produtos/linha/flower/8/";

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

  fs.writeFile(`./uploads/${pdtId}-${imageNameNew}`, buffer, () =>
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

    // $$eva -> Array de imagens
    const images = await page.$$eval(".carousel-item.pt-2 > img", (el) =>
      el.map((link) => link.getAttribute("data-src"))
    );

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

    const titles = await page.$eval(".extra", (element) =>
      element.innerText.split("\n")
    );

    const Descriptions = await page.$eval(
      ".extra",
      (element) => element.innerText
    );

    let obj = {
      pdt_title: titles[0],
      pdt_subtitle: titles[0],
      pdt_cover: images[0].split("/").pop(),
      pdt_content: Descriptions,
      pdt_created: String(formatDate(new Date())),
      pdt_brand: 3,
      pdt_category: 35,
      pdt_subcategory: 51,
      pdt_status: 0,
      pdt_inventory: 10000000,
      pdt_delivered: 0,
      pdt_img_link: images[0],
    };

    // console.log(obj);
    createDataDb(baseURL, obj);
  }

  await browser.close();
})();
