type DragBounds = {
	index: number;
	topBoundary: number;
	bottomBoundary: number;
};

let checklist = document.querySelector(".checklist");
let dragBounds = new Array<DragBounds>();
let dragBound: DragBounds;

const initializeEventListeners = () => {
	checklist.addEventListener("dragstart", onDragStart);
	checklist.addEventListener("drag", onDrag);
	checklist.addEventListener("dragend", onDragEnd);
	checklist.addEventListener("dragover", onDragOver);
};

const onDragStart = (e: DragEvent) => {
	e.stopPropagation();
	const scopedDragBounds = getDragBounds();
	console.log({ scopedDragBounds });

	dragBounds = scopedDragBounds;
	dragBound = undefined;
};

const onDrag = (e: DragEvent) => {
	e.stopPropagation();
	const scopedDragBound = getDragBoundForCurrentPosition(e);

	if (!!scopedDragBound) {
		if (!!dragBound) {
			if (scopedDragBound.index !== dragBound.index) {
				removeDragPlaceholder();
				createDragPlaceholder(scopedDragBound.index);
				dragBound = scopedDragBound;
			}
		} else {
			removeDragPlaceholder();
			createDragPlaceholder(scopedDragBound.index);
			dragBound = scopedDragBound;
		}
	}
};

const onDragEnd = (e: DragEvent) => {
	e.stopPropagation();
	removeDragPlaceholder();

	if (!!dragBound) {
		moveChecklistItem(e.target, dragBound.index);
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
		topBoundary: number,
		bottomBoundary: number,
		temporaryDragBounds = new Array<DragBounds>();

	for (let i = 0; i < itemLength; i++) {
		thisItem = checklistItems[i];
		thisItemBoundingRect = thisItem.getBoundingClientRect();
		previousItem = i > 0 ? checklistItems[i - 1] : undefined;
		previousItemBoundingRect = previousItem ? previousItem.getBoundingClientRect() : undefined;

		if (i == 0) {
			topBoundary = thisItemBoundingRect.top;
			bottomBoundary = thisItemBoundingRect.top + thisItemBoundingRect.height * 0.5;
		} else if (i === itemLength - 1) {
			topBoundary = thisItemBoundingRect.top + thisItemBoundingRect.height * 0.5;
			bottomBoundary = thisItemBoundingRect.top + thisItemBoundingRect.height;
		} else {
			topBoundary = previousItemBoundingRect.top + previousItemBoundingRect.height * 0.5;
			bottomBoundary = thisItemBoundingRect.top + thisItemBoundingRect.height * 0.5;
		}

		temporaryDragBounds.push({
			index: i,
			topBoundary,
			bottomBoundary,
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

const createDragPlaceholder = (index: number) => {
	const dragPlaceholder = document.createElement("div");
	dragPlaceholder.className = "drag-placeholder";

	checklist.insertBefore(dragPlaceholder, checklist.children[index]);
};

const moveChecklistItem = (element: any, index: number) => {
	checklist.insertBefore(element, checklist.children[index]);
};

// --------------------------------------------------------
// START FUNCTIONS
// --------------------------------------------------------

initializeEventListeners();
