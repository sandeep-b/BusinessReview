(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('reviewService', reviewService);

    reviewService.$inject = ['httpi', 'API','$localStorage'];

    function reviewService(httpi, API,$localStorage) {

        var service = {};
        service.createReview=createReview;
        return service;



     function createReview(reviewDetails,callback) {

        return httpi({
             method: "post",
             url: API.createReview,
             data: {
                    reviewDetails:reviewDetails
                   }
        }).then(function(response) {
            return callback(response);
        }, function(response) {
            return callback(response);
        });

    }



  }

})();
