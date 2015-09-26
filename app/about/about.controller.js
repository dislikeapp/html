//This is the controller for our about page
(function(){
    
angular.module('app.about')
    .controller('AboutController', AboutController);

function AboutController(){
    var vm = this;
    
    var ball_details = "The amazing World of Ballcraft is the first 'game' devloped in OmniEngine.  Play as a ball, roll around a procedurally generated world.  Jump around and enjoy our physics.  Log on and roll with your friends, or just watch the sunset thanks to our day/night time system.";
    var teapot_details = "This glass teapot shows off some of the amazing capabilities of the WebGL graphics library.  Luckily, with OmniEngine, you don't have to be a hardcore graphics programmer to render cool scenes like this";
    var demos_details = "Check out our old demos page.  There's some cool stuff on here.  Eventually, we will have a new and improved demos page, but for now, mess around on here.";
    
    //al our demo links is here
    vm.demos = 
        [
            {'name': 'Ballcraft', 'address': 'http://omniserver.no-ip.biz/main/projects/oe-js/apps/ball/', 'photo': "assets/Ballcraft_screenshot.jpg", 'details': ball_details},
            {'name':'Glass Teapot', 'address': 'http://omniserver.no-ip.biz/main/projects/oe-js/OmniEngine/doc/?p=examples/compositors', 'photo': "assets/glassTeapot.png", 'details': teapot_details},
            {'name':'Demo Page', 'address': 'http://omniserver.no-ip.biz/main/projects/oe-js/demos/', 'photo': "assets/OmniVerse.png", 'details': demos_details}
        ];
    
}
    
})();