import memoize from 'fast-memoize';
import interpolate from 'polate-js';
import * as Rematrix from 'rematrix';

// -----------------------------------------------------------
// TYPES
// -----------------------------------------------------------
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
	delay?: number;
	props?: TweenableProperties;
};

// -----------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------

const getViewportHeight = () => {
	return window.innerHeight ?? document.documentElement.clientHeight ?? document.body.clientHeight;
};

const getElementOffset = (element: HTMLElement) => {
	var rect = element.getBoundingClientRect(),
		scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
		scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
};

const normalizeColor = (color: string) => color.replace(/\s+/g, "");

const normalizeFontSize = (fontSize: string) => Number(fontSize.replace("px", ""));

// -----------------------------------------------------------
// CLASSES
// -----------------------------------------------------------

class ScrollTweenInstance {
	private _scrollPosition: number;
	private _isTicking: boolean;
	private _viewportHeight: number;
	private _actions: Array<ScrollTweenAction>;

	private static _nonTransformProps = ["opacity", "color", "backgroundColor", "fontSize"];

	private _transforms: Map<string, Array<number>>;
	private _opacities: Map<string, number>;
	private _colors: Map<string, string>;
	private _backgroundColors: Map<string, string>;
	private _fontSizes: Map<string, number>;
	private _topOffsets: Map<string, number>;

	private _onScroll = () => {
		this._scrollPosition = window.scrollY;

		if (!this._isTicking) {
			window.requestAnimationFrame(() => {
				this._tick();
				this._isTicking = false;
			});
			this._isTicking = true;
		}
	};

	private _tick = () => {
		this._actions.forEach(action => this._runAction(action, this._scrollPosition));
	};

	private _runAction = (action: ScrollTweenAction, scrollPosition: number) => {
		const element: HTMLElement = document.querySelector(action.selector);
		const styleChanges = this._getStyleChanges(action, scrollPosition);

		Object.keys(styleChanges).forEach(o => {
			element.style[o] = styleChanges[o];
		});
	};

	private _getStyleChangesUnOptimized = (action: ScrollTweenAction, scrollPosition: number) => {
		const { selector, props, duration, delay } = action;

		const tweenState = this._getTweenState(selector, duration, delay ?? 0, scrollPosition);
		const styleChanges = {};
		let elementTransforms = [this._transforms.get(selector)];

		Object.keys(props).forEach(prop => {
			if (ScrollTweenInstance._nonTransformProps.includes(prop)) {
				switch (prop) {
					case "opacity":
						styleChanges["opacity"] = this._getNonTransformProp(this._opacities.get(selector), props[prop], tweenState);
						break;
					case "color":
						styleChanges["color"] = this._getNonTransformProp(this._colors.get(selector), normalizeColor(props[prop]), tweenState);
						break;
					case "backgroundColor":
						styleChanges["backgroundColor"] = this._getNonTransformProp(this._backgroundColors.get(selector), normalizeColor(props[prop]), tweenState);
						break;
					case "fontSize":
						styleChanges["fontSize"] = this._getNonTransformProp(this._fontSizes.get(selector), props[prop], tweenState);
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

	private _getStyleChanges = memoize(this._getStyleChangesUnOptimized);

	private _getTweenState = (selector: string, duration: number, delay: number, scrollPosition: number) => {
		const elementOffsetTop = this._topOffsets.get(selector);
		let lowerLimit: number, solveFor: number;

		if (elementOffsetTop <= this._viewportHeight) {
			lowerLimit = 0;
			solveFor = scrollPosition;
		} else {
			lowerLimit = elementOffsetTop;
			solveFor = scrollPosition + this._viewportHeight;
		}
		lowerLimit = lowerLimit + (delay * this._viewportHeight) / 100;
		const upperLimit = lowerLimit + (duration * this._viewportHeight) / 100;

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

	private _getNonTransformProp = (lowerLimit: string | number, upperLimit: string | number, tweenState: number) => {
		if (tweenState <= 0) return lowerLimit;
		if (tweenState >= 1) return upperLimit;

		return interpolate(tweenState, {
			inputRange: [0, 1],
			outputRange: [lowerLimit, upperLimit],
			extrapolate: "clamp",
		});
	};

	start() {
		window.addEventListener("scroll", this._onScroll);
	}

	destroy() {
		window.removeEventListener("scroll", this._onScroll);
	}

	/**
	 *
	 */
	constructor(actions: Array<ScrollTweenAction>) {
		this._scrollPosition = 0;
		this._isTicking = false;
		this._viewportHeight = getViewportHeight();
		this._actions = actions;

		this._transforms = new Map();
		this._opacities = new Map();
		this._colors = new Map();
		this._backgroundColors = new Map();
		this._fontSizes = new Map();
		this._topOffsets = new Map();

		actions.forEach(({ selector }) => {
			const element: HTMLElement = document.querySelector(selector);
			const computedStyled = window.getComputedStyle(element);
			const { transform, opacity, color, backgroundColor, fontSize } = computedStyled;
			const transformMatrix = Rematrix.fromString(transform);
			const top = getElementOffset(element).top;

			this._transforms.set(selector, transformMatrix);
			this._opacities.set(selector, Number(opacity));
			this._colors.set(selector, normalizeColor(color));
			this._backgroundColors.set(selector, normalizeColor(backgroundColor));
			this._fontSizes.set(selector, normalizeFontSize(fontSize));
			this._topOffsets.set(selector, top);
		});
	}
}

// -----------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------

const defineScrollTweenActions = (actions: Array<ScrollTweenAction>) => {
	return new ScrollTweenInstance(actions);
};

const ScrollTween = {
	define: defineScrollTweenActions,
};

export default ScrollTween;
