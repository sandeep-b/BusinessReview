angular.module("myApp").controller('forgetPasswordController',
function($scope,$state,userServices,toastr){

    var vm=this;

    vm.forgetPassword=function(email){
        userServices.sendForgetPassword(email,function(response){
            if(response.status==400){
                toastr.success(response.data.exception);
                //Go to Login Page
            }else if(response.status==200){
                toastr.success(response.data.message);
               //Go to Login Page 
            }
        });  
    }

});