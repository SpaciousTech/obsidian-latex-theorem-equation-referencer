var running = !1;
let batchFraction = 1,
	minBatchFraction = 0.3;
repulsionForce /= batchFraction;
let dt = 1,
	targetFPS = 40,
	startingCameraRect = { minX: -1, minY: -1, maxX: 1, maxY: 1 },
	mouseWorldPos = { x: void 0, y: void 0 },
	scrollVelocity = 0,
	averageFPS = targetFPS;
const pixiApp = new PIXI.Application();
var renderWorker = void 0;
class GraphAssembly {
	static nodeCount = 0;
	static linkCount = 0;
	static hoveredNode = -1;
	static #e = 0;
	static #r = 0;
	static #t = 0;
	static #a = 0;
	static #s = 0;
	static linkSources = new Int32Array(0);
	static linkTargets = new Int32Array(0);
	static radii = new Float32Array(0);
	static maxRadius = 0;
	static averageRadius = 0;
	static minRadius = 0;
	static init(e) {
		(GraphAssembly.nodeCount = e.nodeCount),
			(GraphAssembly.linkCount = e.linkCount);
		let r = new Float32Array(2 * GraphAssembly.nodeCount);
		(GraphAssembly.radii = new Float32Array(e.radii)),
			(GraphAssembly.linkSources = new Int32Array(e.linkSources)),
			(GraphAssembly.linkTargets = new Int32Array(e.linkTargets)),
			(GraphAssembly.#e = Module._malloc(r.byteLength)),
			(GraphAssembly.#r = r.byteLength),
			(GraphAssembly.#t = Module._malloc(GraphAssembly.radii.byteLength)),
			(GraphAssembly.#a = Module._malloc(
				GraphAssembly.linkSources.byteLength
			)),
			(GraphAssembly.#s = Module._malloc(
				GraphAssembly.linkTargets.byteLength
			)),
			(GraphAssembly.maxRadius = GraphAssembly.radii.reduce((e, r) =>
				Math.max(e, r)
			)),
			(GraphAssembly.averageRadius =
				GraphAssembly.radii.reduce((e, r) => e + r) /
				GraphAssembly.radii.length),
			(GraphAssembly.minRadius = GraphAssembly.radii.reduce((e, r) =>
				Math.min(e, r)
			)),
			(r = this.loadState()),
			Module.HEAP32.set(
				new Int32Array(r.buffer),
				GraphAssembly.#e / r.BYTES_PER_ELEMENT
			),
			Module.HEAP32.set(
				new Int32Array(GraphAssembly.radii.buffer),
				GraphAssembly.#t / GraphAssembly.radii.BYTES_PER_ELEMENT
			),
			Module.HEAP32.set(
				new Int32Array(GraphAssembly.linkSources.buffer),
				GraphAssembly.#a / GraphAssembly.linkSources.BYTES_PER_ELEMENT
			),
			Module.HEAP32.set(
				new Int32Array(GraphAssembly.linkTargets.buffer),
				GraphAssembly.#s / GraphAssembly.linkTargets.BYTES_PER_ELEMENT
			),
			Module._Init(
				GraphAssembly.#e,
				GraphAssembly.#t,
				GraphAssembly.#a,
				GraphAssembly.#s,
				GraphAssembly.nodeCount,
				GraphAssembly.linkCount,
				batchFraction,
				dt,
				attractionForce,
				linkLength,
				repulsionForce,
				centralForce
			);
	}
	static get positions() {
		return Module.HEAP32.buffer.slice(
			GraphAssembly.#e,
			GraphAssembly.#e + GraphAssembly.#r
		);
	}
	static saveState(e) {
		localStorage.setItem(
			"positions",
			JSON.stringify(
				new Float32Array(GraphAssembly.positions).map((e) =>
					Math.round(e)
				)
			)
		);
	}
	static loadState() {
		let e = localStorage.getItem("positions"),
			r = null;
		if (
			(e && (r = new Float32Array(Object.values(JSON.parse(e)))),
			!r || !e || r.length != 2 * GraphAssembly.nodeCount)
		) {
			r = new Float32Array(2 * GraphAssembly.nodeCount);
			let e =
				GraphAssembly.averageRadius *
				Math.sqrt(GraphAssembly.nodeCount) *
				2;
			for (let t = 0; t < GraphAssembly.nodeCount; t++) {
				let a =
					(1 - GraphAssembly.radii[t] / GraphAssembly.maxRadius) * e;
				(r[2 * t] =
					Math.cos(
						(t / GraphAssembly.nodeCount) * 7.41 * 2 * Math.PI
					) * a),
					(r[2 * t + 1] =
						Math.sin(
							(t / GraphAssembly.nodeCount) * 7.41 * 2 * Math.PI
						) * a);
			}
		}
		let t = 1 / 0,
			a = -1 / 0,
			s = 1 / 0,
			o = -1 / 0;
		for (let e = 0; e < GraphAssembly.nodeCount - 1; e += 2) {
			let i = { x: r[e], y: r[e + 1] };
			(t = Math.min(t, i.x)),
				(a = Math.max(a, i.x)),
				(s = Math.min(s, i.y)),
				(o = Math.max(o, i.y));
		}
		return (
			(startingCameraRect = {
				minX: t - 50,
				minY: s - 50,
				maxX: a + 50,
				maxY: o + 50,
			}),
			r
		);
	}
	static update(e, r, t) {
		GraphAssembly.hoveredNode = Module._Update(e.x, e.y, r, t);
	}
	static free() {
		Module._free(GraphAssembly.#e),
			Module._free(GraphAssembly.#t),
			Module._free(GraphAssembly.#a),
			Module._free(GraphAssembly.#s),
			Module._FreeMemory();
	}
	static set batchFraction(e) {
		Module._SetBatchFractionSize(e);
	}
	static set attractionForce(e) {
		Module._SetAttractionForce(e);
	}
	static set repulsionForce(e) {
		Module._SetRepulsionForce(e);
	}
	static set centralForce(e) {
		Module._SetCentralForce(e);
	}
	static set linkLength(e) {
		Module._SetLinkLength(e);
	}
	static set dt(e) {
		Module._SetDt(e);
	}
}
class GraphRenderWorker {
	#o;
	#i;
	#n;
	#d;
	#l;
	#c;
	#h;
	constructor() {
		(this.canvas = document.querySelector("#graph-canvas")),
			(this.canvasSidebar = void 0);
		try {
			this.canvasSidebar = document.querySelector(
				".sidebar:has(#graph-canvas)"
			);
		} catch (e) {
			console.log("Error: " + e + "\n\n Using fallback.");
			let r = document.querySelector(".sidebar-right"),
				t = document.querySelector(".sidebar-left");
			this.canvasSidebar = r.querySelector("#graph-canvas") ? r : t;
		}
		(this.view = this.canvas.transferControlToOffscreen()),
			(this.worker = new Worker(
				new URL("./graph-render-worker.js", import.meta.url)
			)),
			(this.#o = { x: 0, y: 0 }),
			(this.#i = 1),
			(this.#n = -1),
			(this.#d = -1),
			(this.#l = {
				background: 0,
				link: 0,
				node: 0,
				outline: 0,
				text: 0,
				accent: 0,
			}),
			(this.#c = 0),
			(this.#h = 0),
			(this.cameraOffset = {
				x: this.canvas.width / 2,
				y: this.canvas.height / 2,
			}),
			(this.cameraScale = 1),
			(this.hoveredNode = -1),
			(this.grabbedNode = -1),
			this.resampleColors(),
			this.#m(),
			(this.width = this.canvas.width),
			(this.height = this.canvas.height),
			this.autoResizeCanvas(),
			this.fitToRect(startingCameraRect);
	}
	#m() {
		let { width: e, height: r } = this.view;
		this.worker.postMessage(
			{
				type: "init",
				linkCount: GraphAssembly.linkCount,
				linkSources: GraphAssembly.linkSources,
				linkTargets: GraphAssembly.linkTargets,
				nodeCount: GraphAssembly.nodeCount,
				radii: GraphAssembly.radii,
				labels: nodes.labels,
				linkLength: linkLength,
				edgePruning: edgePruning,
				options: { width: e, height: r, view: this.view },
			},
			[this.view]
		);
	}
	fitToRect(e) {
		let r = e.minX,
			t = e.minY,
			a = e.maxX - r,
			s = e.maxY - t,
			o = 1 / Math.min(a / this.width, s / this.height);
		(this.cameraScale = o),
			(this.cameraOffset = {
				x: this.width / 2 - (e.minX + a / 2) * o,
				y: this.height / 2 - (e.minY + s / 2) * o,
			});
	}
	resampleColors() {
		function e(e) {
			let r = document.createElement("div");
			document.body.appendChild(r),
				r.style.setProperty("display", "none"),
				r.style.setProperty("color", "var(" + e + ")");
			let t = getComputedStyle(r).color,
				a = getComputedStyle(r).opacity;
			r.remove();
			var s,
				o = (s = t.match(/rgb?\((\d+),\s*(\d+),\s*(\d+)\)/))
					? {
							red: parseInt(s[1]),
							green: parseInt(s[2]),
							blue: parseInt(s[3]),
							alpha: 1,
					  }
					: null,
				i = parseFloat(a);
			return (
				isNaN(i) && (i = 1),
				o
					? {
							a: i * o.alpha,
							rgb: (o.red << 16) | (o.green << 8) | o.blue,
					  }
					: { a: i, rgb: 8947848 }
			);
		}
		this.colors = {
			background: e("--background-secondary").rgb,
			link: e("--graph-line").rgb,
			node: e("--graph-node").rgb,
			outline: e("--graph-line").rgb,
			text: e("--graph-text").rgb,
			accent: e("--interactive-accent").rgb,
		};
	}
	draw(e) {
		this.worker.postMessage({ type: "draw", positions: e }, [e]);
	}
	resizeCanvas(e, r) {
		this.worker.postMessage({ type: "resize", width: e, height: r }),
			(this.#c = e),
			(this.#h = r);
	}
	autoResizeCanvas() {
		this.resizeCanvas(this.canvas.offsetWidth, this.canvas.offsetHeight);
	}
	centerCamera() {
		this.cameraOffset = { x: this.width / 2, y: this.height / 2 };
	}
	#p(e, r) {
		let t = { type: "update_interaction", hoveredNode: e, grabbedNode: r };
		this.worker.postMessage(t);
	}
	#u(e, r) {
		this.worker.postMessage({
			type: "update_camera",
			cameraOffset: e,
			cameraScale: r,
		});
	}
	#y(e) {
		this.worker.postMessage({ type: "update_colors", colors: e });
	}
	set cameraOffset(e) {
		(this.#o = e), this.#u(e, this.cameraScale);
	}
	set cameraScale(e) {
		(this.#i = e), this.#u(this.cameraOffset, e);
	}
	get cameraOffset() {
		return this.#o;
	}
	get cameraScale() {
		return this.#i;
	}
	set hoveredNode(e) {
		(this.#n = e), this.#p(e, this.#d);
	}
	set grabbedNode(e) {
		(this.#d = e), this.#p(this.#n, e);
	}
	set activeNode(e) {
		this.worker.postMessage({ type: "set_active", active: e });
	}
	get hoveredNode() {
		return this.#n;
	}
	get grabbedNode() {
		return this.#d;
	}
	set colors(e) {
		(this.#l = e), this.#y(e);
	}
	get colors() {
		return this.#l;
	}
	set width(e) {
		(this.#c = e), this.resizeCanvas(e, this.#h);
	}
	set height(e) {
		(this.#h = e), this.resizeCanvas(this.#c, e);
	}
	get height() {
		return this.#h;
	}
	get width() {
		return this.#c;
	}
	toScreenSpace(e, r, t = !0) {
		return t
			? {
					x: Math.floor(e * this.cameraScale + this.cameraOffset.x),
					y: Math.floor(r * this.cameraScale + this.cameraOffset.y),
			  }
			: {
					x: e * this.cameraScale + this.cameraOffset.x,
					y: r * this.cameraScale + this.cameraOffset.y,
			  };
	}
	vecToScreenSpace(e, r = !0) {
		return this.toScreenSpace(e.x, e.y, r);
	}
	toWorldspace(e, r) {
		return {
			x: (e - this.cameraOffset.x) / this.cameraScale,
			y: (r - this.cameraOffset.y) / this.cameraScale,
		};
	}
	vecToWorldspace(e) {
		return this.toWorldspace(e.x, e.y);
	}
	setCameraCenterWorldspace({ x: e, y: r }) {
		this.cameraOffset = {
			x: this.width / 2 - e * this.cameraScale,
			y: this.height / 2 - r * this.cameraScale,
		};
	}
	getCameraCenterWorldspace() {
		return this.toWorldspace(this.width / 2, this.height / 2);
	}
}
async function initializeGraphView() {
	running ||
		((running = !0),
		console.log("Module Ready"),
		GraphAssembly.init(nodes),
		(renderWorker = new GraphRenderWorker()),
		(window.renderWorker = renderWorker),
		initializeGraphEvents(),
		(pixiApp.ticker.maxFPS = targetFPS),
		pixiApp.ticker.add(updateGraph),
		setActiveDocument(getURLPath()),
		setInterval(() => {
			try {
				var e =
					renderWorker.canvasSidebar.classList.contains(
						"is-collapsed"
					);
			} catch (e) {
				return;
			}
			running && e
				? (running = !1)
				: running ||
				  e ||
				  ((running = !0),
				  renderWorker.autoResizeCanvas(),
				  renderWorker.centerCamera());
		}, 1e3));
}
function updateGraph() {
	if (
		running &&
		!renderWorker.canvasSidebar.classList.contains("is-collapsed") &&
		(GraphAssembly.update(
			mouseWorldPos,
			renderWorker.grabbedNode,
			renderWorker.cameraScale
		),
		GraphAssembly.hoveredNode != renderWorker.hoveredNode &&
			((renderWorker.hoveredNode = GraphAssembly.hoveredNode),
			(renderWorker.canvas.style.cursor =
				-1 == GraphAssembly.hoveredNode ? "default" : "pointer")),
		renderWorker.draw(GraphAssembly.positions),
		(averageFPS = 0.95 * averageFPS + 0.05 * pixiApp.ticker.FPS),
		averageFPS < 0.9 * targetFPS &&
			batchFraction > minBatchFraction &&
			((batchFraction = Math.max(
				batchFraction - 0.5 / targetFPS,
				minBatchFraction
			)),
			(GraphAssembly.batchFraction = batchFraction),
			(GraphAssembly.repulsionForce = repulsionForce / batchFraction)),
		0 != scrollVelocity)
	) {
		renderWorker.getCameraCenterWorldspace();
		Math.abs(scrollVelocity) < 0.001 && (scrollVelocity = 0),
			zoomGraphViewAroundPoint(mouseWorldPos, scrollVelocity),
			(scrollVelocity *= 0.65);
	}
}
function zoomGraphViewAroundPoint(e, r, t = 0.15, a = 15) {
	let s = renderWorker.getCameraCenterWorldspace();
	if (
		((renderWorker.cameraScale = Math.max(
			Math.min(
				renderWorker.cameraScale + r * renderWorker.cameraScale,
				a
			),
			t
		)),
		renderWorker.cameraScale != t &&
			renderWorker.cameraScale != a &&
			scrollVelocity > 0 &&
			null != mouseWorldPos.x &&
			null != mouseWorldPos.y)
	) {
		let t = { x: e.x - s.x, y: e.y - s.y },
			a = { x: s.x + t.x * r, y: s.y + t.y * r };
		renderWorker.setCameraCenterWorldspace(a);
	} else renderWorker.setCameraCenterWorldspace(s);
}
function scaleGraphViewAroundPoint(e, r, t = 0.15, a = 15) {
	let s = renderWorker.getCameraCenterWorldspace(),
		o = renderWorker.cameraScale;
	renderWorker.cameraScale = Math.max(
		Math.min(r * renderWorker.cameraScale, a),
		t
	);
	let i = (o - renderWorker.cameraScale) / o;
	if (
		renderWorker.cameraScale != t &&
		renderWorker.cameraScale != a &&
		0 != r
	) {
		let r = { x: e.x - s.x, y: e.y - s.y },
			t = { x: s.x - r.x * i, y: s.y - r.y * i };
		renderWorker.setCameraCenterWorldspace(t);
	} else renderWorker.setCameraCenterWorldspace(s);
}
function initializeGraphEvents() {
	window.addEventListener("beforeunload", () => {
		(running = !1), GraphAssembly.free();
	});
	let e = !1,
		r = renderWorker.canvas.width;
	window.addEventListener("resize", () => {
		(e || renderWorker.canvas.width != r) &&
			(renderWorker.autoResizeCanvas(), renderWorker.centerCamera());
	});
	let t = document.querySelector(".graph-view-container");
	function a(e) {
		e.composedPath().includes(t) || s();
	}
	function s() {
		let r = t.clientWidth,
			s = t.clientHeight;
		t.classList.add("scale-down"),
			t
				.animate(
					{ opacity: 0 },
					{ duration: 100, easing: "ease-in", fill: "forwards" }
				)
				.addEventListener("finish", function () {
					t.classList.toggle("expanded"),
						renderWorker.autoResizeCanvas(),
						renderWorker.centerCamera();
					let e = t.clientWidth,
						a = t.clientHeight;
					(renderWorker.cameraScale *= (e / r + a / s) / 2),
						t.classList.remove("scale-down"),
						t.classList.add("scale-up"),
						updateGraph(),
						t
							.animate(
								{ opacity: 1 },
								{
									duration: 200,
									easing: "ease-out",
									fill: "forwards",
								}
							)
							.addEventListener("finish", function () {
								t.classList.remove("scale-up");
							});
				}),
			(e = !e),
			e
				? document.addEventListener("pointerdown", a)
				: document.removeEventListener("pointerdown", a);
	}
	function o(e) {
		var r = renderWorker.canvas.getBoundingClientRect();
		let t = getPointerPosition(e);
		return { x: t.x - r.left, y: t.y - r.top };
	}
	let i = { x: 0, y: 0 },
		n = { x: 0, y: 0 },
		d = { x: 0, y: 0 },
		l = { x: 0, y: 0 },
		c = { x: 0, y: 0 },
		h = 0,
		m = !1,
		p = !1,
		u = !1,
		y = document.querySelector(".graph-view-container"),
		g = -1;
	y.addEventListener("pointerenter", function (r) {
		let t = 0,
			a = !1;
		function b(e) {
			(n = o(e)),
				(mouseWorldPos = renderWorker.vecToWorldspace(n)),
				(l = { x: n.x - d.x, y: n.y - d.y }),
				(d = n),
				-1 != renderWorker.grabbedNode &&
					(c = { x: n.x - i.x, y: n.y - i.y }),
				m &&
					-1 != renderWorker.hoveredNode &&
					-1 == renderWorker.grabbedNode &&
					renderWorker.hoveredNode != renderWorker.grabbedNode &&
					(renderWorker.grabbedNode = renderWorker.hoveredNode),
				(m &&
					-1 == renderWorker.hoveredNode &&
					-1 == renderWorker.grabbedNode) ||
				p
					? (renderWorker.cameraOffset = {
							x: renderWorker.cameraOffset.x + l.x,
							y: renderWorker.cameraOffset.y + l.y,
					  })
					: -1 != renderWorker.hoveredNode
					? (renderWorker.canvas.style.cursor = "pointer")
					: (renderWorker.canvas.style.cursor = "default");
		}
		function v(e) {
			if (1 == e.touches?.length)
				return a && ((d = o(e)), (a = !1)), void b(e);
			if (2 == e.touches?.length) {
				let r = getTouchPosition(e.touches[0]),
					s = getTouchPosition(e.touches[1]);
				(n = o(e)), (l = { x: n.x - d.x, y: n.y - d.y }), (d = n);
				let i = Math.sqrt(
					Math.pow(r.x - s.x, 2) + Math.pow(r.y - s.y, 2)
				);
				a ||
					((a = !0),
					(t = i),
					(l = { x: 0, y: 0 }),
					(mouseWorldPos = { x: void 0, y: void 0 }),
					(renderWorker.grabbedNode = -1),
					(renderWorker.hoveredNode = -1));
				let c = (i - t) / t;
				scaleGraphViewAroundPoint(
					renderWorker.vecToWorldspace(n),
					1 + c,
					0.15,
					15
				),
					(renderWorker.cameraOffset = {
						x: renderWorker.cameraOffset.x + l.x,
						y: renderWorker.cameraOffset.y + l.y,
					}),
					(t = i);
			}
		}
		function k(r) {
			document.removeEventListener("pointerup", k);
			let t = Date.now();
			setTimeout(() => {
				m &&
					-1 != renderWorker.hoveredNode &&
					Math.abs(c.x) <= 4 &&
					Math.abs(c.y) <= 4 &&
					t - h < 300 &&
					(async function (r) {
						e ? s() : GraphAssembly.saveState(renderWorker);
						let t = nodes.paths[r];
						window.location.pathname.endsWith(nodes.paths[r]) ||
							(await loadDocument(t));
					})(renderWorker.hoveredNode),
					m &&
						-1 != renderWorker.grabbedNode &&
						(renderWorker.grabbedNode = -1),
					0 == r.button && (m = !1),
					"touch" == r.pointerType &&
						g == r.pointerId &&
						((g = -1), (m = !1)),
					1 == r.button && (p = !1),
					u ||
						(document.removeEventListener("mousemove", b),
						document.removeEventListener("touchmove", v));
			}, 0);
		}
		function f(e) {
			document.addEventListener("pointerup", k),
				(mouseWorldPos = renderWorker.vecToWorldspace(n)),
				(c = { x: 0, y: 0 }),
				0 == e.button && (m = !0),
				"touch" == e.pointerType &&
					-1 == g &&
					((g = e.pointerId), (m = !0)),
				1 == e.button && (p = !0),
				(i = n),
				(h = Date.now()),
				m &&
					-1 != renderWorker.hoveredNode &&
					(renderWorker.grabbedNode = renderWorker.hoveredNode);
		}
		(n = o(r)),
			(mouseWorldPos = renderWorker.vecToWorldspace(n)),
			(d = o(r)),
			(u = !0),
			document.addEventListener("mousemove", b),
			document.addEventListener("touchmove", v),
			y.addEventListener("pointerdown", f),
			y.addEventListener("pointerleave", function e(r) {
				setTimeout(() => {
					(u = !1),
						m ||
							(document.removeEventListener("mousemove", b),
							document.removeEventListener("touchmove", v),
							(mouseWorldPos = { x: void 0, y: void 0 })),
						y.removeEventListener("pointerdown", f),
						y.removeEventListener("pointerleave", e);
				}, 1);
			});
	}),
		document
			.querySelector(".graph-expand.graph-icon")
			?.addEventListener("click", (e) => {
				e.stopPropagation(), s();
			}),
		y.addEventListener("wheel", function (e) {
			let r = 0.09;
			e.deltaY > 0
				? (scrollVelocity >= -0.09 && (scrollVelocity = -0.09),
				  (scrollVelocity *= 1.4))
				: (scrollVelocity <= r && (scrollVelocity = r),
				  (scrollVelocity *= 1.4));
		}),
		document
			.querySelector(".theme-toggle-input")
			?.addEventListener("change", (e) => {
				setTimeout(() => renderWorker.resampleColors(), 0);
			});
}
(Module.onRuntimeInitialized = initializeGraphView),
	setTimeout(() => Module.onRuntimeInitialized(), 300);
