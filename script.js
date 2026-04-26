// Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Add a slight delay for aesthetic purposes so the smooth animation is seen
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600); // Wait for transition to finish
        }, 500);
    }
});

let canvas, ctx, lenis;

try {
    // --- SMOOTH SCROLLING (LENIS) ---
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    if (lenis) {
        window.airlinkLenis = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
} catch (e) {
    console.error("Lenis init failed:", e);
    document.documentElement.classList.add('no-lenis');
}

// --- CANVAS SETUP ---
canvas = document.getElementById('canvas-mesh');
if (canvas) {
    ctx = canvas.getContext('2d');
}
const navbar = document.getElementById('navbar');

// --- DYNAMIC THEME MANAGER ---
window.airlinkThemes = {
    oceanic: {
        primary: '#00F2FF',
        secondary: '#7000FF',
        glow: 'rgba(0, 242, 255, 0.3)',
        rgb: '0, 242, 255',
        secondaryRgb: '112, 0, 255'
    },
    amethyst: {
        primary: '#A020F0',
        secondary: '#FF00D4',
        glow: 'rgba(160, 32, 240, 0.3)',
        rgb: '160, 32, 240',
        secondaryRgb: '255, 0, 212'
    },
    emerald: {
        primary: '#00FF88',
        secondary: '#00A3FF',
        glow: 'rgba(0, 255, 136, 0.3)',
        rgb: '0, 255, 136',
        secondaryRgb: '0, 163, 255'
    },
    solar: {
        primary: '#FFD700',
        secondary: '#FF4D00',
        glow: 'rgba(255, 215, 0, 0.3)',
        rgb: '255, 215, 0',
        secondaryRgb: '255, 77, 0'
    }
};

window.currentThemeKey = localStorage.getItem('airlink-theme') || 'oceanic';

// Initialize lerp states
window.currentThemeRgbArray = window.airlinkThemes[window.currentThemeKey].rgb.split(',').map(Number);
window.currentThemeSecondaryRgbArray = window.airlinkThemes[window.currentThemeKey].secondaryRgb.split(',').map(Number);

window.airlinkLerp = {
    primaryRgb: window.airlinkThemes[window.currentThemeKey].rgb,
    secondaryRgb: window.airlinkThemes[window.currentThemeKey].secondaryRgb,
    primary: `rgb(${window.airlinkThemes[window.currentThemeKey].rgb})`,
    secondary: `rgb(${window.airlinkThemes[window.currentThemeKey].secondaryRgb})`
};

let isThemeLerpActive = true;
function themeLerpLoop() {
    if (!isThemeLerpActive) return;

    const targetTheme = window.airlinkThemes[window.currentThemeKey];
    const targetRgb = targetTheme.rgb.split(',').map(Number);
    const targetSecRgb = targetTheme.secondaryRgb.split(',').map(Number);

    let changed = false;
    const lerpFactor = 0.05;

    for (let i = 0; i < 3; i++) {
        const diff1 = targetRgb[i] - window.currentThemeRgbArray[i];
        if (Math.abs(diff1) > 0.1) {
            window.currentThemeRgbArray[i] += diff1 * lerpFactor;
            changed = true;
        } else {
            window.currentThemeRgbArray[i] = targetRgb[i];
        }

        const diff2 = targetSecRgb[i] - window.currentThemeSecondaryRgbArray[i];
        if (Math.abs(diff2) > 0.1) {
            window.currentThemeSecondaryRgbArray[i] += diff2 * lerpFactor;
            changed = true;
        } else {
            window.currentThemeSecondaryRgbArray[i] = targetSecRgb[i];
        }
    }

    if (changed) {
        const r1 = Math.round(window.currentThemeRgbArray[0]);
        const g1 = Math.round(window.currentThemeRgbArray[1]);
        const b1 = Math.round(window.currentThemeRgbArray[2]);
        window.airlinkLerp.primaryRgb = `${r1}, ${g1}, ${b1}`;
        window.airlinkLerp.primary = `rgb(${r1}, ${g1}, ${b1})`;

        const r2 = Math.round(window.currentThemeSecondaryRgbArray[0]);
        const g2 = Math.round(window.currentThemeSecondaryRgbArray[1]);
        const b2 = Math.round(window.currentThemeSecondaryRgbArray[2]);
        window.airlinkLerp.secondaryRgb = `${r2}, ${g2}, ${b2}`;
        window.airlinkLerp.secondary = `rgb(${r2}, ${g2}, ${b2})`;
    } else {
        isThemeLerpActive = false; // Pause loop when colors are stable
    }

    requestAnimationFrame(themeLerpLoop);
}
// Start lerp loop
themeLerpLoop();

function applyTheme(themeKey, save = true) {
    const theme = window.airlinkThemes[themeKey];
    if (!theme) return;

    window.currentThemeKey = themeKey;
    isThemeLerpActive = true; // Re-active loop when theme changes

    document.body.classList.add('theme-transition');

    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-glow', theme.glow);

    if (save) localStorage.setItem('airlink-theme', themeKey);

    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 600);
}

function cycleTheme() {
    const themeKeys = Object.keys(window.airlinkThemes);
    const currentIndex = themeKeys.indexOf(window.currentThemeKey);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    applyTheme(themeKeys[nextIndex]);
}

// Initialize Theme early
applyTheme(window.currentThemeKey, false);

// Event Listeners for Theme Switcher
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', cycleTheme);
    }
});

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let mouse = { x: undefined, y: undefined };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Particle Class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.originalX = this.x;
        this.originalY = this.y;
    }

    update() {
        // Cursor Reaction
        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                this.x -= dx / 10;
                this.y -= dy / 10;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        const disaster = window.isDisasterMode;
        ctx.beginPath();
        ctx.arc(this.x, this.y, disaster ? this.size * 1.8 : this.size, 0, Math.PI * 2);
        const rgb = window.airlinkLerp.primaryRgb;
        ctx.fillStyle = disaster ? `rgba(${rgb}, 0.95)` : `rgba(${rgb}, 0.5)`;
        if (disaster) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = window.airlinkLerp.primary;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

const particles = Array.from({ length: window.innerWidth < 768 ? 40 : 80 }, () => new Particle());
let isCanvasPaused = true; // Start paused, IntersectionObserver will handle it

function animate() {
    if (isCanvasPaused) {
        requestAnimationFrame(animate);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.update();
        p.draw();

        // Draw connections between particles
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const disaster = window.isDisasterMode;
                const alpha = disaster ? 0.45 * (1 - dist / 150) : 0.15 * (1 - dist / 150);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                const rgb = window.airlinkLerp.primaryRgb;
                ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
                ctx.lineWidth = disaster ? 1.5 : 1;
                ctx.stroke();
            }
        }

        // --- NEW: Draw connections to Mouse (Advanced Cursor Plugin) ---
        if (mouse.x && mouse.y) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < 180) {
                const alpha = 0.3 * (1 - mdist / 180);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                const rgb = window.airlinkLerp.primaryRgb;
                ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animate);
}

// Intersection Observer for Background Canvas
const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        isCanvasPaused = !entry.isIntersecting;
    });
}, { threshold: 0.1 });
canvasObserver.observe(canvas);

animate();

// --- PREMIUM NAVBAR LOGIC ---
const navIndicator = document.getElementById('nav-indicator');
const navLinksItems = document.querySelectorAll('.nav-link');
const navBorderPath = document.getElementById('nav-border-path');
const navBorderTrack = document.getElementById('nav-border-track');

function updateNavIndicator(element) {
    if (!navIndicator || !element) return;
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement.getBoundingClientRect();

    navIndicator.style.width = `${rect.width}px`;
    navIndicator.style.left = `${rect.left - parentRect.left}px`;
}

// Initialize indicator on active link
const activeNavLink = document.querySelector('.nav-link.active');
if (activeNavLink) {
    // Small delay to ensure layout is ready
    setTimeout(() => updateNavIndicator(activeNavLink), 150);
}

// Hover effects for indicator
navLinksItems.forEach(link => {
    link.addEventListener('mouseenter', () => updateNavIndicator(link));
    link.addEventListener('mouseleave', () => {
        const active = document.querySelector('.nav-link.active');
        if (active) updateNavIndicator(active);
    });
});

// Logo Click - Scroll to Top
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', (e) => {
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
            e.preventDefault();
            lenis.scrollTo(0, {
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
}

// Update indicator on resize
window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-link.active');
    if (active) updateNavIndicator(active);
});


// --- PREMIUM SCROLL ANIMATIONS ---
function initPremiumScrollAnimations() {
    const heroMocks = document.querySelectorAll('.hero-image .phone-frame');
    const focusSections = document.querySelectorAll('.focus-reveal');
    const scrollGlows = document.querySelectorAll('.scroll-glow');
    const scrollTracks = document.querySelectorAll('.scroll-content.horizontal');
    const navbar = document.getElementById('navbar');
    const navBorderPath = document.getElementById('nav-border-path');
    const navBorderTrack = document.getElementById('nav-border-track');
    const navLinksItems = document.querySelectorAll('.nav-link');

    let lastScrollPos = window.pageYOffset || document.documentElement.scrollTop;
    let trackVelocity = 0;
    let isCheckingScroll = false; // Throttle flag

    // Performance optimization: only run when tab is visible
    let isTabVisible = true;
    document.addEventListener('visibilitychange', () => {
        isTabVisible = !document.hidden;
    });

    function animate() {
        if (!isTabVisible) {
            requestAnimationFrame(animate);
            return;
        }

        // Throttle check
        if (isCheckingScroll) {
            requestAnimationFrame(animate);
            return;
        }
        isCheckingScroll = true;
        setTimeout(() => { isCheckingScroll = false; }, 10);

        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const vh = window.innerHeight;

        // Velocity for tracks
        const delta = currentScrollY - lastScrollPos;
        trackVelocity = (trackVelocity + delta * 0.15) * 0.9;
        lastScrollPos = currentScrollY;

        // 1. Navbar & Scroll Progress (Restored Logic)
        if (navbar) {
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else if (!document.body.classList.contains('blog-page') &&
                !document.body.classList.contains('careers-page') &&
                !document.body.classList.contains('pricing-page') &&
                !document.body.classList.contains('legal-page')) {
                navbar.classList.remove('scrolled');
            }
        }

        if (navBorderPath && navbar) {
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (currentScrollY / height) * 100;

            // Dynamic Path & Dot Sync
            const rect = navbar.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const r = Math.min(w, h) / 2;

            // Custom Path: Start from top-center and go clockwise
            const d = `M ${w / 2},0 L ${w - r},0 A ${r},${r} 0 0 1 ${w},${r} L ${w},${h - r} A ${r},${r} 0 0 1 ${w - r},${h} L ${r},${h} A ${r},${r} 0 0 1 0,${h - r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 L ${w / 2},0`;

            navBorderPath.setAttribute('d', d);
            if (navBorderTrack) navBorderTrack.setAttribute('d', d);

            try {
                const pathLength = navBorderPath.getTotalLength();
                navBorderPath.style.strokeDasharray = pathLength;
                navBorderPath.style.strokeDashoffset = pathLength - (pathLength * (scrolled / 100));
            } catch (e) {
                // Total length might fail if SVG is not yet in DOM/rendered, but usually fine here
            }
        }

        // ScrollSpy logic integration
        const sections = document.querySelectorAll('section[id]');
        if (sections.length > 0 && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html'))) {
            let current = "";
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (currentScrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });

            if (current) {
                navLinksItems.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.includes('#' + current)) {
                        if (!link.classList.contains('active')) {
                            navLinksItems.forEach(l => l.classList.remove('active'));
                            link.classList.add('active');
                            if (typeof updateNavIndicator === 'function') updateNavIndicator(link);
                        }
                    }
                });
            }
        }

        // 2. Hero Parallax (only if near top)
        if (currentScrollY < vh * 1.2) {
            heroMocks.forEach(mock => {
                let speed = 0;
                if (mock.classList.contains('center')) speed = 0.12;
                else if (mock.classList.contains('left')) speed = 0.05;
                else if (mock.classList.contains('right')) speed = 0.08;

                const yOffset = currentScrollY * speed;
                mock.style.transform = getPhoneTransform(mock, yOffset);
            });
        }

        // 3. Focus Zone Scaling & Section Glows
        focusSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            const secCenter = rect.top + rect.height / 2;
            const viewCenter = vh / 2;
            const distance = Math.abs(secCenter - viewCenter);

            if (distance < vh * 0.35) {
                sec.classList.add('in-focus');
            } else {
                sec.classList.remove('in-focus');
            }
        });

        scrollGlows.forEach(glow => {
            const rect = glow.getBoundingClientRect();
            if (rect.top < vh * 0.7 && rect.bottom > vh * 0.3) {
                glow.classList.add('active');
            } else {
                glow.classList.remove('active');
            }
        });

        // 4. Track Shift (Supporters)
        scrollTracks.forEach((track, i) => {
            const direction = (i % 2 === 0) ? -1 : 1;
            track.style.setProperty('--scroll-offset', `${trackVelocity * direction}px`);
        });

        // 5. Signal Path Animation
        const signalPathActive = document.getElementById('signal-path-active');
        const signalPathSection = document.getElementById('how-it-works');
        if (signalPathActive && signalPathSection) {
            const rect = signalPathSection.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Calculate progress based on scroll position within the section
            let progress = (viewHeight * 0.8 - rect.top) / (rect.height + viewHeight * 0.4);
            progress = Math.max(0, Math.min(1, progress));

            const pathLength = 1000;
            signalPathActive.style.strokeDashoffset = pathLength * (1 - progress);
        }

        // 6. 3D Parallax Background Layers
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            const yOffset = currentScrollY * speed;
            layer.style.transform = `translateY(${yOffset}px)`;
        });

        requestAnimationFrame(animate);
    }

    // Helper to preserve base 3D transforms while adding parallax
    function getPhoneTransform(el, yOffset) {
        let base = '';
        if (el.classList.contains('left')) {
            base = `translateX(-160px) translateZ(-50px) rotateY(-20deg) rotateX(5deg) scale(0.85)`;
        } else if (el.classList.contains('right')) {
            base = `translateX(160px) translateZ(-50px) rotateY(20deg) rotateX(5deg) scale(0.85)`;
        } else if (el.classList.contains('center')) {
            base = `translateZ(100px)`;
        }

        return `${base} translateY(${yOffset}px)`;
    }

    requestAnimationFrame(animate);
}

