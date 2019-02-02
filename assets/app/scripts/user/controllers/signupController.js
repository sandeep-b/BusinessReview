angular.module("myApp").controller('signupController',
function($scope,$state,userServices,toastr,authenticationService,getRolesResolve,
    getStatesResolveSignUp){

    var vm=this;
    vm.roles=getRolesResolve;
    vm.states=getStatesResolveSignUp;

    vm.signup=function(user){
        userServices.signUp(user,function(response){
            if(response.status==400){
                toastr.error(response.data.exception);
                //Go to Login Page
            }else if(response.status==200){
                authenticationService.SetCredentials(response.data.loginDetails);
                $state.go('userDashboard');
                toastr.success("You have successfully signed into Glocal application");
               //Go to Login Page 
            }
        });  
    }
    

});