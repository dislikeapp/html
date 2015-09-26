(function() {

angular.module('app')
    .controller('MainController', MainController);

function MainController(){
	this.tab = 1;
	this.selectTab = function(setTab){
		this.tab = setTab;
	};
	this.isSelected = function(checkTab){
		return this.tab === checkTab;
	};
}
    
})();