// Initialize animations
if (document.readyState === 'complete') {
    initPremiumScrollAnimations();
} else {
    window.addEventListener('load', initPremiumScrollAnimations);
}

// Intersection Observer for Reveal Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    // Don't reveal elements while intro is playing
    if (document.body.classList.contains('intro-active')) return;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
}

// Testimonials Navigation Logic
const testimonialsGrid = document.getElementById('testimonials-grid');
const testimonialsPrev = document.getElementById('testimonial-prev');
const testimonialsNext = document.getElementById('testimonial-next');
const testimonialsDots = document.querySelectorAll('#testimonial-dots .dot');

if (testimonialsGrid && testimonialsPrev && testimonialsNext) {
    const cardStep = 420;

    testimonialsNext.addEventListener('click', () => {
        testimonialsGrid.scrollBy({ left: cardStep, behavior: 'smooth' });
    });

    testimonialsPrev.addEventListener('click', () => {
        testimonialsGrid.scrollBy({ left: -cardStep, behavior: 'smooth' });
    });

    const updateDots = () => {
        const scrollLeft = testimonialsGrid.scrollLeft;
        const maxScroll = testimonialsGrid.scrollWidth - testimonialsGrid.clientWidth;
        if (maxScroll <= 0) return;

        const scrollPosition = scrollLeft / maxScroll;
        const activeIndex = Math.min(Math.round(scrollPosition * (testimonialsDots.length - 1)), testimonialsDots.length - 1);

        testimonialsDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    };

    testimonialsGrid.addEventListener('scroll', updateDots);
    updateDots();

    testimonialsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const maxScroll = testimonialsGrid.scrollWidth - testimonialsGrid.clientWidth;
            const targetScroll = (index / (testimonialsDots.length - 1)) * maxScroll;
            testimonialsGrid.scrollTo({ left: targetScroll, behavior: 'smooth' });
        });
    });
}

// --- MESH ECOSYSTEM CONNECTIONS ---
function initMeshEcosystem() {
    const svg = document.getElementById('mesh-svg-connections');
    const hub = document.querySelector('.mesh-hub');
    const nodes = document.querySelectorAll('.mesh-node');
    const container = document.querySelector('.mesh-ecosystem');

    if (!svg || !hub || nodes.length === 0 || !container) return;

    function drawConnections() {
        // Only draw on desktop as mobile is stacked
        if (window.innerWidth < 992) {
            svg.innerHTML = '';
            return;
        }

        svg.innerHTML = `
            <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.05" />
                    <stop offset="50%" style="stop-color:var(--primary-color);stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:0.05" />
                </linearGradient>
            </defs>
        `;

        const containerRect = container.getBoundingClientRect();
        const hubCore = hub.querySelector('.hub-core') || hub;
        const hRect = hubCore.getBoundingClientRect();
        const hW = hRect.width || hubCore.offsetWidth || 120;
        const hH = hRect.height || hubCore.offsetHeight || 120;


        const hX = (hRect.left + hW / 2) - containerRect.left;
        const hY = (hRect.top + hH / 2) - containerRect.top;


        nodes.forEach(node => {
            const nRect = node.getBoundingClientRect();
            const nW = nRect.width || node.offsetWidth;
            const nH = nRect.height || node.offsetHeight;
            const nX = (nRect.left + nW / 2) - containerRect.left;
            const nY = (nRect.top + nH / 2) - containerRect.top;


            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", hX);
            line.setAttribute("y1", hY);
            line.setAttribute("x2", nX);
            line.setAttribute("y2", nY);
            line.setAttribute("stroke", "url(#line-grad)");
            line.setAttribute("stroke-width", "1.5");
            svg.appendChild(line);

            // Add a small pulse dot on the line
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("r", "2");
            dot.setAttribute("fill", "var(--primary-color)");
            dot.style.filter = "blur(1px)";

            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            anim.setAttribute("attributeName", "cx");
            anim.setAttribute("from", hX);
            anim.setAttribute("to", nX);
            anim.setAttribute("dur", (Math.random() * 2 + 2) + "s");
            anim.setAttribute("repeatCount", "indefinite");

            const animY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animY.setAttribute("attributeName", "cy");
            animY.setAttribute("from", hY);
            animY.setAttribute("to", nY);
            animY.setAttribute("dur", anim.getAttribute("dur"));
            animY.setAttribute("repeatCount", "indefinite");

            dot.appendChild(anim);
            dot.appendChild(animY);
            svg.appendChild(dot);
        });
    }

    // Use ResizeObserver for more robust redraws
    const ro = new ResizeObserver(() => {
        drawConnections();
    });
    ro.observe(container);

    // Initial draw with retries to ensure final positions are captured
    setTimeout(drawConnections, 500);
    setTimeout(drawConnections, 2000);
}

// Initialize on Load
window.addEventListener('load', () => {
    initMeshEcosystem();
});


// Smooth Scroll for local links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (typeof navLinks !== 'undefined' && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (typeof menuToggle !== 'undefined' && menuToggle) {
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        }

        const href = this.getAttribute('href');
        if (href === '#') {
            lenis.scrollTo(0);
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            lenis.scrollTo(target, {
                offset: 0,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});

// 3D Tilt & Interactive Spotlight Logic
const tiltElements = document.querySelectorAll('.feature-card, .tech-card, .use-case-card, .link-item, .supporter-tier, .certificate-container');
tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentages for CSS variables (Spotlight tracking)
        const mouseX = (x / rect.width) * 100;
        const mouseY = (y / rect.height) * 100;
        el.style.setProperty('--mouse-x', `${mouseX}%`);
        el.style.setProperty('--mouse-y', `${mouseY}%`);

        // 3D Tilt calculation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (centerY - y) / 15; // Slightly less aggressive tilt
        const rotateY = (x - centerX) / 15;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        // Spotlight resets automatically via CSS transition
    });
});

// --- ULTIMATE EDITION FEATURES ---

