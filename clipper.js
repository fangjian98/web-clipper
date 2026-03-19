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

  if (ext === '.txt') {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && trimmed.startsWith('http')) {
        urls.push(trimmed);
      }
    }
  } else if (ext === '.csv') {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Try 'url' column first, then first column
          const url = row.url || row.URL || Object.values(row)[0];
          if (url && url.trim().startsWith('http')) {
            urls.push(url.trim());
          }
        })
        .on('end', () => resolve(urls))
        .on('error', reject);
    });
  } else if (ext === '.xls' || ext === '.xlsx') {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    for (const row of data) {
      const url = row.url || row.URL || Object.values(row)[0];
      if (url && url.toString().trim().startsWith('http')) {
        urls.push(url.toString().trim());
      }
    }
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }

  return urls;
}

async function clip(url, browserInstance = null, isApiCall = false) {
  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    if (isApiCall) {
      return { error: 'Invalid URL format.', code: 'INVALID_URL' };
    } else {
      console.error(`Error: Invalid URL format for ${url}`);
      return;
    }
  }

  let browser = browserInstance;
  let closeBrowser = false;

  try {
    if (!browser) {
      const launchOptions = { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };
      if (process.env.CHROME_PATH) {
        launchOptions.executablePath = process.env.CHROME_PATH;
      }
      browser = await puppeteer.launch(launchOptions);
      closeBrowser = true;
    }

    const page = await browser.newPage();
    if (!isApiCall) console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const html = await page.content();
    await page.close();

    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const realSrc = img.getAttribute('data-src') || img.getAttribute('data-actualsrc') || img.getAttribute('original-src') || img.getAttribute('data-original-src');
      if (realSrc) img.setAttribute('src', realSrc);
    });

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      return { error: 'Could not parse content from URL.', code: 'PARSE_ERROR' };
    }

    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    turndownService.use(gfm);
    const markdown = `# ${article.title}\n\n${turndownService.turndown(article.content)}`;

    if (isApiCall) {
      return { title: article.title, markdown };
    } else {
      const urlObject = new URL(url);
      let hostname = urlObject.hostname.replace('www.', '');
      const domain = hostname.split('.')[0];
      const fileName = `${domain}_article_${Date.now()}.md`;
      const outputDir = path.join(__dirname, 'article');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, markdown);
      console.log(`Successfully saved to article/${fileName}`);
    }

  } catch (error) {
    if (isApiCall) {
      let code = 'PARSE_ERROR';
      if (error.message.includes('Execution context was destroyed')) code = 'ACCESS_DENIED';
      return { error: error.message, code };
    }
    console.error(`Error clipping ${url}: ${error.message}`);
  } finally {
    if (closeBrowser && browser) {
      await browser.close();
    }
  }
}

// Command-line execution part
if (require.main === module) {
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
        const launchOptions = { 
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
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
}

module.exports = { clip, getUrlsFromFile };
