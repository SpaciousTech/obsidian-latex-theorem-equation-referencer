let webpageContainer,
	documentContainer,
	viewContent,
	leftSidebar,
	rightSidebar,
	sidebarCollapseIcons,
	sidebarGutters,
	sidebars,
	sidebarTargetWidth,
	contentTargetWidth,
	canvasWrapper,
	canvas,
	canvasNodes,
	canvasBackground,
	canvasBackgroundPattern,
	focusedCanvasNode,
	loadingIcon,
	documentType,
	embedType,
	customType,
	deviceSize,
	lastScreenWidth,
	isOffline = !1,
	collapseIconUp = ["m7 15 5 5 5-5", "m7 9 5-5 5 5"],
	collapseIconDown = ["m7 20 5-5 5 5", "m7 4 5 5 5-5"],
	isTouchDevice = isTouchCapable(),
	fullyInitialized = !1;
function initGlobalObjects() {
	(loadingIcon = document.createElement("div")),
		loadingIcon.classList.add("loading-icon"),
		document.body.appendChild(loadingIcon),
		(loadingIcon.innerHTML =
			"<div></div><div></div><div></div><div></div>"),
		(webpageContainer = document.querySelector(".webpage-container")),
		(documentContainer = document.querySelector(".document-container")),
		(leftSidebar = document.querySelector(".sidebar-left")),
		(rightSidebar = document.querySelector(".sidebar-right")),
		(sidebarCollapseIcons = Array.from(
			document.querySelectorAll(".sidebar-collapse-icon")
		)),
		(sidebarGutters = [
			sidebarCollapseIcons[0].parentElement,
			sidebarCollapseIcons[1].parentElement,
		]),
		(sidebars = [
			sidebarGutters[0].parentElement,
			sidebarGutters[1].parentElement,
		]);
}
async function initializePage() {
	(focusedCanvasNode = null),
		(canvasWrapper =
			document.querySelector(".canvas-wrapper") ?? canvasWrapper),
		(canvas = document.querySelector(".canvas") ?? canvas);
	let e = document.querySelectorAll(".canvas-node");
	(canvasNodes = e.length > 0 ? e : canvasNodes),
		(canvasBackground =
			document.querySelector(".canvas-background") ?? canvasBackground),
		(canvasBackgroundPattern =
			document.querySelector(".canvas-background pattern") ??
			canvasBackgroundPattern),
		(viewContent =
			document.querySelector(".document-container > .view-content") ??
			document.querySelector(
				".document-container > .markdown-preview-view"
			) ??
			viewContent),
		fullyInitialized ||
			(initGlobalObjects(),
			initializeDocumentTypes(),
			setupSidebars(),
			setupThemeToggle(),
			(sidebarTargetWidth = await getComputedPixelValue(
				"--sidebar-width"
			)),
			(contentTargetWidth =
				0.9 * (await getComputedPixelValue("--line-width"))),
			window.addEventListener("resize", () => onResize()),
			onResize(),
			document.body.classList.toggle("post-load", !0),
			document.body.classList.toggle("loading", !1),
			setTimeout(function () {
				document.body.classList.toggle("loaded", !0),
					document.body.classList.toggle("post-load", !1);
			}, 2e3),
			(fullyInitialized = !0)),
		"video" == embedType ||
		"embed" == embedType ||
		"excalidraw" == customType ||
		"kanban" == customType ||
		"canvas" == documentType
			? rightSidebar.collapsed || rightSidebar.temporaryCollapse()
			: rightSidebar.temporarilyCollapsed &&
			  rightSidebar.collapsed &&
			  (rightSidebar.collapse(!1),
			  (rightSidebar.temporarilyCollapsed = !1));
}
function initializePageEvents(e) {
	setupHeaders(e),
		setupTrees(e),
		setupCallouts(e),
		setupCheckboxes(e),
		setupCanvas(e),
		setupCodeblocks(e),
		setupLinks(e),
		setupScroll(e);
}
function initializeDocumentTypes() {
	document.querySelector(".document-container > .markdown-preview-view")
		? (documentType = "markdown")
		: document.querySelector(".canvas-wrapper")
		? (documentType = "canvas")
		: ((documentType = "custom"),
		  document.querySelector(".kanban-plugin")
				? (customType = "kanban")
				: document.querySelector(".excalidraw-plugin") &&
				  (customType = "excalidraw"));
}
function initializeForFileProtocol() {
	let e = document.querySelector(".graph-view-placeholder");
	e &&
		(console.log(
			"Running locally, skipping graph view initialization and hiding graph."
		),
		(e.style.display = "none"),
		(e.previousElementSibling.style.display = "none"));
}
function onOffline(e) {
	e.preventDefault(),
		e.stopPropagation(),
		console.log("Offline"),
		(isOffline = !0);
}
function onEndResize() {
	document.body.classList.toggle("resizing", !1);
}
function onStartResize() {
	document.body.classList.toggle("resizing", !0);
}
(window.onload = async function () {
	"file:" == window.location.protocol && initializeForFileProtocol(),
		await initializePage(),
		initializePageEvents(document);
}),
	window.addEventListener("offline", onOffline),
	(window.onpopstate = function (e) {
		if (
			(e.preventDefault(),
			e.stopPropagation(),
			document.body.classList.contains("floating-sidebars") &&
				(!leftSidebar.collapsed || !rightSidebar.collapsed))
		)
			return leftSidebar.collapse(!0), void rightSidebar.collapse(!0);
		loadDocument(getURLPath(), !1);
	});
let checkStillResizingTimeout,
	isResizing = !1;
