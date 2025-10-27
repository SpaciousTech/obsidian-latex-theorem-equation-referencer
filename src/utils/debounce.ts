/**
 * Debounce utility for Cross-Links plugin
 * Helps prevent excessive updates and improves performance
 */

export interface DebouncedFunction<T extends (...args: any[]) => any> {
	(...args: Parameters<T>): void;
	cancel(): void;
	flush(): void;
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): DebouncedFunction<T> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: Parameters<T> | undefined;

	const debounced = function (this: any, ...args: Parameters<T>) {
		lastArgs = args;
		
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			timeoutId = undefined;
			func.apply(this, args);
		}, wait);
	} as DebouncedFunction<T>;

	debounced.cancel = function () {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	debounced.flush = function () {
		if (timeoutId !== undefined && lastArgs !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
			func.apply(this, lastArgs);
		}
	};

	return debounced;
}

/**
 * Creates a debounced function with a leading edge call
 * The function is invoked immediately on first call, then debounced for subsequent calls
 */
export function debounceLeading<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): DebouncedFunction<T> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: Parameters<T> | undefined;

	const debounced = function (this: any, ...args: Parameters<T>) {
		const callNow = timeoutId === undefined;
		lastArgs = args;

		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			timeoutId = undefined;
		}, wait);

		if (callNow) {
			func.apply(this, args);
		}
	} as DebouncedFunction<T>;

	debounced.cancel = function () {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	debounced.flush = function () {
		if (lastArgs !== undefined) {
			if (timeoutId !== undefined) {
				clearTimeout(timeoutId);
				timeoutId = undefined;
			}
			func.apply(this, lastArgs);
		}
	};

	return debounced;
}

/**
 * Rate limiting utility - ensures function is not called more than once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): DebouncedFunction<T> {
	let inThrottle: boolean = false;
	let lastArgs: Parameters<T> | undefined;
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const throttled = function (this: any, ...args: Parameters<T>) {
		lastArgs = args;

		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			
			timeoutId = setTimeout(() => {
				inThrottle = false;
				if (lastArgs) {
					throttled.apply(this, lastArgs);
				}
			}, limit);
		}
	} as DebouncedFunction<T>;

	throttled.cancel = function () {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
		inThrottle = false;
	};

	throttled.flush = function () {
		if (lastArgs !== undefined) {
			if (timeoutId !== undefined) {
				clearTimeout(timeoutId);
				timeoutId = undefined;
			}
			inThrottle = false;
			func.apply(this, lastArgs);
		}
	};

	return throttled;
}

