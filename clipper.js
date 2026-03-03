
require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const fs = require('fs');
const path = require('path');

async function clip(url) {
  try {
    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('Waiting for content to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const html = await page.content();
    console.log('Content fetched. Closing browser...');
    await browser.close();

    console.log('Parsing with Readability...');
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
        throw new Error('Could not parse article content.');
    }

    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
    });
    turndownService.use(gfm);

    console.log('Converting to Markdown...');

    let markdown = `# ${article.title}\n\n${turndownService.turndown(article.content)}`;

    const urlObject = new URL(url);
    let hostname = urlObject.hostname;
    if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
    }
    const domain = hostname.split('.')[0];
    const fileName = `${domain}_article_${Date.now()}.md`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, markdown);
    console.log(`Article saved to ${filePath}`);
  } catch (error) {
    console.error('Error clipping article:', error);
  }
}

const url = process.argv[2];
if (!url) {
  console.log('Please provide a URL to clip.');
  process.exit(1);
}

clip(url);
