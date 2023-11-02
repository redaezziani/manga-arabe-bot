import pdfkit from 'pdfkit';
import fs from 'fs';

const makePdf = async (mangaName, mangaChapter) => {
    // make the const images = fs.readdirSync('images') if is already in the images folder
    const images = fs.readdirSync(`${mangaName}-${mangaChapter}`);
    const doc = new pdfkit();
    images.sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));
    for (let i = 0; i < images.length; i++) {
        doc.image(`${mangaName}-${mangaChapter}/${images[i]}`, {
            fit: [600, 600],
            align: 'center',
            valign: 'center'
        });
        doc.addPage();
    }
    doc.pipe(fs.createWriteStream(`${mangaName}-${mangaChapter}.pdf`));
    doc.end();
};