# Crux NZMC Complaints Website

This is a simple HTML static site that displays NZMC complaints against Crux News.

## Structure

The site has three main sections in the left-hand navigation:

### 1. NZMC Complaints
Lists all formal NZMC complaints (2891, 2895, 2940, 3012, 3356) with:
- Links to the official NZMC complaint
- Links to the Crux article republish
- Brief summary of the complaint and findings

### 2. Principles
Lists the four priority NZMC principles:
- P1 - Accuracy, Fairness and Balance
- P4 - Comment and Fact
- P6 - Headlines and Captions
- P10 - Conflicts of Interest

Each principle page shows:
- The principle overview
- Links to all assessments that breach that principle

### 3. Assessments/Articles
Lists all article assessments/reviews with:
- The original article (in a frame)
- The assessment/review
- Links to related principles

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling
- `app.js` - Application logic and rendering
- `config.js` - GitHub repository configuration
- `siteIndex.js` - Content index (list of all complaints, principles, and assessments)

## How to Update Content

### Adding a new NZMC Complaint
Edit `siteIndex.js` and add to the `complaints` array:
```javascript
{ 
  key: '3400', 
  number: '3400',
  title: 'Short Title', 
  path: 'NZMC Complaints/3400.md',
  nzmcUrl: 'https://www.mediacouncil.org.nz/rulings/case-3400',
  cruxUrl: 'https://cruxnews.co.nz/article-url'
}
```

### Adding a new Assessment
Edit `siteIndex.js` and add to the `assessments` array:
```javascript
{
  key: 'unique-key',
  title: 'Display Title',
  path: 'Assessment_articles/filename_Review.md',
  articlePath: 'Crux Articles/filename.md',
  principles: ['p1', 'p4', 'p6', 'p10']  // which principles it breaches
}
```

### Adding a new Principle
Edit `siteIndex.js` and add to the `principles` array:
```javascript
{ 
  key: 'p7', 
  title: 'P7 - Principle Name', 
  path: 'principels_Artciles/P7_Overview.md' 
}
```

## Viewing Locally

Simply open `index.html` in a web browser. The site fetches content from GitHub, so you need an internet connection.

## GitHub Pages

This site is designed to work with GitHub Pages. Once pushed to GitHub, it will be available at:
`https://cruxsucks.github.io/exposed/`

