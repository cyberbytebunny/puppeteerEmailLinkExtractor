const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let browser, page;

const startPuppeteer = async () => {
    const adminSession = process.env.ADMIN_SESSION || 'admin-session';
    const website = process.env.BLUEBIRDJETAIR_HOST || 'localhost';

    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    page = await browser.newPage();

    await page.goto('http://'+website);

    // Setting a cookie
    await page.setCookie({
        name: 'session',
        value: adminSession,
        domain: website
    });

    await page.close()
};

const findUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex);
};

app.post('/email', async (req, res) => {
    const {id, sender, recipient, subject, message} = req.body;

    if (typeof id !== 'number' || !sender || !recipient || !subject || !message) {
        return res.status(400).send('Invalid parameters.');
    }

    const urls = findUrls(message);
    if (urls && urls.length > 0) {
      try {
        await page.goto(urls[0]);
        await page.close()
        return res.send(`Navigated to URL: ${urls[0]}`);
      } catch(e) {}
    } else {
          return res.send('No URL found in message');
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startPuppeteer();
});
