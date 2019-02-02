(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('userServices', userServices);

    userServices.$inject = ['httpi', 'API','$localStorage','Upload','connections'];

    function userServices(httpi, API,$localStorage,Upload,connections) {

        var service = {};
        service.getUserDetails = getUserDetails;
        service.sendForgetPassword=sendForgetPassword;
        service.userDetailsSettings=userDetailsSettings;
        service.login=login;
        service.updateUserDetailsSettings=updateUserDetailsSettings;
        service.getStateDetails=getStateDetails;
        service.updatePassword=updatePassword;
        service.imageUploadUser=imageUploadUser;
        service.getTopTagsResolve=getTopTagsResolve;
        service.getRolesResolve=getRolesResolve;
        service.signUp=signUp;
        service.getUserAnalyticsResolve=getUserAnalyticsResolve;
        return service;


     function getUserDetails(userId) {

        return httpi({
             method: "get",
             url: API.userDetails,
             params: {
                id:userId
              }
        }).then(function(response) {
            return (response.data.message);
        });

    }

     function sendForgetPassword(email,callback) {

        return httpi({
             method: "post",
             url: API.forgetPassword,
             data: {
                    email:email
                   }
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });

    }

    function login(user,callback){
        return httpi({
             method: "post",
             url: API.login,
             data: {
                    email:user.email,
                    password:user.password
                   }
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });
    }

    function userDetailsSettings(){
       return httpi({
             method: "get",
             url: API.userDetailsSettings
        }).then(function(response) {
            return response.data.message[0];
        }); 
    }

    function updateUserDetailsSettings(userDetailsArray,callback){
       return httpi({
             method: "put",
             url: API.userDetailsSettings,
             data:{
                userDetails:userDetailsArray
             }
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });
    }


    function getStateDetails(){
      return httpi({
             method: "get",
             url: API.getStates
        }).then(function(response) {
            return (response.data.states);
        });
    }

    function updatePassword(passwordDetails,callback){
        return httpi({
             method: "put",
             url: API.changePassword,
             data:{
                passwordDetails:passwordDetails
             }
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });
    }

    function imageUploadUser(image,callback){
        return Upload.upload({
          url: API.imageUpload,
          data: {image: image}
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });
    }

    function getTopTagsResolve(userId){

       return httpi({
             method: "get",
             url: API.userTopTags,
             params: {
                id:userId
              }
        }).then(function(response) {
            return (response.data.response);
        });

    }

    function getRolesResolve(){

       return httpi({
             method: "get",
             url: API.roles
        }).then(function(response) {
            return (response.data.userTypes);
        }); 
    }

    function signUp(user,callback){


        return httpi({
             method: "post",
             url: API.signUp,
             data: {
                      email:user.email,
                      firstName:user.firstName,
                      lastName:user.lastName,
                      typeUser:user.typeUser,
                      city:user.city,
                      state:user.state,
                      password:user.password
                   }
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });

    }

    function getUserAnalyticsResolve(userId){

        return httpi({
             method: "get",
             url: API.uana,
             params: {
                id:userId
              }
        }).then(function(response) {
            return (response.data.response);
        }); 
    }


  }

})();
