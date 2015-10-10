//This is the controller for our about page
(function(){
    
angular.module('app.team')
    .controller('TeamController', TeamController);

function TeamController(){
    var vm = this;
    
    var tom_details = "As Chief Engine Engineering Engineer, Tom is responsible for all the important stuff.  He also enjoys China.";
    var ando_details = "Brad enjoys long walks on the beach and cokes with two straws.  He also talks about himself in the third person.  Weird.";
    var sego_details = "Systems Architect and resident Other Brad.  When not shooting possums on his front lawn, Brad can be found automating everything.";
    var kevin_details = "Kevin likes cloud computing!";
    
    
    //al our infos links is here TODO Jsonize all this is nicer
    vm.members = 
        [
            {
                'name': 'Tom Krcmar',
                'position': 'Co-Founder / CTO',
                'photo': "background-image:url(assets/tom.jpg)",
                'details': tom_details
            },
            {
                'name': 'Brad Anderson',
                'position': 'Co-Founder / CEO',
                'photo': "background-image:url(assets/ando.jpg)",
                'details': ando_details
            },
            {
                'name': 'Brad Segobiano',
                'position': 'Systems Architect',
                'photo': "background-image:url(assets/sego.jpg)",
                'details': sego_details
            },
            {
                'name': 'Kevin Dec',
                'position': 'Game Developement',
                'photo': 'background-image:url(assets/kevin.jpg)',
                'details': kevin_details
            }
        ];
    
}
    
})();