(function(){
	var app = angular.module('store', []);

	app.controller('StoreController', function(){
		this.products = gems;
	});

	app.controller('PanelController', function(){
		this.tab =1;

		this.selectTab = function(setTab){
			this.tab = setTab;
		};

		this.isSelected = function(checkTab){
			return this.tab === checkTab;
		};
	});

	var gems = [

		{
			name: 'Champagne of Beers',
			price: .95,
			description: 'Someone spilled beer in my water!',
			canPurchase: true,
			images: [
				{
					full: 'images/dodecahedron.jpg',
					thumb: 'images/dodecahedron_thumb.jpg'
				}
			]
		},
		{
			name:"Hipsters Best Friend",
			price: 1.5,
			description: "Bat urine",
			canPurchase: false,
			images: [
				{
					full: 'images/pentagonal.jpg',
					thumb: 'images/pentagonal_thumb.jpg'
				}
			]
		}
	]

})();