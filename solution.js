const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const cermatiURL = "https://www.cermati.com";

const main = async () => {
  try {
    // get all the artcle link
    let { data } = await axios.get(`${cermatiURL}/artikel`);
    let $ = await cheerio.load(data);
    let linkToArticles = $(".article-list-item").map((i, el) => {
      return $(el).find("a").attr("href");
    });

    let articles = {
      articles: [],
    };

    // go to each article
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

        // scrape realted article link and title
        $(".item-title").each((i, el) => {
          //! no unique id or class for related article
          // related article is the first 5 element
          if (i < 5) {
            postData.relatedArticles.push({
              url: `${cermatiURL}${$(el).parent().attr("href")}`,
              title: $(el).text(),
            });
          }
        });

        // works, but inefficient
        //! async problem, have to write like this, need fix
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
