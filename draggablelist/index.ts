type DragBounds = {
	index: number;
	topBoundary: number;
	bottomBoundary: number;
	operation: "insert" | "append";
};

let checklist = document.querySelector(".checklist");
let dragBounds = new Array<DragBounds>();
let dragBound: DragBounds;
let dragTarget: EventTarget;

const initializeEventListeners = () => {
	checklist.addEventListener("mousedown", onMouseDown);
	checklist.addEventListener("dragstart", onDragStart);
	checklist.addEventListener("drag", onDrag);
	checklist.addEventListener("dragend", onDragEnd);
	checklist.addEventListener("dragover", onDragOver);
};

const onMouseDown = (e: DragEvent) => {
	dragTarget = e.target;
};

const onDragStart = (e: DragEvent) => {
	e.stopPropagation();

	const element = e.target as Element;
	const dragHandle = element.querySelector(".drag-handle");

	if (dragHandle.contains(dragTarget as any)) {
		const scopedDragBounds = getDragBounds();
		dragBounds = scopedDragBounds;
		dragBound = undefined;
		dragTarget = undefined;
	} else {
		e.preventDefault();
	}
};

const onDrag = (e: DragEvent) => {
	e.stopPropagation();
	const scopedDragBound = getDragBoundForCurrentPosition(e);

	if (!!scopedDragBound) {
		if (!!dragBound) {
			if (scopedDragBound.index !== dragBound.index) {
				removeDragPlaceholder();
				createDragPlaceholder(scopedDragBound);
				dragBound = scopedDragBound;
			}
		} else {
			removeDragPlaceholder();
			createDragPlaceholder(scopedDragBound);
			dragBound = scopedDragBound;
		}
	}
};

const onDragEnd = (e: DragEvent) => {
	e.stopPropagation();
	removeDragPlaceholder();

	if (!!dragBound) {
		console.log({ dragBound });
		moveChecklistItem(e.target, dragBound);
	}
};

const onDragOver = (e: DragEvent) => {
	e.preventDefault();
};

// --------------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------------

const getDragBounds = () => {
	const checklistItems = checklist.children;
	const itemLength = checklistItems.length;

	let previousItem: Element,
		previousItemBoundingRect: DOMRect,
		thisItem: Element,
		thisItemBoundingRect: DOMRect,
		lastItem: Element,
		lastItemBoundingRect: DOMRect,
		topBoundary: number,
		bottomBoundary: number,
		temporaryDragBounds = new Array<DragBounds>();

	for (let i = 0; i <= itemLength; i++) {
		thisItem = i < itemLength ? checklistItems[i] : undefined;
		thisItemBoundingRect = thisItem ? thisItem.getBoundingClientRect() : undefined;
		previousItem = i > 0 ? checklistItems[i - 1] : undefined;
		previousItemBoundingRect = previousItem ? previousItem.getBoundingClientRect() : undefined;
		lastItem = checklistItems[itemLength - 1];
		lastItemBoundingRect = lastItem.getBoundingClientRect();

		if (i == 0) {
			topBoundary = thisItemBoundingRect.top;
			bottomBoundary = thisItemBoundingRect.top + thisItemBoundingRect.height * 0.5;
		} else if (i === itemLength) {
			topBoundary = lastItemBoundingRect.top + lastItemBoundingRect.height * 0.5;
			bottomBoundary = lastItemBoundingRect.top + lastItemBoundingRect.height;
		} else {
			topBoundary = previousItemBoundingRect.top + previousItemBoundingRect.height * 0.5;
			bottomBoundary = thisItemBoundingRect.top + thisItemBoundingRect.height * 0.5;
		}

		temporaryDragBounds.push({
			index: i,
			topBoundary,
			bottomBoundary,
			operation: i < itemLength ? "insert" : "append",
		});
	}

	return temporaryDragBounds;
};

const getDragBoundForCurrentPosition = (e: DragEvent) => {
	const positionY = e.pageY;
	return dragBounds.find(o => positionY >= o.topBoundary && positionY <= o.bottomBoundary);
};

const removeDragPlaceholder = () => {
	const dragPlaceholder = checklist.querySelector(".drag-placeholder");

	if (!!dragPlaceholder) {
		dragPlaceholder.remove();
	}
};

const createDragPlaceholder = (dragBound: DragBounds) => {
	const { index, operation } = dragBound;
	const dragPlaceholder = document.createElement("div");
	dragPlaceholder.className = "drag-placeholder";

	if (operation === "insert") {
		checklist.insertBefore(dragPlaceholder, checklist.children[index]);
	} else {
		checklist.appendChild(dragPlaceholder);
	}
};

const moveChecklistItem = (element: any, dragBound: DragBounds) => {
	const { index, operation } = dragBound;

	if (operation === "insert") {
		checklist.insertBefore(element, checklist.children[index]);
	} else {
		checklist.appendChild(element);
	}
};

// --------------------------------------------------------
// START FUNCTIONS
// --------------------------------------------------------

initializeEventListeners();
