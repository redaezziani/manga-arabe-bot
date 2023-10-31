import userAgent from 'user-agents';
import puppeteerExtra from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import pdfkit from 'pdfkit';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

puppeteerExtra.use(Stealth());

const getManga = async (mangaName, mangaChapter) => {
    const browser = await puppeteerExtra.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await page.goto(`https://manga-like.net/manga/${mangaName}/${mangaChapter}/`);
    await page.setViewport({
        width: 1200,
        height: 800
    });
    const images = await page.$$eval('img.wp-manga-chapter-img', (imgs) =>
        imgs.map((img) => img.getAttribute('src'))
    );
    fs.mkdirSync('images');
    for (let i = 0; i < images.length - 2; i++) {
        const viewSource = await page.goto(images[i]);
        fs.writeFileSync(`images/${i}.png`, await viewSource.buffer());
    }
    await browser.close();
    await makePdf(mangaName, mangaChapter);
};

const makePdf = async (mangaName, mangaChapter) => {
    const doc = new pdfkit();
    // make the const images = fs.readdirSync('images') if is already in the images folder
    const images = fs.readdirSync('images');
    
    images.sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));
    for (let i = 0; i < images.length; i++) {
        doc.image(`images/${images[i]}`, {
            fit: [600, 600],
            align: 'center',
            valign: 'center'
        });
        doc.addPage();
    }
    doc.pipe(fs.createWriteStream(`${mangaName}-${mangaChapter}.pdf`));
    doc.end();
};



const bot = new Telegraf(process.env.MANGA_TELEGRAM_SECRET_KEY);

bot.start((ctx) => {
    ctx.reply('Welcome to Manga Bot. To get a manga, send /getmanga');
});

bot.command('getmanga', (ctx) => {
    ctx.reply('Please send the manga name and chapter number in the format: mangaName mangaChapter');
});
bot.on('text', async (ctx) => {
    const input = ctx.message.text.split(' ');
    if (input.length !== 2) {
        console.log('Invalid input');
        ctx.reply('Please enter the manga name and chapter number in the correct format.');
        return;
    }

    const mangaName = input[0];
    const mangaChapter = input[1];
    await getManga(mangaName, mangaChapter);

    setTimeout(() => {
        const pdfPath = `${mangaName}-${mangaChapter}.pdf`;

    if (fs.existsSync(pdfPath)) {
         ctx.replyWithDocument({
            source: pdfPath
        });

        console.log('Reply sent.');
         ctx.reply('Thanks for using Manga Bot');
         ctx.reply('Send /getmanga to get another manga');
    } else {
        console.log('PDF file not found');
        ctx.reply('Sorry, there was an issue generating the PDF. Please try again later.');
    }
    }
    , 3000);
});


bot.launch();
