const SwipeEvents = {
	swipeLeft: "swipe-left",
	swipeRight: "swipe-right",
	swipeUp: "swipe-up",
	swipeDown: "swipe-down",
	swiping: "swiping",
};

const VIEWPORT_WIDTH = window.innerWidth || document.body.clientWidth;
const THRESHOLD = Math.max(1, Math.floor(0.01 * VIEWPORT_WIDTH));
const LIMIT = Math.tan(((45 * 1.5) / 180) * Math.PI);

const handleStart = (e: MouseEvent, setPositionOnSwipeStart: (x: number, y: number) => void, setIsMouseDown: (value: boolean) => void) => {
	e.preventDefault();
	const { clientX, clientY } = e;
	setPositionOnSwipeStart(clientX, clientY);
	setIsMouseDown(true);
};

const handleMove = (
	e: MouseEvent,
	element: HTMLElement,
	swipeStartX: number,
	swipeStartY: number,
	isMouseDown: boolean,
	isTicking: boolean,
	setIsTicking: (value: boolean) => void
) => {
	if (!isMouseDown) return;
	const { clientX, clientY } = e;

	const swipeDistanceX = clientX - swipeStartX;
	const swipeDistanceY = clientY - swipeStartY;

	if (!isTicking) {
		window.requestAnimationFrame(() => {
			const swipingEvent = new CustomEvent(SwipeEvents.swiping, {
				detail: { swipeDistanceX, swipeDistanceY },
			});
			element.dispatchEvent(swipingEvent);
			setIsTicking(false);
		});
		setIsTicking(true);
	}
};

const handleEnd = (e: MouseEvent, element: HTMLElement, swipeStartX: number, swipeStartY: number, setIsMouseDown: (value: boolean) => void) => {
	setIsMouseDown(false);
	const { clientX, clientY } = e;

	const swipeDistanceX = clientX - swipeStartX;
	const swipeDistanceY = clientY - swipeStartY;

	const swipeDistanceXY = Math.abs(swipeDistanceX / swipeDistanceY);
	const swipeDistanceYX = Math.abs(swipeDistanceY / swipeDistanceX);

	if (Math.abs(swipeDistanceX) > THRESHOLD || Math.abs(swipeDistanceY) > THRESHOLD) {
		if (swipeDistanceYX <= LIMIT) {
			if (swipeDistanceX < 0) {
				const swipeLeftEvent = new CustomEvent(SwipeEvents.swipeLeft, {
					detail: { swipeDistanceX, swipeDistanceY },
				});
				element.dispatchEvent(swipeLeftEvent);
			} else {
				const swipeRightEvent = new CustomEvent(SwipeEvents.swipeRight, {
					detail: { swipeDistanceX, swipeDistanceY },
				});
				element.dispatchEvent(swipeRightEvent);
			}
		}

		if (swipeDistanceXY <= LIMIT) {
			if (swipeDistanceY < 0) {
				const swipeUpEvent = new CustomEvent(SwipeEvents.swipeUp, {
					detail: { swipeDistanceX, swipeDistanceY },
				});
				element.dispatchEvent(swipeUpEvent);
			} else {
				const swipeDownEvent = new CustomEvent(SwipeEvents.swipeDown, {
					detail: { swipeDistanceX, swipeDistanceY },
				});
				element.dispatchEvent(swipeDownEvent);
			}
		}
	}
};

const addSwipeEventListener = (element: HTMLElement) => {
	let swipeStartX: number, swipeStartY: number;
	let isTicking: boolean;
	let isMouseDown: boolean;

	const setPositionOnSwipeStart = (x: number, y: number) => {
		swipeStartX = x;
		swipeStartY = y;
	};

	const setIsTicking = (value: boolean) => (isTicking = value);

	const setIsMouseDown = (value: boolean) => (isMouseDown = value);

	element.addEventListener("mousedown", e => handleStart(e, setPositionOnSwipeStart, setIsMouseDown));
	element.addEventListener("mousemove", e => handleMove(e, element, swipeStartX, swipeStartY, isMouseDown, isTicking, setIsTicking));
	element.addEventListener("mouseup", e => handleEnd(e, element, swipeStartX, swipeStartY, setIsMouseDown));
};

const removeSwipeEventListener = (element: HTMLElement) => {
	// element.removeEventListener('mousedown', );
};

export { SwipeEvents, addSwipeEventListener, removeSwipeEventListener };