// Mesh Lab Simulator
const labCanvas = document.createElement('canvas');
const labSection = document.getElementById('mesh-lab-container');
if (labSection) {
    labSection.appendChild(labCanvas);
    const lctx = labCanvas.getContext('2d');
    let labNodes = [];

    function resizeLab() {
        labCanvas.width = labSection.offsetWidth;
        labCanvas.height = labSection.offsetHeight;
    }
    resizeLab();
    window.addEventListener('resize', resizeLab);

    let meshMode = 'random'; // 'random' or 'shape'

    class Node {
        constructor(x, y) {
            this.x = x || Math.random() * labCanvas.width;
            this.y = y || Math.random() * labCanvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.targetX = this.x;
            this.targetY = this.y;
            this.pulse = Math.random() * Math.PI * 2;
            this.flash = 0;
            this.delay = 0;
        }
        update() {
            if (meshMode === 'random') {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > labCanvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > labCanvas.height) this.vy *= -1;
            } else {
                if (this.delay > 0) {
                    this.delay--;
                    // Still move randomly while waiting
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0 || this.x > labCanvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > labCanvas.height) this.vy *= -1;
                } else {
                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < 0.5) {
                        this.x = this.targetX;
                        this.y = this.targetY;
                    } else {
                        // Custom words form faster for a "snappy" live typing feel
                        const speed = meshMode === 'text' ? 0.02 : 0.006;
                        // Jitter reduces as we get closer for a "clear" landing
                        const jitter = Math.min(d * 0.1, 0.1);
                        this.x += dx * speed + (Math.random() - 0.5) * jitter;
                        this.y += dy * speed + (Math.random() - 0.5) * jitter;
                    }
                }
            }
            if (this.flash > 0) this.flash -= 0.05;
        }
        draw() {
            this.pulse += 0.05;
            const isShape = meshMode !== 'random';
            const disaster = window.isDisasterMode;
            let r = (isShape ? 3 : 6) + Math.sin(this.pulse) * (isShape ? 1 : 2);
            if (this.flash > 0) r += this.flash * 8;
            if (disaster) r *= 1.6; // Nodes grow in disaster mode \u2014 they're alive!

            lctx.beginPath();
            lctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            lctx.fillStyle = this.flash > 0 ? `rgba(${window.airlinkLerp.primaryRgb}, ${0.5 + this.flash})` : window.airlinkLerp.primary;
            if (disaster) {
                lctx.shadowBlur = 25;
                lctx.shadowColor = window.airlinkLerp.primary;
            }
            lctx.fill();
            lctx.strokeStyle = `rgba(${window.airlinkLerp.primaryRgb}, ${disaster ? 0.6 : (isShape ? 0.1 : 0.2)})`;
            lctx.lineWidth = disaster ? 12 : (isShape ? 3 : 8);
            lctx.stroke();
            lctx.shadowBlur = 0;
        }
    }

    // --- SHAPE GENERATION ---
    window.setMeshShape = function (shape) {
        meshMode = shape;

        // --- MODE-SPECIFIC NODE COUNTS ---
        const targetCount = shape === 'random' ? 30 : 50;
        if (labNodes.length < targetCount) {
            const toAdd = targetCount - labNodes.length;
            for (let i = 0; i < toAdd; i++) labNodes.push(new Node());
        } else if (labNodes.length > targetCount) {
            labNodes.length = targetCount;
        }

        if (shape === 'random') return;

        const centerX = labCanvas.width / 2;
        const centerY = labCanvas.height / 2;
        const size = 180;

        labNodes.forEach((node, i) => {
            const t = (i / labNodes.length) * Math.PI * 2;
            let tx, ty;

            if (shape === 'heart') {
                tx = 16 * Math.pow(Math.sin(t), 3);
                ty = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                node.targetX = centerX + tx * 10;
                node.targetY = centerY + ty * 10;
            } else if (shape === 'logo') {
                // Stylized "Mesh Star" - Central hub with 6 radiating spokes
                const subIndex = i % 7; // 0=center, 1-6=spokes
                if (subIndex === 0) {
                    node.targetX = centerX + (Math.random() - 0.5) * 40;
                    node.targetY = centerY + (Math.random() - 0.5) * 40;
                } else {
                    const angle = ((subIndex - 1) / 6) * Math.PI * 2;
                    const hubDist = 120;
                    node.targetX = centerX + Math.cos(angle) * hubDist + (Math.random() - 0.5) * 30;
                    node.targetY = centerY + Math.sin(angle) * hubDist + (Math.random() - 0.5) * 30;
                }
            } else if (shape === 'triangle') {
                const side = i % 3;
                const p = (i / labNodes.length) * 3;
                if (p < 1) { // Base
                    node.targetX = centerX - size + (p * 2 * size);
                    node.targetY = centerY + size;
                } else if (p < 2) { // Right side
                    const p2 = p - 1;
                    node.targetX = centerX + size - (p2 * size);
                    node.targetY = centerY + size - (p2 * 2 * size);
                } else { // Left side
                    const p3 = p - 2;
                    node.targetX = centerX - (p3 * size);
                    node.targetY = centerY - size + (p3 * 2 * size);
                }
            } else if (shape === 'circle') {
                node.targetX = centerX + Math.cos(t) * size;
                node.targetY = centerY + Math.sin(t) * size;
            } else if (shape === 'grid') {
                const cols = 6;
                node.targetX = (centerX - 200) + (i % cols) * 80;
                node.targetY = (centerY - 150) + Math.floor(i / cols) * 80;
            } else if (shape === 'infinity') {
                const a = size + 50;
                const denom = 1 + Math.sin(t) * Math.sin(t);
                node.targetX = centerX + (a * Math.cos(t)) / denom;
                node.targetY = centerY + (a * Math.sin(t) * Math.cos(t)) / denom;
            } else if (shape === 'spiral') {
                const turns = 3;
                const p = i / labNodes.length;
                const currentRadius = p * size * 1.5;
                const currentAngle = p * Math.PI * 2 * turns;
                node.targetX = centerX + Math.cos(currentAngle) * currentRadius;
                node.targetY = centerY + Math.sin(currentAngle) * currentRadius;
            } else if (shape === 'star') {
                const p = i / labNodes.length;
                const numPoints = 5;
                const pointP = p * numPoints;
                const pointIndex = Math.floor(pointP);
                const localP = pointP - pointIndex;

                const outerRadius = size * 1.2;
                const innerRadius = size * 0.5;

                const angle1 = (pointIndex / numPoints) * Math.PI * 2 - Math.PI / 2;
                const angleHalf = ((pointIndex + 0.5) / numPoints) * Math.PI * 2 - Math.PI / 2;
                const angle2 = ((pointIndex + 1) / numPoints) * Math.PI * 2 - Math.PI / 2;

                if (localP < 0.5) {
                    const subP = localP * 2;
                    const x1 = Math.cos(angle1) * outerRadius;
                    const y1 = Math.sin(angle1) * outerRadius;
                    const x2 = Math.cos(angleHalf) * innerRadius;
                    const y2 = Math.sin(angleHalf) * innerRadius;
                    node.targetX = centerX + x1 + (x2 - x1) * subP;
                    node.targetY = centerY + y1 + (y2 - y1) * subP;
                } else {
                    const subP = (localP - 0.5) * 2;
                    const x1 = Math.cos(angleHalf) * innerRadius;
                    const y1 = Math.sin(angleHalf) * innerRadius;
                    const x2 = Math.cos(angle2) * outerRadius;
                    const y2 = Math.sin(angle2) * outerRadius;
                    node.targetX = centerX + x1 + (x2 - x1) * subP;
                    node.targetY = centerY + y1 + (y2 - y1) * subP;
                }
            }
        });
    };

    const textCanvas = document.createElement('canvas');
    const tctx = textCanvas.getContext('2d');

    window.setMeshText = function () {
        const input = document.getElementById('mesh-text-input');
        const text = input.value.trim() || 'AIRLINK';
        meshMode = 'text'; // Use distinct mode for faster formation

        // Use a font stack that prioritizes clean emojis
        tctx.font = 'bold 80px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Outfit", sans-serif';
        const textWidth = tctx.measureText(text.toUpperCase()).width;

        // Resize sampling canvas dynamically (Allow extra width for wider emojis)
        textCanvas.width = Math.max(textWidth + 150, 600);
        textCanvas.height = 180;

        tctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        tctx.fillStyle = 'white';
        tctx.font = 'bold 80px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Outfit", sans-serif';
        tctx.textAlign = 'center';
        tctx.textBaseline = 'middle';
        const cx = textCanvas.width / 2;
        const cy = textCanvas.height / 2;
        tctx.fillText(text, cx, cy); // Don't toUpperCase emojis

        const imageData = tctx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
        const points = [];
        const gap = 5;

        // Sample COLUMN-WISE for better formation sequence
        for (let x = 0; x < textCanvas.width; x += gap) {
            for (let y = 0; y < textCanvas.height; y += gap) {
                const index = (y * textCanvas.width + x) * 4;
                // Check ALPHA channel (+3) to detect emoji pixels correctly
                if (imageData[index + 3] > 128) {
                    points.push({ x: x, y: y });
                }
            }
        }

        if (labNodes.length < points.length) {
            const toAdd = points.length - labNodes.length;
            for (let i = 0; i < toAdd; i++) labNodes.push(new Node());
        } else if (labNodes.length > points.length) {
            labNodes.length = points.length;
        }

        const availableWidth = labCanvas.width * 0.85;
        const availableHeight = labCanvas.height * 0.7;

        let scaleX = availableWidth / textWidth;
        let scaleY = availableHeight / 100;
        let finalScale = Math.min(scaleX, scaleY, 2.5);

        const centerX = labCanvas.width / 2;
        const centerY = labCanvas.height / 2;

        labNodes.forEach((node, i) => {
            const pt = points[i];
            const oldTargetX = node.targetX;
            node.targetX = centerX + (pt.x - cx) * finalScale;
            node.targetY = centerY + (pt.y - cy) * finalScale * 1.5;

            // Only reset delay if it's a new point or target moved significantly
            // This makes live typing feel "continuous"
            if (Math.abs(oldTargetX - node.targetX) > 20) {
                const normX = (node.targetX - (centerX - availableWidth / 2)) / availableWidth;
                node.delay = normX * 800;
            }
        });
    };

    class TravelingPacket {
        constructor(path) {
            this.path = path; // Array of [curr, prev]
            this.segmentIndex = path.length - 1;
            this.progress = 0;
            this.speed = 0.03;
        }
        update() {
            this.progress += this.speed;
            if (this.progress >= 1) {
                this.progress = 0;
                const [target, source] = this.path[this.segmentIndex];
                target.flash = 1; // Trigger Relay Glow
                this.segmentIndex--;
            }
        }
        draw() {
            if (this.segmentIndex < 0) return false;
            const [end, start] = this.path[this.segmentIndex];
            const x = start.x + (end.x - start.x) * this.progress;
            const y = start.y + (end.y - start.y) * this.progress;

            lctx.beginPath();
            lctx.arc(x, y, 5, 0, Math.PI * 2);
            lctx.fillStyle = '#FFFFFF';
            lctx.shadowBlur = 15;
            lctx.shadowColor = '#00F2FF';
            lctx.fill();
            lctx.shadowBlur = 0;
            return true;
        }
    }

    let packets = [];
    setInterval(() => {
        // Scroll-Sync Check: Only emit packets when visible or scroll is high enough
        const scrollFactor = window.scrollY / 2000;
        if (Math.random() < 0.5 + scrollFactor) {
            const path = findShortestPath(labNodes);
            if (path && path.length > 0) packets.push(new TravelingPacket(path));
        }
        if (packets.length > 10) packets.shift();
    }, 1000);

    // Initial nodes
    for (let i = 0; i < 20; i++) labNodes.push(new Node());

    // Auto-generate nodes up to a limit
    setInterval(() => {
        if (labNodes.length < 35) {
            labNodes.push(new Node());
        }
    }, 2000);

    labCanvas.addEventListener('mousedown', (e) => {
        const rect = labCanvas.getBoundingClientRect();
        labNodes.push(new Node(e.clientX - rect.left, e.clientY - rect.top));
        if (labNodes.length > 50) labNodes.shift();
    });

    function findShortestPath(nodes) {
        if (nodes.length < 2) return null;
        const start = nodes[0];
        const end = nodes[nodes.length - 1];

        const distances = new Map();
        const prev = new Map();
        const queue = [...nodes];

        nodes.forEach(n => distances.set(n, Infinity));
        distances.set(start, 0);

        while (queue.length > 0) {
            queue.sort((a, b) => distances.get(a) - distances.get(b));
            const u = queue.shift();
            if (u === end) break;
            if (distances.get(u) === Infinity) break;

            nodes.forEach(v => {
                const dist = Math.sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
                if (dist < 180) {
                    const alt = distances.get(u) + dist;
                    if (alt < distances.get(v)) {
                        distances.set(v, alt);
                        prev.set(v, u);
                    }
                }
            });
        }

        let path = [];
        let curr = end;
        while (prev.has(curr)) {
            path.push([curr, prev.get(curr)]);
            curr = prev.get(curr);
        }
        return path;
    }

    function updateStats(path) {
        document.getElementById('stat-nodes').innerText = labNodes.length;
        document.getElementById('stat-hops').innerText = path ? path.length : '0';
        if (path && path.length > 0) {
            const directDist = Math.sqrt((labNodes[0].x - labNodes[labNodes.length - 1].x) ** 2 + (labNodes[0].y - labNodes[labNodes.length - 1].y) ** 2);
            let pathDist = 0;
            path.forEach(([u, v]) => {
                pathDist += Math.sqrt((u.x - v.x) ** 2 + (u.y - v.y) ** 2);
            });
            const efficiency = Math.round((directDist / pathDist) * 100);
            document.getElementById('stat-eff').innerText = efficiency + '%';
        } else {
            document.getElementById('stat-eff').innerText = '0%';
        }
    }

    let isLabPaused = true;
    const labObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isLabPaused = !entry.isIntersecting;
        });
    }, { threshold: 0.1 });
    labObserver.observe(labSection);

    function animateLab() {
        if (isLabPaused) {
            requestAnimationFrame(animateLab);
            return;
        }
        lctx.clearRect(0, 0, labCanvas.width, labCanvas.height);

        const isShape = meshMode !== 'random';
        labNodes.forEach(n => n.update());

        const rgb = window.airlinkLerp.primaryRgb;
        lctx.strokeStyle = `rgba(${rgb}, ${isShape ? 0.04 : 0.1})`;
        lctx.lineWidth = 1;
        const connectionDist = isShape ? 80 : 180;

        for (let i = 0; i < labNodes.length; i++) {
            for (let j = i + 1; j < labNodes.length; j++) {
                const dist = Math.sqrt((labNodes[i].x - labNodes[j].x) ** 2 + (labNodes[i].y - labNodes[j].y) ** 2);
                if (dist < connectionDist) {
                    lctx.beginPath();
                    lctx.moveTo(labNodes[i].x, labNodes[i].y);
                    lctx.lineTo(labNodes[j].x, labNodes[j].y);
                    lctx.stroke();
                }
            }
        }

        const path = findShortestPath(labNodes);
        updateStats(path);

        if (labNodes.length >= 2) {
            lctx.save();
            lctx.setLineDash([5, 10]);
            lctx.strokeStyle = 'rgba(112, 0, 255, 0.2)';
            lctx.beginPath();
            lctx.moveTo(labNodes[0].x, labNodes[0].y);
            lctx.lineTo(labNodes[labNodes.length - 1].x, labNodes[labNodes.length - 1].y);
            lctx.stroke();
            lctx.restore();
        }

        if (path && path.length > 0) {
            lctx.strokeStyle = window.airlinkLerp.secondary;
            lctx.lineWidth = 3;
            lctx.shadowBlur = 15;
            lctx.shadowColor = window.airlinkLerp.secondary;
            path.forEach(([u, v]) => {
                lctx.beginPath();
                lctx.moveTo(u.x, u.y);
                lctx.lineTo(v.x, v.y);
                lctx.stroke();
            });
            lctx.shadowBlur = 0;
        }

        packets = packets.filter(p => {
            p.update();
            return p.draw();
        });

        labNodes.forEach((node, idx) => {
            node.draw();
            if (idx === 0 || idx === labNodes.length - 1) {
                lctx.beginPath();
                lctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
                lctx.strokeStyle = idx === 0 ? window.airlinkLerp.primary : window.airlinkLerp.secondary;
                lctx.lineWidth = 2;
                lctx.stroke();
            }
        });

        requestAnimationFrame(animateLab);
    }
    animateLab();
}




// --- NETWORK COMPARISON SLIDER ---
const compareContainer = document.querySelector('.comparison-slider-container');
const sliderHandle = document.querySelector('.slider-handle');
const meshView = document.getElementById('mesh-view');

