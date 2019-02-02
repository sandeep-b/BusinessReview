(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('businessDashboardService', businessDashboardService);

    businessDashboardService.$inject = ['httpi', 'API'];

    function businessDashboardService(httpi, API) {

        var service = {};
        service.getBusinesses=getBusinesses;
        return service;

        function getBusinesses() {

          return httpi({
             method: "get",
             url: API.businessDashboard
            }).then(function(response) {
                return (response.data.businesses);
            });
        }
}

})();
