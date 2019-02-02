angular.module("myApp").controller('loginController',
function($scope,$state,userServices,toastr,authenticationService){

    var vm=this;
    vm.user={};

    vm.login=function(user){
        userServices.login(user,function(response){
            if(response.status==400){
                toastr.error(response.data.exception);
                //Go to Login Page
            }else if(response.status==200){
                authenticationService.SetCredentials(response.data.loginDetails);
                $state.go('userDashboard');
                toastr.success("You Have logged into the Glocal Application");
               //Go to Login Page 
            }
        });  
    }

});