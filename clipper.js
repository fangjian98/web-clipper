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
const csv = require('csv-parser');
const xlsx = require('xlsx');

async function getUrlsFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const urls = [];

  if (ext === '.csv') {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // 假设 CSV 有一个名为 'url' 的列，或者取第一列
          const url = row.url || Object.values(row)[0];
          if (url && url.startsWith('http')) urls.push(url.trim());
        })
        .on('end', () => resolve(urls))
        .on('error', reject);
    });
  } else if (ext === '.xls' || ext === '.xlsx') {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    data.forEach(row => {
      const url = row.url || Object.values(row)[0];
      if (url && typeof url === 'string' && url.startsWith('http')) urls.push(url.trim());
    });
    return urls;
  } else if (ext === '.txt') {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split(/\r?\n/).map(line => line.trim()).filter(line => line.startsWith('http'));
  }
  
  throw new Error(`Unsupported file format: ${ext}`);
}

async function clip(url, browserInstance = null) {
  let browser = browserInstance;
  let closeBrowser = false;

  try {
    if (!browser) {
      browser = await puppeteer.launch({
        executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      closeBrowser = true;
    }

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const html = await page.content();
    await page.close();

    console.log('Parsing with Readability...');
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error(`Could not parse content from ${url}`);
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
    console.log(`Successfully saved: ${fileName}`);
  } catch (error) {
    console.error(`Error clipping ${url}:`, error.message);
  } finally {
    if (closeBrowser && browser) {
      await browser.close();
    }
  }
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: node clipper.js <URL or FilePath (.csv, .xls, .xlsx, .txt)>');
    process.exit(1);
  }

  if (input.startsWith('http')) {
    // Single URL
    await clip(input);
  } else {
    // Batch from file
    try {
      if (!fs.existsSync(input)) {
        console.error(`File not found: ${input}`);
        process.exit(1);
      }

      console.log(`Reading URLs from ${input}...`);
      const urls = await getUrlsFromFile(input);
      console.log(`Found ${urls.length} URLs. Starting batch process...`);

      const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      for (const url of urls) {
        await clip(url, browser);
      }

      await browser.close();
      console.log('Batch process completed.');
    } catch (error) {
      console.error('Batch error:', error.message);
    }
  }
}

main();
