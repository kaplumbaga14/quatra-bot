const fs = require('fs').promises;
const path = require('path');

const settingsFile = path.join(__dirname, 'settings.json');

async function getSetting(key) {
    try {
        const data = await fs.readFile(settingsFile, 'utf8');
        const settings = JSON.parse(data);
        return settings[key];
    } catch (error) {
        console.error('Ayar okunurken hata:', error);
        return null;
    }
}

async function setSetting(key, value) {
    try {
        let settings = {};
        try {
            const data = await fs.readFile(settingsFile, 'utf8');
            settings = JSON.parse(data);
        } catch (readError) {
        }
        settings[key] = value;
        await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Ayar kaydedilirken hata:', error);
    }
}

module.exports = { getSetting, setSetting };
