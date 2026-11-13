/**
 * Couche « kinétique » ajoutée par-dessus GSAP/ScrollTrigger/Lenis.
 *
 * Trois effets sont adaptés de react-bits (MIT) en JavaScript natif, le site
 * n'utilisant pas React :
 *   - SpotlightCard → halo qui suit le curseur sur les cartes et les liens ;
 *   - TiltedCard   → légère inclinaison 3D des visuels de la galerie ;
 *   - ClickSpark   → étincelles dorées au clic (canvas plein écran).
 *
 * Plus : barre de progression de lecture, boutons magnétiques et brillance
 * au survol. Tout est désactivé en `prefers-reduced-motion`.
 */

export function initFX({ reduced = false } = {}) {
	const { gsap, ScrollTrigger } = window;
	const fine = matchMedia('(pointer: fine) and (hover: hover)').matches;

	// Mouvement réduit : on évite ScrollTrigger (non rafraîchi dans ce mode) au
	// profit d'un simple écouteur de défilement.
	initProgress(reduced ? null : gsap, reduced ? null : ScrollTrigger);

	if (reduced || !gsap) return;

	if (fine) {
		initSpotlight();
		initTilt(gsap);
		initMagnet(gsap);
	}
	initSparks();
}

/* ---------- Barre de progression de lecture ---------- */
function initProgress(gsap, ScrollTrigger) {
	if (document.querySelector('.progress')) return;

	const bar = document.createElement('div');
	bar.className = 'progress';
	bar.setAttribute('aria-hidden', 'true');
	bar.innerHTML = '<i></i>';
	document.body.append(bar);

	const fill = bar.firstElementChild;

	if (gsap && ScrollTrigger) {
		const setX = gsap.quickSetter(fill, 'scaleX');
		gsap.set(fill, { scaleX: 0, transformOrigin: '0 50%' });
		ScrollTrigger.create({
			start: 0,
			end: 'max',
			onUpdate: (self) => setX(self.progress),
		});
	} else {
		const update = () => {
			const max = document.documentElement.scrollHeight - innerHeight;
			fill.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
		};
		addEventListener('scroll', update, { passive: true });
		addEventListener('resize', update);
		update();
	}
}

/* ---------- Halo au curseur (react-bits SpotlightCard) ---------- */
function initSpotlight() {
	const targets = document.querySelectorAll(
		'[data-card] .card__media, .s-visit__actions .btn, .s-end__links a'
	);

	targets.forEach((el) => {
		el.classList.add('spot');
		// Le pourcentage est écrit dans des variables CSS : le dégradé suit la
		// souris sans provoquer de recalcul GSAP.
		el.addEventListener('pointermove', (e) => {
			const r = el.getBoundingClientRect();
			el.style.setProperty('--sx', ((e.clientX - r.left) / r.width) * 100 + '%');
			el.style.setProperty('--sy', ((e.clientY - r.top) / r.height) * 100 + '%');
		});
	});
}

/* ---------- Inclinaison 3D des cartes (react-bits TiltedCard) ---------- */
function initTilt(gsap) {
	document.querySelectorAll('[data-card] .card__media').forEach((el) => {
		gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });
		const rx = gsap.quickTo(el, 'rotationX', { duration: 0.55, ease: 'power3' });
		const ry = gsap.quickTo(el, 'rotationY', { duration: 0.55, ease: 'power3' });
		const card = el.closest('[data-card]');

		card.addEventListener('pointermove', (e) => {
			const r = el.getBoundingClientRect();
			ry(((e.clientX - r.left) / r.width - 0.5) * 10);
			rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
		});
		card.addEventListener('pointerleave', () => {
			rx(0);
			ry(0);
		});
	});
}

/* ---------- Boutons magnétiques (les liens de la barre le sont déjà) ---------- */
function initMagnet(gsap) {
	document.querySelectorAll('.btn:not([data-magnetic])').forEach((el) => {
		const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
		const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

		el.addEventListener('pointermove', (e) => {
			const r = el.getBoundingClientRect();
			qx((e.clientX - (r.left + r.width / 2)) * 0.18);
			qy((e.clientY - (r.top + r.height / 2)) * 0.22);
		});
		el.addEventListener('pointerleave', () => {
			gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
		});
	});
}

/* ---------- Étincelles au clic (react-bits ClickSpark) ---------- */
function initSparks() {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const canvas = document.createElement('canvas');
	canvas.className = 'sparks';
	canvas.setAttribute('aria-hidden', 'true');
	document.body.append(canvas);

	const ctx = canvas.getContext('2d');
	const dpr = Math.min(2, devicePixelRatio || 1);
	const resize = () => {
		canvas.width = Math.round(innerWidth * dpr);
		canvas.height = Math.round(innerHeight * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};
	resize();
	addEventListener('resize', resize);

	const COLORS = ['#FDBC01', '#FED06E', '#F4AD32', '#FFF0DC'];
	const DURATION = 480;
	const COUNT = 9;
	const sparks = [];
	let raf = 0;

	const draw = (now) => {
		ctx.clearRect(0, 0, innerWidth, innerHeight);

		for (let i = sparks.length - 1; i >= 0; i--) {
			const s = sparks[i];
			const p = (now - s.t0) / DURATION;
			if (p >= 1) {
				sparks.splice(i, 1);
				continue;
			}
			// Départ rapide puis freinage : la traînée s'allonge et pâlit.
			const eased = 1 - Math.pow(1 - p, 3);
			const r0 = eased * s.len * 0.45;
			const r1 = eased * s.len;
			ctx.globalAlpha = 1 - p;
			ctx.strokeStyle = s.color;
			ctx.lineWidth = 2.2;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(s.x + Math.cos(s.angle) * r0, s.y + Math.sin(s.angle) * r0);
			ctx.lineTo(s.x + Math.cos(s.angle) * r1, s.y + Math.sin(s.angle) * r1);
			ctx.stroke();
		}

		ctx.globalAlpha = 1;
		raf = sparks.length ? requestAnimationFrame(draw) : 0;
	};

	addEventListener(
		'pointerdown',
		(e) => {
			const now = performance.now();
			for (let i = 0; i < COUNT; i++) {
				sparks.push({
					x: e.clientX,
					y: e.clientY,
					angle: (i / COUNT) * Math.PI * 2 + Math.random() * 0.4,
					len: 26 + Math.random() * 22,
					t0: now,
					color: COLORS[i % COLORS.length],
				});
			}
			if (!raf) raf = requestAnimationFrame(draw);
		},
		{ passive: true }
	);
}
