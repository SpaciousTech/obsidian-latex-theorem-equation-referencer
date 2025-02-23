var read_,
	readAsync,
	readBinary,
	setWindowTitle,
	Module = void 0 !== Module ? Module : {},
	moduleOverrides = Object.assign({}, Module),
	arguments_ = [],
	thisProgram = "./this.program",
	quit_ = (e, n) => {
		throw n;
	},
	ENVIRONMENT_IS_WEB = "object" == typeof window,
	ENVIRONMENT_IS_WORKER = "function" == typeof importScripts,
	ENVIRONMENT_IS_NODE =
		"object" == typeof process &&
		"object" == typeof process.versions &&
		"string" == typeof process.versions.node,
	scriptDirectory = "";
function locateFile(e) {
	return Module.locateFile
		? Module.locateFile(e, scriptDirectory)
		: scriptDirectory + e;
}
if (ENVIRONMENT_IS_NODE) {
	var fs = require("fs"),
		nodePath = require("path");
	(scriptDirectory = ENVIRONMENT_IS_WORKER
		? nodePath.dirname(scriptDirectory) + "/"
		: __dirname + "/"),
		(read_ = (e, n) => (
			(e = isFileURI(e) ? new URL(e) : nodePath.normalize(e)),
			fs.readFileSync(e, n ? void 0 : "utf8")
		)),
		(readBinary = (e) => {
			var n = read_(e, !0);
			return n.buffer || (n = new Uint8Array(n)), n;
		}),
		(readAsync = (e, n, t) => {
			(e = isFileURI(e) ? new URL(e) : nodePath.normalize(e)),
				fs.readFile(e, function (e, r) {
					e ? t(e) : n(r.buffer);
				});
		}),
		!Module.thisProgram &&
			process.argv.length > 1 &&
			(thisProgram = process.argv[1].replace(/\\/g, "/")),
		(arguments_ = process.argv.slice(2)),
		"undefined" != typeof module && (module.exports = Module),
		process.on("uncaughtException", function (e) {
			if (
				!(
					"unwind" === e ||
					e instanceof ExitStatus ||
					e.context instanceof ExitStatus
				)
			)
				throw e;
		});
	var nodeMajor = process.versions.node.split(".")[0];
	nodeMajor < 15 &&
		process.on("unhandledRejection", function (e) {
			throw e;
		}),
		(quit_ = (e, n) => {
			throw ((process.exitCode = e), n);
		}),
		(Module.inspect = function () {
			return "[Emscripten Module object]";
		});
} else
	(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
		(ENVIRONMENT_IS_WORKER
			? (scriptDirectory = self.location.href)
			: "undefined" != typeof document &&
			  document.currentScript &&
			  (scriptDirectory = document.currentScript.src),
		(scriptDirectory =
			0 !== scriptDirectory.indexOf("blob:")
				? scriptDirectory.substr(
						0,
						scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") +
							1
				  )
				: ""),
		(read_ = (e) => {
			var n = new XMLHttpRequest();
			return n.open("GET", e, !1), n.send(null), n.responseText;
		}),
		ENVIRONMENT_IS_WORKER &&
			(readBinary = (e) => {
				var n = new XMLHttpRequest();
				return (
					n.open("GET", e, !1),
					(n.responseType = "arraybuffer"),
					n.send(null),
					new Uint8Array(n.response)
				);
			}),
		(readAsync = (e, n, t) => {
			var r = new XMLHttpRequest();
			r.open("GET", e, !0),
				(r.responseType = "arraybuffer"),
				(r.onload = () => {
					200 == r.status || (0 == r.status && r.response)
						? n(r.response)
						: t();
				}),
				(r.onerror = t),
				r.send(null);
		}),
		(setWindowTitle = (e) => (document.title = e)));
var wasmBinary,
	out = Module.print || console.log.bind(console),
	err = Module.printErr || console.warn.bind(console);
Object.assign(Module, moduleOverrides),
	(moduleOverrides = null),
	Module.arguments && (arguments_ = Module.arguments),
	Module.thisProgram && (thisProgram = Module.thisProgram),
	Module.quit && (quit_ = Module.quit),
	Module.wasmBinary && (wasmBinary = Module.wasmBinary);
var wasmMemory,
	noExitRuntime = Module.noExitRuntime || !0;
"object" != typeof WebAssembly && abort("no native wasm support detected");
var EXITSTATUS,
	HEAP8,
	HEAPU8,
	HEAP16,
	HEAPU16,
	HEAP32,
	HEAPU32,
	HEAPF32,
	HEAPF64,
	wasmTable,
	ABORT = !1;
function updateMemoryViews() {
	var e = wasmMemory.buffer;
	(Module.HEAP8 = HEAP8 = new Int8Array(e)),
		(Module.HEAP16 = HEAP16 = new Int16Array(e)),
		(Module.HEAP32 = HEAP32 = new Int32Array(e)),
		(Module.HEAPU8 = HEAPU8 = new Uint8Array(e)),
		(Module.HEAPU16 = HEAPU16 = new Uint16Array(e)),
		(Module.HEAPU32 = HEAPU32 = new Uint32Array(e)),
		(Module.HEAPF32 = HEAPF32 = new Float32Array(e)),
		(Module.HEAPF64 = HEAPF64 = new Float64Array(e));
}
var __ATPRERUN__ = [],
	__ATINIT__ = [],
	__ATPOSTRUN__ = [],
	runtimeInitialized = !1;
function preRun() {
	if (Module.preRun)
		for (
			"function" == typeof Module.preRun &&
			(Module.preRun = [Module.preRun]);
			Module.preRun.length;

		)
			addOnPreRun(Module.preRun.shift());
	callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
	(runtimeInitialized = !0), callRuntimeCallbacks(__ATINIT__);
}
function postRun() {
	if (Module.postRun)
		for (
			"function" == typeof Module.postRun &&
			(Module.postRun = [Module.postRun]);
			Module.postRun.length;

		)
			addOnPostRun(Module.postRun.shift());
	callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(e) {
	__ATPRERUN__.unshift(e);
}
function addOnInit(e) {
	__ATINIT__.unshift(e);
}
function addOnPostRun(e) {
	__ATPOSTRUN__.unshift(e);
}
var runDependencies = 0,
	runDependencyWatcher = null,
	dependenciesFulfilled = null;
function addRunDependency(e) {
	runDependencies++,
		Module.monitorRunDependencies &&
			Module.monitorRunDependencies(runDependencies);
}
function removeRunDependency(e) {
	if (
		(runDependencies--,
		Module.monitorRunDependencies &&
			Module.monitorRunDependencies(runDependencies),
		0 == runDependencies &&
			(null !== runDependencyWatcher &&
				(clearInterval(runDependencyWatcher),
				(runDependencyWatcher = null)),
			dependenciesFulfilled))
	) {
		var n = dependenciesFulfilled;
		(dependenciesFulfilled = null), n();
	}
}
function abort(e) {
	throw (
		(Module.onAbort && Module.onAbort(e),
		err((e = "Aborted(" + e + ")")),
		(ABORT = !0),
		(EXITSTATUS = 1),
		(e += ". Build with -sASSERTIONS for more info."),
		new WebAssembly.RuntimeError(e))
	);
}
var wasmBinaryFile,
	tempDouble,
	tempI64,
	dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(e) {
	return e.startsWith(dataURIPrefix);
}
function isFileURI(e) {
	return e.startsWith("file://");
}
function getBinary(e) {
	try {
		if (e == wasmBinaryFile && wasmBinary)
			return new Uint8Array(wasmBinary);
		if (readBinary) return readBinary(e);
		throw "both async and sync fetching of the wasm failed";
	} catch (e) {
		abort(e);
	}
}
function getBinaryPromise(e) {
	if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
		if ("function" == typeof fetch && !isFileURI(e))
			return fetch(e, { credentials: "same-origin" })
				.then(function (n) {
					if (!n.ok)
						throw "failed to load wasm binary file at '" + e + "'";
					return n.arrayBuffer();
				})
				.catch(function () {
					return getBinary(e);
				});
		if (readAsync)
			return new Promise(function (n, t) {
				readAsync(
					e,
					function (e) {
						n(new Uint8Array(e));
					},
					t
				);
			});
	}
	return Promise.resolve().then(function () {
		return getBinary(e);
	});
}
function instantiateArrayBuffer(e, n, t) {
	return getBinaryPromise(e)
		.then(function (e) {
			return WebAssembly.instantiate(e, n);
		})
		.then(function (e) {
			return e;
		})
		.then(t, function (e) {
			err("failed to asynchronously prepare wasm: " + e), abort(e);
		});
}
function instantiateAsync(e, n, t, r) {
	return e ||
		"function" != typeof WebAssembly.instantiateStreaming ||
		isDataURI(n) ||
		isFileURI(n) ||
		ENVIRONMENT_IS_NODE ||
		"function" != typeof fetch
		? instantiateArrayBuffer(n, t, r)
		: fetch(n, { credentials: "same-origin" }).then(function (e) {
				return WebAssembly.instantiateStreaming(e, t).then(
					r,
					function (e) {
						return (
							err("wasm streaming compile failed: " + e),
							err("falling back to ArrayBuffer instantiation"),
							instantiateArrayBuffer(n, t, r)
						);
					}
				);
		  });
}
function createWasm() {
	var e = { a: wasmImports };
	function n(e, n) {
		var t = e.exports;
		return (
			(Module.asm = t),
			(wasmMemory = Module.asm.f),
			updateMemoryViews(),
			(wasmTable = Module.asm.r),
			addOnInit(Module.asm.g),
			removeRunDependency("wasm-instantiate"),
			t
		);
	}
	if ((addRunDependency("wasm-instantiate"), Module.instantiateWasm))
		try {
			return Module.instantiateWasm(e, n);
		} catch (e) {
			return (
				err("Module.instantiateWasm callback failed with error: " + e),
				!1
			);
		}
	return (
		instantiateAsync(wasmBinary, wasmBinaryFile, e, function (e) {
			n(e.instance);
		}),
		{}
	);
}
isDataURI((wasmBinaryFile = "graph_wasm.wasm")) ||
	(wasmBinaryFile = locateFile(wasmBinaryFile));
var ASM_CONSTS = {
	2304: (e) => {
		console.log(UTF8ToString(e));
	},
};
function ExitStatus(e) {
	(this.name = "ExitStatus"),
		(this.message = "Program terminated with exit(" + e + ")"),
		(this.status = e);
}
function callRuntimeCallbacks(e) {
	for (; e.length > 0; ) e.shift()(Module);
}
function getValue(e, n = "i8") {
	switch ((n.endsWith("*") && (n = "*"), n)) {
		case "i1":
		case "i8":
			return HEAP8[e >> 0];
		case "i16":
			return HEAP16[e >> 1];
		case "i32":
		case "i64":
			return HEAP32[e >> 2];
		case "float":
			return HEAPF32[e >> 2];
		case "double":
			return HEAPF64[e >> 3];
		case "*":
			return HEAPU32[e >> 2];
		default:
			abort("invalid type for getValue: " + n);
	}
}
function setValue(e, n, t = "i8") {
	switch ((t.endsWith("*") && (t = "*"), t)) {
		case "i1":
		case "i8":
			HEAP8[e >> 0] = n;
			break;
		case "i16":
			HEAP16[e >> 1] = n;
			break;
		case "i32":
			HEAP32[e >> 2] = n;
			break;
		case "i64":
			(tempI64 = [
				n >>> 0,
				((tempDouble = n),
				+Math.abs(tempDouble) >= 1
					? tempDouble > 0
						? (0 |
								Math.min(
									+Math.floor(tempDouble / 4294967296),
									4294967295
								)) >>>
						  0
						: ~~+Math.ceil(
								(tempDouble - +(~~tempDouble >>> 0)) /
									4294967296
						  ) >>> 0
					: 0),
			]),
				(HEAP32[e >> 2] = tempI64[0]),
				(HEAP32[(e + 4) >> 2] = tempI64[1]);
			break;
		case "float":
			HEAPF32[e >> 2] = n;
			break;
		case "double":
			HEAPF64[e >> 3] = n;
			break;
		case "*":
			HEAPU32[e >> 2] = n;
			break;
		default:
			abort("invalid type for setValue: " + t);
	}
}
function _abort() {
	abort("");
}
var readEmAsmArgsArray = [];
function readEmAsmArgs(e, n) {
	var t;
	for (readEmAsmArgsArray.length = 0, n >>= 2; (t = HEAPU8[e++]); )
		(n += (105 != t) & n),
			readEmAsmArgsArray.push(105 == t ? HEAP32[n] : HEAPF64[n++ >> 1]),
			++n;
	return readEmAsmArgsArray;
}
function runEmAsmFunction(e, n, t) {
	var r = readEmAsmArgs(n, t);
	return ASM_CONSTS[e].apply(null, r);
}
function _emscripten_asm_const_int(e, n, t) {
	return runEmAsmFunction(e, n, t);
}
function _emscripten_date_now() {
	return Date.now();
}
function _emscripten_memcpy_big(e, n, t) {
	HEAPU8.copyWithin(e, n, n + t);
}
function getHeapMax() {
	return 2147483648;
}
function emscripten_realloc_buffer(e) {
	var n = wasmMemory.buffer;
	try {
		return (
			wasmMemory.grow((e - n.byteLength + 65535) >>> 16),
			updateMemoryViews(),
			1
		);
	} catch (e) {}
}
function _emscripten_resize_heap(e) {
	var n = HEAPU8.length;
	e >>>= 0;
	var t = getHeapMax();
	if (e > t) return !1;
	for (var r = 1; r <= 4; r *= 2) {
		var o = n * (1 + 0.2 / r);
		if (
			((o = Math.min(o, e + 100663296)),
			emscripten_realloc_buffer(
				Math.min(
					t,
					(a = Math.max(e, o)) + (((i = 65536) - (a % i)) % i)
				)
			))
		)
			return !0;
	}
	var a, i;
	return !1;
}
function getCFunc(e) {
	return Module["_" + e];
}
function writeArrayToMemory(e, n) {
	HEAP8.set(e, n);
}
function lengthBytesUTF8(e) {
	for (var n = 0, t = 0; t < e.length; ++t) {
		var r = e.charCodeAt(t);
		r <= 127
			? n++
			: r <= 2047
			? (n += 2)
			: r >= 55296 && r <= 57343
			? ((n += 4), ++t)
			: (n += 3);
	}
	return n;
}
function stringToUTF8Array(e, n, t, r) {
	if (!(r > 0)) return 0;
	for (var o = t, a = t + r - 1, i = 0; i < e.length; ++i) {
		var u = e.charCodeAt(i);
		if (u >= 55296 && u <= 57343)
			u = (65536 + ((1023 & u) << 10)) | (1023 & e.charCodeAt(++i));
		if (u <= 127) {
			if (t >= a) break;
			n[t++] = u;
		} else if (u <= 2047) {
			if (t + 1 >= a) break;
			(n[t++] = 192 | (u >> 6)), (n[t++] = 128 | (63 & u));
		} else if (u <= 65535) {
			if (t + 2 >= a) break;
			(n[t++] = 224 | (u >> 12)),
				(n[t++] = 128 | ((u >> 6) & 63)),
				(n[t++] = 128 | (63 & u));
		} else {
			if (t + 3 >= a) break;
			(n[t++] = 240 | (u >> 18)),
				(n[t++] = 128 | ((u >> 12) & 63)),
				(n[t++] = 128 | ((u >> 6) & 63)),
				(n[t++] = 128 | (63 & u));
		}
	}
	return (n[t] = 0), t - o;
}
function stringToUTF8(e, n, t) {
	return stringToUTF8Array(e, HEAPU8, n, t);
}
function stringToUTF8OnStack(e) {
	var n = lengthBytesUTF8(e) + 1,
		t = stackAlloc(n);
	return stringToUTF8(e, t, n), t;
}
var UTF8Decoder =
	"undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function UTF8ArrayToString(e, n, t) {
	for (var r = n + t, o = n; e[o] && !(o >= r); ) ++o;
	if (o - n > 16 && e.buffer && UTF8Decoder)
		return UTF8Decoder.decode(e.subarray(n, o));
	for (var a = ""; n < o; ) {
		var i = e[n++];
		if (128 & i) {
			var u = 63 & e[n++];
			if (192 != (224 & i)) {
				var l = 63 & e[n++];
				if (
					(i =
						224 == (240 & i)
							? ((15 & i) << 12) | (u << 6) | l
							: ((7 & i) << 18) |
							  (u << 12) |
							  (l << 6) |
							  (63 & e[n++])) < 65536
				)
					a += String.fromCharCode(i);
				else {
					var s = i - 65536;
					a += String.fromCharCode(
						55296 | (s >> 10),
						56320 | (1023 & s)
					);
				}
			} else a += String.fromCharCode(((31 & i) << 6) | u);
		} else a += String.fromCharCode(i);
	}
	return a;
}
function UTF8ToString(e, n) {
	return e ? UTF8ArrayToString(HEAPU8, e, n) : "";
}
function ccall(e, n, t, r, o) {
	var a = {
		string: (e) => {
			var n = 0;
			return null != e && 0 !== e && (n = stringToUTF8OnStack(e)), n;
		},
		array: (e) => {
			var n = stackAlloc(e.length);
			return writeArrayToMemory(e, n), n;
		},
	};
	var i = getCFunc(e),
		u = [],
		l = 0;
	if (r)
		for (var s = 0; s < r.length; s++) {
			var c = a[t[s]];
			c
				? (0 === l && (l = stackSave()), (u[s] = c(r[s])))
				: (u[s] = r[s]);
		}
	var d = i.apply(null, u);
	return (d = (function (e) {
		return (
			0 !== l && stackRestore(l),
			(function (e) {
				return "string" === n
					? UTF8ToString(e)
					: "boolean" === n
					? Boolean(e)
					: e;
			})(e)
		);
	})(d));
}
function cwrap(e, n, t, r) {
	var o = !t || t.every((e) => "number" === e || "boolean" === e);
	return "string" !== n && o && !r
		? getCFunc(e)
		: function () {
				return ccall(e, n, t, arguments, r);
		  };
}
var calledRun,
	wasmImports = {
		b: _abort,
		e: _emscripten_asm_const_int,
		d: _emscripten_date_now,
		c: _emscripten_memcpy_big,
		a: _emscripten_resize_heap,
	},
	asm = createWasm(),
	___wasm_call_ctors = function () {
		return (___wasm_call_ctors = Module.asm.g).apply(null, arguments);
	},
	_SetBatchFractionSize = (Module._SetBatchFractionSize = function () {
		return (_SetBatchFractionSize = Module._SetBatchFractionSize =
			Module.asm.h).apply(null, arguments);
	}),
	_SetAttractionForce = (Module._SetAttractionForce = function () {
		return (_SetAttractionForce = Module._SetAttractionForce =
			Module.asm.i).apply(null, arguments);
	}),
	_SetLinkLength = (Module._SetLinkLength = function () {
		return (_SetLinkLength = Module._SetLinkLength = Module.asm.j).apply(
			null,
			arguments
		);
	}),
	_SetRepulsionForce = (Module._SetRepulsionForce = function () {
		return (_SetRepulsionForce = Module._SetRepulsionForce =
			Module.asm.k).apply(null, arguments);
	}),
	_SetCentralForce = (Module._SetCentralForce = function () {
		return (_SetCentralForce = Module._SetCentralForce =
			Module.asm.l).apply(null, arguments);
	}),
	_SetDt = (Module._SetDt = function () {
		return (_SetDt = Module._SetDt = Module.asm.m).apply(null, arguments);
	}),
	_Init = (Module._Init = function () {
		return (_Init = Module._Init = Module.asm.n).apply(null, arguments);
	}),
	_Update = (Module._Update = function () {
		return (_Update = Module._Update = Module.asm.o).apply(null, arguments);
	}),
	_SetPosition = (Module._SetPosition = function () {
		return (_SetPosition = Module._SetPosition = Module.asm.p).apply(
			null,
			arguments
		);
	}),
	_FreeMemory = (Module._FreeMemory = function () {
		return (_FreeMemory = Module._FreeMemory = Module.asm.q).apply(
			null,
			arguments
		);
	}),
	___errno_location = function () {
		return (___errno_location = Module.asm.__errno_location).apply(
			null,
			arguments
		);
	},
	_malloc = (Module._malloc = function () {
		return (_malloc = Module._malloc = Module.asm.s).apply(null, arguments);
	}),
	_free = (Module._free = function () {
		return (_free = Module._free = Module.asm.t).apply(null, arguments);
	}),
	stackSave = function () {
		return (stackSave = Module.asm.u).apply(null, arguments);
	},
	stackRestore = function () {
		return (stackRestore = Module.asm.v).apply(null, arguments);
	},
	stackAlloc = function () {
		return (stackAlloc = Module.asm.w).apply(null, arguments);
	},
	___cxa_is_pointer_type = function () {
		return (___cxa_is_pointer_type =
			Module.asm.__cxa_is_pointer_type).apply(null, arguments);
	};
function run() {
	function e() {
		calledRun ||
			((calledRun = !0),
			(Module.calledRun = !0),
			ABORT ||
				(initRuntime(),
				Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
				postRun()));
	}
	runDependencies > 0 ||
		(preRun(),
		runDependencies > 0 ||
			(Module.setStatus
				? (Module.setStatus("Running..."),
				  setTimeout(function () {
						setTimeout(function () {
							Module.setStatus("");
						}, 1),
							e();
				  }, 1))
				: e()));
}
if (
	((Module.cwrap = cwrap),
	(Module.setValue = setValue),
	(Module.getValue = getValue),
	(dependenciesFulfilled = function e() {
		calledRun || run(), calledRun || (dependenciesFulfilled = e);
	}),
	Module.preInit)
)
	for (
		"function" == typeof Module.preInit &&
		(Module.preInit = [Module.preInit]);
		Module.preInit.length > 0;

	)
		Module.preInit.pop()();
run();