function onResize(e = !1) {
	function t(e, t) {
		let o = window.innerWidth;
		return (
			(o > e && o < t && null == lastScreenWidth) ||
			(o > e && o < t && (lastScreenWidth <= e || lastScreenWidth >= t))
		);
	}
	isResizing || (onStartResize(), (isResizing = !0)),
		!(function (e) {
			let t = window.innerWidth;
			return (
				(t > e && null == lastScreenWidth) ||
				(t > e && lastScreenWidth < e)
			);
		})(contentTargetWidth + 2 * sidebarTargetWidth)
			? t(
					contentTargetWidth + sidebarTargetWidth,
					contentTargetWidth + 2 * sidebarTargetWidth
			  )
				? ((deviceSize = "small screen"),
				  document.body.classList.toggle("floating-sidebars", !1),
				  document.body.classList.toggle("is-large-screen", !1),
				  document.body.classList.toggle("is-small-screen", !0),
				  document.body.classList.toggle("is-tablet", !1),
				  document.body.classList.toggle("is-phone", !1),
				  sidebarGutters.forEach(function (e) {
						e.collapse(!1);
				  }),
				  leftSidebar.collapsed || rightSidebar.collapse(!0))
				: t(
						1.5 * sidebarTargetWidth,
						contentTargetWidth + sidebarTargetWidth
				  )
				? ((deviceSize = "tablet"),
				  document.body.classList.toggle("floating-sidebars", !0),
				  document.body.classList.toggle("is-large-screen", !1),
				  document.body.classList.toggle("is-small-screen", !1),
				  document.body.classList.toggle("is-tablet", !0),
				  document.body.classList.toggle("is-phone", !1),
				  sidebarGutters.forEach(function (e) {
						e.collapse(!1);
				  }),
				  leftSidebar.collapsed || rightSidebar.collapse(!0),
				  fullyInitialized || leftSidebar.collapse(!0))
				: (function (e) {
						let t = window.innerWidth;
						return (
							(t < e && null == lastScreenWidth) ||
							(t < e && lastScreenWidth > e)
						);
				  })(1.5 * sidebarTargetWidth) &&
				  ((deviceSize = "phone"),
				  document.body.classList.toggle("floating-sidebars", !0),
				  document.body.classList.toggle("is-large-screen", !1),
				  document.body.classList.toggle("is-small-screen", !1),
				  document.body.classList.toggle("is-tablet", !1),
				  document.body.classList.toggle("is-phone", !0),
				  sidebars.forEach(function (e) {
						e.collapse(!0);
				  }),
				  sidebarGutters.forEach(function (e) {
						e.collapse(!1);
				  }))
			: ((deviceSize = "large-screen"),
			  document.body.classList.toggle("floating-sidebars", !1),
			  document.body.classList.toggle("is-large-screen", !0),
			  document.body.classList.toggle("is-small-screen", !1),
			  document.body.classList.toggle("is-tablet", !1),
			  document.body.classList.toggle("is-phone", !1),
			  sidebars.forEach(function (e) {
					e.collapse(!1);
			  }),
			  document.body.classList.contains("sidebars-always-collapsible")
					? sidebarGutters.forEach(function (e) {
							e.collapse(!1);
					  })
					: sidebarGutters.forEach(function (e) {
							e.collapse(!0);
					  })),
		(lastScreenWidth = window.innerWidth),
		null != checkStillResizingTimeout &&
			clearTimeout(checkStillResizingTimeout);
	let o = window.innerWidth;
	checkStillResizingTimeout = setTimeout(function () {
		window.innerWidth == o &&
			((checkStillResizingTimeout = void 0),
			(isResizing = !1),
			onEndResize());
	}, 200);
}
function clamp(e, t, o) {
	return Math.min(Math.max(e, t), o);
}
function getElBounds(e) {
	let t = e.getBoundingClientRect(),
		o = t.x,
		n = t.y,
		i = t.width,
		s = t.height;
	return {
		x: o,
		y: n,
		width: i,
		height: s,
		minX: o,
		minY: n,
		maxX: o + i,
		maxY: n + s,
		centerX: t.x + t.width / 2,
		centerY: t.y + t.height / 2,
	};
}
async function getComputedPixelValue(e) {
	const t = document.createElement("div");
	document.body.appendChild(t),
		(t.style.position = "absolute"),
		(t.style.width = `var(${e})`),
		await new Promise((e) => setTimeout(e, 10));
	const o = window.getComputedStyle(t).width;
	return t.remove(), parseFloat(o);
}
function getPointerPosition(e) {
	let t = e.touches ? Array.from(e.touches) : [];
	return {
		x:
			t.length > 0
				? t.reduce((e, t) => e + t.clientX, 0) / e.touches.length
				: e.clientX,
		y:
			t.length > 0
				? t.reduce((e, t) => e + t.clientY, 0) / e.touches.length
				: e.clientY,
	};
}
function getTouchPosition(e) {
	return { x: e.clientX, y: e.clientY };
}
function getAllChildrenRecursive(e) {
	let t = [];
	for (let o = 0; o < e.children.length; o++) {
		const n = e.children[o];
		t.push(n), (t = t.concat(getAllChildrenRecursive(n)));
	}
	return t;
}
function isMobile() {
	let e = !1;
	var t;
	return (
		(t = navigator.userAgent || navigator.vendor || window.opera),
		(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
			t
		) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				t.substr(0, 4)
			)) &&
			(e = !0),
		e
	);
}
function isTouchCapable() {
	return (
		"ontouchstart" in window ||
		navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0
	);
}
function downloadBlob(e, t = "file.txt") {
	if (window.navigator && window.navigator.msSaveOrOpenBlob)
		return window.navigator.msSaveOrOpenBlob(e);
	const o = window.URL.createObjectURL(e),
		n = document.createElement("a");
	(n.href = o),
		(n.download = t),
		n.dispatchEvent(
			new MouseEvent("click", {
				bubbles: !0,
				cancelable: !0,
				view: window,
			})
		),
		setTimeout(() => {
			window.URL.revokeObjectURL(o), n.remove();
		}, 100);
}
function extentionToTag(e) {
	return ["png", "jpg", "jpeg", "svg", "gif", "bmp", "ico"].includes(e)
		? "img"
		: ["mp4", "mov", "avi", "webm", "mpeg"].includes(e)
		? "video"
		: ["mp3", "wav", "ogg", "aac"].includes(e)
		? "audio"
		: ["pdf"].includes(e)
		? "embed"
		: void 0;
}
let slideUp = (e, t = 500) => {
		(e.style.transitionProperty = "height, margin, padding"),
			(e.style.transitionDuration = t + "ms"),
			(e.style.boxSizing = "border-box"),
			(e.style.height = e.offsetHeight + "px"),
			e.offsetHeight,
			(e.style.overflow = "hidden"),
			(e.style.height = 0),
			(e.style.paddingTop = 0),
			(e.style.paddingBottom = 0),
			(e.style.marginTop = 0),
			(e.style.marginBottom = 0),
			window.setTimeout(async () => {
				(e.style.display = "none"),
					e.style.removeProperty("height"),
					e.style.removeProperty("padding-top"),
					e.style.removeProperty("padding-bottom"),
					e.style.removeProperty("margin-top"),
					e.style.removeProperty("margin-bottom"),
					e.style.removeProperty("overflow"),
					e.style.removeProperty("transition-duration"),
					e.style.removeProperty("transition-property");
			}, t);
	},
	slideUpAll = (e, t = 500) => {
		e.forEach(async (e) => {
			(e.style.transitionProperty = "height, margin, padding"),
				(e.style.transitionDuration = t + "ms"),
				(e.style.boxSizing = "border-box"),
				(e.style.height = e.offsetHeight + "px"),
				e.offsetHeight,
				(e.style.overflow = "hidden"),
				(e.style.height = 0),
				(e.style.paddingTop = 0),
				(e.style.paddingBottom = 0),
				(e.style.marginTop = 0),
				(e.style.marginBottom = 0);
		}),
			window.setTimeout(async () => {
				e.forEach(async (e) => {
					(e.style.display = "none"),
						e.style.removeProperty("height"),
						e.style.removeProperty("padding-top"),
						e.style.removeProperty("padding-bottom"),
						e.style.removeProperty("margin-top"),
						e.style.removeProperty("margin-bottom"),
						e.style.removeProperty("overflow"),
						e.style.removeProperty("transition-duration"),
						e.style.removeProperty("transition-property");
				});
			}, t);
	},
	slideDown = (e, t = 500) => {
		e.style.removeProperty("display");
		let o = window.getComputedStyle(e).display;
		"none" === o && (o = "block"), (e.style.display = o);
		let n = e.offsetHeight;
		(e.style.overflow = "hidden"),
			(e.style.height = 0),
			(e.style.paddingTop = 0),
			(e.style.paddingBottom = 0),
			(e.style.marginTop = 0),
			(e.style.marginBottom = 0),
			e.offsetHeight,
			(e.style.boxSizing = "border-box"),
			(e.style.transitionProperty = "height, margin, padding"),
			(e.style.transitionDuration = t + "ms"),
			(e.style.height = n + "px"),
			e.style.removeProperty("padding-top"),
			e.style.removeProperty("padding-bottom"),
			e.style.removeProperty("margin-top"),
			e.style.removeProperty("margin-bottom"),
			window.setTimeout(async () => {
				e.style.removeProperty("height"),
					e.style.removeProperty("overflow"),
					e.style.removeProperty("transition-duration"),
					e.style.removeProperty("transition-property");
			}, t);
	},
	slideDownAll = (e, t = 500) => {
		e.forEach(async (e) => {
			e.style.removeProperty("display");
			let o = window.getComputedStyle(e).display;
			"none" === o && (o = "block"), (e.style.display = o);
			let n = e.offsetHeight;
			(e.style.overflow = "hidden"),
				(e.style.height = 0),
				(e.style.paddingTop = 0),
				(e.style.paddingBottom = 0),
				(e.style.marginTop = 0),
				(e.style.marginBottom = 0),
				e.offsetHeight,
				(e.style.boxSizing = "border-box"),
				(e.style.transitionProperty = "height, margin, padding"),
				(e.style.transitionDuration = t + "ms"),
				(e.style.height = n + "px"),
				e.style.removeProperty("padding-top"),
				e.style.removeProperty("padding-bottom"),
				e.style.removeProperty("margin-top"),
				e.style.removeProperty("margin-bottom");
		}),
			window.setTimeout(async () => {
				e.forEach(async (e) => {
					e.style.removeProperty("height"),
						e.style.removeProperty("overflow"),
						e.style.removeProperty("transition-duration"),
						e.style.removeProperty("transition-property");
				});
			}, t);
	};
