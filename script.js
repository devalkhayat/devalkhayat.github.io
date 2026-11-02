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

// Project filters and Previous / Next pages; each filter remembers its own page
const projectCards = [...document.querySelectorAll('.project-card')];
const filterButtons = document.querySelectorAll('.filter');
const projectCarousel = document.getElementById('project-carousel');
const projectPrev = document.getElementById('projects-prev');
const projectNext = document.getElementById('projects-next');
const projectDots = document.getElementById('project-dots');
const projectState = { filter: 'all', pages: {} };

function projectsPerPage() {
    if (window.matchMedia('(max-width: 640px)').matches) return 1;
    return window.matchMedia('(max-width: 1024px)').matches ? 2 : 3;
}

function showProjectPage(page) {
    projectState.pages[projectState.filter] = page;
    renderProjects();
}

function renderProjects() {
    const matching = projectCards.filter(card =>
        projectState.filter === 'all' || card.dataset.category === projectState.filter
    );
    const perPage = projectsPerPage();
    const pageCount = Math.ceil(matching.length / perPage);
    const page = Math.min(projectState.pages[projectState.filter] || 0, pageCount - 1);
    projectState.pages[projectState.filter] = page;

    const start = page * perPage;
    const visible = matching.slice(start, start + perPage);
    projectCards.forEach(card => {
        card.hidden = !visible.includes(card);
    });

    projectPrev.disabled = page === 0;
    projectNext.disabled = page >= pageCount - 1;
    projectCarousel.classList.toggle('is-single', pageCount < 2);
    const highlight = renderDots(projectDots, pageCount, 'Projects page', showProjectPage);
    highlight(page);
}

projectPrev.addEventListener('click', () => showProjectPage(projectState.pages[projectState.filter] - 1));
projectNext.addEventListener('click', () => showProjectPage(projectState.pages[projectState.filter] + 1));

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(other => {
            const isSelected = other === button;
            other.classList.toggle('is-active', isSelected);
            other.setAttribute('aria-pressed', String(isSelected));
        });
        projectState.filter = button.dataset.filter;
        renderProjects();
        // On mobile the chip may be partly off-screen in the scrolling row
        button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
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

document.querySelectorAll('.project-grid, .carousel-track, .timeline, .contact-cards').forEach(group => {
    [...group.children].forEach((item, index) => {
        const card = item.matches('.timeline-item') ? item.querySelector('.timeline-card')
            : item.querySelector('.contact-card') || item;
        card.style.setProperty('--reveal-delay', `${(index % 4) * 0.08}s`);
        card.classList.add('reveal');
        revealObserver.observe(card);
    });
});

// Experience details popup: copies the matching hidden card into a dialog
const detailsDialog = document.getElementById('details-dialog');
const detailsTitle = document.getElementById('details-title');
const detailsBody = document.getElementById('details-body');
let detailsTrigger = null;

function openDetails(sourceId, trigger) {
    if (detailsDialog.open) return;
    const source = document.getElementById(sourceId);
    const cards = source.matches('.detail-card') ? [source] : [...source.querySelectorAll('.detail-card')];
    // A single job uses its company name as the title; a group keeps each card's heading
    detailsTitle.textContent = source.dataset.title || cards[0].querySelector('h3').textContent;
    detailsBody.replaceChildren(...cards.map(card => {
        const section = document.createElement('section');
        section.className = 'details-section';
        [...card.children].forEach(child => {
            if (cards.length > 1 || !child.matches('h3')) {
                section.append(child.cloneNode(true));
            }
        });
        return section;
    }));

    detailsTrigger = trigger;
    // Locking the page hides its scrollbar, so padding takes its place and nothing shifts
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    document.documentElement.classList.add('dialog-open');
    detailsDialog.showModal();
    detailsBody.scrollTop = 0;
}

document.querySelectorAll('[data-details]').forEach(link => {
    link.addEventListener('click', () => openDetails(link.dataset.details, link));
});

// The bottom sheet slides away before the dialog really closes; with no exit animation it closes at once
function closeDetails() {
    if (!detailsDialog.open || detailsDialog.classList.contains('is-closing')) return;
    detailsDialog.classList.add('is-closing');
    Promise.all(detailsDialog.getAnimations().map(animation => animation.finished))
        .catch(() => {})
        .then(() => detailsDialog.close());
}

document.getElementById('details-close').addEventListener('click', closeDetails);

// Escape would close the dialog instantly, so it goes through the same animation
detailsDialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDetails();
});

// A click that lands on the dialog itself is on the backdrop outside the panel
detailsDialog.addEventListener('click', event => {
    if (event.target === detailsDialog) {
        closeDetails();
    }
});

detailsDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialog-open');
    document.body.style.paddingRight = '';
    detailsDialog.classList.remove('is-closing');
    detailsDialog.style.transform = '';
    if (detailsTrigger) {
        detailsTrigger.focus({ preventScroll: true });
        detailsTrigger = null;
    }
});

// Bottom sheet: dragging the header down far enough closes it
const detailsHead = detailsDialog.querySelector('.details-head');
let dragStart = null;

detailsHead.addEventListener('pointerdown', event => {
    if (!window.matchMedia('(max-width: 640px)').matches || event.target.closest('button')) return;
    dragStart = event.clientY;
    detailsHead.setPointerCapture(event.pointerId);
    detailsDialog.style.transition = 'none';
});

detailsHead.addEventListener('pointermove', event => {
    if (dragStart === null) return;
    detailsDialog.style.transform = `translateY(${Math.max(0, event.clientY - dragStart)}px)`;
});

function endDrag(event) {
    if (dragStart === null) return;
    const distance = event.clientY - dragStart;
    dragStart = null;
    detailsDialog.style.transition = '';
    if (distance > 80) {
        closeDetails();
    } else {
        detailsDialog.style.transform = '';
    }
}

detailsHead.addEventListener('pointerup', endDrag);
detailsHead.addEventListener('pointercancel', endDrag);

// Education moved into the details popup, so the old #education link opens it
if (window.location.hash === '#education') {
    openDetails('details-more', null);
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
