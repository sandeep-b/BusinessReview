(function () {

  angular.module('myApp').factory('API', API);

  API.$inject = ['$http', '$timeout', 'ENVIRONMENT', 'routes'];

  function API($http, $timeout, ENVIRONMENT, routes) {

    var enpoints = {}

    for (var route in routes) {
      if (routes.hasOwnProperty(route)) {
        enpoints[route] = ENVIRONMENT.BASEURL + routes[route];
      }
    }

    return enpoints;
  }
})();