/*
//API
new ScrollTween.Staggered([]).start();
new ScrollTween.Sequence([]).start();
new ScrollTween.Parallel([]).start();
new ScrollTween().start();

*/

type ScrollTweenEvent = {
	selector: string;
	duration: number;
	offset?: number; //TEMPORARY
};

const sampleEvent: ScrollTweenEvent = {
	selector: ".object",
	duration: 30,
	offset: 300,
};

function linearInterpolate(inputRange: Array<number>, outputRange: Array<number>, solveFor: number, extrapolate: "clamp" | "extend" = "extend"): number {
	const inputMin = inputRange[0];
	const inputMax = inputRange[inputRange.length - 1];
	const outputMin = outputRange[0];
	const outputMax = outputRange[outputRange.length - 1];

	if (solveFor < inputMin && extrapolate === "clamp") {
		return outputMin;
	}
	if (solveFor > inputMax && extrapolate === "clamp") {
		return outputMax;
	}

	const increment = ((solveFor - inputRange[0]) * (outputRange[1] - outputRange[0])) / (inputRange[1] - inputRange[0]);
	return outputRange[0] + increment;
}

function findInterpolationRangeStart(inputRange: Array<number>, solveFor: number): number {
	let rangeEnd: number;
	for (let i = 0; i < inputRange.length; i++) {
		if (inputRange[i] >= solveFor) {
			rangeEnd = i;
			break;
		}
	}
	return rangeEnd - 1;
}

function numericalInterpolate(inputRange: Array<number>, outputRange: Array<number>, solveFor: number, extrapolate: "clamp" | "extend" = "extend"): number {
	const interpolationRangeStart = findInterpolationRangeStart(inputRange, solveFor);
	return linearInterpolate(
		[inputRange[interpolationRangeStart], inputRange[interpolationRangeStart + 1]],
		[outputRange[interpolationRangeStart], outputRange[interpolationRangeStart + 1]],
		solveFor,
		extrapolate
	);
}

const VIEWPORT_HEIGHT = window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight;
const EVENTS = new Array<ScrollTweenEvent>();

EVENTS.push(sampleEvent);

let scrollPosition = 0;
let isTicking = false;

const handleScroll = () => {
	scrollPosition = window.scrollY;

	if (!isTicking) {
		requestAnimationFrame(() => {
			tick();
			isTicking = false;
		});
		isTicking = true;
	}
};

const runEvent = (event: ScrollTweenEvent, scrollPosition: number) => {
	const { selector, duration, offset } = event;
	const element: HTMLElement = document.querySelector(selector);

	if (!element) return;

	const computedOffset = memoizedComputeOffset(selector, scrollPosition, duration, offset);

	if (typeof computedOffset === "number") {
		element.style.transform = `translateX(${computedOffset}px)`;
	}
};

// To create a Property name from the arguments passed to the function
const constructPropertyFromArgs = function(fnToMemoize, args) {
	let propToCheck = [];
	propToCheck = propToCheck.concat(fnToMemoize.name, args);
	return propToCheck.join("|"); // A delimiter to join args
};

//  `memoize` function  decides if it has to return cached value or call the summation function
const memoize = function(fnToMemoize) {
	const memoizedCache = {}; // A closeure Object
	return function(...args) {
		const propToCheck = constructPropertyFromArgs(fnToMemoize, args);
		if (!memoizedCache[propToCheck]) {
			memoizedCache[propToCheck] = fnToMemoize(...args);
		} else {
			console.log("From Cache ");
		}
		return memoizedCache[propToCheck];
	};
};

//PURE FUNCTION
const computeOffset = (selector: string, scrollPosition: number, duration: number, offset: number) => {
	// return 1;
	const element = document.querySelector(selector);
	const lowerLimit = 0;
	const upperLimit = (duration * VIEWPORT_HEIGHT) / 100;
	const interpolatedScrollPosition = numericalInterpolate([lowerLimit, upperLimit], [0, offset], scrollPosition, "clamp");
	return interpolatedScrollPosition;
};

const memoizedComputeOffset = memoize(computeOffset);

const tick = () => {
	EVENTS.forEach(o => runEvent(o, scrollPosition));
};

window.addEventListener("scroll", handleScroll);
