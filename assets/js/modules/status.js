/**
 * Live opening status (Asia/Kolkata time zone), countdown to launch and
 * highlighting of today's row in the opening-hours list.
 */
const DAYS = ['', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAYS_LONG = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const toMin = (s) => {
	const [a, b] = s.split(':').map(Number);
	return a * 60 + b;
};

/** 12-hour label: "17:00" → "5 PM", "02:30" → "2:30 AM". */
const clock = (s) => {
	const [h, m] = s.split(':').map(Number);
	const h12 = ((h + 11) % 12) + 1;
	const suffix = h < 12 ? 'AM' : 'PM';
	return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
};

/** ISO weekday (1-7) and minutes elapsed, in the restaurant's time zone. */
function localNow(tz) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: tz,
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(new Date());
	const get = (t) => parts.find((p) => p.type === t)?.value;
	const day = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[get('weekday')];
	return { day, min: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** Closing time as minutes, rolled past midnight when the window is overnight. */
const closeMin = (o, c) => (toMin(c) <= toMin(o) ? toMin(c) + 1440 : toMin(c));

/** Start of the service that may still be running from yesterday. */
function lastNight(hours, day) {
	const prev = ((day + 5) % 7) + 1; // day - 1, wrapped to 1-7
	const y = hours[prev];
	if (!y) return null;
	const c = closeMin(y[0], y[1]);
	return c > 1440 ? { until: c - 1440, close: y[1] } : null;
}

function compute(data) {
	const hours = data.hours || {};
	const { day, min } = localNow(data.tz || 'Asia/Kolkata');
	const launch = data.launch ? Date.parse(data.launch) : 0;
	const before = launch && Date.now() < launch;

	if (before) {
		const parts = new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: 'numeric',
			minute: '2-digit',
			hourCycle: 'h12',
			timeZone: data.tz,
		}).formatToParts(new Date(launch));
		const get = (t) => parts.find((p) => p.type === t)?.value;
		const date = `${get('day')} ${get('month')}`;
		const time = `${String(Number(get('hour')))}${get('minute') === '00' ? '' : `:${get('minute')}`} ${get('dayPeriod')}`;
		const narrow = innerWidth < 520;
		return { open: false, today: day, text: narrow ? `Opening ${date}` : `Opening ${date} from ${time}`, k: '', sub: '' };
	}

	// After launch: permanent status derived from the opening hours.
	const night = lastNight(hours, day);
	if (night && min < night.until) {
		return { open: true, today: day, text: `Open now · until ${clock(night.close)}`, k: 'Open now', sub: `until ${clock(night.close)}` };
	}

	const today = hours[day];
	if (today) {
		const [o, c] = today;
		if (min >= toMin(o) && min < closeMin(o, c)) {
			return { open: true, today: day, text: `Open now · until ${clock(c)}`, k: 'Open now', sub: `until ${clock(c)} tonight` };
		}
		if (min < toMin(o)) {
			return { open: false, today: day, text: `Tonight from ${clock(o)}`, k: 'Today', sub: `tonight from ${clock(o)}` };
		}
	}
	for (let i = 1; i <= 7; i++) {
		const d = ((day - 1 + i) % 7) + 1;
		if (hours[d]) {
			const label = i === 1 ? 'Tomorrow' : DAYS_LONG[d];
			return { open: false, today: day, text: `${i === 1 ? 'Tomorrow' : DAYS[d]} from ${clock(hours[d][0])}`, k: 'See you soon', sub: `${label} from ${clock(hours[d][0])}` };
		}
	}
	return { open: false, today: day, text: '', k: '', sub: '' };
}

export function initStatus(data) {
	const statusText = document.querySelector('[data-status-text]');
	const counters = [...document.querySelectorAll('[data-countdown]')];
	const launch = data.launch ? Date.parse(data.launch) : 0;
	const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
	const setText = (el, v) => {
		if (el && el.textContent !== v) el.textContent = v;
	};

	const render = () => {
		const s = compute(data);
		setText(statusText, s.text);
		document.documentElement.classList.toggle('is-open', s.open);
		document.querySelectorAll('[data-hours-row]').forEach((row) => {
			const days = row.dataset.days.split(',').map(Number);
			row.classList.toggle('is-today', days.includes(s.today));
		});

		const left = launch - Date.now();
		for (const cd of counters) {
			if (left > 0) {
				const sec = Math.floor(left / 1000);
				setText(cd.querySelector('[data-cd="d"]'), pad(Math.floor(sec / 86400)));
				setText(cd.querySelector('[data-cd="h"]'), pad(Math.floor((sec % 86400) / 3600)));
				setText(cd.querySelector('[data-cd="m"]'), pad(Math.floor((sec % 3600) / 60)));
				setText(cd.querySelector('[data-cd="s"]'), pad(sec % 60));
				continue;
			}
			// Countdown reached zero: it becomes a permanent status.
			if (!cd.classList.contains('is-live')) {
				cd.classList.add('is-live');
				const label = cd.querySelector('[data-cd-label]');
				if (label) label.textContent = cd.dataset.summary || '';
				const open = cd.querySelector('.countdown__open');
				if (open) open.hidden = false;
			}
			setText(cd.querySelector('[data-open-k]'), s.k || 'Crave');
			setText(cd.querySelector('[data-open-text]'), s.sub || cd.dataset.summary || '');
		}
	};
	render();
	setInterval(render, 1000);
}
