//This is the controller for our about page
(function(){
    
angular.module('app.team')
    .controller('TeamController', TeamController);

function TeamController(){
    var vm = this;
    
    var tom_details = "TODO: these and also format stuffs";
    var ando_details = "Brad 1";
    var sego_details = "Brad 2";
    var kevin_details = "Kevin likes cloud computing";
    
    
    //al our infos links is here
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