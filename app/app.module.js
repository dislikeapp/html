//This is the main module for our website, it will know all other modules!

(function() {

angular.module('app', [
    'app.about',
    'app.tutorial',
    'app.documentation'
]);
    
})();