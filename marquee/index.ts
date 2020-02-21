class Marquee {
	width: number;
	height: number;
	element: HTMLElement;

	private getSizeInPx(size: number) {
		return size * 3 + size * 2;
	}

	render() {
		const elementWidth = this.getSizeInPx(this.width);
		const elementHeight = this.getSizeInPx(this.height);

		Object.assign(this.element.style, {
			width: `${elementWidth}px`,
			height: `${elementHeight}px`,
		});

		let dots = '';
		const dot = '<span class="dot"></span>';
		const totalDots = this.width * this.height;

		for (let i = 0; i < totalDots; i++) {
			dots += dot;
		}

		this.element.innerHTML = dots;
	}

	/**
	 *
	 */
	constructor(width: number, height: number, selector: string) {
		this.width = width;
		this.height = height;

		const element = document.querySelector(selector) as HTMLElement;

		if (!element) {
			throw Error('Element does not exist');
		}

		this.element = element;
	}
}

const ms = new Marquee(100, 20, '.marquee');
window['ms'] = ms;
ms.render();
// console.log({ ms });
