/* HELEN banner behaviour. No data leaves this page except through Helen's own widget. */
(function () {
	'use strict';
	var AGENT_ID = 'agent_6301m66z2s9de4wtrx90anjjxxyx'; // Helen Maple, unchanged
	var QUESTIONS = [
		'When is garbage pickup on my road?',
		'Do I need a permit to build a deck?',
		'How do I pay my property taxes?',
		'Where do I vote?',
		'Can I burn brush in my yard?',
		'When does the Town Board meet next?',
		'Who do I call about a pothole?',
		'I just moved here. What should I set up first?',
		'Do I need a dog license?',
		'Where can I go hiking near Delafield?'
	];

	var form = document.getElementById('helen-form');
	var input = document.getElementById('helen-q');
	var typed = document.getElementById('helen-typed');
	var mic = document.getElementById('helen-mic');
	var banner = document.getElementById('helen-banner');
	if (!form || !input) return;

	/* ---------- rotating example questions ---------- */
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var stopped = false, timer = null, qi = 0;
	var t = document.createElement('span'); t.className = 'hb-t'; typed.appendChild(t);
	function show(text) {
		t.textContent = text;
		typed.classList.toggle('hb-overflow', t.offsetWidth > typed.clientWidth);
	}
	function stopRotation() {
		stopped = true; clearTimeout(timer);
		form.classList.add('hb-active');
	}
	function typeOut(text, i) {
		if (stopped) return;
		show(text.slice(0, i));
		if (i < text.length) { timer = setTimeout(function () { typeOut(text, i + 1); }, 55); }
		else { timer = setTimeout(function () { erase(text, text.length); }, 2400); }
	}
	function erase(text, i) {
		if (stopped) return;
		show(text.slice(0, i));
		if (i > 0) { timer = setTimeout(function () { erase(text, i - 1); }, 22); }
		else { qi = (qi + 1) % QUESTIONS.length; timer = setTimeout(function () { typeOut(QUESTIONS[qi], 0); }, 350); }
	}
	if (reduce) { show(QUESTIONS[0]); }
	else { typed.classList.add('hb-caret'); timer = setTimeout(function () { typeOut(QUESTIONS[0], 0); }, 600); }
	['focus', 'pointerdown', 'keydown'].forEach(function (ev) { input.addEventListener(ev, stopRotation); });
	mic.addEventListener('focus', stopRotation);
	input.addEventListener('input', function () {
		form.classList.toggle('hb-has-text', input.value.trim().length > 0);
		mic.setAttribute('aria-label', input.value.trim() ? 'Send your question to Helen' : 'Talk to Helen');
	});

	/* ---------- Helen's widget ---------- */
	var widget = null, opened = false;
	function ensureWidget() {
		if (widget) return widget;
		widget = document.createElement('elevenlabs-convai');
		widget.setAttribute('agent-id', AGENT_ID);
		document.body.appendChild(widget);
		return widget;
	}
	function root() { return widget && widget.shadowRoot; }
	function waitFor(fn, ms) {
		return new Promise(function (resolve) {
			var t0 = Date.now();
			(function poll() {
				var v = null; try { v = fn(); } catch (e) { v = null; }
				if (v) return resolve(v);
				if (Date.now() - t0 > ms) return resolve(null);
				setTimeout(poll, 100);
			})();
		});
	}
	function expand() {
		opened = true; stopRotation();
		if (widget) { widget.classList.remove('hb-launcher-hidden'); widget.classList.add('hb-opened'); }
		document.body.classList.add('hb-helen-open');
		document.dispatchEvent(new CustomEvent('elevenlabs-agent:expand', { detail: { action: 'expand' } }));
	}
	function ready() { return waitFor(function () { return window.customElements && customElements.get('elevenlabs-convai') && root(); }, 8000); }

	function startVoice() {
		ensureWidget();
		ready().then(function () {
			expand();
			// Start the call the way a visitor would: the widget's own start button.
			return waitFor(function () {
				var r = root(); if (!r) return null;
				return r.querySelector('button[aria-label*="Start" i], button[aria-label*="call" i]');
			}, 3000);
		}).then(function (btn) { if (btn && !btn.disabled) btn.click(); });
	}
	function askText(q) {
		ensureWidget();
		ready().then(function () {
			expand();
			return waitFor(function () {
				var r = root(); if (!r) return null;
				return r.querySelector('textarea, input[type="text"]');
			}, 3000);
		}).then(function (box) {
			if (!box) return;
			var proto = box.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
			Object.getOwnPropertyDescriptor(proto, 'value').set.call(box, q);
			box.dispatchEvent(new Event('input', { bubbles: true }));
			box.focus();
			// Send it as the visitor's first message, with the widget's own Send button.
			return waitFor(function () {
				var r = root(); if (!r) return null;
				var b = r.querySelector('button[aria-label="Send"]');
				return b && !b.disabled ? b : null;
			}, 2000).then(function (send) {
				if (send) send.click();
				else box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }));
			});
		});
	}
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var q = input.value.trim();
		if (q) askText(q); else startVoice();
	});
	mic.addEventListener('click', function () {
		stopRotation();
		var q = input.value.trim();
		if (q) askText(q); else startVoice();
	});

	// Load the widget once the page is idle; keep its floating launcher hidden while the banner is on screen.
	function loadWidgetScript() {
		var s = document.createElement('script');
		s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.22.2';
		s.async = true;
		document.head.appendChild(s);
		ensureWidget();
		if ('IntersectionObserver' in window) {
			new IntersectionObserver(function (entries) {
				var vis = entries[0].isIntersecting;
				if (!opened) widget.classList.toggle('hb-launcher-hidden', vis);
			}, { threshold: 0.15 }).observe(banner);
		}
	}
	// When Helen is collapsed again, put the Town's page back as it was: the share button
	// returns and, on phones, the floating launcher hides again.
	setInterval(function () {
		if (!opened || !root()) return;
		// The widget's message box exists only while its panel is open.
		var expanded = !!root().querySelector('textarea');
		if (!expanded) {
			document.body.classList.remove('hb-helen-open');
			widget.classList.remove('hb-opened');
		} else {
			document.body.classList.add('hb-helen-open');
			widget.classList.add('hb-opened');
		}
	}, 700);
	if (document.readyState === 'complete') loadWidgetScript(); else window.addEventListener('load', loadWidgetScript);

	/* ---------- intro video ---------- */
	var frame = document.getElementById('helen-frame');
	var video = document.getElementById('helen-video');
	var play = document.getElementById('helen-play');
	var expandBtn = document.getElementById('helen-expand');
	function captionsOn() {
		for (var i = 0; i < video.textTracks.length; i++) video.textTracks[i].mode = 'showing';
	}
	play.addEventListener('click', function () {
		video.controls = true; video.muted = false; captionsOn();
		var p = video.play(); if (p && p.catch) p.catch(function () {});
		frame.classList.add('hb-playing');
		video.focus();
	});
	video.addEventListener('play', function () { frame.classList.add('hb-playing'); captionsOn(); });
	video.addEventListener('ended', function () { frame.classList.remove('hb-playing'); video.controls = false; video.load(); });
	expandBtn.addEventListener('click', function () {
		captionsOn();
		if (video.paused) { video.controls = true; var p = video.play(); if (p && p.catch) p.catch(function () {}); }
		if (frame.requestFullscreen) frame.requestFullscreen();
		else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
		else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
	});
})();
