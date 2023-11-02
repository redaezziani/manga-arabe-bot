import fs from 'fs';
const removeTrash = async (mangaName, mangaChapter) => {
    fs.rmdirSync(`${mangaName}-${mangaChapter}`, { recursive: true });
    fs.unlinkSync(`${mangaName}-${mangaChapter}.pdf`);
};

export default removeTrash;