if (compareContainer) {
    let isDragging = false;

    const handleSlider = (e) => {
        const rect = compareContainer.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);

        meshView.style.width = percent + '%';
        sliderHandle.style.left = percent + '%';
    };

    sliderHandle.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (e) => { if (isDragging) handleSlider(e); });

    // Canvas Logic for Comparison
    const cCanvas = document.getElementById('canvas-centralized');
    const mCanvas = document.getElementById('canvas-mesh-simple');

    function initCompCanvas(canvas, mode) {
        const ctx = canvas.getContext('2d');
        canvas.width = compareContainer.offsetWidth;
        canvas.height = 500;

        let nodes = Array.from({ length: 15 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1
        }));

        const server = { x: canvas.width / 2, y: canvas.height / 2 };

        let isCompPaused = true;
        const compObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isCompPaused = !entry.isIntersecting;
            });
        }, { threshold: 0.1 });
        compObserver.observe(canvas);

        function draw() {
            if (isCompPaused) {
                requestAnimationFrame(draw);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = window.airlinkLerp.primary;
                ctx.fill();

                if (mode === 'centralized') {
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(server.x, server.y);
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                    ctx.stroke();
                } else {
                    nodes.forEach(n2 => {
                        const dist = Math.sqrt((n.x - n2.x) ** 2 + (n.y - n2.y) ** 2);
                        if (dist < 150) {
                            ctx.beginPath();
                            ctx.moveTo(n.x, n.y);
                            ctx.lineTo(n2.x, n2.y);
                            const rgb = window.airlinkLerp.primaryRgb;
                            ctx.strokeStyle = `rgba(${rgb}, 0.2)`;
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    });
                }
            });

            if (mode === 'centralized') {
                ctx.beginPath();
                ctx.arc(server.x, server.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#FF4444';
                ctx.fill();
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FF4444';
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            requestAnimationFrame(draw);
        }
        draw();
    }

    initCompCanvas(cCanvas, 'centralized');
    initCompCanvas(mCanvas, 'mesh');
}


// --- LIVE SUPPORTERS FEED (REAL GOOGLE SHEET LINK) ---
const SUPPORTER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwH9u3PKIKq7rbnnBE7kDEx6THYHNpCkSNZtvBKULDtYUFjySLpMhaUpgePlh3aWQ1DgQ/exec';
const NYRA_PROXY_URL = 'https://script.google.com/macros/s/AKfycbwH9u3PKIKq7rbnnBE7kDEx6THYHNpCkSNZtvBKULDtYUFjySLpMhaUpgePlh3aWQ1DgQ/exec';

const trackContainers = {
    1: document.getElementById('track-1-content'),
    2: document.getElementById('track-2-content'),
    3: document.getElementById('track-3-content'),
    4: document.getElementById('track-4-content'),
    5: document.getElementById('track-5-content')
};

// State to store supporters for each track
const supportersByTrack = { 1: [], 2: [], 3: [], 4: [], 5: [] };
const trackStates = { 1: '', 2: '', 3: '', 4: '', 5: '' }; // Tracks DOM state to prevent flicker
let lastProcessedCount = 0;

function createSupporterCard(name, amount, tier) {
    const card = document.createElement('div');
    card.className = `supporter-card glass ${tier}`;
    if (tier === 'tier-custom') {
        card.setAttribute('data-amount', `\u20B9${amount}`);
    }
    const init = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    card.innerHTML = `
        <div class="supporter-avatar">${init}</div>
        <div class="supporter-info"><strong>${name}</strong></div>
    `;
    return card;
}

