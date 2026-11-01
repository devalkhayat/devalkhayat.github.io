# Mohammed Alkhayat - Portfolio Website

A modern, responsive static portfolio website showcasing professional experience, technical skills, and projects.

## Features

- **Light Design**: Minimal light-mode UI with a portrait hero
- **Fully Responsive**: Works on desktop, tablet, and mobile devices
- **Interactive Navigation**: Sticky navbar with smooth scrolling to sections
- **Mobile Menu**: Hamburger menu for mobile devices
- **Project Showcase**: Filterable project cards with a View All option
- **Skills Carousel**: Swipe, arrow, dot, and keyboard navigation
- **Experience Timeline**: Horizontal timeline with an expandable full history
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

## Sections

1. **Hero**: Name, title, introduction, and key statistics
2. **Selected Work**: Projects filterable by industry
3. **My Main Technologies**: Skills carousel
4. **Work Experience**: Horizontal timeline; the full view adds detailed history, skills, education, and languages
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

