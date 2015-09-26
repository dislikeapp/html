//Directive for Documentations module

(function(){
    angular.module('app.documentation')
        .directive('oDocumentTab', oDocumentTab);

function oDocumentTab(){
    
    var directive = {
        templateUrl: 'app/Documentations/documentations.html',
        restrict: 'E',
        //controller: 'AboutController',
        //controllerAs: 'about'
    };
    return directive;
}
    
    
})();