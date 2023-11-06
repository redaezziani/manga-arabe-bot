
import fs from 'fs';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();
import getManga from'./utils/getManga.js';
import removeTrash from'./utils/removeTrash.js';

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
    setTimeout(() => {
        removeTrash(mangaName, mangaChapter);
    }, 5000);

});

bot.launch();

