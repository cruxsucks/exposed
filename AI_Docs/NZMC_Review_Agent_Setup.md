# NZMC Media Review Agent Setup

## Overview
This system uses a specialized Claude agent to review media articles against New Zealand Media Council (NZMC) standards and ethical journalism principles.

## Directory Structure
```
Media Complaint/
├── NZMC DOCS/              # NZMC reference documents
│   ├── Statement of principals.md
│   ├── Complains Procedure.md
│   └── Media Complaint Process.md
├── Crux Articles/          # Articles to be reviewed
├── Reviews/                # Generated review reports (output)
├── ReviewContext.MD        # Background context for reviews
└── .claude/
    ├── agents/
    │   └── nzmc-media-reviewer.json
    └── commands/
        └── review-article.md
```

## How to Use

### Method 1: Using the Task Tool (Recommended)
Ask Claude to review an article using the NZMC agent:

```
"Please use the nzmc-media-reviewer agent to review [Article.md] and create a review report in the Reviews directory"
```

### Method 2: Direct Request
Simply ask Claude to review an article:

```
"Review the article CruxArticle1.md against NZMC standards and create a review in the Reviews folder"
```

Claude will:
1. Read the article file
2. Load ReviewContext.MD for background
3. Reference NZMC standards from "NZMC DOCS"
4. Analyze against all relevant NZMC principles
5. Generate `Reviews/CruxArticle1_Review.md`

## Review Output Format
Each review will include:
- **Article Summary**: Brief overview of the content
- **Context Considerations**: Relevant background from ReviewContext.MD
- **NZMC Standards Analysis**: Evaluation against each relevant principle
- **Potential Breaches**: Specific violations with evidence
- **Recommendations**: Suggested actions or complaint grounds
- **Supporting Evidence**: Quotes and references from the article

## NZMC Principles Covered
1. **Accuracy, Fairness and Balance**: Truthfulness and fair representation
2. **Privacy**: Respect for personal privacy vs public interest
3. **Children and Young People**: Special protections
4. **Comment and Fact**: Clear distinction between opinion and fact
5. **Headlines and Captions**: Accuracy in titles and images
6. **Discrimination and Diversity**: Appropriate handling of sensitive topics
7. **Conflicts of Interest**: Disclosure of relationships and sponsorships
8. **Photographs and Graphics**: Ethical image use and manipulation

## ReviewContext.MD Purpose
This file should contain:
- Background information about the publication
- Historical context or patterns of behavior
- Electoral or political context
- Advertising relationships
- Previous complaints or issues
- Any other relevant background for the review

## Tips for Best Results
1. Keep ReviewContext.MD updated with relevant background
2. Ensure article files are in markdown format
3. Use descriptive filenames for articles
4. Review multiple articles to identify patterns
5. Combine reviews when filing formal complaints to NZMC

## Example Workflow
1. Save article as `Crux Articles/Article1.md`
2. Update `ReviewContext.MD` with any relevant background
3. Ask Claude: "Review Article1.md against NZMC standards"
4. Find output in `Reviews/Article1_Review.md`
5. Use review as basis for formal NZMC complaint

## Next Steps
Once you have reviews generated, you can:
- Compile multiple reviews to show patterns
- Use reviews to draft formal complaints
- Reference specific NZMC principle breaches
- Submit to publishers first (required by NZMC procedure)
- Escalate to NZMC if publisher response is inadequate
