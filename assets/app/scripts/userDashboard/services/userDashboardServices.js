(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('userDashboardServices', userDashboardServices);

    userDashboardServices.$inject = ['httpi', 'API'];

    function userDashboardServices(httpi, API) {

        var service = {};
        service.getTop3Reviews = getTop3Reviews;
        service.getTop3Business= getTop3Business;
        service.logout=logout;
        service.tupleCountAPI=tupleCountAPI;
        service.getStatesTagResolve=getStatesTagResolve;
        return service;


        function getTop3Reviews() {

        return httpi({
             method: "get",
             url: API.getTop3Reviews
        }).then(function(response) {
            return (response.data.Review);
        });

    }

    function getTop3Business() {

        return httpi({
             method: "get",
             url: API.getTop3Business
        }).then(function(response) {
            return (response.data.Business);
        });

    }

    function logout(callback){
        return httpi({
             method: "put",
             url: API.logout
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });
    }

    function tupleCountAPI(callback){
        return httpi({
             method: "get",
             url: API.getTuples
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });
    }

    function getStatesTagResolve(){
        return httpi({
             method: "get",
             url: API.getStates
        }).then(function(response) {
            return (response.data.states);
        });
    }

}

})();