function renderPremiumSupporters(premiumSupporters) {
    const container = document.getElementById('premium-supporters-list');
    const column = document.getElementById('premium-supporters-column');
    if (!container || !column) return;

    if (premiumSupporters.length === 0) {
        column.style.display = 'none';
        return;
    }

    column.style.display = 'flex';
    container.innerHTML = '';

    premiumSupporters.forEach(supporter => {
        const item = document.createElement('div');
        item.className = 'premium-supporter-item';

        const init = supporter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        item.innerHTML = `
            <div class="premium-supporter-avatar">${init}</div>
            <div class="premium-supporter-info">
                <span class="premium-supporter-name">${supporter.name}</span>
                <span class="premium-supporter-amount">₹${supporter.amount}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderTrack(trackId, tier) {
    const container = trackContainers[trackId];
    if (!container) return;

    const list = supportersByTrack[trackId];

    // Flicker-free Check: Only update if the data has actually changed
    const listState = JSON.stringify(list);
    if (trackStates[trackId] === listState) return;
    trackStates[trackId] = listState;

    if (list.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Clear and re-fill
    container.innerHTML = '';

    // To create a seamless loop, we need at least enough items to fill the width
    const itemsToRender = list.length < 3 ? [...list] : [...list, ...list];

    itemsToRender.forEach(item => {
        container.appendChild(createSupporterCard(item.name, item.amount, tier));
    });

    // Toggle animation and centering based on content length
    container.style.animation = list.length < 2 ? 'none' : '';
    container.style.justifyContent = list.length < 2 ? 'center' : 'flex-start';
}

let lastJsonString = "";

async function fetchSupporters() {
    if (!SUPPORTER_SCRIPT_URL || !SUPPORTER_SCRIPT_URL.includes('macros/s/')) return;

    try {
        const response = await fetch(SUPPORTER_SCRIPT_URL);
        const currentJsonString = await response.text();

        // Only update if the data has actually changed (add, edit, or delete)
        if (currentJsonString !== lastJsonString) {
            const supporters = JSON.parse(currentJsonString);
            lastJsonString = currentJsonString;

            // Reset state for a fresh sync
            for (let id in supportersByTrack) supportersByTrack[id] = [];

            let totalCollected = 0;

            let premiumSupporters = [];

            // Sort everything back into tracks
            supporters.forEach(supporter => {
                const amount = parseFloat(supporter.amount) || 0;
                // supporter.email is also available here if needed for verification
                totalCollected += amount;

                let trackId;

                if (amount > 101) {
                    premiumSupporters.push({ name: supporter.name, amount: amount });
                    trackId = 1; // Also keep them in track 1 for the scrolling feed
                } else if (amount === 101) trackId = 1;
                else if (amount === 51) trackId = 2;
                else if (amount === 21) trackId = 3;
                else if (amount === 11) trackId = 4;
                else trackId = 5; // Custom amount automatically goes to track 5

                supportersByTrack[trackId].unshift({ name: supporter.name, amount: amount });
            });

            // Render Premium Supporters Sidebar
            renderPremiumSupporters(premiumSupporters);

            // Update the live total money UI
            const totalMoneyEl = document.getElementById('total-money-amount');
            if (totalMoneyEl) {
                totalMoneyEl.innerText = `\u20B9${totalCollected}`;
            }

            // Update Goal Progress (Target: \u20B92500)
            const GOAL_AMOUNT = 2500;
            const progressFill = document.getElementById('goal-progress-fill');
            const percentText = document.getElementById('goal-percent');

            if (progressFill && percentText) {
                const percent = Math.min(Math.max((totalCollected / GOAL_AMOUNT) * 100, 0), 100);
                progressFill.style.width = `${percent}%`;
                percentText.innerText = `${Math.round(percent)}% reached`;
            }

            // Update total supporters count
            const totalSupportersEl = document.getElementById('total-supporters-count');
            if (totalSupportersEl) {
                totalSupportersEl.innerText = supporters.length;
            }

            // Re-render all tracks to reflect the current sheet state
            const tiers = {
                1: 'tier-platinum',
                2: 'tier-gold',
                3: 'tier-silver',
                4: 'tier-community',
                5: 'tier-custom'
            };
            for (let id in supportersByTrack) {
                renderTrack(id, tiers[id]);
            }
        }
    } catch (error) {
        console.error('AirLink: Error syncing with Google Sheets:', error);
    }
}

// Sync with Google Sheets every 10 seconds
setInterval(fetchSupporters, 10000);
fetchSupporters(); // Initial sync on load

// =============================================
// PAYMENT MODAL LOGIC
// =============================================
(function () {
    // --- Constants ---
    const UPI_ID = '8577026386@sbi';
    const PAYEE_NAME = 'Airlink project';

    // --- Element refs ---
    const modal = document.getElementById('payment-modal');
    const openBtn = document.getElementById('open-payment-modal-btn');
    const closeBtn = document.getElementById('close-payment-modal-btn');

    const steps = [1, 2, 3, 4, 5].map(n => document.getElementById(`payment-step-${n}`));
    const stepDots = [1, 2, 3, 4].map(n => document.getElementById(`step-dot-${n}`));

    // Step 1
    const nameInput = document.getElementById('supporter-name');
    const emailInput = document.getElementById('supporter-email');
    const step1Next = document.getElementById('step1-next');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const otpSection = document.getElementById('otp-section');
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpStatus = document.getElementById('otp-status');
    const resendOtpBtn = document.getElementById('resend-otp-btn');
    const resendTimer = document.getElementById('resend-timer');
    const changeEmailBtn = document.getElementById('change-email-btn');

    // Step 2
    const tierChips = document.querySelectorAll('.tier-chip');
    const customAmountInput = document.getElementById('custom-amount');
    const step2Back = document.getElementById('step2-back');
    const step2Next = document.getElementById('step2-next');

    // Step 3
    const qrImg = document.getElementById('qr-code-img');
    const qrAmountDisplay = document.getElementById('qr-amount-display');
    const upiDeeplink = document.getElementById('upi-deeplink-btn');
    const step3Back = document.getElementById('step3-back');
    const step3Next = document.getElementById('step3-next');

    // Step 4
    const txnIdInput = document.getElementById('transaction-id');
    const submitBtn = document.getElementById('submit-payment-btn');
    const submissionStatus = document.getElementById('submission-status');
    const step4Back = document.getElementById('step4-back');

    // Step 5
    const step5Done = document.getElementById('step5-done');

    // --- State ---
    let currentStep = 1;
    let selectedAmount = 0;
    let generatedOtp = '';
    let emailVerified = false;
    let resendInterval = null;

    // --- Helpers ---
    function goToStep(n) {
        steps.forEach((s, i) => {
            if (s) s.classList.toggle('hidden', i !== n - 1);
        });
        stepDots.forEach((dot, i) => {
            if (!dot) return;
            dot.classList.remove('active', 'completed');
            if (i + 1 < n) dot.classList.add('completed');
            else if (i + 1 === n) dot.classList.add('active');
        });
        currentStep = n;
    }

    function openModal() {
        resetModal();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function resetModal() {
        nameInput.value = '';
        emailInput.value = '';
        otpInputs.forEach(input => input.value = '');
        if (otpSection) otpSection.classList.add('hidden');
        if (otpStatus) { otpStatus.textContent = ''; otpStatus.className = 'submission-status'; }
        if (sendOtpBtn) { sendOtpBtn.textContent = 'Send OTP'; sendOtpBtn.disabled = false; sendOtpBtn.classList.remove('sent'); }
        if (step1Next) { step1Next.disabled = true; step1Next.style.opacity = '0.5'; step1Next.style.cursor = 'not-allowed'; }
        if (resendOtpBtn) { resendOtpBtn.disabled = true; resendOtpBtn.textContent = 'Resend'; }
        if (resendInterval) clearInterval(resendInterval);
        generatedOtp = '';
        emailVerified = false;
        customAmountInput.value = '';
        txnIdInput.value = '';
        submissionStatus.textContent = '';
        submissionStatus.className = 'submission-status';
        tierChips.forEach(c => c.classList.remove('selected'));
        selectedAmount = 0;
        goToStep(1);
    }

    function buildQrUrl(amount) {
        const upiPayload = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('AirLink Support')}`;
        return `https://quickchart.io/qr?text=${encodeURIComponent(upiPayload)}&size=200&margin=1`;
    }

    function updateQr(amount) {
        selectedAmount = amount;
        qrImg.src = buildQrUrl(amount);
        qrAmountDisplay.textContent = amount;
        // Update UPI deep-link for mobile
        upiDeeplink.href = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('AirLink Support')}`;
    }

    // --- OTP Helpers ---
    function generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    function startResendTimer() {
        let secs = 30;
        const totalSecs = 30;
        const progressEl = document.getElementById('resend-progress');
        const timerText = document.getElementById('resend-timer');
        const dashArray = 88; // 2 * PI * 14

        if (timerText) timerText.textContent = secs;
        if (resendOtpBtn) {
            resendOtpBtn.disabled = true;
            const timerContainer = document.getElementById('resend-timer-text');
            if (timerContainer) timerContainer.innerHTML = `Resend in <span id="resend-timer">${secs}</span>s`;
        }

        if (progressEl) progressEl.style.strokeDashoffset = dashArray;

        if (resendInterval) clearInterval(resendInterval);
        resendInterval = setInterval(() => {
            secs--;
            const timerEl = document.getElementById('resend-timer');
            if (timerEl) timerEl.textContent = secs;

            if (progressEl) {
                const offset = dashArray - (dashArray * (totalSecs - secs) / totalSecs);
                progressEl.style.strokeDashoffset = offset;
            }

            if (secs <= 0) {
                clearInterval(resendInterval);
                if (resendOtpBtn) {
                    resendOtpBtn.disabled = false;
                    resendOtpBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Resend OTP';
                }
            }
        }, 1000);
    }

    function triggerHaptic(type) {
        if (!navigator.vibrate) return;
        if (type === 'success') navigator.vibrate([100]);
        if (type === 'error') navigator.vibrate([100, 50, 100]);
    }

    async function sendOtp(email) {
        generatedOtp = generateOtp();
        const params = new URLSearchParams({
            action: 'sendOTP',
            email: email,
            otp: generatedOtp,
        });
        fetch(`${SUPPORTER_SCRIPT_URL}?${params.toString()}`, { mode: 'no-cors' }).catch(() => { });
    }

    // --- Email Ghost Autocomplete Logic ---
    const emailGhost = document.getElementById('email-ghost');
    const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];

    emailInput && emailInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (!value.includes('@') || value.endsWith('@')) {
            emailGhost.textContent = '';
            return;
        }

        const [local, partialDomain] = value.split('@');
        const match = commonDomains.find(d => d.startsWith(partialDomain));

        if (match && partialDomain) {
            // We use opaque text for the typed part to ensure perfect alignment
            // then append the rest of the suggestion
            const suggestionPart = match.substring(partialDomain.length);
            emailGhost.innerHTML = `<span style="opacity:0">${value}</span>${suggestionPart}`;
        } else {
            emailGhost.textContent = '';
        }
    });

    emailInput && emailInput.addEventListener('keydown', (e) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'Enter') && emailGhost.textContent) {
            const ghostContent = emailGhost.textContent;
            if (ghostContent) {
                e.preventDefault();
                emailInput.value = ghostContent;
                emailGhost.textContent = '';
            }
        }
    });

    // --- Step 1: Send OTP ---
    sendOtpBtn && sendOtpBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        if (!name) { nameInput.focus(); nameInput.style.borderColor = 'var(--error-color)'; return; }
        nameInput.style.borderColor = '';
        if (!email || !email.includes('@') || !email.includes('.')) {
            emailInput.focus(); emailInput.style.borderColor = 'var(--error-color)';
            return;
        }
        emailInput.style.borderColor = '';
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending\u2026';
        await sendOtp(email);
        sendOtpBtn.textContent = '\u2713 Sent';
        sendOtpBtn.classList.add('sent');
        otpSection.classList.remove('hidden');
        if (otpInputs[0]) otpInputs[0].focus();
        otpStatus.textContent = `OTP sent to ${email}`;
        otpStatus.className = 'submission-status otp-status-success';
        changeEmailBtn && changeEmailBtn.classList.remove('hidden');
        startResendTimer();
    });

    changeEmailBtn && changeEmailBtn.addEventListener('click', () => {
        otpSection.classList.add('hidden');
        changeEmailBtn.classList.add('hidden');
        emailInput.disabled = false;
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
        sendOtpBtn.classList.remove('sent');
        otpStatus.textContent = '';
        otpStatus.className = 'submission-status';

        if (typeof resendInterval !== 'undefined' && resendInterval) {
            clearInterval(resendInterval);
        }
        resendOtpBtn.disabled = true;

        emailInput.focus();
    });

    // --- Step 1: Resend OTP ---
    resendOtpBtn && resendOtpBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        resendOtpBtn.disabled = true;
        otpStatus.textContent = 'Resending OTP\u2026';
        otpStatus.className = 'submission-status loading';
        await sendOtp(email);
        otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('verified');
        });
        step1Next.disabled = true;
        step1Next.style.opacity = '0.5';
        otpStatus.textContent = `New OTP sent to ${email}`;
        otpStatus.className = 'submission-status otp-status-success';
        startResendTimer();
    });

    // --- Step 1: Enhanced OTP Input Logic ---
    otpInputs.forEach((input, index) => {
        // Handle numeric input & auto-focus
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length > 0) {
                // Keep only last char if somehow more entered
                e.target.value = val.slice(-1);

                // Move to next if digit
                if (/[0-9]/.test(e.target.value)) {
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                } else {
                    e.target.value = '';
                }
            }
            checkAllOtpInputs();
        });

        // Handle Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        // Handle Paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const data = e.clipboardData.getData('text').trim();
            if (/^\d{6}$/.test(data)) {
                data.split('').forEach((digit, i) => {
                    if (otpInputs[i]) otpInputs[i].value = digit;
                });
                otpInputs[5].focus();
                checkAllOtpInputs();
            }
        });
    });

    function checkAllOtpInputs() {
        const otpValues = Array.from(otpInputs).map(i => i.value).join('');
        const section = document.getElementById('otp-section');

        if (otpValues.length === 6) {
            // Add verifying state
            section.classList.add('verifying');
            otpStatus.textContent = 'Verifying code...';
            otpStatus.className = 'submission-status loading';

            setTimeout(() => {
                section.classList.remove('verifying');
                if (otpValues === generatedOtp) {
                    emailVerified = true;
                    otpStatus.textContent = '\u2705 Email verified!';
                    otpStatus.className = 'submission-status otp-status-success';
                    triggerHaptic('success');

                    otpInputs.forEach(input => {
                        input.classList.add('verified');
                        input.disabled = true;
                    });

                    // Auto-submit: Transition directly to Step 2 ("Choose Your Tier")
                    setTimeout(() => {
                        goToStep(2);
                    }, 800);
                } else {
                    emailVerified = false;
                    otpStatus.textContent = '\u274C Incorrect OTP. Please try again.';
                    otpStatus.className = 'submission-status error';
                    triggerHaptic('error');

                    // Shake animation
                    const inputsContainer = document.getElementById('otp-inputs-container');
                    inputsContainer.classList.add('shake');
                    setTimeout(() => inputsContainer.classList.remove('shake'), 400);
                }
            }, 1000); // 1-second "Checking" delay for premium feel
        } else {
            emailVerified = false;
            otpStatus.textContent = '';
        }
    }

    // --- Step 1: Continue (only if verified) ---
    step1Next && step1Next.addEventListener('click', () => {
        if (!emailVerified) return;
        goToStep(2);
    });

    // --- Step 2 ---
    tierChips.forEach(chip => {
        chip.addEventListener('click', () => {
            tierChips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            customAmountInput.value = ''; // Clear custom when tier selected
        });
    });

    customAmountInput && customAmountInput.addEventListener('input', () => {
        if (customAmountInput.value) {
            tierChips.forEach(c => c.classList.remove('selected'));
        }
    });

    step2Back && step2Back.addEventListener('click', () => goToStep(1));
    step2Next && step2Next.addEventListener('click', () => {
        const selected = document.querySelector('.tier-chip.selected');
        const customVal = parseInt(customAmountInput.value);

        if (selected) {
            updateQr(parseInt(selected.dataset.amount));
        } else if (customVal && customVal >= 1) {
            updateQr(customVal);
        } else {
            customAmountInput.focus();
            customAmountInput.style.borderColor = 'var(--error-color)';
            return;
        }
        customAmountInput.style.borderColor = '';
        goToStep(3);
    });

    // --- Step 3 ---
    step3Back && step3Back.addEventListener('click', () => goToStep(2));
    step3Next && step3Next.addEventListener('click', () => goToStep(4));

    // --- Step 4 ---
    step4Back && step4Back.addEventListener('click', () => goToStep(3));
    submitBtn && submitBtn.addEventListener('click', async () => {
        const txnId = txnIdInput.value.trim();
        const txnIdValid = /^\d{12}$/.test(txnId);
        if (!txnIdValid) {
            txnIdInput.focus();
            txnIdInput.style.borderColor = 'var(--error-color)';
            submissionStatus.textContent = '\u26A0\uFE0F Please enter a valid 12-digit Transaction ID.';
            submissionStatus.className = 'submission-status error';
            return;
        }
        txnIdInput.style.borderColor = '';

        // Disable and show loading
        submitBtn.disabled = true;
        submissionStatus.textContent = '\u23F3 Submitting your details\u2026';
        submissionStatus.className = 'submission-status loading';

        const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            amount: selectedAmount,
            txnId: txnId,
        };

        try {
            // Single GET request with URL params \u2014 reliable for Google Apps Script
            const params = new URLSearchParams({
                action: 'addSupporter',
                name: payload.name,
                email: payload.email,
                amount: payload.amount,
                txnId: payload.txnId,
            });
            const submitUrl = `${SUPPORTER_SCRIPT_URL}?${params.toString()}`;

            // Fire exactly ONE request then advance to success
            fetch(submitUrl, { mode: 'no-cors' }).catch(() => { });
            // Wait 2s then show success (can't read response in no-cors)
            setTimeout(() => goToStep(5), 2000);
        } catch (err) {
            submissionStatus.textContent = '\u274C Submission failed. Please try again.';
            submissionStatus.className = 'submission-status error';
            submitBtn.disabled = false;
        }
    });

    // --- Step 5 ---
    step5Done && step5Done.addEventListener('click', closeModal);

    // --- Open / Close ---
    openBtn && openBtn.addEventListener('click', openModal);
    closeBtn && closeBtn.addEventListener('click', closeModal);

    // Close on overlay click
    modal && modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
})();


// FAQ Toggles
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
    });
});
// --- INTERACTIVE TECH DEEP-DIVE ---
const techDeepDive = document.getElementById('tech-deep-dive');
const deepDiveContent = document.getElementById('deep-dive-content');
const closeDeepDiveBtn = document.getElementById('close-deep-dive');

const techCards = [
    { id: 'tech-signal', type: 'signal', color: 'var(--primary-color)' },
    { id: 'tech-nearby', type: 'nearby', color: 'var(--secondary-color)' },
    { id: 'tech-routing', type: 'routing', color: '#FFD700' }
];

let activeVizInterval = null;

function clearViz() {
    if (activeVizInterval) clearInterval(activeVizInterval);
    deepDiveContent.innerHTML = '';
}

function openDeepDive(type) {
    clearViz();
    techDeepDive.style.display = 'block';
    setTimeout(() => {
        techDeepDive.classList.add('active');
        // Scroll to the deep-dive area
        techDeepDive.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 10);

    if (type === 'signal') renderSignalViz();
    else if (type === 'nearby') renderNearbyViz();
    else if (type === 'routing') renderRoutingViz();
}

function closeDeepDive() {
    techDeepDive.classList.remove('active');
    setTimeout(() => {
        techDeepDive.style.display = 'none';
        clearViz();
    }, 500);
}

if (closeDeepDiveBtn) {
    closeDeepDiveBtn.addEventListener('click', closeDeepDive);
}

techCards.forEach(card => {
    const el = document.getElementById(card.id);
    if (el) {
        el.addEventListener('click', () => openDeepDive(card.type));
    }
});

function renderSignalViz() {
    deepDiveContent.innerHTML = `
        <h3 class="gradient-text">Signal Protocol: End-to-End Encryption</h3>
        <p style="text-align: center; color: var(--text-dim); max-width: 600px;">
            Uses the Double Ratchet algorithm. Every message has a unique key, and keys are never reused.
        </p>
        <div class="viz-container">
            <div class="viz-node" style="position: absolute; left: 10%;"><i class="fa-solid fa-user"></i></div>
            <div class="viz-node" style="position: absolute; right: 10%;"><i class="fa-solid fa-user"></i></div>
            <div id="signal-path" style="width: 80%; height: 2px; background: var(--glass-border); position: absolute; z-index: 1;"></div>
            <div id="encryption-key" class="rotating-key" style="position: absolute; top: 20%;"><i class="fa-solid fa-key"></i></div>
            <div id="signal-message" class="viz-packet" style="left: 15%; top: 48%;"></div>
            <div id="cipher-status" class="encryption-text" style="position: absolute; bottom: 10%;">PLAINTEXT: "Hello"</div>
        </div>
        <button class="btn btn-primary" onclick="startSignalSimulation()">Run Simulation</button>
    `;
}

window.startSignalSimulation = function () {
    const packet = document.getElementById('signal-message');
    const status = document.getElementById('cipher-status');
    const key = document.getElementById('encryption-key');

    let pos = 15;
    let encrypted = false;

    if (activeVizInterval) clearInterval(activeVizInterval);

    activeVizInterval = setInterval(() => {
        pos += 1;
        packet.style.left = pos + '%';

        if (pos > 45 && !encrypted) {
            encrypted = true;
            status.innerHTML = 'CIPHERTEXT: <span style="color: #FF4444;">xK9$pL2!m...</span>';
            packet.style.background = '#FF4444';
            packet.style.boxShadow = '0 0 15px #FF4444';
            key.style.color = '#00FF88';
        }

        if (pos >= 85) {
            pos = 15;
            encrypted = false;
            status.innerHTML = 'PLAINTEXT: "Hello"';
            packet.style.background = 'white';
            packet.style.boxShadow = '0 0 15px white';
            key.style.color = '#FFD700';
        }
    }, 30);
};

function renderNearbyViz() {
    deepDiveContent.innerHTML = `
        <h3 style="color: var(--secondary-color);">Nearby Connections: P2P Discovery</h3>
        <p style="text-align: center; color: var(--text-dim); max-width: 600px;">
            Discovery using Bluetooth Low Energy (BLE) and high-speed transfers via Wi-Fi Direct.
        </p>
        <div class="viz-container" style="overflow: hidden;">
            <div class="viz-node" style="z-index: 10; border-color: var(--secondary-color);"><i class="fa-solid fa-mobile-screen"></i></div>
            <div class="signal-pulse" style="border-color: var(--secondary-color);"></div>
            <div class="signal-pulse" style="border-color: var(--secondary-color); animation-delay: 1s;"></div>
            
            <div class="viz-node found-node" style="position: absolute; top: 20%; left: 20%; opacity: 0.3; border-color: gray;"><i class="fa-solid fa-mobile"></i></div>
            <div class="viz-node found-node" style="position: absolute; bottom: 20%; right: 20%; opacity: 0.3; border-color: gray;"><i class="fa-solid fa-mobile"></i></div>
        </div>
    `;

    // Auto-discovery effect
    activeVizInterval = setInterval(() => {
        const nodes = document.querySelectorAll('.found-node');
        nodes.forEach(n => {
            n.style.opacity = '1';
            n.style.borderColor = 'var(--secondary-color)';
            n.style.transition = 'all 1s ease';
        });
        setTimeout(() => {
            nodes.forEach(n => {
                n.style.opacity = '0.3';
                n.style.borderColor = 'gray';
            });
        }, 2000);
    }, 3000);
}

function renderRoutingViz() {
    deepDiveContent.innerHTML = `
        <h3 style="color: #FFD700;">Mesh Routing: Adaptive Pathfinding</h3>
        <p style="text-align: center; color: var(--text-dim); max-width: 600px;">
            Messages hop through multiple nodes to extend range beyond a single jump.
        </p>
        <div class="viz-container" id="routing-viz">
            <!-- Nodes will be injected here -->
        </div>
        <div id="routing-status" style="color: #FFD700; font-weight: 600;">Optimal Path: A -> B -> D</div>
    `;

    const container = document.getElementById('routing-viz');
    const nodes = [
        { id: 'A', x: 10, y: 50, label: 'YOU' },
        { id: 'B', x: 40, y: 30, label: 'Node B' },
        { id: 'C', x: 40, y: 70, label: 'Node C' },
        { id: 'D', x: 80, y: 50, label: 'BOB' }
    ];

    nodes.forEach(n => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'viz-node';
        nodeEl.style.position = 'absolute';
        nodeEl.style.left = n.x + '%';
        nodeEl.style.top = n.y + '%';
        nodeEl.innerHTML = `<span style="font-size: 0.7rem;">${n.label}</span>`;
        if (n.id === 'D') nodeEl.style.borderColor = '#FFD700';
        container.appendChild(nodeEl);
    });

    const packet = document.createElement('div');
    packet.className = 'viz-packet';
    packet.style.background = '#FFD700';
    packet.style.boxShadow = '0 0 15px #FFD700';
    container.appendChild(packet);

    let step = 0;
    const path = [nodes[0], nodes[1], nodes[3]]; // A -> B -> D

    activeVizInterval = setInterval(() => {
        const target = path[step];
        packet.style.transition = 'all 1s linear';
        packet.style.left = (target.x + 4) + '%';
        packet.style.top = (target.y + 4) + '%';

        step = (step + 1) % path.length;
    }, 1500);
}



// --- Scroll Parallax for Hero Mockup ---
window.addEventListener('scroll', () => {
    const mockup = document.querySelector('.mockup-container');
    if (mockup && window.innerWidth > 768) {
        const scrollValue = window.scrollY;
        mockup.style.transform = `scale(0.75) translateY(${scrollValue * 0.1}px)`;
    }
});

// --- 3D Mockup Carousel Rotation ---
function initMockupCarousel() {
    const mockupContainer = document.querySelector('.mockup-container');
    if (!mockupContainer) return;

    const phones = mockupContainer.querySelectorAll('.phone-frame');
    if (phones.length !== 3) return;

    // Available screen images pool
    const screenImages = [
        'assets/splash.jpeg',      // 0
        'assets/discovery.jpeg',   // 1
        'assets/chat screen.jpeg', // 2
        'assets/chat list.jpeg',   // 3
        'assets/group .jpeg',      // 4
        'assets/profile.jpeg',     // 5
        'assets/secert.jpeg'       // 6
    ];

    // Initial state matching HTML exactly:
    // Phone 0 (Left): Discovery
    // Phone 1 (Center): Splash
    // Phone 2 (Right): Chat Screen

    // nextImageIndex = 3 because 0, 1, 2 are effectively in the HTML
    let nextImageIndex = 3;

    // The states in order: 0=Left, 1=Center, 2=Right
    const states = [
        ['side', 'left'],
        ['center'],
        ['side', 'right']
    ];

    let currentState = [0, 1, 2]; // Index of state for phone 0(L), 1(C), 2(R)

    // To prevent rotating while hovering
    let isHovering = false;
    mockupContainer.addEventListener('mouseenter', () => isHovering = true);
    mockupContainer.addEventListener('mouseleave', () => isHovering = false);

    // Return a function to start the interval
    return function start() {
        setInterval(() => {
            if (isHovering) return; // Pause on hover

            // Shift array left to rotate states
            // Phone 0 (Left) -> Center
            // Phone 1 (Center) -> Right
            // Phone 2 (Right) -> Left
            currentState.push(currentState.shift());

            // Apply new states and update images
            phones.forEach((phone, index) => {
                const newStateIndex = currentState[index];

                // Remove existing position classes
                phone.classList.remove('side', 'left', 'right', 'center');

                // Add new classes based on current state
                const stateClasses = states[newStateIndex];
                phone.classList.add(...stateClasses);

                // IMAGE SWAP LOGIC:
                // Update image when phone moves to Left (out of focus)
                if (newStateIndex === 0) {
                    const img = phone.querySelector('img');
                    if (img) {
                        img.src = screenImages[nextImageIndex];
                        nextImageIndex = (nextImageIndex + 1) % screenImages.length;
                    }
                }
            });
        }, 3000);
    };
}

// Initialization is now handled by revealWebsite for perfect timing
// Fallback if intro was skipped/removed manually
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('video-intro')) {
        const startCarousel = initMockupCarousel();
        if (startCarousel) startCarousel();
    }
});



// =============================================
// --- DISASTER MODE SIMULATOR \u2014 ENHANCED ---
// =============================================

(function () {
    const btn = document.getElementById('disaster-toggle');
    if (!btn) return;

    let isDisasterMode = false;
    let uptimeInterval = null;
    let nodeInterval = null;
    let uptimeSeconds = 0;

    // --- Audio Assets ---
    const siren = new Audio('assets/siren.mp3');
    siren.loop = true;

    window.isDisasterMode = false;

    // --- Typewriter Effect ---
    const TYPEWRITER_MSG = 'INTERNET CONNECTION TERMINATED';
    function runTypewriter() {
        const el = document.getElementById('hud-typewriter');
        if (!el) return;
        el.textContent = '';
        let i = 0;
        const iv = setInterval(() => {
            if (!window.isDisasterMode) { clearInterval(iv); el.textContent = ''; return; }
            if (i < TYPEWRITER_MSG.length) {
                el.textContent += TYPEWRITER_MSG[i++];
            } else {
                clearInterval(iv);
            }
        }, 55);
    }

    // --- Live Uptime Counter ---
    function startUptime() {
        uptimeSeconds = 0;
        const el = document.getElementById('hud-uptime');
        uptimeInterval = setInterval(() => {
            if (!el) return;
            uptimeSeconds++;
            const h = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(uptimeSeconds % 60).padStart(2, '0');
            el.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }

    function stopUptime() {
        clearInterval(uptimeInterval);
        const el = document.getElementById('hud-uptime');
        if (el) el.textContent = '00:00:00';
    }

    // --- Live Node Count (reads from Mesh Lab) ---
    function startNodeCount() {
        const el = document.getElementById('hud-nodes');
        nodeInterval = setInterval(() => {
            if (!el) return;
            // Try to read from the lab's stat, with a small random jitter for realism
            const statNodes = document.getElementById('stat-nodes');
            const count = statNodes ? parseInt(statNodes.textContent) || 0 : 0;
            el.textContent = count + Math.floor(Math.random() * 3); // slight jitter
        }, 800);
    }

    function stopNodeCount() {
        clearInterval(nodeInterval);
        const el = document.getElementById('hud-nodes');
        if (el) el.textContent = '--';
    }

    // --- Content Flicker on Activation ---
    function triggerFlicker() {
        document.body.classList.add('disaster-flicker');
        setTimeout(() => document.body.classList.remove('disaster-flicker'), 450);
    }

    // --- Screen Shake ---
    function triggerShake() {
        const shakeTarget = document.querySelector('main') || document.body;
        shakeTarget.style.animation = 'none';
        void shakeTarget.offsetWidth;
        shakeTarget.style.animation = 'screen-shake 0.5s ease';
        setTimeout(() => { shakeTarget.style.animation = ''; }, 550);
    }

    // --- Terminal Sequence Logic ---
    async function runTerminalSequence() {
        const terminal = document.getElementById('disaster-terminal');
        const body = document.getElementById('terminal-body');
        if (!terminal || !body) return;

        terminal.classList.add('active');
        body.innerHTML = '';

        const logs = [
            { text: "INITIALIZING airlink-mesh-protocol v2.4.0-STABLE", type: "system" },
            { text: "HARDWARE: Allocating mesh-buffer [1024MB]... [OK]", type: "system" },
            { text: "HARDWARE: Detecting Bluetooth Low Energy (BLE) Radio... Found.", type: "system" },
            { text: "HARDWARE: Initializing Wi-Fi Direct (P2P-GO) Stack... Found.", type: "system" },
            { text: "CHECKING: Global Internet Connectivity...", type: "system" },
            { text: "ERROR: Gateway [192.168.1.1] unreachable.", type: "error" },
            { text: "ERROR: DNS resolve timeout (8.8.8.8).", type: "error" },
            { text: "CRITICAL: Global Wide Area Network (WAN) lost.", type: "error" },
            { text: "SYSTEM: Switching to Emergency AirLink Mesh Mode...", type: "warning" },
            { text: "NETWORK: Scanning peer discovery channels 1, 6, 11...", type: "system" },
            { text: "P2P: Discovery beacon sent [PID: 88102]", type: "system" },
            { text: "PEER FOUND: [N-8821] - Latency: 4ms - SNR: 18dB", type: "airlink" },
            { text: "PEER FOUND: [N-4493] - Latency: 12ms - SNR: 14dB", type: "airlink" },
            { text: "PEER FOUND: [N-0012] - Latency: 7ms - SNR: 22dB", type: "airlink" },
            { text: "CRYPTO: Generating ephemeral Signal Identity Keys...", type: "system" },
            { text: "CRYPTO: Initializing Double Ratchet encryption... [SECURE]", type: "success" },
            { text: "DATABASE: Syncing local offline messages... [14 queued]", type: "system" },
            { text: "ROUTING: Recalculating Dijkstra topology paths...", type: "system" },
            { text: "ROUTING: Found 3 alternate relay paths to Master Hub.", type: "success" },
            { text: "SUCCESS: AirLink P2P Mesh Network fully synchronized.", type: "success" },
            { text: "BOOT: Disaster Console Active. Monitoring Mesh Traffic...", type: "system" }
        ];

        for (const log of logs) {
            if (!window.isDisasterMode) break; // Abort if turned off during sequence

            const line = document.createElement('div');
            line.className = `terminal-line ${log.type}`;
            const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            line.innerHTML = `<span class="terminal-timestamp">[${ts}]</span> <span class="terminal-text">${log.text}</span>`;
            body.appendChild(line);
            body.scrollTop = body.scrollHeight;

            await new Promise(r => setTimeout(r, 180 + Math.random() * 200));
        }

        if (window.isDisasterMode) {
            await new Promise(r => setTimeout(r, 500));
            terminal.classList.remove('active');
        }
    }

    // --- MAIN TOGGLE ---
    btn.addEventListener('click', async () => {
        isDisasterMode = !isDisasterMode;
        window.isDisasterMode = isDisasterMode;

        if (isDisasterMode) {
            // Step 1: Show Terminal Bootup
            btn.classList.add('loading'); // Optional loading state for button
            await runTerminalSequence();

            if (!window.isDisasterMode) return; // In case they toggled it off fast

            // Step 2: Apply Red Theme & Effects
            document.body.classList.add('disaster-mode');
            btn.title = 'Restore Internet Connection';
            btn.innerHTML = '<i class="fa-solid fa-power-off"></i>';

            siren.play().catch(e => console.log("Audio play blocked:", e));

            triggerShake();
            setTimeout(triggerFlicker, 100);
            setTimeout(runTypewriter, 400);
            setTimeout(startUptime, 200);
            setTimeout(startNodeCount, 200);

        } else {
            // Deactivate immediately
            document.body.classList.remove('disaster-mode');
            const terminal = document.getElementById('disaster-terminal');
            if (terminal) terminal.classList.remove('active');

            siren.pause();
            siren.currentTime = 0;

            btn.title = 'Simulate Internet Shutdown';
            btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';

            stopUptime();
            stopNodeCount();

            // Clear typewriter text
            const twEl = document.getElementById('hud-typewriter');
            if (twEl) twEl.textContent = '';
        }
    });

})();

/* ==========================================================================
   NYRA AI CHATBOT LOGIC
   ========================================================================== */

(function () {
    // CONFIGURATION

    // (Other configuration moved to Google Apps Script for security)


    // UI ELEMENTS
    const container = document.getElementById('nyra-chatbot');
    const fab = document.getElementById('nyra-fab');
    const windowEl = document.getElementById('nyra-window');
    const closeBtn = document.getElementById('nyra-close');
    const clearBtn = document.getElementById('nyra-clear');
    const sendBtn = document.getElementById('nyra-send');
    const inputField = document.getElementById('nyra-input');
    const messagesContainer = document.getElementById('nyra-messages');

    let isChatOpen = false;
    let chatHistory = [];

    // INITIALIZATION
    function init() {
        if (!container) return;

        // Event Listeners
        fab.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', closeChat);
        clearBtn.addEventListener('click', clearChat);
        sendBtn.addEventListener('click', handleSend);

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });


    }

    // CHAT ACTIONS
    function toggleChat() {
        isChatOpen ? closeChat() : openChat();
        localStorage.setItem('nyra_interacted', 'true');
    }

    function openChat() {
        windowEl.classList.remove('hidden');
        isChatOpen = true;
        inputField.focus();

        // Greet user on first interaction if empty
        if (messagesContainer.children.length === 0) {
            setTimeout(() => {
                addMessage("bot", "Hi there! I'm Nyra, your AirLink guide. ðŸ‘‹ Need help understanding how our offline mesh works?");
            }, 500);
        }
    }

    function closeChat() {
        windowEl.classList.add('hidden');
        isChatOpen = false;
    }

    function clearChat() {
        messagesContainer.innerHTML = '';
        chatHistory = [];
        addMessage("bot", "Chat cleared. What else can I help you with?");
    }

    async function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        // User Message
        addMessage("user", text);
        inputField.value = '';
        inputField.style.height = 'auto';

        // Disable input while thinking
        setInputState(false);

        // Bot Response
        await getNyraResponse(text);

        setInputState(true);
    }

    function setInputState(enabled) {
        inputField.disabled = !enabled;
        sendBtn.disabled = !enabled;
        if (enabled) inputField.focus();
    }

    // MESSAGE RENDERING
    function addMessage(type, text) {
        const msgEl = document.createElement('div');
        msgEl.className = `message ${type}`;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgEl.innerHTML = `
            <div class="message-content">${formatText(text)}</div>
            <span class="message-time">${timestamp}</span>
        `;

        messagesContainer.appendChild(msgEl);
        scrollToBottom();

        // Update history for API - Only if it's not the initial greeting
        if (messagesContainer.children.length > 1 || type === 'user') {
            chatHistory.push({ role: type === 'bot' ? 'model' : 'user', parts: [{ text }] });
        }
    }

    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-msg';
        indicator.id = 'nyra-typing';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const el = document.getElementById('nyra-typing');
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function formatText(text) {
        // Simple Markdown-ish formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // GEMINI API INTEGRATION
    async function getNyraResponse(userText) {
        addTypingIndicator();

        try {
            const params = new URLSearchParams({
                action: 'chat',
                history: JSON.stringify(chatHistory.slice(-10))
            });

            const response = await fetch(`${NYRA_PROXY_URL}?${params.toString()}`);
            const data = await response.json();

            removeTypingIndicator();

            if (response.ok && data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                const botText = data.candidates[0].content.parts[0].text;
                addMessage("bot", botText);
            } else {
                const errorMsg = data.error?.message || "Invalid response from AI brain.";
                console.error("Proxy Error details:", data);
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error("Nyra Proxy Error:", error);
            removeTypingIndicator();
            addMessage("bot", `Oops! I'm having trouble reaching my brain: ${error.message}. Please try again later.`);
        }
    }

    // Auto-resize textarea
    inputField.addEventListener('input', () => {
        inputField.style.height = 'auto';
        inputField.style.height = inputField.scrollHeight + 'px';
    });

    init();
})();

