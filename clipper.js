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
      const launchOptions = { headless: true };
      if (process.env.CHROME_PATH) {
        launchOptions.executablePath = process.env.CHROME_PATH;
      }
      browser = await puppeteer.launch(launchOptions);
      closeBrowser = true;
    }

    const page = await browser.newPage();
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // 等待一小段时间，让可能的动态内容加载
    await new Promise(resolve => setTimeout(resolve, 5000));

    const html = await page.content();
    await page.close();

    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // 预处理图片懒加载
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const realSrc = img.getAttribute('data-src') || img.getAttribute('data-actualsrc') || img.getAttribute('original-src') || img.getAttribute('data-original-src');
      if (realSrc) {
        img.setAttribute('src', realSrc);
      }
    });

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      throw new Error(`Could not parse content from ${url}`);
    }

    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    turndownService.use(gfm);

    console.log('Converting to Markdown...');
    let markdown = `# ${article.title}\n\n${turndownService.turndown(article.content)}`;

    const urlObject = new URL(url);
    let hostname = urlObject.hostname.replace('www.', '');
    const domain = hostname.split('.')[0];
    const fileName = `${domain}_article_${Date.now()}.md`;
    const outputDir = path.join(__dirname, 'article');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, markdown);
    console.log(`Successfully saved to article/${fileName}`);

  } catch (error) {
    console.error(`Error clipping ${url}: ${error.message}`);
  } finally {
    if (closeBrowser && browser) {
      await browser.close();
    }
  }
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: node clipper.js <URL or FilePath>');
    process.exit(1);
  }

  if (input.startsWith('http')) {
    await clip(input);
  } else {
    try {
      if (!fs.existsSync(input)) {
        console.error(`File not found: ${input}`);
        process.exit(1);
      }

      const urls = await getUrlsFromFile(input);
      console.log(`Found ${urls.length} URLs. Starting batch process...`);

      const launchOptions = { headless: true };
      if (process.env.CHROME_PATH) {
        launchOptions.executablePath = process.env.CHROME_PATH;
      }
      const browser = await puppeteer.launch(launchOptions);

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
