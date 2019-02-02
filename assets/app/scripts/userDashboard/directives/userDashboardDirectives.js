var myApp = angular.module('myApp', []);

myApp.directive('piggybankingrating', function () {
    return {
        restrict: 'A',
        template:
            '<span ng-repeat="star in stars" class="glyphicon glyphicon-piggy-bank">' +
            '</span>',
        scope: {
            ratingvalue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
        	console.log("entered");
            scope.stars = [];
            for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                    filled: i < scope.ratingvalue
                });
            }
        }
    }
});