var slideToggle = (e, t = 500) =>
		"none" === window.getComputedStyle(e).display
			? slideDown(e, t)
			: slideUp(e, t),
	slideToggleAll = (e, t = 500) =>
		"none" === window.getComputedStyle(e[0]).display
			? slideDownAll(e, t)
			: slideUpAll(e, t);
let transferDocument = document.implementation.createHTMLDocument();
async function loadDocument(e, t = !0, o = !0) {
	let n = e.split("#"),
		i = n[0] ?? e;
	console.log("Loading document: " + i),
		loadingIcon.classList.toggle("shown", !0);
	let s,
		a = getViewBounds();
	if (
		((loadingIcon.style.left =
			a.centerX - loadingIcon.offsetWidth / 2 + "px"),
		(loadingIcon.style.top =
			a.centerY - loadingIcon.offsetHeight / 2 + "px"),
		documentContainer.classList.toggle("hide", !0),
		documentContainer.classList.toggle("show", !1),
		"phone" == deviceSize && leftSidebar.collapse(!0),
		!isOffline)
	) {
		try {
			s = await fetch(i);
		} catch (e) {
			return (
				console.log(
					"Cannot use fetch API (likely due to CORS), just loading the page normally."
				),
				void window.location.assign(i)
			);
		}
		if (s.ok) {
			setActiveDocument(i, o, t);
			let a = e
				.split(".")
				.pop()
				.split("?")[0]
				.split("#")[0]
				.toLowerCase()
				.trim();
			if (
				((documentType = "none"),
				(embedType = "none"),
				(customType = "none"),
				"html" == a)
			) {
				let e = (await s.text())
					.replaceAll("<!DOCTYPE html>", "")
					.replaceAll("<html>", "")
					.replaceAll("</html>", "");
				transferDocument.write(e);
				let t = document.importNode(
					transferDocument.querySelector(".document-container"),
					!0
				);
				documentContainer.remove(),
					(documentContainer = t),
					webpageContainer.insertBefore(
						documentContainer,
						webpageContainer.children[1]
					),
					(document.querySelector(".outline-tree").innerHTML =
						transferDocument.querySelector(
							".outline-tree"
						).innerHTML);
				let o = n.length > 1 ? n[1] : null;
				o && document.getElementById(o).scrollIntoView(),
					setupRootPath(transferDocument),
					initializeDocumentTypes(),
					setTimeout(function () {
						initializePageEvents(documentContainer),
							initializePageEvents(
								document.querySelector(".outline-tree")
							);
					}, 0),
					(document.title = transferDocument.title),
					transferDocument.close();
			} else if (
				((documentType = "embed"),
				(embedType = extentionToTag(a)),
				null != embedType)
			) {
				let t = document.createElement(embedType);
				(t.controls = !0),
					(t.src = e),
					(t.style.maxWidth = "100%"),
					"embed" == embedType &&
						((t.style.width = "100%"), (t.style.height = "100%")),
					(t.style.objectFit = "contain"),
					(viewContent.innerHTML = ""),
					viewContent.setAttribute("class", "view-content embed"),
					viewContent.appendChild(t),
					(document.querySelector(".outline-tree").innerHTML = ""),
					(document.title = e.split("/").pop());
			} else {
				downloadBlob(await s.blob(), e.split("/").pop());
			}
			await initializePage();
		} else
			setTimeout(function () {
				(viewContent.innerHTML =
					"\n\t\t\t<div>\n\t\t\t\t<center style='position: relative; transform: translateY(20vh); width: 100%; text-align: center;'>\n\t\t\t\t\t<h1 style>Page Not Found</h1>\n\t\t\t\t</center>\n\t\t\t</div>\n\t\t\t"),
					(document.querySelector(".outline-tree").innerHTML = ""),
					console.log("Page not found: " + getAbsoluteRootPath() + e);
				let t = getURLRootPath(getAbsoluteRootPath() + e);
				(rootPath = t),
					(document.querySelector("base").href = t),
					(document.title = "Page Not Found");
			}, 1e3);
		return (
			loadingIcon.classList.toggle("shown", !1),
			(documentContainer.style.transitionDuration = ""),
			documentContainer.classList.toggle("hide", !1),
			documentContainer.classList.toggle("show", !0),
			transferDocument
		);
	}
	setTimeout(function () {
		(viewContent.innerHTML =
			"\n<center style='position: relative; transform: translateY(20vh); width: 100%; text-align: center;'>\n\t<h1>You appear to be offline. Check your internet connection and then try reloading the page.</h1>\n</center>"),
			(document.querySelector(".outline-tree").innerHTML = ""),
			console.log("Page offline: " + getAbsoluteRootPath() + e);
		let t = getURLRootPath(getAbsoluteRootPath() + e);
		(rootPath = t),
			(document.querySelector("base").href = t),
			(document.title = "Page Offline"),
			documentContainer.classList.toggle("hide", !1),
			documentContainer.classList.toggle("show", !0),
			loadingIcon.classList.toggle("shown", !1);
	}, 1e3);
}
function setActiveDocument(e, t = !0, o = !0) {
	let n = e.split("#")[0] ?? e;
	document
		.querySelector(".tree-item.mod-active")
		?.classList.remove("mod-active");
	let i,
		s = Array.from(
			document.querySelectorAll(
				".tree-item > .tree-item-contents > .tree-item-link"
			)
		);
	for (let t of s)
		if (t.getAttribute("href") == decodeURI(e)) {
			let e = t.parentElement.parentElement;
			for (
				e.classList.add("mod-active"), i = e;
				e.hasAttribute("data-depth");

			)
				setTreeCollapsed(e, !1, !1),
					(e = e.parentElement.parentElement);
			break;
		}
	if (
		(t && i?.scrollIntoView({ block: "center", inline: "nearest" }),
		"undefined" != typeof nodes && window.renderWorker)
	) {
		let e =
			nodes?.paths.findIndex(function (e) {
				return e.endsWith(n);
			}) ?? -1;
		e >= 0 && (window.renderWorker.activeNode = e);
	}
	o &&
		"file:" != window.location.protocol &&
		window.history.pushState({ path: n }, "", n);
}
function setupRootPath(e) {
	let t = e.querySelector("#root-path").getAttribute("root-path");
	(document.querySelector("base").href = t),
		document.querySelector("#root-path").setAttribute("root-path", t),
		(rootPath = t);
}
function getAbsoluteRootPath() {
	return (
		"undefined" == typeof rootPath && setupRootPath(document),
		new URL(window.location.href + "/../" + rootPath).pathname
	);
}
function getURLPath(e = window.location.pathname) {
	let t = getAbsoluteRootPath();
	return e.substring(t.length);
}
function getURLRootPath(e = window.location.pathname) {
	let t = getURLPath(e).split("/"),
		o = "";
	for (let e = 0; e < t.length - 1; e++) o += "../";
	return o;
}
function setupHeaders(e) {
	e.querySelectorAll(".heading-collapse-indicator").forEach(function (e) {
		e.addEventListener("click", function () {
			toggleTreeHeaderOpen(e.parentElement.parentElement, !0);
		});
	}),
		e.querySelectorAll(".heading-wrapper").forEach(function (e) {
			(e.collapsed = !1),
				(e.childrenContainer = e.querySelector(".heading-children")),
				(e.parentHeader = e.parentElement.parentElement),
				(e.headerElement = e.querySelector(".heading")),
				(e.markdownPreviewSizer = getHeaderSizerEl(e)),
				(e.collapse = function (t, o = !0, n = !1) {
					collapseHeader(e, t, o, n);
				}),
				(e.toggleCollapse = function (t = !0) {
					toggleTreeHeaderOpen(e, t);
				}),
				(e.hide = function () {
					hideHeader(e);
				}),
				(e.show = function (t = !1, o = !1, n = !1) {
					showHeader(e, t, o, n);
				});
		}),
		e.querySelectorAll(".heading").forEach(function (e) {
			e.headingWrapper = e.parentElement;
		});
}
function isHeadingWrapper(e) {
	return !!e && e.classList.contains("heading-wrapper");
}
function getHeaderSizerEl(e) {
	let t = e;
	for (; t && !t.classList.contains("markdown-preview-sizer"); )
		t = t.parentElement;
	return t || void 0;
}
async function collapseHeader(e, t, o = !0, n = !1) {
	let i = e.childrenContainer;
	if (o && !t) {
		let t = e.parentHeader;
		isHeadingWrapper(t) && t.collapse(!1, !0, n);
	}
	if (!(e.classList.contains("is-collapsed") != t))
		return void (t || "canvas" != documentType || e.show(!0));
	if (
		(e.timeout &&
			(clearTimeout(e.timeout),
			(i.style.transitionDuration = ""),
			(i.style.height = ""),
			e.classList.toggle("is-animating", !1)),
		t)
	) {
		e.collapseHeight =
			i.offsetHeight + parseFloat(i.lastChild?.marginBottom || 0);
		let t = e.nextElementSibling;
		for (; t && "canvas" == documentType; ) {
			let e = t;
			isHeadingWrapper(e) && e.show(!1, !0, !0),
				setTimeout(function () {
					e.forceShown = !1;
				}, 500),
				(t = t.nextElementSibling);
		}
	}
	let s = e.collapseHeight;
	if (
		((i.style.height = s + "px"),
		t || "canvas" != documentType || e.show(!0),
		(e.collapsed = t),
		n)
	) {
		console.log("instant"),
			(i.style.transitionDuration = "0s"),
			e.classList.toggle("is-collapsed", t),
			(i.style.height = ""),
			(i.style.transitionDuration = "");
		let o = Array.from(e.markdownPreviewSizer.children).reduce(
			(e, t) => e + t.offsetHeight,
			0
		);
		return void (e.markdownPreviewSizer.style.minHeight = o + "px");
	}
	let a = getComputedStyle(i).transitionDuration;
	a = a.endsWith("s")
		? parseFloat(a)
		: a.endsWith("ms")
		? parseFloat(a) / 1e3
		: 0;
	let l = Math.min((a * Math.sqrt(s)) / 16, 0.5);
	(i.style.transitionDuration = `${l}s`),
		(i.style.height = t ? "0px" : s + "px"),
		e.classList.toggle("is-animating", !0),
		e.classList.toggle("is-collapsed", t),
		setTimeout(function () {
			(i.style.transitionDuration = ""),
				t || (i.style.height = ""),
				e.classList.toggle("is-animating", !1);
			let o = Array.from(e.markdownPreviewSizer.children).reduce(
				(e, t) => e + t.offsetHeight,
				0
			);
			e.markdownPreviewSizer.style.minHeight = o + "px";
		}, 1e3 * l);
}
function toggleTreeHeaderOpen(e, t = !0) {
	e.collapse(!e.collapsed, t);
}
function hideHeader(e) {
	if (e.forceShown) return;
	if (
		e.classList.contains("is-hidden") ||
		e.classList.contains("is-collapsed")
	)
		return;
	if ("none" == getComputedStyle(e).display) return;
	let t = e.offsetHeight;
	e.classList.toggle("is-hidden", !0),
		0 != t && (e.style.height = t + "px"),
		(e.style.visibility = "hidden");
}
function showHeader(e, t = !0, o = !1, n = !1) {
	if ((n && (e.forceShown = !0), t)) {
		let t = e.parentHeader;
		isHeadingWrapper(t) && t.show(!0, !1, n);
	}
	if (o) {
		e.querySelectorAll(".heading-wrapper").forEach(function (e) {
			e.show(!1, !0, n);
		});
	}
	e.classList.contains("is-hidden") &&
		!e.classList.contains("is-collapsed") &&
		(e.classList.toggle("is-hidden", !1),
		(e.style.height = ""),
		(e.style.visibility = ""));
}
function setupTrees(e) {
	const t = Array.from(
			e.querySelectorAll(".tree-container.file-tree .tree-item")
		),
		o = Array.from(
			e.querySelectorAll(".tree-container.outline-tree .tree-item")
		);
	e
		.querySelectorAll(".tree-item-link > .collapse-icon")
		.forEach(function (e) {
			e.addEventListener("click", function (t) {
				return (
					t.preventDefault(),
					t.stopPropagation(),
					toggleTreeCollapsed(
						e.parentElement.parentElement.parentElement
					),
					!1
				);
			});
		}),
		e.querySelectorAll(".collapse-tree-button").forEach(function (e) {
			(e.treeRoot = e.parentElement.parentElement),
				(e.icon = e.firstChild),
				(e.icon.innerHTML = "<path d></path><path d></path>");
			let n = e.treeRoot.classList.contains("file-tree") ? t : o;
			(e.setIcon = function (t) {
				e.icon.children[0].setAttribute(
					"d",
					t ? collapseIconUp[0] : collapseIconDown[0]
				),
					e.icon.children[1].setAttribute(
						"d",
						t ? collapseIconUp[1] : collapseIconDown[1]
					);
			}),
				(e.collapse = function (t) {
					setTreeCollapsedAll(n, t), e.setIcon(t), (e.collapsed = t);
				}),
				(e.toggleCollapse = function () {
					e.collapse(!e.collapsed);
				}),
				(e.collapsed =
					0 !=
					e.treeRoot.querySelectorAll(
						".tree-scroll-area + .tree-item.mod-collapsible.is-collapsed"
					)),
				e.setIcon(e.collapsed),
				e.addEventListener("click", function (t) {
					return (
						t.preventDefault(),
						t.stopPropagation(),
						e.toggleCollapse(),
						!1
					);
				});
		}),
		t.forEach(function (e) {
			let t = e.querySelector(".tree-item-link");
			if (e.querySelector(".collapse-icon"))
				t?.addEventListener("click", function (e) {
					e.preventDefault(), e.stopPropagation();
					let t = this.parentElement?.parentElement;
					t && toggleTreeCollapsed(t);
				});
			else {
				let o = t.getAttribute("href").split(".").pop();
				if (!o.includes(" ") && "html" != o) {
					let t = document.createElement("div");
					t.classList.add("nav-file-tag"),
						(t.textContent = o.toUpperCase()),
						e.querySelector(".tree-item-contents").appendChild(t);
				}
			}
		});
}
async function setTreeCollapsed(e, t, o = !0) {
	if (!e || !e.classList.contains("mod-collapsible")) return;
	let n = e.querySelector(".tree-item-children");
	t
		? (e.classList.add("is-collapsed"),
		  o ? slideUp(n, 100) : (n.style.display = "none"))
		: (e.classList.remove("is-collapsed"),
		  o ? slideDown(n, 100) : n.style.removeProperty("display"));
}
async function setTreeCollapsedAll(e, t, o = !0) {
	let n = [];
	e.forEach(async (e) => {
		if (!e || !e.classList.contains("mod-collapsible")) return;
		let o = e.querySelector(".tree-item-children");
		t
			? e.classList.add("is-collapsed")
			: e.classList.remove("is-collapsed"),
			n.push(o);
	}),
		t
			? o
				? slideUpAll(n, 100)
				: n.forEach(async (e) => (e.style.display = "none"))
			: o
			? slideDownAll(n, 100)
			: n.forEach(async (e) => e.style.removeProperty("display"));
}
function toggleTreeCollapsed(e) {
	e && setTreeCollapsed(e, !e.classList.contains("is-collapsed"));
}
function toggleTreeCollapsedAll(e) {
	e && setTreeCollapsedAll(e, !e[0].classList.contains("is-collapsed"));
}
function setupCanvas(e) {
	if ("canvas" != documentType || !e.querySelector(".canvas-wrapper")) return;
	e.querySelector(".canvas")?.setAttribute(
		"style",
		"translate: 0px 1px; scale: 1;"
	);
	let t = getNodesBounds();
	function o(e) {
		let t = e.touches ?? [];
		if (
			!(t.length > 1) &&
			(1 == e.button || 0 == e.button || t.length > 0)
		) {
			let o = getPointerPosition(e),
				n = !1,
				i = 0,
				s = t.length,
				a = function (t) {
					let a = t.touches ?? [],
						l = getPointerPosition(t);
					s != a.length && ((o = l), (s = a.length));
					let r = l.x - o.x,
						c = l.y - o.y,
						d = !1;
					if ((1 == e.button || 1 == a.length) && focusedCanvasNode) {
						let e = Math.abs(r) > Math.abs(1.5 * c),
							t = Math.abs(c) > Math.abs(1.5 * r),
							o = focusedCanvasNode.querySelector(
								".markdown-preview-sizer"
							);
						if (o) {
							let n =
									o.scrollHeight >
									o.parentElement.clientHeight + 1,
								i =
									o.scrollWidth >
									o.parentElement.clientWidth + 1;
							((e && i) || (t && n)) && (d = !0);
						}
					}
					if (
						(d || (translateCanvas(r, c), (o = l)), 2 == a.length)
					) {
						let e = getPointerPosition(t, !1),
							o = getTouchPosition(t.touches[0]),
							s = getTouchPosition(t.touches[1]),
							a = Math.sqrt(
								Math.pow(o.x - s.x, 2) + Math.pow(o.y - s.y, 2)
							);
						n || ((n = !0), (i = a)),
							scaleCanvasAroundPoint(1 + (a - i) / i, e.x, e.y),
							(i = a);
					}
				},
				l = function (e) {
					document.body.removeEventListener("mousemove", a),
						document.body.removeEventListener("mouseup", l),
						document.body.removeEventListener("mouseenter", r),
						document.body.removeEventListener("touchmove", a),
						document.body.removeEventListener("touchend", l),
						document.body.removeEventListener("touchcancel", l);
				},
				r = function (e) {
					1 != e.buttons && 4 != e.buttons && l(e);
				};
			document.body.addEventListener("mousemove", a),
				document.body.addEventListener("mouseup", l),
				document.body.addEventListener("mouseenter", r),
				document.body.addEventListener("touchmove", a),
				document.body.addEventListener("touchend", l),
				document.body.addEventListener("touchcancel", l);
		}
	}
	setViewCenter(t.centerX, t.centerY),
		e.querySelectorAll(".canvas-node-container").forEach(function (e) {
			var t = e.parentElement;
			function o(e) {
				t.classList.toggle("is-focused"),
					null != focusedCanvasNode &&
						focusedCanvasNode != t &&
						(focusedCanvasNode.classList.remove("is-focused"),
						(focusedCanvasNode.querySelector(
							".canvas-node-container"
						).style.display = "")),
					(focusedCanvasNode = t),
					t.addEventListener("mouseleave", n),
					t.addEventListener("touchend", n);
			}
			function n(e) {
				focusedCanvasNode &&
					(focusedCanvasNode.classList.remove("is-focused"),
					(focusedCanvasNode = null)),
					t.removeEventListener("mouseleave", n),
					t.removeEventListener("touchend", n);
			}
			e.addEventListener("mouseenter", o),
				e.addEventListener("touchstart", o);
		}),
		e.querySelectorAll(".canvas-node").forEach(function (e) {
			e.addEventListener("dblclick", function (t) {
				fitViewToNode(e);
			});
		}),
		e.querySelectorAll(".canvas-background").forEach(function (e) {
			e.addEventListener("dblclick", function (e) {
				fitViewToCanvas();
			});
		}),
		canvasWrapper.addEventListener("mousedown", o),
		canvasWrapper.addEventListener("touchstart", o);
	let n = 0,
		i = 0;
	canvasWrapper.addEventListener("mousemove", function (e) {
		let t = getPointerPosition(e);
		(n = t.x), (i = t.y);
	});
	let s = 1,
		a = 0,
		l = !1;
	canvasWrapper.addEventListener("wheel", function (e) {
		if (focusedCanvasNode) {
			let e = focusedCanvasNode.querySelector(".markdown-preview-sizer");
			if (e && e.scrollHeight > e.parentElement.clientHeight) return;
		}
		if ((e.preventDefault(), e.stopPropagation(), l)) {
			let t = 1;
			(t -= (e.deltaY / 700) * t), (t = clamp(t, 0.1, 10));
			let o = getViewBounds();
			scaleCanvasAroundPoint(t, o.centerX, o.centerY);
		} else {
			let t = 0 == a;
			a -= e.deltaY / 200;
			const o = 0.14 * s;
			(a = clamp(a, -o, o)), t && requestAnimationFrame(u);
		}
	});
	let r = 0,
		c = 0,
		d = 0;
	function u(e) {
		if (
			((r = e - c),
			0 == c && (r = 30),
			(c = e),
			(d = 0.05 * r + 0.95 * d),
			d > 50)
		)
			return (
				console.log("Scrolling too slow, turning on instant scroll"),
				void (l = !0)
			);
		let t = s;
		(s += a * (r / 1e3) * 30), (s = clamp(s, 0.1, 10));
		getViewBounds();
		scaleCanvasAroundPoint(s / t, n, i),
			(a *= 0.4),
			Math.abs(a) < 0.01 ? ((a = 0), (c = 0)) : requestAnimationFrame(u);
	}
	fitViewToCanvas();
}
function getViewBounds() {
	let e = viewContent.getBoundingClientRect(),
		t = e.x,
		o = e.y,
		n = e.x + e.width,
		i = e.y + e.height;
	return {
		x: t,
		y: o,
		width: n - t,
		height: i - o,
		minX: t,
		minY: o,
		maxX: n,
		maxY: i,
		centerX: e.x + e.width / 2,
		centerY: e.y + e.height / 2,
	};
}
function getNodesBounds() {
	let e = 1 / 0,
		t = 1 / 0,
		o = -1 / 0,
		n = -1 / 0;
	canvasNodes.forEach(function (i) {
		let s = i.getBoundingClientRect();
		s.x < e && (e = s.x),
			s.y < t && (t = s.y),
			s.x + s.width > o && (o = s.x + s.width),
			s.y + s.height > n && (n = s.y + s.height);
	});
	let i = o - e,
		s = n - t;
	return {
		x: e,
		y: t,
		width: i,
		height: s,
		minX: e,
		minY: t,
		maxX: o,
		maxY: n,
		centerX: e + i / 2,
		centerY: t + s / 2,
	};
}
function getCanvasBounds() {
	let e = canvas.getBoundingClientRect(),
		t = e.x,
		o = e.y,
		n = e.width,
		i = e.height;
	return {
		x: t,
		y: o,
		width: n,
		height: i,
		minX: t,
		minY: o,
		maxX: t + n,
		maxY: o + i,
		centerX: e.x + e.width / 2,
		centerY: e.y + e.height / 2,
	};
}
function scaleCanvasAroundPoint(e, t, o) {
	let n = getCanvasBounds(),
		i = t - n.x,
		s = o - n.y,
		a = t - (n.x + i * e),
		l = o - (n.y + s * e);
	return scaleCanvas(e), translateCanvas(a, l), { x: a, y: l };
}
function scaleCanvas(e) {
	let t = Math.max(e * canvas.style.scale, 0.001);
	(canvas.style.scale = t),
		canvasWrapper.style.setProperty("--zoom-multiplier", 1 / Math.sqrt(t));
}
function translateCanvas(e, t) {
	let o = canvas.style.translate,
		n = o.split(" "),
		i = n.length > 0 ? parseFloat(o.split(" ")[0].trim()) : 0,
		s = n.length > 1 ? parseFloat(o.split(" ")[1].trim()) : i;
	canvas.style.translate = `${i + e}px ${s + t}px`;
}
function setViewCenter(e, t) {
	let o = getViewBounds();
	translateCanvas(o.centerX - e, o.centerY - t);
}
function getCanvasTranslation() {
	let e = canvas.style.translate,
		t = e.split(" "),
		o = t.length > 0 ? parseFloat(e.split(" ")[0].trim()) : 0;
	return { x: o, y: t.length > 1 ? parseFloat(e.split(" ")[1].trim()) : o };
}
function scaleCanvasBackground(e) {
	let t = e * canvasBackgroundPattern.getAttribute("width"),
		o = e * canvasBackgroundPattern.getAttribute("height");
	canvasBackgroundPattern.setAttribute("width", t),
		canvasBackgroundPattern.setAttribute("height", o);
}
function translateCanvasBackground(e, t) {
	canvasBackgroundPattern.setAttribute(
		"x",
		e + canvasBackgroundPattern.getAttribute("x")
	),
		canvasBackgroundPattern.setAttribute(
			"y",
			t + canvasBackgroundPattern.getAttribute("y")
		);
}
function fitViewToNode(e) {
	let t = getElBounds(e),
		o = getViewBounds(),
		n = getCanvasBounds(),
		i = 0.8 * Math.min(o.width / t.width, o.height / t.height),
		s = n.x,
		a = n.y,
		l = s + (t.centerX - s) * i,
		r = a + (t.centerY - a) * i,
		c = o.centerX - l,
		d = o.centerY - r;
	(t = getElBounds(e)),
		(canvas.style.transition =
			"scale 0.5s cubic-bezier(0.5, -0.1, 0.5, 1.1), translate 0.5s cubic-bezier(0.5, -0.1, 0.5, 1.1)"),
		scaleCanvas(i),
		translateCanvas(c, d),
		setTimeout(function () {
			canvas.style.transition = "";
		}, 550);
}
function fitViewToCanvas() {
	let e = getNodesBounds(),
		t = getViewBounds(),
		o = getCanvasBounds(),
		n = 0.8 * Math.min(t.width / e.width, t.height / e.height),
		i = o.x,
		s = o.y,
		a = i + (e.centerX - i) * n,
		l = s + (e.centerY - s) * n,
		r = t.centerX - a,
		c = t.centerY - l;
	(canvas.style.transition =
		"scale 0.5s cubic-bezier(0.5, -0.1, 0.5, 1.1), translate 0.5s cubic-bezier(0.5, -0.1, 0.5, 1.1)"),
		scaleCanvas(n),
		translateCanvas(r, c),
		setTimeout(function () {
			canvas.style.transition = "";
		}, 550);
}
function setupCallouts(e) {
	e.querySelectorAll(".callout.is-collapsible .callout-title").forEach(
		function (e) {
			e.addEventListener("click", function () {
				var t = this.parentElement;
				t.classList.toggle("is-collapsed"),
					e
						.querySelector(".callout-fold")
						.classList.toggle("is-collapsed"),
					slideToggle(t.querySelector(".callout-content"), 100);
			});
		}
	);
}
function setupCheckboxes(e) {
	e.querySelectorAll(".task-list-item-checkbox").forEach(function (e) {
		e.addEventListener("click", function () {
			var e = this.parentElement;
			e.classList.toggle("is-checked"),
				e.setAttribute(
					"data-task",
					e.classList.contains("is-checked") ? "x" : " "
				);
		});
	}),
		e
			.querySelectorAll('.plugin-tasks-list-item input[type="checkbox"]')
			.forEach(function (e) {
				e.checked = e.parentElement.classList.contains("is-checked");
			}),
		e
			.querySelectorAll(".kanban-plugin__item.is-complete")
			.forEach(function (e) {
				e.querySelector('input[type="checkbox"]').checked = !0;
			});
}
function setupCodeblocks(e) {
	e.querySelectorAll(".copy-code-button").forEach(function (t) {
		t.addEventListener("click", function () {
			var t = this.parentElement.querySelector("code").textContent;
			navigator.clipboard.writeText(t),
				(this.textContent = "Copied!"),
				setTimeout(function () {
					e.querySelectorAll(".copy-code-button").forEach(function (
						e
					) {
						e.textContent = "Copy";
					});
				}, 2e3);
		});
	});
}
function setupLinks(e) {
	e.querySelectorAll(
		".internal-link, .footnote-link, .tree-item:not(.mod-tree-folder) > .tree-item-contents > .tree-item-link"
	).forEach(function (e) {
		e.addEventListener("click", function (t) {
			let o = e.getAttribute("href");
			if ((t.preventDefault(), o))
				if (o.startsWith("#")) {
					let e = document.getElementById(o.substring(1));
					e
						? (e.headingWrapper?.collapse(!1, !0, !0),
						  setTimeout(function () {
								e.classList.contains(".heading")
									? e.headingWrapper?.scrollIntoView({
											behavior: "smooth",
											block: "start",
									  })
									: e.scrollIntoView({
											behavior: "smooth",
											block: "start",
									  }),
									"phone" == deviceSize &&
										rightSidebar.collapse(!0);
						  }, 0))
						: console.log(
								"No element found with id: " + o.substring(1)
						  );
				} else
					loadDocument(
						o,
						!0,
						!e.classList.contains("tree-item-link")
					);
		});
	});
}
function setupSidebars() {
	(sidebarCollapseIcons[0].otherIcon = sidebarCollapseIcons[1]),
		(sidebarCollapseIcons[1].otherIcon = sidebarCollapseIcons[0]),
		(sidebarCollapseIcons[0].gutter = sidebarGutters[0]),
		(sidebarCollapseIcons[1].gutter = sidebarGutters[1]),
		(sidebarCollapseIcons[0].sidebar = sidebars[0]),
		(sidebarCollapseIcons[1].sidebar = sidebars[1]),
		(sidebarGutters[0].otherGutter = sidebarGutters[1]),
		(sidebarGutters[1].otherGutter = sidebarGutters[0]),
		(sidebarGutters[0].collapseIcon = sidebarCollapseIcons[0]),
		(sidebarGutters[1].collapseIcon = sidebarCollapseIcons[1]),
		(sidebars[0].otherSidebar = sidebars[1]),
		(sidebars[1].otherSidebar = sidebars[0]),
		(sidebars[0].gutter = sidebarGutters[0]),
		(sidebars[1].gutter = sidebarGutters[1]),
		sidebars.forEach(function (e) {
			(e.collapsed = e.classList.contains("is-collapsed")),
				(e.collapse = function (t = !0) {
					if (
						(!t &&
							this.temporarilyCollapsed &&
							"large-screen" == deviceSize &&
							this.gutter.collapse(!0),
						!t &&
							document.body.classList.contains(
								"floating-sidebars"
							))
					) {
						document.body.addEventListener("click", function t(o) {
							e.collapse(!0),
								document.body.removeEventListener("click", t);
						});
					}
					"phone" == deviceSize &&
						(t || e.otherSidebar.fullCollapse(!0, !0),
						t && e.gutter.otherGutter.collapse(!1, !0)),
						"tablet" == deviceSize &&
							(t || e.otherSidebar.collapse(!0)),
						this.classList.toggle("is-collapsed", t),
						(this.collapsed = t);
				}),
				(e.temporaryCollapse = function (e = !0) {
					(this.temporarilyCollapsed = !0),
						this.collapse(!0),
						this.gutter.collapse(!1),
						(this.collapsed = e);
				}),
				(e.fullCollapse = function (e = !0, t = !1) {
					this.collapse(e),
						this.gutter.collapse(!0, t),
						(this.collapsed = e);
				}),
				(e.toggleCollapse = function () {
					this.collapse(!this.collapsed);
				}),
				(e.toggleFullCollapse = function () {
					this.fullCollapse(!this.collapsed);
				});
		}),
		sidebarGutters.forEach(function (e) {
			(e.collapsed = e.classList.contains("is-collapsed")),
				(e.collapse = function (e, t = !1) {
					(!t &&
						document.body.classList.contains(
							"sidebars-always-collapsible"
						)) ||
						(this.classList.toggle("is-collapsed", e),
						(this.collapsed = e));
				}),
				(e.toggleCollapse = function () {
					this.collapse(!this.collapsed);
				});
		}),
		sidebarCollapseIcons.forEach(function (e) {
			e.addEventListener("click", function (t) {
				t.stopPropagation(), e.sidebar.toggleCollapse();
			});
		}),
		document.querySelectorAll(".sidebar-container").forEach(function (e) {
			e.addEventListener("click", function (e) {
				e.stopPropagation();
			});
		});
}
function getSidebarWidthProp() {
	return getComputedPixelValue("--sidebar-width");
}
function setupThemeToggle() {
	function e(e, t = !1) {
		let o = document.querySelector(".theme-toggle-input");
		if (((o.checked = e), t)) {
			var n = document.body.style.transition;
			document.body.style.transition = "none";
		}
		!o.classList.contains("is-checked") && e
			? o.classList.add("is-checked")
			: o.classList.contains("is-checked") &&
			  !e &&
			  o.classList.remove("is-checked"),
			e
				? (document.body.classList.contains("theme-dark") &&
						document.body.classList.remove("theme-dark"),
				  document.body.classList.contains("theme-light") ||
						document.body.classList.add("theme-light"))
				: (document.body.classList.contains("theme-light") &&
						document.body.classList.remove("theme-light"),
				  document.body.classList.contains("theme-dark") ||
						document.body.classList.add("theme-dark")),
			t &&
				setTimeout(function () {
					document.body.style.transition = n;
				}, 100),
			localStorage.setItem("theme_toggle", e ? "true" : "false");
	}
	null != localStorage.getItem("theme_toggle") &&
		e("true" == localStorage.getItem("theme_toggle")),
		document.body.classList.contains("theme-light") ? e(!0) : e(!1),
		document
			.querySelector(".theme-toggle-input")
			?.addEventListener("change", (t) => {
				console.log(
					"Theme toggle changed to: " +
						!("true" == localStorage.getItem("theme_toggle"))
				),
					e(!("true" == localStorage.getItem("theme_toggle")));
			});
}
function setupScroll(e) {
	if ("canvas" != documentType) return;
	let t = Array.from(e.querySelectorAll(".markdown-preview-view")),
		o = 0,
		n = 0;
	t.forEach(async function (e) {
		console.log("Setting up markdown view");
		let t = Array.from(e.querySelectorAll(".heading-wrapper"));
		e.updateVisibleWindowMarkdown = function (o = !0, i = !0) {
			let s = e.getBoundingClientRect();
			n = Math.min(0.1 * s.height, 150);
			let a = s.top - n,
				l = s.bottom + n;
			async function r(e) {
				let t = e?.getBoundingClientRect();
				if (!t) return;
				let n =
					(t.top < a && t.bottom < a) || (t.top > l && t.bottom > l);
				n && o ? e.hide() : !n && i && e.show();
			}
			for (let e = 0; e < t.length; e++) {
				let o = t[e];
				o && r(o);
			}
		};
		let o = 0;
		e.addEventListener("scroll", function () {
			Math.abs(e.scrollTop - o) > n / 3 &&
				e.updateVisibleWindowMarkdown(!1, !0),
				(o = e.scrollTop);
		});
	}),
		setInterval(async function () {
			t.length > 0 &&
				(t[o].updateVisibleWindowMarkdown(), (o = (o + 1) % t.length));
		}, 200);
}
function setupExcalidraw(e) {
	e.querySelectorAll(".excalidraw-svg svg").forEach(function (e) {
		let t = e.querySelector("rect").getAttribute("fill") > "#7F7F7F";
		e.classList.add(t ? "light" : "dark");
	});
}