// Newsletter Subscription Logic
const newsletterForm = document.getElementById('newsletter-form');
const newsletterStatus = document.getElementById('newsletter-status');
const newsletterSubmit = document.getElementById('newsletter-submit');

// --- IMPORTANT: User must update this URL after deploying their Apps Script ---
const NEWSLETTER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFElOkbbF3GUUpbsvGrRWUcqfXbUzw15pccv_SFacmfQxi2VGorr0CI0fqbXhX4Lne/exec';

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            showNewsletterStatus('Please enter a valid email address.', 'error');
            return;
        }

        // Disable button & show loading state
        newsletterSubmit.disabled = true;
        const originalBtnText = newsletterSubmit.innerHTML;
        newsletterSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...';
        showNewsletterStatus('Connecting to mesh...', '');

        try {
            // Using URLSearchParams for compatibility with Google Apps Script doPost
            const params = new URLSearchParams();
            params.append('email', email);
            params.append('action', 'subscribe');

            const response = await fetch(NEWSLETTER_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script requires no-cors for simple POSTs
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            // Since we use no-cors, we can't read the response body, 
            // but if it didn't throw an error, we assume success or handle it based on timeout.
            showNewsletterStatus('Welcome to the mesh! Check your inbox soon. ðŸš€', 'success');
            emailInput.value = '';

            // Celebration effect
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#00F2FF', '#7000FF', '#FFFFFF']
                });
            }

        } catch (error) {
            console.error('Newsletter Error:', error);
            showNewsletterStatus('Something went wrong. Please try again later.', 'error');
        } finally {
            newsletterSubmit.disabled = false;
            newsletterSubmit.innerHTML = originalBtnText;
        }
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showNewsletterStatus(message, type) {
        newsletterStatus.textContent = message;
        newsletterStatus.className = 'newsletter-status ' + type;
    }
}

