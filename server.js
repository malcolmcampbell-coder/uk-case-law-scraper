const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/scrape-cases', async (req, res) => {
  try {
    const { data: html } = await axios.get(
      'https://caselaw.nationalarchives.gov.uk/search?q=parental+alienation&court=family-court'
    );

    const $ = cheerio.load(html);
    const results = [];

    $('a.document__link').each((i, el) => {
      if (results.length >= 10) return false;
      const title = $(el).text().trim();
      const url = 'https://caselaw.nationalarchives.gov.uk' + $(el).attr('href');
      const citation = $(el).closest('li').find('span.document__citation').text().trim();
      const date = $(el).closest('li').find('time').text().trim();
      results.push({ title, citation, date, url });
    });

    res.json({ count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

app.listen(process.env.PORT || 3000);
