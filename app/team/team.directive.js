//Directive for Team module

(function(){
    angular.module('app.team')
        .directive('oTeamTab', oTeamTab)
        .directive('oBackImg', oBackImg);

function oTeamTab(){
    
    var directive = {
        templateUrl: 'app/team/team.html',
        restrict: 'E',
        controller: 'TeamController',
        controllerAs: 'team'
    };
    return directive;
}
    
function oBackImg(){
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            element.css({
                'background-image': 'url(' + value +')',
                'background-size' : 'cover'
            });
        });
    };
}
    
})();