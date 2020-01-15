import ScrollTween from './scrolltween';

/*
//API
new ScrollTween.Staggered([]).start();
new ScrollTween.Sequence([]).start();
new ScrollTween.Parallel([]).start();
new ScrollTween().start();

ScrollTween.parallel();
ScrollTween.sequence(trigger, ); 
ScrollTween.staggered();
ScrollTween.fromChildren();

const scrollTween = ScrollTween.define();
scrollTween.start();
scrollTween.destroy();

*/

const scrollTweenInstance = ScrollTween.define([
	{
		selector: ".object",
		delay: 30,
		duration: 30,
		props: {
			translateX: 300,
			rotate: 90,
			opacity: 1,
			scale: 0.5,
			backgroundColor: "#8ccf53",
		},
	},
]);

scrollTweenInstance.start();
