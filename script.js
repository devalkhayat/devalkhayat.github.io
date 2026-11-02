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


// Distance from an element down to a positioned ancestor, ignoring transforms such as the hover lift
function offsetTopWithin(element, ancestor) {
    let top = 0;
    while (element && element !== ancestor) {
        top += element.offsetTop;
        element = element.offsetParent;
    }
    return top;
}

// Carousels: native scroll-snap handles swipes, the arrows step a page and the counter shows where you are
function createCarousel(name, label) {
    const track = document.getElementById(`${name}-track`);
    const carousel = track.closest('.carousel');
    const prev = document.getElementById(`${name}-prev`);
    const next = document.getElementById(`${name}-next`);
    const count = document.getElementById(`${name}-count`);
    let pageCount = 1;
    let pageWidth = 1;
    let perPage = 1;
    // Index of the first card in view, kept so a resize or a filter change can return to it
    let anchor = 0;
    let frozen = false;

    const visibleItems = () => [...track.children].filter(item => !item.hidden);

    function scrollToPage(page) {
        track.scrollTo({ left: page * pageWidth, behavior: 'smooth' });
    }

    function currentPage() {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 0 && track.scrollLeft >= maxScroll - 2) return pageCount - 1;
        return Math.min(Math.round(track.scrollLeft / pageWidth), pageCount - 1);
    }

    function updateControls() {
        // While the width is changing the old page size no longer matches the cards
        if (frozen) return;
        const page = currentPage();
        anchor = page * perPage;
        prev.disabled = page === 0;
        next.disabled = page >= pageCount - 1;
        count.textContent = `${page + 1} / ${pageCount}`;
        count.setAttribute('aria-label', `${label} ${page + 1} of ${pageCount}`);
    }

    function setup(startIndex = anchor) {
        const items = visibleItems();
        const itemWidth = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
        perPage = Math.max(1, Math.round(track.clientWidth / itemWidth));
        pageWidth = perPage * itemWidth;
        pageCount = Math.max(1, Math.ceil(items.length / perPage));
        track.scrollLeft = Math.min(Math.floor(startIndex / perPage), pageCount - 1) * pageWidth;
        frozen = false;

        // Arrows line up with the middle of the cards, not the dates under the timeline
        const card = items[0] && (items[0].querySelector('.timeline-card') || items[0]);
        if (card) {
            let arrowY = offsetTopWithin(card, carousel) + card.offsetHeight / 2;
            // On phones the arrows overlap the card edges, so they stay below a project's screenshot
            const media = card.querySelector('.project-media');
            if (media && window.matchMedia('(max-width: 640px)').matches) {
                arrowY = Math.max(arrowY, offsetTopWithin(media, carousel) + media.offsetHeight + 24);
            }
            carousel.style.setProperty('--arrow-y', `${arrowY}px`);
        }
        updateControls();
    }

    prev.addEventListener('click', () => scrollToPage(currentPage() - 1));
    next.addEventListener('click', () => scrollToPage(currentPage() + 1));
    track.addEventListener('scroll', updateControls, { passive: true });
    setup(0);

    return {
        setup,
        freeze: () => { frozen = true; },
        anchor: () => anchor
    };
}

const projectCarousel = createCarousel('projects', 'Project');
const carousels = [
    projectCarousel,
    createCarousel('skills', 'Technologies page'),
    createCarousel('experience', 'Experience')
];

// Project filters; each filter remembers where its carousel was left
const projectCards = [...document.querySelectorAll('.project-card')];
const filterButtons = document.querySelectorAll('.filter');
const projectAnchors = {};
let projectFilter = 'all';

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(other => {
            const isSelected = other === button;
            other.classList.toggle('is-active', isSelected);
            other.setAttribute('aria-pressed', String(isSelected));
        });
        projectAnchors[projectFilter] = projectCarousel.anchor();
        projectFilter = button.dataset.filter;
        projectCards.forEach(card => {
            card.hidden = projectFilter !== 'all' && card.dataset.category !== projectFilter;
        });
        projectCarousel.setup(projectAnchors[projectFilter] || 0);
        // On mobile the chip may be partly off-screen in the scrolling row
        button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
});

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
const detailsPanel = document.getElementById('details-panel');
const detailsTitle = document.getElementById('details-title');
const detailsSubtitle = document.getElementById('details-subtitle');
const detailsBody = document.getElementById('details-body');
const detailsScrim = detailsDialog.querySelector('.details-scrim');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let detailsTrigger = null;
let closeTimer = null;

