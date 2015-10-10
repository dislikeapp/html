
var bgs = [
	["assets/sunrise_ballcraft.png", "rgba(0, 0, 0, 0.0)"],
	["assets/teapotHD.png", "rgba(0, 0, 0, 0.0)"],
	["assets/beemer.png", "rgba(0, 0, 0, 0.0)"]
];

window.addEventListener("load", function() {
	var index = 0;
	
	var shuffle = function() {
		for (var i = bgs.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = bgs[i];
			bgs[i] = bgs[j];
			bgs[j] = temp;
		}
	};
	var next = function() {
		index++;
		if (index === bgs.length) {
			shuffle();
			index = 0;
		}
		update();
	};
	var update = function() {
		var e = document.getElementsByClassName("titleBlock")[0];
		var bg = bgs[index][0];
		var col = bgs[index][1];
		e.style.backgroundImage = "url('"+bg+"')";
		e.style.backgroundColor = col;
	};
	shuffle();
	update();
	setInterval(next, 10000);
});

window.addEventListener("load", function() {
	var titleBlock = document.getElementsByClassName("titleBlock")[0];
	var arrow = document.getElementById("titleArrow");
	arrow.addEventListener("mouseover", function() {
		titleBlock.style.height = "95%";
	});
	arrow.addEventListener("mouseout", function() {
		titleBlock.style.height = "100%";
	});
	arrow.addEventListener("click", function() {
		var height = window.innerHeight;
		document.body.scrollTop = height;
	});
});