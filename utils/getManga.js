import userAgent from 'user-agents';
import puppeteerExtra from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import  makePdf from'./makePdf.js';
puppeteerExtra.use(Stealth());


const replaceSpaceWithDash= (mangaName) => {
    return mangaName.split(' ').join('-');
};

const getManga = async (mangaName, mangaChapter) => {
    const browser = await puppeteerExtra.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const name = replaceSpaceWithDash(mangaName);
    await page.setUserAgent(userAgent.random().toString());
    await page.goto(`https://manga-like.net/manga/${name}/${mangaChapter}/`);

    // lets make a try catch block here to catch the error if the manga is not found
    await page.setViewport({
        width: 1200,
        height: 800
    });
    const images = await page.$$eval('img.wp-manga-chapter-img', (imgs) =>
        imgs.map((img) => img.getAttribute('src'))
    );
        fs.mkdirSync(`${mangaName}-${mangaChapter}`, { recursive: true });
    for (let i = 0; i < images.length - 2; i++) {
        const viewSource = await page.goto(images[i]);
        fs.writeFile(`${mangaName}-${mangaChapter}/${i}.png`, await viewSource.buffer(), () => {});
      }

      await browser.close();
      await makePdf(mangaName, mangaChapter);
};

export default getManga;