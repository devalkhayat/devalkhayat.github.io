// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

function setMenuOpen(open) {
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
}

hamburger.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('active'));
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
});

// Navbar scroll effect and active section highlighting
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('main > section');
const navLinks = document.querySelectorAll('.nav-menu a');

// Close mobile menu when tapping outside the header
document.addEventListener('click', event => {
    if (navMenu.classList.contains('active') && !navbar.contains(event.target)) {
        setMenuOpen(false);
    }
});

function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = 'home';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) {
            current = section.id;
        }
    });
    // Contact may never reach the threshold above, but Experience can also land at the page bottom when clicked
    if (atBottom && window.location.hash !== '#experience') {
        current = 'contact';
    }

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
    });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('hashchange', onScroll);
onScroll();

// Builds a row of pagination dots; returns a function that highlights one
function renderDots(container, count, label, onSelect) {
    container.replaceChildren();
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot';
        dot.setAttribute('aria-label', `${label} ${i + 1} of ${count}`);
        dot.addEventListener('click', () => onSelect(i));
        container.appendChild(dot);
    }
    container.hidden = count < 2;

    return index => {
        [...container.children].forEach((dot, i) => {
            dot.classList.toggle('is-active', i === index);
            if (i === index) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    };
}

// Project filters, pagination and "View All"
const projectCards = [...document.querySelectorAll('.project-card')];
const filterButtons = document.querySelectorAll('.filter');
const projectDots = document.getElementById('project-dots');
const projectsToggle = document.getElementById('projects-toggle');
const projectsMore = document.getElementById('projects-more');
const projectState = { filter: 'all', page: 0, showAll: false };

function projectsPerPage() {
    return window.matchMedia('(max-width: 1024px)').matches ? 2 : 3;
}

function renderProjects() {
    const matching = projectCards.filter(card =>
        projectState.filter === 'all' || card.dataset.category === projectState.filter
    );
    const perPage = projectsPerPage();
    const pageCount = projectState.showAll ? 1 : Math.ceil(matching.length / perPage);
    projectState.page = Math.min(projectState.page, pageCount - 1);

    const start = projectState.page * perPage;
    const visible = projectState.showAll ? matching : matching.slice(start, start + perPage);
    projectCards.forEach(card => {
        card.hidden = !visible.includes(card);
    });

    const highlight = renderDots(projectDots, pageCount, 'Projects page', page => {
        projectState.page = page;
        renderProjects();
    });
    highlight(projectState.page);

    projectsToggle.firstElementChild.textContent = projectState.showAll ? 'Show Fewer Projects' : 'View All Projects';
    projectsToggle.setAttribute('aria-expanded', String(projectState.showAll));
    projectsMore.hidden = !projectState.showAll;
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(other => {
            const isSelected = other === button;
            other.classList.toggle('is-active', isSelected);
            other.setAttribute('aria-pressed', String(isSelected));
        });
        projectState.filter = button.dataset.filter;
        projectState.page = 0;
        renderProjects();
        // On mobile the chip may be partly off-screen in the scrolling row
        button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
});

projectsToggle.addEventListener('click', () => {
    projectState.showAll = !projectState.showAll;
    projectState.page = 0;
    renderProjects();
});

renderProjects();

// Carousels: native scroll-snap handles touch, the buttons and dots drive it
function createCarousel(name, dotLabel) {
    const track = document.getElementById(`${name}-track`);
    const prev = document.getElementById(`${name}-prev`);
    const next = document.getElementById(`${name}-next`);
    const dots = document.getElementById(`${name}-dots`);
    let highlightDot = () => {};
    let pageCount = 1;
    let pageWidth = 1;

    function scrollToPage(page) {
        track.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
    }

    function currentPage() {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 2) return pageCount - 1;
        return Math.round(track.scrollLeft / pageWidth);
    }

    function updateControls() {
        const page = currentPage();
        highlightDot(page);
        prev.disabled = page === 0;
        next.disabled = page >= pageCount - 1;
    }

    function setup() {
        const items = track.children;
        const itemWidth = items[1].offsetLeft - items[0].offsetLeft;
        const perPage = Math.max(1, Math.round(track.clientWidth / itemWidth));
        pageWidth = perPage * itemWidth;
        pageCount = Math.ceil(items.length / perPage);
        highlightDot = renderDots(dots, pageCount, dotLabel, scrollToPage);
        updateControls();
    }

    prev.addEventListener('click', () => scrollToPage(currentPage() - 1));
    next.addEventListener('click', () => scrollToPage(currentPage() + 1));
    track.addEventListener('scroll', updateControls, { passive: true });
    setup();

    return setup;
}

const carouselSetups = [
    createCarousel('skills', 'Technologies page'),
    createCarousel('experience', 'Experience page')
];

// Fade cards in as they enter the view; the delay staggers neighbouring cards
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-grid, .carousel-track, .timeline, .detail-grid, .contact-cards').forEach(group => {
    [...group.children].forEach((item, index) => {
        const card = item.matches('.timeline-item') ? item.querySelector('.timeline-card')
            : item.querySelector('.contact-card') || item;
        card.style.setProperty('--reveal-delay', `${(index % 4) * 0.08}s`);
        card.classList.add('reveal');
        revealObserver.observe(card);
    });
});

// Full experience panel
const experienceToggle = document.getElementById('experience-toggle');
const experienceFull = document.getElementById('experience-full');

function setExperienceOpen(open) {
    experienceFull.hidden = !open;
    experienceToggle.setAttribute('aria-expanded', String(open));
    experienceToggle.firstElementChild.textContent = open ? 'Hide Full Experience' : 'View Full Experience';
}

experienceToggle.addEventListener('click', () => setExperienceOpen(experienceFull.hidden));

// Education moved into the panel, so the old #education link has to open it first
if (window.location.hash === '#education') {
    setExperienceOpen(true);
    document.getElementById('education').scrollIntoView();
}

let resizeTimer;
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    // A phone's address bar changes the height while scrolling; rebuilding then makes the dots flicker
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        renderProjects();
        carouselSetups.forEach(setup => setup());
    }, 150);
});
