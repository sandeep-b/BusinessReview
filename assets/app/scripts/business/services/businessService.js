(function() {
    'use strict';

    angular
        .module('myApp')
        .factory('businessService', businessService);

    businessService.$inject = ['httpi', 'API','$localStorage','$http'];

    function businessService(httpi, API,$localStorage,$http) {

        var service = {};
        service.basicBusinessDetails=basicBusinessDetails;
        service.getBusinessReviewsSortBy=getBusinessReviewsSortBy;
        service.getBusinessReviewsForResolve=getBusinessReviewsForResolve;
        service.basicBusinessDetailsTagResolve=basicBusinessDetailsTagResolve;
        service.firstReviewerResolve=firstReviewerResolve;
        service.reviewDistributionResolve=reviewDistributionResolve;
        service.basicBusinessReviewWithLimitResolve=basicBusinessReviewWithLimitResolve;
        service.getSearchDetailsResolve=getSearchDetailsResolve;
        service.getBusinessAnalyticsResolve=getBusinessAnalyticsResolve;
        return service;

        function basicBusinessDetails(businessId) {

          return httpi({
             method: "get",
             url: API.basicBusinessDetails,
             params:{
                id:businessId
             }
            }).then(function(response) {
                return (response.data.Business[0]);
            });
        }

         function getBusinessReviewsForResolve(businessId) {

          return httpi({
             method: "get",
             url: API.businessReviews,
             params:{
                id:businessId
              }
            }).then(function(response) {
                console.log(response.data.Reviews);
                return (response.data.Reviews);
            });

        }

        function getBusinessReviewsSortBy(businessId,sortBy,callback) {

          return httpi({
             method: "get",
             url: API.businessReviews,
             params:{
                id:businessId,
                sortBy:sortBy
             }
            }).then(function(response) {
                return callback(response);
            },function(response) {
                return callback(response);
            });
        }

        function basicBusinessDetailsTagResolve(businessId){

           return httpi({
             method: "get",
             url: API.basicBusinessTags,
             params:{
                id:businessId
             }
            }).then(function(response) {
                return (response.data);
            }); 
        }

        function firstReviewerResolve(businessId){
            return httpi({
             method: "get",
             url: API.firstReview,
             params:{
                id:businessId
             }
            }).then(function(response) {
                return (response.data.firstReviewer);
            }); 
        }

        function reviewDistributionResolve(businessId){
            return httpi({
             method: "get",
             url: API.reviewDisributionBusiness,
             params:{
                id:businessId
             }
            }).then(function(response) {
                return (response.data);
            }); 
        }

        function basicBusinessReviewWithLimitResolve(businessId){

             return httpi({
             method: "get",
             url: API.businessReviews,
             params:{
                id:businessId,
                limit:3
              }
            }).then(function(response) {
                console.log(response.data.Reviews);
                return (response.data.Reviews);
            });

        }

        function getSearchDetailsResolve(params){
            var url=API.getSearchDetails;
            var userDetailsLocalStorage=JSON.parse($localStorage.get('user'));
            console.log(params);
            if(!params.hasOwnProperty('City') || params.City== undefined || params.City== null ){
                params.City=userDetailsLocalStorage.City;
            }

            if(!params.hasOwnProperty('State') || params.State== undefined || params.State== null){
                params.State=userDetailsLocalStorage.State;
            }

            url=url+"City="+params.City;
            url=url+"&State="+params.State;

            if(params.hasOwnProperty('Tag') && params.Tag!=undefined && params.Tag!=null && typeof params.Tag != "string"){
                for(var i=0;i<params.Tag.length;i++){
                    if(i==0){
                        url=url+"&Tag="+params.Tag[i];
                    }else{
                        url=url+","+params.Tag[i];
                    }
                    
                }
            }else if(params.Tag!=undefined && params.Tag!=null && typeof params.Tag == "string"){
                url=url+"&Tag="+params.Tag;
            }


            if(params.hasOwnProperty('PriceRange') && params.PriceRange!=undefined && params.PriceRange!=null && typeof params.PriceRange != "string"){
                for(var i=0;i<params.PriceRange.length;i++){
                        url=url+"&PriceRange="+params.PriceRange[i];                    
                }
            }else if(params.PriceRange!=undefined && params.PriceRange!=null && typeof params.PriceRange == "string"){
                url=url+"&PriceRange="+params.PriceRange;
            }

            if(params.hasOwnProperty('FindDesc') && params.FindDesc!=undefined && params.FindDesc!=null){
                    url=url+"&FindDesc="+params.FindDesc;
            }

            if(params.hasOwnProperty('orderBy') && params.orderBy!=undefined && params.orderBy!=null){
                url=url+"&OrderBy="+params.orderBy;
            }

            return $http({
              method: 'GET',
              url: url
            }).then(function (response) {
              return response.data;   
            }, function (err) {
              throw err.data;
            });

        }


        function getBusinessAnalyticsResolve(businessId,businessName){
            return httpi({
             method: "get",
             url: API.businessAnalysis,
             params:{
                id:businessId
              }
            }).then(function(response) {
                response.data.businessId=businessId;
                response.data.businessName=businessName;
                console.log(response.data);
                return (response.data);
            });
        }
}

})();