// BACKEND INTEGRATION (Apps Script)
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxEzjn6GZ9JD9XH32zny1hgKgNO9anjIrNBMjG-gmLobMSMi0EsoQg3wjRW0M4792ejlA/exec';

async function fetchHomeBlog() {
    const grid = document.getElementById('home-blog-grid');
    if (!grid) return;
    try {
        const response = await fetch(`${BACKEND_URL}?action=getPosts`);
        const data = await response.json();
        if (data.status === 'success') {
            const posts = data.posts.slice(0, 3);
            grid.innerHTML = posts.map(post => {
                const date = new Date(post.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return `<div class="blog-card glass" onclick="window.location.href='/blog'" style="cursor:pointer; display:flex; flex-direction:column; overflow:hidden;">
                    <div style="height: 160px; overflow: hidden;">
                        <img src="${post.thumbnail}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="padding: 1.5rem;">
                        <span style="color: var(--primary-color); font-size: 0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${date}</span>
                        <h4 style="margin: 0.5rem 0; font-size: 1.1rem; color: var(--text-main);">${post.title}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-dim); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${post.summary}</p>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (e) {
        console.error('Home Blog Error:', e);
    }
}
document.addEventListener('DOMContentLoaded', fetchHomeBlog);

/* LIVE VISITOR COUNTER - REAL-TIME ANALYTICS */
async function initLiveVisitorCounter() {
    const footerBottom = document.querySelector('.footer-bottom');
    if (!footerBottom) return;

    // 1. Create Counter Element
    const liveContainer = document.createElement('div');
    liveContainer.className = 'footer-live-status';
    liveContainer.innerHTML = `
        <span class="live-dot pulse"></span>
        <span class="live-text">Calculating active users...</span>
    `;
    footerBottom.appendChild(liveContainer);

    const countDisplay = document.createElement('strong');
    const labelText = document.createTextNode(' visitors online now');

    async function updateCounter() {
        try {
            const response = await fetch(`${BACKEND_URL}?action=getLiveVisitors`);
            const data = await response.json();

            let count = data.status === 'success' ? data.count : null;

            // Fallback to Simulation if Real Data fails or is 0
            if (count === null || count === 0) {
                const hours = new Date().getHours();
                let baseCount = 42;
                if (hours >= 18 && hours <= 23) baseCount = 85;
                else if (hours >= 0 && hours <= 4) baseCount = 20;
                count = Math.floor(baseCount + (Math.random() * 15));
            }

            // Update UI with smooth transition
            const textElement = liveContainer.querySelector('.live-text');
            textElement.style.opacity = '0';

            setTimeout(() => {
                textElement.innerHTML = '';
                countDisplay.textContent = count;
                textElement.appendChild(countDisplay);
                textElement.appendChild(labelText);
                textElement.style.opacity = '1';
                textElement.style.transition = 'opacity 0.3s ease';
            }, 300);

        } catch (e) {
            console.warn('Live Counter Fetch Error, using simulation.');
        }
    }

    // Initial Fetch
    await updateCounter();

    // Periodic Update (Every 60 seconds to save API quota)
    setInterval(updateCounter, 60000);
}

window.addEventListener('load', initLiveVisitorCounter);

/* --- CUSTOM PREMIUM CURSOR LOGIC --- */
function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    const body = document.body;

    if (!dot || !outline) return;

    // Safety: Only hide the real cursor if we have the custom one ready
    document.documentElement.classList.add('custom-cursor-active');

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    // Linear Interpolation (Lerp) for smooth following
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instantly move the dot
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        dot.style.opacity = '1';
        outline.style.opacity = '1';
    });

    function animate() {
        // Smoothly follow with the outline
        outlineX = lerp(outlineX, mouseX, 0.15);
        outlineY = lerp(outlineY, mouseY, 0.15);

        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;

        requestAnimationFrame(animate);
    }
    animate();

    // Hover Detection
    const interactiveElements = 'a, button, [role="button"], .glass, .glass-card, .blog-card, .supporter-card, .faq-question, .read-more, .nav-link, .btn-nav-cta, .social-link';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveElements)) {
            body.classList.add('cursor-hovered');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements)) {
            body.classList.remove('cursor-hovered');
        }
    });

    // Active/Click Detection & Mesh Ping
    document.addEventListener('mousedown', (e) => {
        body.classList.add('cursor-active');

        // Spawn Ripple
        const ripple = document.createElement('div');
        ripple.className = 'cursor-ping';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);

        // Cleanup
        setTimeout(() => ripple.remove(), 600);
    });

    document.addEventListener('mouseup', () => body.classList.remove('cursor-active'));

    // --- NEW: Magnetic Interaction ---
    const magneticElements = document.querySelectorAll('.btn, .nav-link, .btn-nav-cta, .social-link, .glass-card');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Subtle pull effect
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px) scale(1.02)`;
            el.classList.add('magnetic-target');

            // Magnetize the cursor dot slightly to the center
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            mouseX = lerp(mouseX, centerX, 0.2);
            mouseY = lerp(mouseY, centerY, 0.2);
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.classList.remove('magnetic-target');
        });
    });

    // Handle Window Leave
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        outline.style.opacity = '0';
    });
}

// Initialize if NOT on mobile
if (window.innerWidth > 1024) {
    initCustomCursor();
}

