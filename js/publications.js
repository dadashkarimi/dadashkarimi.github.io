(function () {
  var topics = {
    neuro: { name: 'Medical imaging', short: 'medical imaging', color: '#4ade80', desc: 'fetal MRI, brain extraction, segmentation, traumatic brain injury' },
    connectome: { name: 'Connectomics & brain-behavior', short: 'connectomics', color: '#60a5fa', desc: 'functional connectomes, predictive models, optimal transport alignment' },
    nlp: { name: 'NLP & information retrieval', short: 'nlp & ir', color: '#fbbf24', desc: 'cross-lingual retrieval, query translation, semantic parsing' },
    method: { name: 'ML methods', short: 'ml methods', color: '#f472b6', desc: 'graph learning, optimal transport, adversarial ML, synthetic data' },
    meta: { name: 'Scholarly publishing', short: 'publishing', color: '#a78bfa', desc: 'self-citation, journal trends, and scientific communication' }
  };

  var scholarMetrics = {
    citationsAll: 629,
    citationsSince2021: 544,
    hIndexAll: 11,
    hIndexSince2021: 10,
    i10All: 12,
    i10Since2021: 10
  };

  var scholarCitationsByYear = [
    { year: 2019, citations: 22 },
    { year: 2020, citations: 20 },
    { year: 2021, citations: 41 },
    { year: 2022, citations: 65 },
    { year: 2023, citations: 101 },
    { year: 2024, citations: 116 },
    { year: 2025, citations: 160 },
    { year: 2026, citations: 64 }
  ];

  function applyScholarProfile(profile) {
    if (!profile) return;
    if (profile.metrics) {
      scholarMetrics = {
        citationsAll: Number(profile.metrics.citationsAll) || scholarMetrics.citationsAll,
        citationsSince2021: Number(profile.metrics.citationsSince2021) || scholarMetrics.citationsSince2021,
        hIndexAll: Number(profile.metrics.hIndexAll) || scholarMetrics.hIndexAll,
        hIndexSince2021: Number(profile.metrics.hIndexSince2021) || scholarMetrics.hIndexSince2021,
        i10All: Number(profile.metrics.i10All) || scholarMetrics.i10All,
        i10Since2021: Number(profile.metrics.i10Since2021) || scholarMetrics.i10Since2021
      };
    }
    if (Array.isArray(profile.citationsByYear) && profile.citationsByYear.length) {
      scholarCitationsByYear = profile.citationsByYear.map(function (row) {
        return { year: Number(row.year), citations: Number(row.citations) || 0 };
      }).filter(function (row) {
        return row.year;
      }).sort(function (a, b) {
        return a.year - b.year;
      });
    }
  }

  function loadScholarProfile() {
    if (!window.fetch) return;
    window.fetch('data/scholar-profile.json', { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) return null;
      return response.json();
    }).then(function (profile) {
      if (!profile) return;
      applyScholarProfile(profile);
      renderMetrics();
      renderSpark();
    }).catch(function () {});
  }

  var publications = [
    { y: 2026, t: 'connectome', title: 'Feature selection leads to divergent neurobiological interpretations of brain-based machine learning biomarkers', a: 'BD Adkinson, M Rosenblatt, H Sun, J Dadashkarimi, L Tejavibulya, R Jiang, D Scheinost', v: 'Nature Human Behaviour', c: 0, high: true, badge: 'biomarkers' },
    { y: 2026, t: 'neuro', title: 'PIGSKIN: PIG SKull Stripping with Synthetic Images and Neural Networks', a: 'J Dadashkarimi, D Parker, N Broomand Lomer, R Diaz-Arrastia, DH Smith, V Johnson, J Wolf', v: 'AI in Neuroscience', c: 0, high: true, url: 'https://doi.org/10.1177/2997979X261429297', badge: 'in press' },
    { y: 2025, t: 'neuro', title: 'Deep learning-based brain extraction for pig brain imaging', a: 'J Dadashkarimi, D Parker, R Diaz-Arrastia, D Smith, V Johnson, J Wolf', v: 'National Neurotrauma Society', c: 0, badge: 'TBI imaging' },
    { y: 2025, t: 'connectome', title: 'Brainefex: A web app for exploring fMRI effect sizes', a: 'H Shearer, M Rosenblatt, J Ye, R Jiang, L Tejavibulya, M Foster, Q Liang, J Dadashkarimi', v: 'Aperture Neuro', c: 1, url: 'https://apertureneuro.org/article/146251' },
    { y: 2025, t: 'meta', title: 'Trends in self-citation rates in high-impact neurology, neuroscience, and psychiatry journals', a: 'M Rosenblatt, S Mehta, H Peterson, J Dadashkarimi, R Rodriguez', v: 'eLife', c: 1, high: true, badge: 'publishing trends' },
    { y: 2024, t: 'neuro', title: 'Search Wide, Focus Deep: Automated Fetal Brain Extraction with Sparse Training Data', a: 'J Dadashkarimi, VP Trujillo, C Jaimes, L Zollei, M Hoffmann', v: 'MICCAI 2024 / arXiv', c: 0, high: true, url: 'https://arxiv.org/abs/2410.20532', badge: 'fetal MRI' },
    { y: 2024, t: 'connectome', title: 'Brain-phenotype predictions of language and executive function can survive across diverse real-world data', a: 'BD Adkinson, M Rosenblatt, J Dadashkarimi, L Tejavibulya, R Jiang, D Scheinost', v: 'Developmental Cognitive Neuroscience', c: 15, url: 'https://www.sciencedirect.com/science/article/pii/S1878929324001257' },
    { y: 2024, t: 'connectome', title: 'Edge-centric network control on the human brain structural network', a: 'H Sun, M Rosenblatt, J Dadashkarimi, R Rodriguez, L Tejavibulya', v: 'Imaging Neuroscience', c: 4, url: 'https://imaging.neuroscience.org/imag-2-00191' },
    { y: 2024, t: 'connectome', title: 'Prediction of craving across studies: conceptual and methodological considerations for data-driven methods', a: 'J Dadashkarimi, S Antons, SW Yip, CM Lacadie, D Scheinost', v: 'Journal of Behavioral Addictions', c: 6 },
    { y: 2023, t: 'connectome', title: 'Cross Atlas Remapping via Optimal Transport (CAROT): Creating connectomes for different atlases when raw data is not available', a: 'J Dadashkarimi, A Karbasi, Q Liang, M Rosenblatt, S Noble, M Foster, D Scheinost', v: 'Medical Image Analysis', c: 13, high: true, url: 'https://www.sciencedirect.com/science/article/abs/pii/S136184152300124X', badge: 'CAROT' },
    { y: 2023, t: 'connectome', title: 'Stacking multiple optimal transport policies to map functional connectomes', a: 'J Dadashkarimi, M Rosenblatt, A Karbasi, D Scheinost', v: 'CISS', c: 0 },
    { y: 2023, t: 'connectome', title: 'Altered brain dynamics across bipolar disorder and schizophrenia during rest and task switching', a: 'J Ye, H Sun, S Gao, J Dadashkarimi, M Rosenblatt, RX Rodriguez', v: 'Biological Psychiatry', c: 22, high: true },
    { y: 2023, t: 'connectome', title: 'Connectome-based prediction of craving in gambling disorder and cocaine use disorder', a: 'S Antons, SW Yip, CM Lacadie, J Dadashkarimi, D Scheinost, M Brand', v: 'Dialogues in Clinical Neuroscience', c: 31, url: 'https://akjournals.com/view/journals/2006/13/3/article-p695.xml' },
    { y: 2023, t: 'neuro', title: 'Machine learning and prediction in fetal, infant, and toddler neuroimaging: a review and primer', a: 'D Scheinost, A Pollatou, AJ Dufford, R Jiang, MC Farruggia, M Rosenblatt, J Dadashkarimi', v: 'Biological Psychiatry', c: 42, high: true },
    { y: 2023, t: 'method', title: 'Gradient-based enhancement attacks in biomedical machine learning', a: 'M Rosenblatt, J Dadashkarimi, D Scheinost', v: 'Clinical Image-Based Procedures', c: 4, url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9882585/' },
    { y: 2022, t: 'connectome', title: 'Predicting the future of neuroimaging predictive models in mental health', a: 'L Tejavibulya, M Rolison, S Gao, Q Liang, H Peterson, J Dadashkarimi, D Scheinost', v: 'Molecular Psychiatry', c: 70, high: true, url: 'https://www.nature.com/articles/s41380-022-01635-2' },
    { y: 2022, t: 'connectome', title: 'Combining multiple atlases to estimate data-driven mappings between functional connectomes using optimal transport', a: 'J Dadashkarimi, A Karbasi, D Scheinost', v: 'MICCAI 2022', c: 0, high: true, url: 'https://par.nsf.gov/servlets/purl/10410112' },
    { y: 2022, t: 'method', title: 'Transforming connectomes to any parcellation via graph matching', a: 'Q Liang, J Dadashkarimi, W Dai, A Karbasi, J Chang, HH Zhou', v: 'GRAIL Workshop at MICCAI', c: 0, high: true, url: 'https://link.springer.com/chapter/10.1007/978-3-031-21083-9_12', badge: 'Best Paper' },
    { y: 2022, t: 'connectome', title: 'Common networks predicting craving for cocaine use and gambling', a: 'S Antons, SW Yip, CM Lacadie, J Dadashkarimi, D Scheinost, M Brand', v: 'Journal of Behavioral Addictions', c: 0 },
    { y: 2022, t: 'method', title: 'The exact class of graph functions generated by graph neural networks', a: 'M Fereydounian, H Hassani, J Dadashkarimi, A Karbasi', v: 'arXiv:2202.08833', c: 8 },
    { y: 2022, t: 'connectome', title: 'Predicting transdiagnostic social impairments in childhood using connectome-based predictive modeling', a: 'AJ Dufford, V Kimble, L Tejavibulya, J Dadashkarimi, K Ibrahim, D Scheinost', v: 'medRxiv', c: 7 },
    { y: 2022, t: 'meta', title: 'Trends in self-citation rates in neuroscience literature', a: 'M Rosenblatt, S Mehta, H Peterson, J Dadashkarimi', v: 'eLife', c: 2 },
    { y: 2021, t: 'connectome', title: 'Transdiagnostic, connectome-based prediction of memory constructs across psychiatric disorders', a: 'DS Barron, S Gao, J Dadashkarimi, AS Greene, MN Spann, S Noble', v: 'Cerebral Cortex', c: 68, high: true, url: 'https://pubmed.ncbi.nlm.nih.gov/33345271/' },
    { y: 2021, t: 'connectome', title: 'Functional connectivity during frustration: predictive modeling of irritability in youth', a: 'D Scheinost, J Dadashkarimi, ES Finn, CG Wambach, C MacGillivray', v: 'Neuropsychopharmacology', c: 61, high: true, url: 'https://www.nature.com/articles/s41386-020-00954-8' },
    { y: 2021, t: 'connectome', title: 'A hitchhiker\'s guide to working with large, open-source neuroimaging datasets', a: 'C Horien, S Noble, AS Greene, K Lee, DS Barron, S Gao, D O\'Connor, J Dadashkarimi', v: 'Nature Human Behaviour', c: 100, high: true, url: 'https://www.nature.com/articles/s41562-020-01005-4' },
    { y: 2021, t: 'connectome', title: 'Data-driven mapping between functional connectomes using optimal transport', a: 'J Dadashkarimi, A Karbasi, D Scheinost', v: 'MICCAI 2021', c: 8, high: true, url: 'https://link.springer.com/chapter/10.1007/978-3-030-87199-4_28' },
    { y: 2020, t: 'connectome', title: 'Predicting BMI from whole-brain functional connectivity', a: 'E Yeagle, J Dadashkarimi, V Duan, A Greene, D Barron, S Gao', v: 'Biological Psychiatry', c: 0 },
    { y: 2020, t: 'nlp', title: 'Method and System for Information Retrieval', a: 'SA Tabrizi, A Shakery, MA Tavallaei, J Dadashkarimi', v: 'US Patent 10,540,399', c: 5, high: true, url: 'https://patentimages.storage.googleapis.com/64/34/17/19d553787def30/US10540399.pdf', badge: 'US Patent' },
    { y: 2019, t: 'connectome', title: 'A mass multivariate edge-wise approach for combining multiple connectomes to improve group-difference detection', a: 'J Dadashkarimi, S Gao, E Yeagle, S Noble, D Scheinost', v: 'Connectomics Workshop at MICCAI', c: 8, url: 'https://link.springer.com/chapter/10.1007/978-3-030-32391-2_7', badge: 'Best Poster' },
    { y: 2019, t: 'connectome', title: 'Task-based functional connectomes predict cognitive phenotypes across psychiatric disease', a: 'DS Barron, S Gao, J Dadashkarimi, AS Greene, MN Spann, S Noble', v: 'bioRxiv', c: 3 },
    { y: 2018, t: 'nlp', title: 'Zero-shot transfer learning for semantic parsing', a: 'J Dadashkarimi, A Fabbri, S Tatikonda, DR Radev', v: 'arXiv:1808.09889', c: 3 },
    { y: 2018, t: 'nlp', title: 'Sequence to Logic with Copy and Cache', a: 'J Dadashkarimi, S Tatikonda', v: 'arXiv:1807.07333', c: 1 },
    { y: 2017, t: 'nlp', title: 'An expectation-maximization algorithm for query translation based on pseudo-relevant documents', a: 'J Dadashkarimi, A Shakery, H Faili, H Zamani', v: 'Information Processing & Management', c: 15, high: true, url: 'https://www.sciencedirect.com/science/article/abs/pii/S0306457316306379' },
    { y: 2017, t: 'nlp', title: 'Dimension projection among languages based on pseudo-relevant documents for query translation', a: 'J Dadashkarimi, MS Shahshahani, A Tebbifakhr, H Faili, A Shakery', v: 'ECIR', c: 7, high: true, url: 'https://link.springer.com/chapter/10.1007/978-3-319-56608-5_39' },
    { y: 2016, t: 'nlp', title: 'Pseudo-relevance feedback based on matrix factorization', a: 'H Zamani, J Dadashkarimi, A Shakery, WB Croft', v: 'CIKM', c: 73, high: true, url: 'https://dl.acm.org/doi/abs/10.1145/2983323.2983844' },
    { y: 2016, t: 'nlp', title: 'Learning to weight translations using ordinal linear regression and query-generated training data', a: 'J Dadashkarimi, MJ Sabet, A Shakery', v: 'COLING', c: 0, high: true },
    { y: 2016, t: 'nlp', title: 'Low-dimensional query projection based on divergence minimization feedback model for ad-hoc retrieval', a: 'J Dadashkarimi', v: 'COLING', c: 0, high: true },
    { y: 2016, t: 'nlp', title: 'Profile-based translation in multilingual expertise retrieval', a: 'HN Esfahani, J Dadashkarimi, A Shakery', v: 'MultiLingMine at ECIR', c: 3 },
    { y: 2016, t: 'nlp', title: 'SS4MCT: A statistical stemmer for morphologically complex texts', a: 'J Dadashkarimi, HN Esfahani, H Faili, A Shakery', v: 'arXiv:1605.07852', c: 4 },
    { y: 2016, t: 'nlp', title: 'Building a multi-domain comparable corpus using a learning to rank method', a: 'R Rahimi, A Shakery, J Dadashkarimi, M Ariannezhad, M Dehghani', v: 'Natural Language Engineering', c: 9 },
    { y: 2015, t: 'nlp', title: 'Revisiting optimal rank aggregation: A dynamic programming approach', a: 'SA Tabrizi, J Dadashkarimi, M Dehghani, H Nasr Esfahani, A Shakery', v: 'Theory of Information Retrieval', c: 3 },
    { y: 2014, t: 'nlp', title: 'A probabilistic translation method for dictionary-based cross-lingual information retrieval in agglutinative languages', a: 'J Dadashkarimi, A Shakery, H Faili', v: 'arXiv:1411.1006', c: 11 }
  ];

  var knownAffiliations = {
    'D Scheinost': 'Yale University', 'A Karbasi': 'Yale / Cisco', 'S Noble': 'Northeastern University', 'M Rosenblatt': 'MGH / Harvard', 'A Shakery': 'University of Tehran', 'H Faili': 'University of Tehran', 'H Zamani': 'UMass Amherst', 'R Diaz-Arrastia': 'Penn Medicine', 'J Wolf': 'Penn Medicine', 'BD Adkinson': 'Yale School of Medicine', 'L Tejavibulya': 'Yale University', 'S Gao': 'Yale University', 'Q Liang': 'Yale University', 'H Sun': 'Yale University', 'R Jiang': 'Yale University', 'M Foster': 'Yale University', 'D Parker': 'Penn Medicine', 'V Johnson': 'Penn Medicine', 'M Brand': 'University of Duisburg-Essen', 'SW Yip': 'Yale University', 'C Jaimes': 'Boston Children\'s Hospital', 'L Zollei': 'MGH / Harvard', 'M Hoffmann': 'MGH / Harvard'
  };

  var knownPhotos = {};

  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function esc(value) { return String(value).replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]; }); }
  function byYear(a, b) { return b.y - a.y || b.c - a.c; }
  function authorHtml(authors) { return authors.split(/,\s*/).map(function (a) { return a === 'J Dadashkarimi' ? '<span class="me">J Dadashkarimi</span>' : esc(a); }).join(', '); }

  function renderMetrics() {
    var metrics = [
      ['citations', scholarMetrics.citationsAll, scholarMetrics.citationsSince2021 + ' since 2021'],
      ['h-index', scholarMetrics.hIndexAll, scholarMetrics.hIndexSince2021 + ' since 2021'],
      ['i10-index', scholarMetrics.i10All, scholarMetrics.i10Since2021 + ' since 2021'],
      ['works grouped', publications.length, 'across ' + Object.keys(topics).length + ' topics']
    ];
    document.getElementById('pubMetricGrid').innerHTML = metrics.map(function (m) {
      return '<div class="pub-metric"><div class="pub-metric-label">' + m[0] + '</div><div class="pub-metric-num">' + m[1] + '</div><div class="pub-metric-sub">' + m[2] + '</div></div>';
    }).join('');
  }

  function renderSpark() {
    var max = Math.max.apply(null, scholarCitationsByYear.map(function (row) { return row.citations; }));
    var width = 360;
    var gap = 10;
    var barWidth = Math.max(18, (width - 24 - gap * (scholarCitationsByYear.length - 1)) / scholarCitationsByYear.length);
    document.getElementById('pubYearSpark').innerHTML = scholarCitationsByYear.map(function (row, i) {
      var h = 82 * row.citations / max;
      var x = 10 + i * (barWidth + gap);
      var y = 90 - h;
      return '<rect class="pub-spark-bar' + (row.year >= 2024 ? ' recent' : '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barWidth.toFixed(1) + '" height="' + h.toFixed(1) + '"><title>' + row.year + ': ' + row.citations + ' citations</title></rect><text class="pub-spark-label" x="' + (x + barWidth / 2).toFixed(1) + '" y="108">' + row.year + '</text>';
    }).join('');
  }

  function renderDonut() {
    var counts = {};
    publications.forEach(function (p) { counts[p.t] = (counts[p.t] || 0) + 1; });
    var total = publications.length;
    var circumference = 2 * Math.PI * 40;
    var offset = 0;
    document.getElementById('pubTopicDonut').innerHTML = Object.keys(topics).map(function (key) {
      var count = counts[key] || 0;
      var length = circumference * count / total;
      var ring = '<circle class="pub-donut-ring" cx="60" cy="60" r="40" stroke="' + topics[key].color + '" stroke-dasharray="' + length.toFixed(1) + ' ' + (circumference - length).toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 60 60)"></circle>';
      offset += length;
      return ring;
    }).join('') + '<text class="pub-donut-center" x="60" y="58">' + total + '</text><text class="pub-donut-label" x="60" y="74">works</text>';
    document.getElementById('pubTopicLegend').innerHTML = Object.keys(topics).map(function (key) {
      var count = counts[key] || 0;
      return '<div class="pub-field-row"><span class="pub-field-dot" style="background:' + topics[key].color + '"></span><span>' + topics[key].name + '</span><span class="pub-field-pct">' + Math.round(100 * count / total) + '% · ' + count + '</span></div>';
    }).join('');
  }

  function renderHighlights() {
    document.getElementById('pubHighlightList').innerHTML = publications.filter(function (p) { return p.high; }).sort(function (a, b) { return b.c - a.c; }).slice(0, 4).map(function (p) {
      return '<div class="pub-highlight"><div class="pub-highlight-venue">' + esc(p.v) + '</div><div class="pub-highlight-title">' + esc(p.title) + '</div><div class="pub-highlight-year">' + p.y + ' · ' + (p.c || 'new') + ' citations</div></div>';
    }).join('');
  }

  function renderFilters(active) {
    active = active || 'all';
    var counts = {};
    publications.forEach(function (p) { counts[p.t] = (counts[p.t] || 0) + 1; });
    var html = '<span class="pub-filter-label">filter:</span><button class="pub-filter-btn ' + (active === 'all' ? 'active' : '') + '" data-topic="all">all <span class="count">' + publications.length + '</span></button>';
    html += Object.keys(topics).map(function (key) {
      return '<button class="pub-filter-btn ' + (active === key ? 'active' : '') + '" data-topic="' + key + '"><span class="pub-dot" style="background:' + topics[key].color + '"></span>' + topics[key].short + ' <span class="count">' + (counts[key] || 0) + '</span></button>';
    }).join('');
    document.getElementById('pubFilterBar').innerHTML = html;
  }

  function renderPublications(active) {
    active = active || 'all';
    document.getElementById('pubSections').innerHTML = Object.keys(topics).map(function (key) {
      var papers = publications.filter(function (p) { return p.t === key; }).sort(byYear);
      var rows = papers.map(function (p) {
        var inner = '<div class="pub-item-year">' + p.y + '</div><div><div class="pub-item-title">' + esc(p.title) + '</div><div class="pub-item-authors">' + authorHtml(p.a) + '</div>' + (p.badge ? '<span class="pub-item-badge">' + esc(p.badge) + '</span>' : '') + '</div><div class="pub-item-venue ' + (p.high ? 'high' : '') + '">' + esc(p.v) + '</div><div class="pub-item-cites"><span class="num">' + (p.c || '—') + '</span><span class="label">' + (p.c === 1 ? 'citation' : p.c ? 'citations' : 'listed') + '</span></div>';
        return p.url ? '<a class="pub-item" href="' + p.url + '" target="_blank" rel="noreferrer">' + inner + '</a>' : '<div class="pub-item">' + inner + '</div>';
      }).join('');
      return '<section class="pub-field-section" id="' + key + '"' + (active !== 'all' && active !== key ? ' hidden' : '') + '><div class="pub-field-head"><div class="pub-field-bar" style="background:' + topics[key].color + '"></div><h2>' + topics[key].name + '</h2><span class="pub-field-count">' + papers.length + ' WORKS</span></div><div class="pub-field-desc">' + topics[key].desc + '</div><div class="pub-list">' + rows + '</div></section>';
    }).join('');
  }

  function renderCoauthors() {
    var counts = {};
    publications.forEach(function (p) {
      p.a.split(/,\s*/).forEach(function (author) {
        if (!author || author === 'J Dadashkarimi') return;
        counts[author] = (counts[author] || 0) + 1;
      });
    });
    var authors = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).slice(0, 18);
    document.getElementById('pubCoauthorMeta').textContent = authors.length + ' frequent collaborators shown';
    document.getElementById('pubCoauthorGrid').innerHTML = authors.map(function (author) {
      var initials = author.split(/\s+/).map(function (part) { return part[0]; }).join('').slice(0, 2).toUpperCase();
      var photo = knownPhotos[author] ? '<img src="' + esc(knownPhotos[author]) + '" alt="' + esc(author) + '">' : initials;
      return '<div class="pub-co-card"><div class="pub-co-avatar">' + photo + '</div><div class="pub-co-info"><div class="pub-co-name">' + esc(author) + '</div><div class="pub-co-affil">' + esc(knownAffiliations[author] || 'collaborator') + '</div><span class="pub-co-papers">' + counts[author] + ' shared ' + (counts[author] === 1 ? 'work' : 'works') + '</span></div></div>';
    }).join('');
  }

  function renderAll(active) {
    renderMetrics();
    renderSpark();
    renderDonut();
    renderHighlights();
    renderFilters(active || 'all');
    renderPublications(active || 'all');
    renderCoauthors();
  }

  function syncThemeClass() {
    document.body.classList.toggle('theme-bright', !document.body.classList.contains('theme-dark'));
  }

  function boot() {
    syncThemeClass();
    renderAll('all');
    loadScholarProfile();
    document.getElementById('pubFilterBar').addEventListener('click', function (event) {
      var button = event.target.closest('button[data-topic]');
      if (!button) return;
      var topic = button.dataset.topic;
      renderFilters(topic);
      renderPublications(topic);
      if (topic !== 'all') {
        var section = document.getElementById(topic);
        if (section) window.setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      }
    });
    var themeButton = document.getElementById('themeToggle');
    if (themeButton) themeButton.addEventListener('click', function () {
      window.setTimeout(function () {
        syncThemeClass();
        renderSpark();
      }, 0);
    });
    window.addEventListener('storage', function (event) {
      if (event.key === 'site-theme') {
        syncThemeClass();
        renderSpark();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
