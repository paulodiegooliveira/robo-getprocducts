const puppeteer = require("puppeteer");
const { formatDate, createDataDb, createCategory } = require("./Util.js");
const baseURL = "http://localhost:3333";
const pageURL = "https://galvanotek.com.br/produtos/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Iniciei");

  // https://galvanotek.com.br/produtos";
  await page.goto(pageURL);
  console.log("Fui para a url!");

  const linksCat = await page.$$eval(".card.w-100 a", (el) =>
    el.map((link) => link.href)
  );
  console.log("Entrei linksCat", linksCat);

  let i = 2;
  for (const linkCat of linksCat) {
    // https://galvanotek.com.br/produtos/bazar";
    await page.goto(linkCat);
    await page.waitForSelector("h4");

    const linksSubCat = await page.$$eval("a.linkFullDiv", (el) =>
      el.map((link) => link.href)
    );

    console.log("\n\nEntrei linksSubCat", linksSubCat);

    const subcategory = await page.evaluate(() => {
      const el = document.querySelector("h4");
      if (!el) return null;
      return el.innerHTML;
    });

    console.log(i + " ::category:: " + subcategory);

    // function to save category
    createCategory(baseURL, subcategory);

    let ii = 1;
    for (const link of linksSubCat) {
      // https://galvanotek.com.br/produtos/bazar/garrafa-g450";
      await page.goto(link);
      await page.waitForSelector("img.lazyloaded");
      console.log("\n\nEntrei link", link);

      /**
       * EXEMPLO DE ARRAY QUE NÃO QUEBRA A PÁGINA
       */
      /* Run javascript inside the page
      const data = await page.evaluate(() => {
        const list = [];
        const items = document.querySelectorAll("tr.job");

        for (const item of items) {
          list.push({
            company: item.querySelector(".company h3").innerHTML,
            position: item.querySelector(".company h2").innerHTML,
            link: "https://remoteok.io" + item.getAttribute("data-href"),
          });
        }

        return list;
      });*/
      /**
       * EXEMPLO DE ARRAY QUE NÃO QUEBRA A PÁGINA
       */

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
          pdt_code: ii.toString().padStart(4, "0"),
          pdt_title: titles ? titles[0] : "",
          pdt_subtitle: titles ? titles[0] : "",
          pdt_cover: images ? images.split("/").pop() : "",
          pdt_content: Descriptions ? Descriptions : "",
          pdt_created: String(formatDate(new Date())),
          pdt_brand: 1,
          pdt_category: 1,
          pdt_subcategory: i,
          pdt_status: 1,
          pdt_inventory: 10000000,
          pdt_delivered: 0,
          pdt_img_link: images,
        };

        console.log(obj);
        // await page.waitForTimeout(2000);
        createDataDb(baseURL, obj);
      }
      ii++;
    }
    i++;
  }

  await browser.close();
})();
