#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';

const publicationsFile = new URL('../pubs.html', import.meta.url);
const authorId = process.env.SCHOLAR_AUTHOR_ID || 'LrXokpIAAAAJ';
const apiKey = process.env.SERPAPI_KEY;

if (!apiKey) {
  console.log('SERPAPI_KEY is not set; skipping citation update.');
  process.exit(0);
}

function decodeEntities(text) {
  const entities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return entities[entity.toLowerCase()] || match;
  });
}

function titleText(titleHtml) {
  return decodeEntities(titleHtml.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function fetchScholarArticles() {
  const articles = [];

  for (let start = 0; start < 500; start += 100) {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google_scholar_author');
    url.searchParams.set('author_id', authorId);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('hl', 'en');
    url.searchParams.set('num', '100');
    url.searchParams.set('start', String(start));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const pageArticles = payload.articles || [];
    articles.push(...pageArticles);

    if (pageArticles.length < 100) break;
  }

  return articles;
}

function buildCitationMap(articles) {
  const citations = new Map();

  for (const article of articles) {
    if (!article.title) continue;
    const citedBy = article.cited_by?.value;
    const value = Number.parseInt(String(citedBy ?? '').replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(value)) continue;
    citations.set(normalizeTitle(article.title), value);
  }

  return citations;
}

function updatePublicationHtml(html, citations) {
  let matched = 0;
  let changed = 0;

  const nextHtml = html.replace(
    /(<div class="pub-row">[\s\S]*?<div class="pub-title">)([\s\S]*?)(<\/div>[\s\S]*?<div class="pub-cite">)([^<]*)(<\/div>)/g,
    (row, beforeTitle, titleHtml, beforeCite, currentCite, afterCite) => {
      const title = titleText(titleHtml);
      const count = citations.get(normalizeTitle(title));

      if (count === undefined) return row;
      matched += 1;

      const nextCite = String(count);
      if (currentCite.trim() !== nextCite) changed += 1;

      let updatedRow = `${beforeTitle}${titleHtml}${beforeCite}${nextCite}${afterCite}`;
      updatedRow = updatedRow.replace(/<span class="pub-badge">cited\s+\d+<\/span>/i, `<span class="pub-badge">cited ${nextCite}</span>`);
      return updatedRow;
    }
  );

  return { nextHtml, matched, changed };
}

const html = await readFile(publicationsFile, 'utf8');
const articles = await fetchScholarArticles();
const citations = buildCitationMap(articles);
const { nextHtml, matched, changed } = updatePublicationHtml(html, citations);

if (nextHtml !== html) {
  await writeFile(publicationsFile, nextHtml);
}

console.log(`Fetched ${articles.length} Scholar articles.`);
console.log(`Matched ${matched} publication rows.`);
console.log(`Updated ${changed} citation counts.`);
