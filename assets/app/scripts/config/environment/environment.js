(function () {
    angular.module('myApp').factory('ENVIRONMENT', ENVIRONMENT);

    ENVIRONMENT.$inject = ['connections'];

    function ENVIRONMENT(connections) {
        return {
            BASEURL: connections.DEVELOPMENT
        }
    }
})();