function openDetails(sourceId, trigger) {
    if (detailsDialog.open) return;
    const source = document.getElementById(sourceId);
    const single = source.matches('.detail-card');
    const cards = single ? [source] : [...source.querySelectorAll('.detail-card')];
    // A single job puts its company and role line in the header; a group keeps each card's heading
    detailsTitle.textContent = single ? source.querySelector('h3').textContent : source.dataset.title;
    detailsSubtitle.textContent = single ? source.querySelector('.detail-meta').textContent : '';
    detailsSubtitle.hidden = !single;
    detailsBody.replaceChildren(...cards.map(card => {
        const section = document.createElement('section');
        section.className = 'details-section';
        [...card.children].forEach(child => {
            if (!single || !child.matches('h3, .detail-meta')) {
                section.append(child.cloneNode(true));
            }
        });
        return section;
    }));

    detailsTrigger = trigger;
    // Locking the page hides its scrollbar, so padding takes its place and nothing shifts
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    document.documentElement.classList.add('dialog-open');
    const pageY = window.scrollY;
    detailsDialog.showModal();
    // Browsers without overflow: clip may still scroll to the focused close button; undo that
    detailsDialog.scrollTop = 0;
    if (window.scrollY !== pageY) window.scrollTo(0, pageY);
    detailsBody.scrollTop = 0;
    if (reducedMotion.matches) {
        detailsDialog.classList.add('is-open');
        return;
    }
    // Browsers only draw what is on screen. The panel is drawn once where it will end up, almost transparent,
    // then moved to its start and slid in; without this the first frames of the slide show nothing
    detailsDialog.classList.add('is-preparing');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!detailsDialog.open || closeTimer) return;
        detailsPanel.style.transition = 'none';
        detailsDialog.classList.remove('is-preparing');
        detailsPanel.getBoundingClientRect();
        detailsPanel.style.transition = '';
        requestAnimationFrame(() => {
            if (detailsDialog.open && !closeTimer) detailsDialog.classList.add('is-open');
        });
    }));
}

// The panel animates out first; the dialog only closes once that has finished
function closeDetails() {
    if (!detailsDialog.open || closeTimer) return;
    detailsDialog.classList.remove('is-open', 'is-preparing');
    detailsPanel.style.transform = '';
    detailsScrim.style.opacity = '';
    if (reducedMotion.matches) {
        detailsDialog.close();
        return;
    }
    const finish = () => {
        detailsPanel.removeEventListener('transitionend', onEnd);
        clearTimeout(closeTimer);
        closeTimer = null;
        detailsDialog.close();
    };
    const onEnd = event => {
        if (event.target === detailsPanel && event.propertyName === 'transform') finish();
    };
    detailsPanel.addEventListener('transitionend', onEnd);
    // In case the transition is skipped, for example in a background tab
    closeTimer = setTimeout(finish, 450);
}

document.querySelectorAll('[data-details]').forEach(link => {
    link.addEventListener('click', () => openDetails(link.dataset.details, link));
});

document.getElementById('details-close').addEventListener('click', closeDetails);
detailsScrim.addEventListener('click', closeDetails);

// Escape would close the dialog instantly, so it goes through the same animation
detailsDialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDetails();
});

detailsDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialog-open');
    document.body.style.paddingRight = '';
    detailsDialog.classList.remove('is-open', 'is-preparing');
    detailsPanel.style.transform = '';
    detailsPanel.style.transition = '';
    detailsScrim.style.opacity = '';
    detailsScrim.style.transition = '';
    if (detailsTrigger) {
        detailsTrigger.focus({ preventScroll: true });
        detailsTrigger = null;
    }
});

// Bottom sheet: the header follows the finger; a long or quick pull down closes it
const detailsHead = detailsDialog.querySelector('.details-head');
let drag = null;

detailsHead.addEventListener('pointerdown', event => {
    if (!window.matchMedia('(max-width: 640px)').matches || event.target.closest('button') || closeTimer) return;
    drag = { y: event.clientY, time: event.timeStamp, distance: 0 };
    detailsHead.setPointerCapture(event.pointerId);
    detailsPanel.style.transition = 'none';
    detailsScrim.style.transition = 'none';
});

detailsHead.addEventListener('pointermove', event => {
    if (!drag) return;
    drag.distance = Math.max(0, event.clientY - drag.y);
    detailsPanel.style.transform = `translateY(${drag.distance}px)`;
    detailsScrim.style.opacity = String(1 - Math.min(1, drag.distance / detailsPanel.offsetHeight));
});

function endDrag(event) {
    if (!drag) return;
    const speed = drag.distance / Math.max(1, event.timeStamp - drag.time);
    const shouldClose = drag.distance > 80 || (drag.distance > 24 && speed > 0.5);
    drag = null;
    detailsPanel.style.transition = '';
    detailsScrim.style.transition = '';
    if (shouldClose) {
        closeDetails();
    } else {
        detailsPanel.style.transform = '';
        detailsScrim.style.opacity = '';
    }
}

detailsHead.addEventListener('pointerup', endDrag);
detailsHead.addEventListener('pointercancel', endDrag);

// Education moved into the details popup, so the old #education link opens it
if (window.location.hash === '#education') {
    openDetails('details-more', null);
}

// Web fonts and late images can change card heights, which moves the arrows' centre line
document.fonts.ready.then(() => carousels.forEach(carousel => carousel.setup()));
window.addEventListener('load', () => carousels.forEach(carousel => carousel.setup()));

let resizeTimer;
let lastWidth = window.innerWidth;
window.addEventListener('resize', () => {
    // A phone's address bar changes the height while scrolling; that needs no rebuild
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    // Keep each carousel's first card until the new layout has settled, then return to it
    carousels.forEach(carousel => carousel.freeze());
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => carousels.forEach(carousel => carousel.setup()), 150);
});
