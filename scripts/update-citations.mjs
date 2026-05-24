#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';

const authorId = process.env.SCHOLAR_AUTHOR_ID || 'LrXokpIAAAAJ';
const apiKey = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY;
const outputFile = new URL('../data/scholar-profile.json', import.meta.url);

if (!apiKey) {
  console.log('SERPAPI_API_KEY or SERPAPI_KEY is not set; skipping Scholar profile update.');
  process.exit(0);
}

function metricFromTable(table, metricName) {
  const row = table.find((item) => item && item[metricName]);
  const metric = row ? row[metricName] : {};
  const sinceKey = Object.keys(metric).find((key) => key.startsWith('since_'));

  return {
    all: Number(metric.all) || 0,
    since: sinceKey ? Number(metric[sinceKey]) || 0 : 0,
    sinceYear: sinceKey ? sinceKey.replace('since_', '') : '2021',
  };
}

function normalizeGraph(graph) {
  return graph
    .map((row) => ({
      year: Number(row.year),
      citations: Number(row.citations) || 0,
    }))
    .filter((row) => row.year)
    .sort((a, b) => a.year - b.year);
}

async function fetchScholarProfile() {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_scholar_author');
  url.searchParams.set('author_id', authorId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('hl', 'en');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SerpAPI request failed with ${response.status} ${response.statusText}`);
  }

  return response.json();
}

const payload = await fetchScholarProfile();
const citedBy = payload.cited_by || {};
const table = Array.isArray(citedBy.table) ? citedBy.table : [];
const graph = Array.isArray(citedBy.graph) ? citedBy.graph : [];

const citations = metricFromTable(table, 'citations');
const hIndex = metricFromTable(table, 'h_index');
const i10Index = metricFromTable(table, 'i10_index');
const citationsByYear = normalizeGraph(graph);

if (!citations.all || !citationsByYear.length) {
  throw new Error('SerpAPI response did not include usable citation metrics and graph data.');
}

const profile = {
  source: 'serpapi/google_scholar_author',
  authorId,
  updatedAt: new Date().toISOString(),
  sinceYear: citations.sinceYear,
  metrics: {
    citationsAll: citations.all,
    citationsSince2021: citations.since,
    hIndexAll: hIndex.all,
    hIndexSince2021: hIndex.since,
    i10All: i10Index.all,
    i10Since2021: i10Index.since,
  },
  citationsByYear,
};

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(profile, null, 2)}\n`);

console.log(`Updated Scholar profile for ${authorId}.`);
console.log(`Citations: ${profile.metrics.citationsAll} total, ${profile.metrics.citationsSince2021} since ${profile.sinceYear}.`);
console.log(`Citation graph years: ${citationsByYear[0].year}-${citationsByYear[citationsByYear.length - 1].year}.`);
