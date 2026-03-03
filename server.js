const express = require('express');
const cors = require('cors');
const { clip } = require('./clipper');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// 允许所有来源
app.use(cors());

app.post('/api/parse', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'URL_REQUIRED',
        message: 'URL is required in the request body.'
      }
    });
  }

  try {
    const result = await clip(url, null, true); // Pass a flag to indicate API call

    if (result.error) {
      // Determine appropriate status code based on error
      let statusCode = 500;
      if (result.code === 'ACCESS_DENIED') statusCode = 403;
      if (result.code === 'INVALID_URL') statusCode = 400;

      return res.status(statusCode).json({
        success: false,
        error: {
          code: result.code || 'PARSE_ERROR',
          message: result.error
        }
      });
    }

    res.json({
      success: true,
      data: {
        title: result.title,
        content: result.markdown,
        url: url,
        createdAt: new Date().toISOString()
      }
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: e.message
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Web Clipper API server listening on port ${port}`);
});
