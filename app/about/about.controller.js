//This is the controller for our about page
(function(){
    
angular.module('app.about')
    .controller('AboutController', AboutController);

function AboutController(){
    var vm = this;
    
    var ball_details = "The amazing World of Ballcraft is the first 'game' devloped in OmniEngine.  Play as a ball, roll around a procedurally generated world.  Jump around and enjoy our physics.  Log on and roll with your friends, or just watch the sunset thanks to our day/night time system.";
    var teapot_details = "This glass teapot shows off some of the amazing capabilities of the WebGL graphics library.  Luckily, with OmniEngine, you don't have to be a hardcore graphics programmer to render cool scenes like this";
    var demos_details = "Check out our demos page.  There's some cool stuff on here.  Eventually, we will have a new and improved demos page, but for now, mess around on here.";
    var oculus_details = "We are currently developing stereoscopic capabilities for support of virtual reality systems such as the Oculus Rift!";
    
    //separate this stuffs to games and demos (we should also probably JSON ize all this info at some point)
    vm.games =
        [
            {
                'name': 'Ballcraft',
                'address': 'http://danglingpointers.me/Ballcraft',
                'photo': "assets/Ballcraft_screenshot.jpg",
                'details': ball_details
            }
        ]
    
    //all our demo links is here
    vm.demos = 
        [
            {
                'name': 'Stereoscopic Support',
                'address': 'http://omniserver.no-ip.biz/main/projects/oe-js/OmniEngine/doc/demos/stereoscopic/',
                'photo': "assets/stereoscopic.png",
                'details': oculus_details
            },
            {
                'name':'Glass Teapot',
                'address': '/demos/compositors/refraction/',
                'photo': "assets/glassTeapot.png",
                'details': teapot_details
            },
            {'name':'Demo Page',
             'address': '/demos/',
             'photo': "assets/OmniVerse.png",
             'details': demos_details
            }
        ];
    
}
    
})();