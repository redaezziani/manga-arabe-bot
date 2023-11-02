import userAgent from 'user-agents';
import puppeteer  from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { executablePath } from 'puppeteer';

puppeteer.use(StealthPlugin());




const replaceSpaceWithDash= (mangaName) => {
    return mangaName.split(' ').join('+');
}


const searchManga= async (mangaName)=> {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: executablePath()
    });
    const page = await browser.newPage();
    const name = replaceSpaceWithDash(mangaName);
    await page.setUserAgent(userAgent.random().toString());
    await page.goto(`https://manga-like.net/?s=${name}&post_type=wp-manga`);

    // await 10 seconds to load the page

    // lets make a try catch block here to catch the error if the manga is not found

    await page.setViewport({
        width: 1200,
        height: 800
    });

    const mangaList = await page.$$eval('h3.h4 a', (mangas) =>
        mangas.map((manga) => manga.textContent)
    ); 

    // lets take a screenshot of the page
    await page.screenshot({ path: 'example.png' });
    await browser.close();

    return mangaList;

};

searchManga('jujutsu+kaisen').then((mangaList) => console.log(mangaList));
