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

// const scrollTweenInstance = ScrollTween.define([
// 	{
// 		selector: ".object",
// 		duration: 30,
// 		props: {
// 			translateX: 300,
// 			rotate: 90,
// 			opacity: 1,
// 			scale: 0.5,
// 			backgroundColor: "#8ccf53",
// 		},
// 	},
// ]);

// const children = ScrollTween.fromChildren(".parent", 20, { translateX: 300 });
// const

const scrollTweenInstance = ScrollTween.define(
	ScrollTween.staggered(
		".parent",
		10,
		ScrollTween.fromChildren(".parent", 20, {
			translateX: 300,
			rotate: 45,
		})
		// 10
	).concat([
		{
			selector: ".object",
			duration: 30,
			props: {
				translateX: 300,
				rotate: 90,
				opacity: 1,
				scale: 0.5,
				backgroundColor: "#8ccf53",
			},
		},
	])
);

scrollTweenInstance.start();

// scrollTweenInstance.start();
