//Directive for About module

(function(){
    angular.module('app.about')
        .directive('oAboutTab', oAboutTab);

function oAboutTab(){
    
    var directive = {
        templateUrl: 'app/about/about.html',
        restrict: 'E',
        controller: 'AboutController',
        controllerAs: 'about'
    };
    return directive;
}
    
    
})();