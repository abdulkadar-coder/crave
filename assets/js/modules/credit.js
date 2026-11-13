/**
 * Piqo and e-Medias credits: on hover the line switches language (CSS).
 * Easter egg: the more you insist, the more the chef has to say.
 */
const LINES = {
	emedias: [
		null,
		'So you like this masterpiece? Go on, admit it.',
		null,
		'Fun fact: 47 burgers were sacrificed during the making of this masterpiece.',
		null,
		'You again? This masterpiece is not edible… but it is clickable.',
		'A work of art, I know. Go on, you can click now.',
	],
	piqo: [
		null,
		'Every burger here was drawn by hand. Yes, really, by hand.',
		null,
		'51 pictograms drawn. Us? We just did the tasting.',
		null,
		'“The Masterpiece” is also on the menu. Coincidence? Doubtful.',
		'Pure art! Go on, click — they deserve it.',
	],
};

export function initCredit() {
	document.querySelectorAll('[data-credit]').forEach((link) => {
		const bubble = link.querySelector('[data-credit-bubble]');
		const lines = LINES[link.dataset.credit] || [];
		if (!bubble || !lines.length) return;
		let count = 0;
		let timer = 0;
		link.addEventListener('pointerenter', () => {
			const line = lines[count % lines.length];
			count++;
			if (!line) return;
			bubble.textContent = line;
			bubble.classList.add('is-on');
			clearTimeout(timer);
			timer = setTimeout(() => bubble.classList.remove('is-on'), 3800);
		});
	});
}
