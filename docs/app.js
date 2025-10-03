(function() {
  const $ = sel => document.querySelector(sel);
  const noticeEl = $('#notice');
  const mainEl = $('#content-main');

  const cfg = window.SITE_CONFIG || {};
  const idx = window.SITE_INDEX || { complaints: [], principles: [], assessments: [] };

  // Detect if running locally or on GitHub Pages
  const isLocal = window.location.protocol === 'file:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';

  function baseRawUrl() {
    if (isLocal) {
      // When running locally, files are in the same directory structure
      return './';
    } else {
      // When on GitHub Pages, fetch from raw.githubusercontent.com
      const { owner, repo, branch } = cfg;
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/docs/`;
    }
  }

  function showNotice(msg) {
    noticeEl.textContent = msg;
    noticeEl.style.display = 'block';
  }
  function hideNotice() { noticeEl.style.display = 'none'; }

  async function fetchMarkdown(path) {
    let url;
    if (isLocal) {
      // For local server, use relative paths
      url = baseRawUrl() + path;
    } else {
      // For GitHub, encode each path segment separately to handle spaces and special characters
      const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
      url = baseRawUrl() + encodedPath;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Fetch failed (${res.status}) for ${path}`);
    }
    return await res.text();
  }

  // Layout 1: NZMC Complaint Layout
  async function renderComplaint(complaint) {
    try {
      hideNotice();
      mainEl.innerHTML = '<p class="muted">Loading…</p>';
      const md = await fetchMarkdown(complaint.path);
      const content = marked.parse(md);

      mainEl.innerHTML = `
        <h1 class="section-title">NZMC Complaint ${complaint.number}</h1>
        <div class="complaint-links">
          ${complaint.nzmcUrl ? `<a href="${complaint.nzmcUrl}" target="_blank" class="btn">View NZMC Complaint</a>` : ''}
          ${complaint.cruxUrl ? `<a href="${complaint.cruxUrl}" target="_blank" class="btn btn-secondary">View Crux Article</a>` : ''}
        </div>
        <div class="card">
          <h3>Summary</h3>
          ${content}
        </div>
      `;
    } catch (err) {
      console.error(err);
      mainEl.innerHTML = `<div class="card"><strong>Error:</strong> ${err.message}</div>`;
    }
  }

  // Layout 2: Principle Layout
  async function renderPrinciple(principle) {
    try {
      hideNotice();
      mainEl.innerHTML = '<p class="muted">Loading…</p>';
      const md = await fetchMarkdown(principle.path);
      const content = marked.parse(md);

      // Find assessments that breach this principle
      const relatedAssessments = idx.assessments.filter(a =>
        a.principles && a.principles.includes(principle.key)
      );

      let assessmentLinks = '';
      if (relatedAssessments.length > 0) {
        assessmentLinks = `
          <div class="card">
            <h3>Articles that breach this principle:</h3>
            <ul>
              ${relatedAssessments.map(a =>
                `<li><a href="#" data-type="assessment" data-key="${a.key}">${a.title}</a></li>`
              ).join('')}
            </ul>
          </div>
        `;
      }

      mainEl.innerHTML = `
        <h1 class="section-title">${principle.title}</h1>
        <div class="card">${content}</div>
        ${assessmentLinks}
      `;

      // Wire up assessment links
      mainEl.querySelectorAll('a[data-type="assessment"]').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const key = a.getAttribute('data-key');
          const assessment = idx.assessments.find(x => x.key === key);
          if (assessment) {
            setActiveNav('assessments', key);
            renderAssessment(assessment);
          }
        });
      });
    } catch (err) {
      console.error(err);
      mainEl.innerHTML = `<div class="card"><strong>Error:</strong> ${err.message}</div>`;
    }
  }

  // Layout 3: Assessment Layout
  async function renderAssessment(assessment) {
    try {
      hideNotice();
      mainEl.innerHTML = '<p class="muted">Loading…</p>';

      // Fetch both the original article and the review
      const [articleMd, reviewMd] = await Promise.all([
        assessment.articlePath ? fetchMarkdown(assessment.articlePath) : Promise.resolve(''),
        fetchMarkdown(assessment.path)
      ]);

      const articleContent = articleMd ? marked.parse(articleMd) : '';
      const reviewContent = marked.parse(reviewMd);

      mainEl.innerHTML = `
        <h1 class="section-title">${assessment.title}</h1>
        ${articleContent ? `
          <div class="assessment-frame">
            <h3>Original Article</h3>
            ${articleContent}
          </div>
        ` : ''}
        <div class="card">
          <h3>Assessment / Review</h3>
          ${reviewContent}
        </div>
      `;
    } catch (err) {
      console.error(err);
      mainEl.innerHTML = `<div class="card"><strong>Error:</strong> ${err.message}</div>`;
    }
  }

  // Set active state in navigation
  function setActiveNav(section, key) {
    document.querySelectorAll('.nav-section a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-section a[data-type="${section}"][data-key="${key}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  // Build the left-hand navigation
  function buildNavigation() {
    const complaintsNav = $('#nav-complaints');
    const principlesNav = $('#nav-principles');
    const assessmentsNav = $('#nav-assessments');

    // Build complaints list
    if (idx.complaints && idx.complaints.length > 0) {
      complaintsNav.innerHTML = idx.complaints.map(c =>
        `<li><a href="#" data-type="complaints" data-key="${c.key}">${c.number} - ${c.title}</a></li>`
      ).join('');
    } else {
      complaintsNav.innerHTML = '<li class="muted">No complaints</li>';
    }

    // Build principles list
    if (idx.principles && idx.principles.length > 0) {
      principlesNav.innerHTML = idx.principles.map(p =>
        `<li><a href="#" data-type="principles" data-key="${p.key}">${p.title}</a></li>`
      ).join('');
    } else {
      principlesNav.innerHTML = '<li class="muted">No principles</li>';
    }

    // Build assessments list
    if (idx.assessments && idx.assessments.length > 0) {
      assessmentsNav.innerHTML = idx.assessments.map(a =>
        `<li><a href="#" data-type="assessments" data-key="${a.key}">${a.title}</a></li>`
      ).join('');
    } else {
      assessmentsNav.innerHTML = '<li class="muted">No assessments</li>';
    }

    // Wire up all navigation clicks
    document.querySelectorAll('.nav-section a[data-type]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const type = link.getAttribute('data-type');
        const key = link.getAttribute('data-key');

        setActiveNav(type, key);

        if (type === 'complaints') {
          const item = idx.complaints.find(x => x.key === key);
          if (item) renderComplaint(item);
        } else if (type === 'principles') {
          const item = idx.principles.find(x => x.key === key);
          if (item) renderPrinciple(item);
        } else if (type === 'assessments') {
          const item = idx.assessments.find(x => x.key === key);
          if (item) renderAssessment(item);
        }
      });
    });
  }

  // Initialize the site
  function init() {
    if (!cfg.owner || cfg.owner === 'YOUR_GH_OWNER' || !cfg.repo || cfg.repo === 'YOUR_REPO') {
      showNotice('Edit docs/config.js to set your GitHub owner/repo so the Markdown can be fetched.');
    } else {
      hideNotice();
    }

    buildNavigation();

    // Load first available item
    if (idx.complaints && idx.complaints.length > 0) {
      setActiveNav('complaints', idx.complaints[0].key);
      renderComplaint(idx.complaints[0]);
    } else if (idx.principles && idx.principles.length > 0) {
      setActiveNav('principles', idx.principles[0].key);
      renderPrinciple(idx.principles[0]);
    } else if (idx.assessments && idx.assessments.length > 0) {
      setActiveNav('assessments', idx.assessments[0].key);
      renderAssessment(idx.assessments[0]);
    } else {
      mainEl.innerHTML = '<div class="card"><p>No content configured yet. Please update siteIndex.js</p></div>';
    }
  }

  // Start the app
  init();
})();

