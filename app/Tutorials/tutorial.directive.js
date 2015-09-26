//Directive for Tutorial module

(function(){
    angular.module('app.about')
        .directive('oTutorialTab', oTutorialTab);

function oTutorialTab(){
    
    var directive = {
        templateUrl: 'app/Tutorials/tutorials.html',
        restrict: 'E',
        //controller: 'AboutController',
        //controllerAs: 'about'
    };
    return directive;
}
    
    
})();