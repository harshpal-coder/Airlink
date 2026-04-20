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

const canvas = document.getElementById('canvas-mesh');
const ctx = canvas.getContext('2d');
const navbar = document.getElementById('navbar');

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
        ctx.fillStyle = disaster ? 'rgba(0, 242, 255, 0.95)' : 'rgba(0, 242, 255, 0.5)';
        if (disaster) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#00F2FF';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

const particles = Array.from({ length: 80 }, () => new Particle());
let isCanvasPaused = false;

function animate() {
    if (isCanvasPaused) {
        requestAnimationFrame(animate);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.update();
        p.draw();

        // Draw connections
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
                ctx.strokeStyle = `rgba(0, 242, 255, ${alpha})`;
                if (disaster) {
                    ctx.lineWidth = 1.5;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = '#00F2FF';
                } else {
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.lineWidth = 1;
            }
        }
    });

    requestAnimationFrame(animate);
}

animate();

// --- PREMIUM NAVBAR LOGIC ---
const navIndicator = document.getElementById('nav-indicator');
const navLinksItems = document.querySelectorAll('.nav-link');
const navProgress = document.getElementById('nav-progress');

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
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// Update indicator on resize
window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-link.active');
    if (active) updateNavIndicator(active);
});

// Scroll Progress & Navbar Effects
window.addEventListener('scroll', () => {
    // Navbar background & size
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else if (!document.body.classList.contains('blog-page') && 
               !document.body.classList.contains('careers-page') && 
               !document.body.classList.contains('pricing-page') &&
               !document.body.classList.contains('legal-page')) {
        // Only remove scrolled class if not a sub-page that requires it
        navbar.classList.remove('scrolled');
    }

    // Scroll Progress
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (navProgress) navProgress.style.width = scrolled + "%";

    // ScrollSpy - Only if sections exist and we are on home
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0 && window.location.pathname === '/') {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        if (current) {
            navLinksItems.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('#' + current)) {
                    navLinksItems.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    updateNavIndicator(link);
                }
            });
        }
    }
});

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

// Smooth Scroll for local links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 0; // Section padding already accounts for the fixed header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = target.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 3D Tilt & Interactive Spotlight Logic
const tiltElements = document.querySelectorAll('.feature-card, .tech-card, .use-case-card, .link-item, .supporter-tier');
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
            if (disaster) r *= 1.6; // Nodes grow in disaster mode — they're alive!

            lctx.beginPath();
            lctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            lctx.fillStyle = this.flash > 0 ? `rgba(0, 242, 255, ${0.5 + this.flash})` : '#00F2FF';
            if (disaster) {
                lctx.shadowBlur = 25;
                lctx.shadowColor = '#00F2FF';
            }
            lctx.fill();
            lctx.strokeStyle = `rgba(0, 242, 255, ${disaster ? 0.6 : (isShape ? 0.1 : 0.2)})`;
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

    function animateLab() {
        lctx.clearRect(0, 0, labCanvas.width, labCanvas.height);

        const isShape = meshMode !== 'random';
        labNodes.forEach(n => n.update());

        lctx.strokeStyle = `rgba(0, 242, 255, ${isShape ? 0.04 : 0.1})`;
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
            lctx.strokeStyle = '#7000FF';
            lctx.lineWidth = 3;
            lctx.shadowBlur = 15;
            lctx.shadowColor = '#7000FF';
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
                lctx.strokeStyle = idx === 0 ? '#00F2FF' : '#7000FF';
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

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#00F2FF';
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
                            ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
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
        card.setAttribute('data-amount', `₹${amount}`);
    }
    const init = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    card.innerHTML = `
        <div class="supporter-avatar">${init}</div>
        <div class="supporter-info"><strong>${name}</strong></div>
    `;
    return card;
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

            // Sort everything back into tracks
            supporters.forEach(supporter => {
                const amount = parseFloat(supporter.amount) || 0;
                // supporter.email is also available here if needed for verification
                totalCollected += amount;

                let trackId;

                if (amount === 101) trackId = 1;
                else if (amount === 51) trackId = 2;
                else if (amount === 21) trackId = 3;
                else if (amount === 11) trackId = 4;
                else trackId = 5; // Custom amount automatically goes to track 5

                supportersByTrack[trackId].unshift({ name: supporter.name, amount: amount });
            });

            // Update the live total money UI
            const totalMoneyEl = document.getElementById('total-money-amount');
            if (totalMoneyEl) {
                totalMoneyEl.innerText = `₹${totalCollected}`;
            }

            // Update Goal Progress (Target: ₹2500)
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
        sendOtpBtn.textContent = 'Sending…';
        await sendOtp(email);
        sendOtpBtn.textContent = '✓ Sent';
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
        otpStatus.textContent = 'Resending OTP…';
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
                    otpStatus.textContent = '✅ Email verified!';
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
                    otpStatus.textContent = '❌ Incorrect OTP. Please try again.';
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
            submissionStatus.textContent = '⚠️ Please enter a valid 12-digit Transaction ID.';
            submissionStatus.className = 'submission-status error';
            return;
        }
        txnIdInput.style.borderColor = '';

        // Disable and show loading
        submitBtn.disabled = true;
        submissionStatus.textContent = '⏳ Submitting your details…';
        submissionStatus.className = 'submission-status loading';

        const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            amount: selectedAmount,
            txnId: txnId,
        };

        try {
            // Single GET request with URL params — reliable for Google Apps Script
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
            submissionStatus.textContent = '❌ Submission failed. Please try again.';
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
// --- DISASTER MODE SIMULATOR — ENHANCED ---
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
                addMessage("bot", "Hi there! I'm Nyra, your AirLink guide. 👋 Need help understanding how our offline mesh works?");
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
            showNewsletterStatus('Welcome to the mesh! Check your inbox soon. 🚀', 'success');
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
