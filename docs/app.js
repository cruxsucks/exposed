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
      const content = marked.parse(stripFrontmatter(md));

      mainEl.innerHTML = `
        <h1 class="section-title">NZMC Complaint ${complaint.number}</h1>
        <div class="complaint-links">
          ${complaint.nzmcUrl ? `<p><a href="${complaint.nzmcUrl}" target="_blank" class="text-link">View original complaint on Media Council website</a></p>` : ''}
          ${complaint.cruxUrl ? `<p><a href="${complaint.cruxUrl}" target="_blank" class="text-link">${complaint.cruxArticleTitle || 'View Crux correction/response'}</a></p>` : ''}
          ${!complaint.cruxUrl && complaint.cruxArticleTitle ? `<p class="muted">${complaint.cruxArticleTitle}</p>` : ''}
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

  // Extract URL from markdown content
  function extractUrlFromMarkdown(markdown) {
    // Look for URLs in markdown - try to find the first http/https link
    const urlMatch = markdown.match(/https?:\/\/[^\s\)]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  // Extract metadata from markdown frontmatter or content
  function extractMetadata(markdown) {
    const metadata = {
      date: null,
      title: null,
      outlet: 'Crux'
    };

    // Check for YAML frontmatter
    const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];

      // Extract date_published
      const dateMatch = frontmatter.match(/date_published:\s*(.+)/);
      if (dateMatch) {
        metadata.date = dateMatch[1].trim();
      }

      // Extract outlet
      const outletMatch = frontmatter.match(/outlet:\s*(.+)/);
      if (outletMatch) {
        metadata.outlet = outletMatch[1].trim();
      }
    }

    // If no frontmatter, try to extract from content format:
    // Line 1: URL
    // Line 2: Title
    // Line 3: by Author - Date
    if (!metadata.date || !metadata.title) {
      const lines = markdown.split('\n');

      // Extract title from line 2 (after URL)
      if (lines.length > 1 && lines[1].trim()) {
        metadata.title = lines[1].trim();
      }

      // Extract date from line 3 (format: "by Author - Sep 03, 2025")
      if (lines.length > 2) {
        const byLineMatch = lines[2].match(/by .+ - (.+)/);
        if (byLineMatch) {
          metadata.date = byLineMatch[1].trim();
        }
      }
    }

    // Fallback: Extract title from first H1 or H2
    if (!metadata.title) {
      const titleMatch = markdown.match(/^#{1,2}\s+(.+)$/m);
      if (titleMatch) {
        metadata.title = titleMatch[1].trim();
      }
    }

    return metadata;
  }

  // Format date nicely
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      // Try to parse the date - handles both "Sep 03, 2025" and ISO formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      // If parsing fails, return the original string
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  // Remove YAML frontmatter from markdown content
  function stripFrontmatter(markdown) {
    // Remove YAML frontmatter (--- ... ---)
    return markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
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

      const articleContent = articleMd ? marked.parse(stripFrontmatter(articleMd)) : '';
      const reviewContent = marked.parse(stripFrontmatter(reviewMd));

      // Extract metadata from the article
      const metadata = articleMd ? extractMetadata(articleMd) : {};
      const cruxUrl = articleMd ? extractUrlFromMarkdown(articleMd) : null;

      // Create article preview box with iframe thumbnail
      const thumbnailHtml = cruxUrl ? `
        <div class="article-preview">
          <div class="article-preview-thumbnail">
            <iframe src="${cruxUrl}"
                    scrolling="no"
                    sandbox="allow-same-origin"
                    title="Article preview"
                    onload="this.style.opacity='1';"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            </iframe>
            <div class="thumbnail-fallback">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="13" y2="17"></line>
              </svg>
              <p>Crux Article</p>
            </div>
          </div>
          <div class="article-preview-info">
            ${metadata.date ? `<p class="article-date">${formatDate(metadata.date)}</p>` : ''}
            ${metadata.title ? `<h3 class="article-title">${metadata.title}</h3>` : '<h3 class="article-title">Original Crux Article</h3>'}
            <a href="${cruxUrl}" target="_blank" class="article-url">${cruxUrl}</a>
          </div>
        </div>
      ` : '';

      mainEl.innerHTML = `
        ${thumbnailHtml}
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

