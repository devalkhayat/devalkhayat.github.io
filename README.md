# Mohammed Alkhayat - Portfolio Website

A modern, responsive static portfolio website showcasing professional experience, technical skills, and projects.

## Features

- **Light Design**: Minimal light-mode UI with a portrait hero
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Interactive Navigation**: Sticky navbar with smooth scrolling to sections
- **Mobile Menu**: Hamburger menu for mobile devices
- **Project Showcase**: Filterable project carousel with Previous / Next arrows, swipe and a position counter; each filter keeps its own position
- **Skills Carousel**: Swipe, arrow, and keyboard navigation with a position counter
- **Experience Timeline**: Horizontal timeline (one card at a time on phones) with a details popup per job
- **Contact Integration**: Quick access to email, phone, LinkedIn, GitHub, and website

## File Structure

```
portfolio/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Interactive functionality
├── docs/           # Downloadable CV
├── images/         # Portrait, project screenshots, technology icons
└── README.md       # This file
```

## How to View

### Option 1: Direct File Opening
Simply open `index.html` in your web browser.

### Option 2: Using a Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Deployment

Pushing to `master` runs `.github/workflows/pages.yml`, which publishes the site to GitHub Pages. It links
`styles.css` and `script.js` with a `?v=` hash of their contents, so visitors get matching new files right
after a deploy while unchanged files stay cached. The repository's Pages source must be set to
**GitHub Actions** (Settings → Pages).

## Sections

1. **Hero**: Name, title, introduction, and key statistics
2. **Selected Work**: Projects filterable by industry
3. **My Main Technologies**: Skills carousel
4. **Work Experience**: Horizontal timeline; each card's Show Details opens a popup (a bottom sheet on phones), and a separate link opens skills, education, and languages
5. **Get In Touch**: Contact details and social links

## Technologies Used

- HTML5
- CSS3 (with CSS Grid, Flexbox, and scroll snap)
- Vanilla JavaScript (for interactivity)
- Google Fonts (Inter)

## Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

