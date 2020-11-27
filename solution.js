const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const cermatiURL = "https://www.cermati.com";

const main = async () => {
  try {
    let { data } = await axios.get(`${cermatiURL}/artikel`);
    let $ = await cheerio.load(data);
    let linkToArticles = $(".article-list-item").map((i, el) => {
      return $(el).find("a").attr("href");
    });

    let articles = {
      articles: [],
    };

    linkToArticles.each(async (i, el) => {
      try {
        let { data } = await axios.get(`${cermatiURL}${el}`);
        let $ = await cheerio.load(data);
        const postData = {
          url: `${cermatiURL}${el}`,
          title: $(".post-title").text().trim(),
          author: $(".author-name").text().trim(),
          postingDate: $(".post-date").text().trim(),
          relatedArticles: [],
        };
        $(".item-title").each((i, el) => {
          if (i < 5) {
            postData.relatedArticles.push({
              url: `${cermatiURL}${$(el).parent().attr("href")}`,
              title: $(el).text(),
            });
          }
        });
        articles.articles.push(postData);
        fs.writeFileSync("./solution.json", JSON.stringify(articles, null, 2));
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

main();
