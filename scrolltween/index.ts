import memoize from 'fast-memoize';
import interpolate from 'polate-js';
import * as Rematrix from 'rematrix';

/*
//API
new ScrollTween.Staggered([]).start();
new ScrollTween.Sequence([]).start();
new ScrollTween.Parallel([]).start();
new ScrollTween().start();

*/

type TweenableProperties = Partial<{
	translate: number;
	translateX: number;
	translateY: number;
	translateZ: number;
	scale: number;
	scaleX: number;
	scaleY: number;
	scaleZ: number;
	rotate: number;
	rotateX: number;
	rotateY: number;
	rotateZ: number;
	opacity: number;
	color: string;
	backgroundColor: string;
	fontSize: number;
}>;

type ScrollTweenAction = {
	selector: string;
	duration: number;
	props?: TweenableProperties;
};

const sampleAction: ScrollTweenAction = {
	selector: ".object",
	duration: 30,
	props: {
		translateX: 300,
		rotate: 90,
		opacity: 1,
		scale: 0.5,
		backgroundColor: "#8ccf53",
	},
};

const sampleAction2: ScrollTweenAction = {
	selector: ".text",
	duration: 30,
	props: {
		translateX: 300,
		opacity: 1,
		color: "#8ccf53",
		fontSize: 100,
	},
};

const VIEWPORT_HEIGHT = window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight;
const ACTIONS = new Array<ScrollTweenAction>();
const NON_TRANSFORM_PROPS = ["opacity", "color", "backgroundColor", "fontSize"];

const INITIAL_TRANSFORMS_DICTIONARY = new Map<string, Array<number>>();
const INITIAL_OPACITY_DICTIONARY = new Map<string, number>();
const INITIAL_COLOR_DICTIONARY = new Map<string, string>();
const INITIAL_BACKGROUND_COLOR_DICTIONARY = new Map<string, string>();
const INITIAL_FONT_SIZE_DICTIONARY = new Map<string, number>();

ACTIONS.push(sampleAction2);

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

const initializeActions = () => {
	ACTIONS.forEach(({ selector }) => {
		const element = document.querySelector(selector);
		const computedStyled = window.getComputedStyle(element);
		const { transform, opacity, color, backgroundColor, fontSize } = computedStyled;
		const transformMatrix = Rematrix.fromString(transform);

		INITIAL_TRANSFORMS_DICTIONARY.set(selector, transformMatrix);
		INITIAL_OPACITY_DICTIONARY.set(selector, Number(opacity));
		INITIAL_COLOR_DICTIONARY.set(selector, normalizeColor(color));
		INITIAL_BACKGROUND_COLOR_DICTIONARY.set(selector, normalizeColor(backgroundColor));
		INITIAL_FONT_SIZE_DICTIONARY.set(selector, normalizeFontSize(fontSize));
	});
};

const runAction = (action: ScrollTweenAction, scrollPosition: number) => {
	const element: HTMLElement = document.querySelector(action.selector);
	const styleChanges = memoizedComputeStyleChanges(action, scrollPosition);

	Object.keys(styleChanges).forEach(o => {
		element.style[o] = styleChanges[o];
	});
};

const normalizeColor = (color: string) => color.replace(/\s+/g, "");
const normalizeFontSize = (fontSize: string) => Number(fontSize.replace("px", ""));

const computeStyleChanges = (action: ScrollTweenAction, scrollPosition: number) => {
	const { selector, props, duration } = action;

	const tweenState = computeTweenState(selector, duration, scrollPosition);
	const styleChanges = {};
	let elementTransforms = [INITIAL_TRANSFORMS_DICTIONARY.get(selector)];

	Object.keys(props).forEach(prop => {
		if (NON_TRANSFORM_PROPS.includes(prop)) {
			switch (prop) {
				case "opacity":
					styleChanges["opacity"] = computeNonTransformProp(INITIAL_OPACITY_DICTIONARY.get(selector), props[prop], tweenState);
					break;
				case "color":
					styleChanges["color"] = computeNonTransformProp(INITIAL_COLOR_DICTIONARY.get(selector), normalizeColor(props[prop]), tweenState);
					break;
				case "backgroundColor":
					styleChanges["backgroundColor"] = computeNonTransformProp(INITIAL_BACKGROUND_COLOR_DICTIONARY.get(selector), normalizeColor(props[prop]), tweenState);
					break;
				case "fontSize":
					styleChanges["fontSize"] = computeNonTransformProp(INITIAL_FONT_SIZE_DICTIONARY.get(selector), props[prop], tweenState);
					break;
				default:
					break;
			}
			return;
		}
		const propValue = props[prop];
		const computedPropValue = prop.startsWith("scale") ? 1 + propValue * tweenState : propValue * tweenState;
		elementTransforms.push(Rematrix[prop](computedPropValue));
	});

	styleChanges["transform"] = Rematrix.toString(elementTransforms.reduce(Rematrix.multiply));

	return styleChanges;
};

const computeNonTransformProp = (lowerLimit: string | number, upperLimit: string | number, tweenState: number) => {
	if (tweenState <= 0) return lowerLimit;
	if (tweenState >= 1) return upperLimit;

	return interpolate(tweenState, {
		inputRange: [0, 1],
		outputRange: [lowerLimit, upperLimit],
		extrapolate: "clamp",
	});
};

const computeTweenState = (selector: string, duration: number, scrollPosition: number) => {
	const element = document.querySelector(selector);
	const lowerLimit = 0;
	const upperLimit = (duration * VIEWPORT_HEIGHT) / 100;
	const solveFor = scrollPosition;

	if (solveFor <= lowerLimit) return 0;
	if (solveFor >= upperLimit) return 1;

	return Number(
		interpolate(solveFor, {
			inputRange: [lowerLimit, upperLimit],
			outputRange: [0, 1],
			extrapolate: "clamp",
		})
	);
};

// const memoizedComputeTweenState = memoize(computeTweenState);
const memoizedComputeStyleChanges = memoize(computeStyleChanges);

const tick = () => {
	ACTIONS.forEach(o => runAction(o, scrollPosition));
};

initializeActions();
window.addEventListener("scroll", handleScroll);
