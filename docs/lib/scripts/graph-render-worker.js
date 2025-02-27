if ("function" == typeof importScripts) {
	let e, t, o;
	importScripts(
		"https://d157l7jdn8e5sf.cloudfront.net/v7.2.0/webworker.js",
		"./tinycolor.js"
	),
		addEventListener("message", onMessage),
		(isDrawing = !1);
	let n = 0,
		a = [],
		r = [],
		i = 0,
		l = [],
		c = [],
		d = [],
		s = [],
		u = [],
		g = { x: 0, y: 0 },
		p = new Float32Array(0),
		h = 0,
		f = 0,
		y = {
			background: 2302755,
			link: 11184810,
			node: 13421772,
			outline: 11184810,
			text: 16777215,
			accent: 4203434,
		},
		S = -1,
		x = -1,
		v = -1,
		m = !1,
		w = [],
		b = -1,
		C = 1,
		k = 1;
	function toScreenSpace(e, t, o = !0) {
		return o
			? { x: Math.floor(e * C + g.x), y: Math.floor(t * C + g.y) }
			: { x: e * C + g.x, y: t * C + g.y };
	}
	function vecToScreenSpace({ x: e, y: t }, o = !0) {
		return toScreenSpace(e, t, o);
	}
	function toWorldspace(e, t) {
		return { x: (e - g.x) / C, y: (t - g.y) / C };
	}
	function vecToWorldspace({ x: e, y: t }) {
		return toWorldspace(e, t);
	}
	function setCameraCenterWorldspace({ x: e, y: t }) {
		(g.x = canvas.width / 2 - e * C), (g.y = canvas.height / 2 - t * C);
	}
	function getCameraCenterWorldspace() {
		return toWorldspace(canvas.width / 2, canvas.height / 2);
	}
	function getNodeScreenRadius(e) {
		return e * k;
	}
	function getNodeWorldspaceRadius(e) {
		return e / k;
	}
	function getPosition(e) {
		return { x: p[2 * e], y: p[2 * e + 1] };
	}
	function mixColors(e, t, o) {
		return tinycolor
			.mix(tinycolor(e.toString(16)), tinycolor(t.toString(16)), o)
			.toHexNumber();
	}
	function darkenColor(e, t) {
		return tinycolor(e.toString(16)).darken(t).toHexNumber();
	}
	function lightenColor(e, t) {
		return tinycolor(e.toString(16)).lighten(t).toHexNumber();
	}
	function invertColor(e, t) {
		if (
			(0 === (e = e.toString(16)).indexOf("#") && (e = e.slice(1)),
			3 === e.length && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]),
			6 !== e.length)
		)
			throw new Error("Invalid HEX color.");
		var o = parseInt(e.slice(0, 2), 16),
			n = parseInt(e.slice(2, 4), 16),
			a = parseInt(e.slice(4, 6), 16);
		return t
			? 0.299 * o + 0.587 * n + 0.114 * a > 186
				? "#000000"
				: "#FFFFFF"
			: ((o = (255 - o).toString(16)),
			  (n = (255 - n).toString(16)),
			  (a = (255 - a).toString(16)),
			  "#" + padZero(o) + padZero(n) + padZero(a));
	}
	function clamp(e, t, o) {
		return Math.min(Math.max(e, t), o);
	}
	function lerp(e, t, o) {
		return e + (t - e) * o;
	}
	let N = 0,
		T = 0.2,
		F = 15,
		M = 12,
		P = F / M;
	function showLabel(e, t, o = !1) {
		let n = u[e];
		if (((d[e] = t), !(t > 0.01))) return void hideLabel(e);
		(n.visible = !0), (n.style.fontSize = o ? F : M);
		let a = vecToScreenSpace(getPosition(e)),
			r = (s[e] * (o ? P : 1)) / 2;
		(n.x = a.x - r),
			(n.y = a.y + getNodeScreenRadius(l[e]) + 9),
			(n.alpha = t);
	}
	function hideLabel(e) {
		u[e].visible = !1;
	}
	function draw() {
		o.clear();
		let e = [];
		m && (w = []),
			(N = -1 != S || -1 != v ? Math.min(1, N + T) : Math.max(0, N - T)),
			o.lineStyle(1, mixColors(y.link, y.background, 50 * N), 0.7);
		for (let t = 0; t < n; t++) {
			let n = r[t],
				i = a[t];
			(S != i && S != n && ((x != i && x != n) || 0 == N)) ||
				(m && S == i ? w.push(n) : m && S == n && w.push(i), e.push(t));
			let c = getPosition(i),
				d = getPosition(n),
				s = vecToScreenSpace(c),
				u = vecToScreenSpace(d);
			Math.sqrt(Math.pow(c.x - d.x, 2) + Math.pow(c.y - d.y, 2)) <
				(l[i] + l[n]) * f && (o.moveTo(s.x, s.y), o.lineTo(u.x, u.y));
		}
		let t = 1 - 0.5 * N;
		o.beginFill(mixColors(y.node, y.background, 50 * N), t),
			o.lineStyle(0, 16777215);
		for (let e = 0; e < i; e++) {
			let t = getNodeScreenRadius(l[e]);
			if (S != e)
				if (t > 2) {
					showLabel(
						e,
						lerp(
							0,
							(t - 4) / 10 - (1 / k / 6) * 0.9,
							Math.max(1 - N, 0.2)
						)
					);
				} else hideLabel(e);
			if (S == e || (x == e && 0 != N) || (-1 != S && w.includes(e)))
				continue;
			let n = vecToScreenSpace(getPosition(e));
			o.drawCircle(n.x, n.y, t);
		}
		o.endFill(),
			(t = 0.7 * N),
			o.lineStyle(
				1,
				mixColors(
					mixColors(y.link, y.accent, 100 * N),
					y.background,
					20
				),
				t
			);
		for (let t = 0; t < e.length; t++) {
			let n = r[e[t]],
				i = vecToScreenSpace(getPosition(a[e[t]])),
				l = vecToScreenSpace(getPosition(n));
			o.moveTo(i.x, i.y), o.lineTo(l.x, l.y);
		}
		if (-1 != S || (-1 != x && 0 != N)) {
			o.beginFill(mixColors(y.node, y.accent, 20 * N), 0.9),
				o.lineStyle(0, 16777215);
			for (let e = 0; e < w.length; e++) {
				let t = w[e],
					n = vecToScreenSpace(getPosition(t));
				o.drawCircle(n.x, n.y, getNodeScreenRadius(l[t])),
					showLabel(t, Math.max(0.6 * N, d[t]));
			}
			o.endFill();
			let e = -1 != S ? S : x,
				t = vecToScreenSpace(getPosition(e));
			o.beginFill(mixColors(y.node, y.accent, 100 * N), 1),
				o.lineStyle(
					N,
					mixColors(invertColor(y.background, !0), y.accent, 50)
				),
				o.drawCircle(t.x, t.y, getNodeScreenRadius(l[e])),
				o.endFill(),
				showLabel(e, Math.max(N, d[e]), !0);
		}
		if (((m = !1), o.lineStyle(2, y.accent), -1 != b)) {
			let e = vecToScreenSpace(getPosition(b));
			o.drawCircle(e.x, e.y, getNodeScreenRadius(l[b]) + 4);
		}
	}
	function onMessage(w) {
		if ("draw" == w.data.type)
			(p = new Float32Array(w.data.positions)), draw();
		else if ("update_camera" == w.data.type)
			(g = w.data.cameraOffset),
				(C = w.data.cameraScale),
				(k = Math.sqrt(C));
		else if ("update_interaction" == w.data.type)
			S != w.data.hoveredNode && -1 != w.data.hoveredNode && (m = !0),
				v != w.data.grabbedNode && -1 != w.data.hoveredNode && (m = !0),
				(x = -1 == w.data.hoveredNode ? S : -1),
				(S = w.data.hoveredNode),
				(v = w.data.grabbedNode);
		else if ("resize" == w.data.type)
			e.renderer.resize(w.data.width, w.data.height);
		else if ("set_active" == w.data.type) b = w.data.active;
		else if ("update_colors" == w.data.type) {
			y = w.data.colors;
			for (let e of u) e.style.fill = invertColor(y.background, !0);
		} else if ("init" == w.data.type) {
			(n = w.data.linkCount),
				(a = w.data.linkSources),
				(r = w.data.linkTargets),
				(i = w.data.nodeCount),
				(l = w.data.radii),
				(c = w.data.labels),
				(h = w.data.linkLength),
				(f = w.data.edgePruning),
				(e = new PIXI.Application({
					...w.data.options,
					antialias: !0,
					resolution: 2,
					backgroundAlpha: 0,
					transparent: !0,
				})),
				(t = new PIXI.Container()),
				(o = new PIXI.Graphics()),
				e.stage.addChild(t),
				t.addChild(o),
				(u = []);
			for (let t = 0; t < i; t++) {
				let o = new PIXI.Text(c[t], {
					fontFamily: "Arial",
					fontSize: 12,
					fontWeight: "normal",
					fill: invertColor(y.background, !0),
					align: "center",
					anchor: 0.5,
				});
				u.push(o), s.push(o.width), d.push(0), e.stage.addChild(o);
			}
		} else
			console.log(
				"Unknown message type sent to graph worker: " + w.data.type
			);
	}
}