// =============================================
// --- SCENARIO SIMULATOR LOGIC ---
// =============================================
function initScenarioSimulator() {
    const canvas = document.getElementById('scenario-canvas');
    const atm = document.getElementById('scenario-atm');
    const btns = document.querySelectorAll('.scenario-btn');
    const title = document.getElementById('scenario-title');
    const desc = document.getElementById('scenario-desc');
    const densityStat = document.getElementById('stat-density');
    const reliabilityStat = document.getElementById('stat-reliability');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let activeScenario = 'wilderness';

    const scenarios = {
        wilderness: {
            title: "Outdoor Adventure",
            desc: "Stay in touch while hiking or camping in areas with zero cellular coverage. Long-range links bridge the gap.",
            density: "Low",
            reliability: "High",
            color: "High",
            particleCount: 15,
            speed: 0.3,
            linkDist: 250,
            atmClass: "atm-wilderness"
        },
        emergency: {
            title: "Emergency Response",
            desc: "A lifeline during natural disasters. Urgent pulsing connections ensure critical data reaches rescuers.",
            density: "Medium",
            reliability: "Critical",
            particleCount: 30,
            speed: 1.2,
            linkDist: 180,
            atmClass: "atm-emergency"
        },
        festival: {
            title: "Mass Events",
            desc: "Bypass network congestion at music festivals or stadiums. High-density nodes create a resilient local web.",
            density: "Extreme",
            reliability: "Medium",
            particleCount: 60,
            speed: 0.8,
            linkDist: 100,
            atmClass: "atm-festival"
        },
        privacy: {
            title: "Privacy Conscious",
            desc: "True anonymity for sensitive environments. No central servers means no tracking or surveillance.",
            density: "Stealth",
            reliability: "Max",
            particleCount: 20,
            speed: 0.2,
            linkDist: 150,
            atmClass: "atm-privacy"
        }
    };

    class SimParticle {
        constructor(config) {
            this.config = config;
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * this.config.speed;
            this.vy = (Math.random() - 0.5) * this.config.speed;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = activeScenario === 'emergency' ? '#FF4D4D' : 'var(--primary-color)';
            ctx.fill();
        }
    }

    function setupScenario(id) {
        const config = scenarios[id];
        activeScenario = id;

        // Update UI
        btns.forEach(b => b.classList.toggle('active', b.dataset.scenario === id));
        atm.className = 'scenario-atm-overlay ' + config.atmClass;

        // Update Text with fade
        const info = document.querySelector('.scenario-info');
        info.style.opacity = '0';
        info.style.transform = 'translateY(10px)';

        setTimeout(() => {
            title.textContent = config.title;
            desc.textContent = config.desc;
            densityStat.textContent = config.density;
            reliabilityStat.textContent = config.reliability;
            info.style.opacity = '1';
            info.style.transform = 'translateY(0)';
        }, 300);

        // Reset Particles
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new SimParticle(config));
        }
    }

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        setupScenario(activeScenario);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const config = scenarios[activeScenario];

        particles.forEach((p, i) => {
            p.update();
            p.draw();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.linkDist) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = activeScenario === 'emergency'
                        ? `rgba(255, 77, 77, ${1 - dist / config.linkDist})`
                        : `rgba(${window.airlinkLerp.primaryRgb}, ${1 - dist / config.linkDist})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => setupScenario(btn.dataset.scenario));
    });

    window.addEventListener('resize', resize);
    resize();
    animate();
}

// Initial Call
document.addEventListener('DOMContentLoaded', () => {
    initScenarioSimulator();
});

/* ==========================================================================
   STICKY SCROLL USE CASES LOGIC
   ========================================================================== */

function initStickyUseCases() {
    const wrapper = document.getElementById('sticky-wrapper');
    const view = document.querySelector('.sticky-view');
    const cards = gsap.utils.toArray('.scroll-card');
    const labels = gsap.utils.toArray('.progress-labels .label');
    const fill = document.getElementById('sticky-progress-fill');

    if (!wrapper || !cards.length) return;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Create a timeline for the sticky section
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                // Update progress bar fill
                if (fill) fill.style.height = (self.progress * 100) + "%";

                // Calculate which card is active (0 to 3)
                // Use a slight offset to switch exactly in the middle of segments
                const index = Math.min(
                    Math.floor(self.progress * cards.length),
                    cards.length - 1
                );

                // Update active classes
                cards.forEach((card, i) => {
                    if (i === index) {
                        if (!card.classList.contains('active')) {
                            card.classList.add('active');
                        }
                    } else {
                        card.classList.remove('active');
                    }
                });

                labels.forEach((label, i) => {
                    if (i === index) {
                        if (!label.classList.contains('active')) {
                            label.classList.add('active');
                        }
                    } else {
                        label.classList.remove('active');
                    }
                });
            }
        }
    });

    // Background subtle zoom effect
    cards.forEach((card, i) => {
        const bg = card.querySelector('.card-bg');
        if (bg) {
            tl.fromTo(bg,
                { scale: 1 },
                { scale: 1.1, ease: "none", duration: 1 },
                i // This maps the animation to the segment
            );
        }
    });
}

// Initialize on Load
window.addEventListener('load', () => {
    try {
        initStickyUseCases();
    } catch (e) {
        console.warn("Sticky Use Cases init skipped or failed:", e.message);
    }
});

// ===== AIRLINK HANDSHAKE (MQTT) =====
(function initAirLinkHandshake() {
    const fab = document.getElementById('handshake-fab');
    const modal = document.getElementById('handshake-modal');
    const closeBtn = document.getElementById('handshake-modal-close');
    const retryBtn = document.getElementById('hs-retry-btn');
    const disconnectBtn = document.getElementById('hs-disconnect-btn');

    const stateInit = document.getElementById('hs-state-init');
    const stateReady = document.getElementById('hs-state-ready');
    const stateConn = document.getElementById('hs-state-connected');
    const stateError = document.getElementById('hs-state-error');

    const qrImg = document.getElementById('hs-qr-img');
    const peerIdText = document.getElementById('hs-peer-id-text');
    const swipeCounter = document.getElementById('hs-swipe-counter');

    if (!fab || !modal) return;

    // --- Create remote cursor element ---
    let remoteCursor = document.getElementById('airlink-remote-cursor');
    if (!remoteCursor) {
        remoteCursor = document.createElement('div');
        remoteCursor.id = 'airlink-remote-cursor';
        document.body.appendChild(remoteCursor);
    }
    // Cursor position state — starts at screen center
    let remoteCursorX = window.innerWidth / 2;
    let remoteCursorY = window.innerHeight / 2;
    let lastHoveredElement = null;

    // --- MQTT config ---
    const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
    let mqttClient = null;
    let sessionId = null;
    let sessionReady = false;
    let phoneConnected = false;
    let swipeCount = 0;

    // --- Helpers ---
    function showState(state) {
        [stateInit, stateReady, stateConn, stateError].forEach(s => s.classList.add('hidden'));
        state.classList.remove('hidden');
    }

    function generateSessionId() {
        // 6-char uppercase alphanumeric code
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function buildRemoteUrl(sid) {
        const base = window.location.origin;
        const remoteUrl = `${base}/remote?session=${sid}`;
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=ffffff&color=000000&data=${encodeURIComponent(remoteUrl)}`;
        return { qrApi, remoteUrl };
    }

    // --- Init MQTT session ---
    function initSession() {
        if (typeof mqtt === 'undefined') {
            console.error('[AirLink] MQTT.js not loaded');
            showState(stateError);
            return;
        }

        showState(stateInit);
        sessionReady = false;
        phoneConnected = false;
        swipeCount = 0;

        // Clean up old client
        if (mqttClient) { try { mqttClient.end(true); } catch (e) { } mqttClient = null; }

        // New session code
        sessionId = generateSessionId();
        const scrollTopic = `airlink/${sessionId}/scroll`;
        const ackTopic = `airlink/${sessionId}/ack`;

        mqttClient = mqtt.connect(MQTT_BROKER, {
            clientId: `al-desktop-${sessionId}-${Math.random().toString(36).substring(2, 6)}`,
            clean: true,
            connectTimeout: 10000,
            reconnectPeriod: 0  // No auto-reconnect — we handle it manually
        });

        mqttClient.on('connect', () => {
            mqttClient.subscribe(scrollTopic, { qos: 0 }, (err) => {
                if (err) { showState(stateError); return; }

                sessionReady = true;
                peerIdText.textContent = sessionId;

                const { qrApi } = buildRemoteUrl(sessionId);
                qrImg.onload = () => showState(stateReady);
                qrImg.onerror = () => showState(stateError);
                qrImg.src = qrApi;
            });
        });

        mqttClient.on('message', (topic, message) => {
            if (topic !== scrollTopic) return;
            try {
                const data = JSON.parse(message.toString());

                // Phone connected — first message is a ping
                if (!phoneConnected) {
                    phoneConnected = true;
                    swipeCount = 0;
                    swipeCounter.textContent = '0 swipes received';
                    showState(stateConn);
                    // Send ack back
                    if (mqttClient && mqttClient.connected) {
                        mqttClient.publish(ackTopic, JSON.stringify({ ok: true }), { qos: 0 });
                    }
                }

                if (data.action === 'scroll' && typeof data.delta === 'number') {
                    swipeCount++;
                    swipeCounter.textContent = `${swipeCount} action${swipeCount !== 1 ? 's' : ''} received`;

                    const lenis = window.airlinkLenis;
                    if (lenis) {
                        lenis.scrollTo(window.scrollY + data.delta, {
                            duration: 0.25,
                            easing: t => 1 - Math.pow(1 - t, 3)
                        });
                    } else {
                        window.scrollBy({ top: data.delta, behavior: 'smooth' });
                    }
                }

                // --- Remote cursor: relative move (dx/dy) ---
                if (data.action === 'move' && typeof data.dx === 'number') {
                    remoteCursorX = Math.max(0, Math.min(window.innerWidth, remoteCursorX + data.dx));
                    remoteCursorY = Math.max(0, Math.min(window.innerHeight, remoteCursorY + data.dy));
                    remoteCursor.style.left = remoteCursorX + 'px';
                    remoteCursor.style.top = remoteCursorY + 'px';
                    remoteCursor.classList.add('visible');
                    remoteCursor.classList.remove('clicking');

                    // --- Hover Simulation ---
                    const target = document.elementFromPoint(remoteCursorX, remoteCursorY);
                    if (target !== lastHoveredElement) {
                        if (lastHoveredElement) {
                            lastHoveredElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                        }
                        if (target) {
                            target.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                        }
                        lastHoveredElement = target;
                    }

                    swipeCount++;
                    swipeCounter.textContent = `${swipeCount} action${swipeCount !== 1 ? 's' : ''} received`;
                }

                // --- Remote cursor: click at current position ---
                if (data.action === 'click') {
                    remoteCursor.classList.add('clicking');
                    setTimeout(() => remoteCursor.classList.remove('clicking'), 220);

                    // Click ripple
                    const ripple = document.createElement('div');
                    ripple.className = 'airlink-click-ripple';
                    ripple.style.left = remoteCursorX + 'px';
                    ripple.style.top = remoteCursorY + 'px';
                    document.body.appendChild(ripple);
                    ripple.addEventListener('animationend', () => ripple.remove());

                    // Fire real click at cursor coords
                    const target = document.elementFromPoint(remoteCursorX, remoteCursorY);
                    if (target) target.click();

                    swipeCount++;
                    swipeCounter.textContent = `${swipeCount} action${swipeCount !== 1 ? 's' : ''} received`;
                }

                // --- Show / hide cursor ---
                if (data.action === 'cursor_show') remoteCursor.classList.add('visible');
                if (data.action === 'cursor_hide') remoteCursor.classList.remove('visible');
                if (data.action === 'cursor_leave') remoteCursor.classList.remove('visible');

                if (data.action === 'disconnect') {
                    phoneConnected = false;
                    remoteCursor.classList.remove('visible');
                    showState(stateReady);
                }
            } catch (e) { /* ignore malformed */ }
        });

        mqttClient.on('error', (err) => {
            console.warn('[AirLink MQTT] Error:', err.message || err);
            showState(stateError);
        });

        mqttClient.on('close', () => {
            if (phoneConnected) {
                phoneConnected = false;
                if (modal.classList.contains('active')) showState(stateReady);
            }
        });
    }

    // --- Open Modal ---
    function openModal() {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (!sessionReady || !mqttClient || !mqttClient.connected) {
            initSession();
        } else {
            // Session alive — just re-show the QR
            showState(stateReady);
        }
    }

    // --- Close Modal (session stays alive) ---
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // --- Disconnect phone but keep session ---
    function disconnect() {
        phoneConnected = false;
        swipeCount = 0;
        showState(stateReady);
    }

    // --- Full reset (new session, new QR) ---
    function fullReset() {
        phoneConnected = false;
        swipeCount = 0;
        sessionReady = false;
        initSession();
    }

    // --- Events ---
    fab.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    retryBtn.addEventListener('click', fullReset);
    disconnectBtn.addEventListener('click', disconnect);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // --- Auto-start session on page load ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSession);
    } else {
        initSession();
    }
})();

