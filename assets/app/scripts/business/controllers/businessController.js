angular.module("myApp").controller('businessController',
function($state,toastr,$localStorage,authenticationService,userDashboardServices,
         basicBusinessDataResolve,businessService,$scope,basicBusinessReviewResolve,
         $stateParams,basicBusinessDataTagResolve,firstReviewerResolve,reviewDistributionResolve,
         $uibModal
    ){

	var vm=this;

    vm.newestFirst=0;
    vm.oldestFirst=1;
    vm.highRated=2;
    vm.lowRated=3;

    vm.business=basicBusinessDataResolve;
    vm.reviewDetails=basicBusinessReviewResolve;
    vm.TextTags=basicBusinessDataTagResolve.TextTags;
    vm.Hours=basicBusinessDataTagResolve.Hours;
    vm.firstReviewer=firstReviewerResolve[0];
    vm.ReviewDistribution=reviewDistributionResolve.ReviewDistribution;
    vm.RatingDistribution=reviewDistributionResolve.RatingDistribution;

    var userDetails=JSON.parse($localStorage.get('user'));
    vm.userDetails=userDetails;
    console.log(userDetails);

    vm.userName=userDetails.FirstName+" "+userDetails.LastName;
    console.log(vm.userName);

    $scope.pageNumber=1;
    $scope.limit=6;
    $scope.offset=0;

    var userDetailsLocalStorage=JSON.parse($localStorage.get('user'));
    vm.userDetailsLocalStorage=userDetailsLocalStorage;
    vm.userNameLocalStorage=userDetailsLocalStorage.FirstName+" "+userDetailsLocalStorage.LastName;

    vm.businessAPI=function(){
        $state.go('businessDashboard');
    }

    vm.paginationClick=function(pageNumber,sortBy){
        console.log(pageNumber);
        $scope.pageNumber=$scope.pageNumber+1;
        $scope.limit=10;
        $scope.offset=3*(pageNumber-1);
        var businessId=$stateParams.id;

         businessService.getBusinessReviewsSortBy(businessId,$scope.offset,$scope.limit,sortBy,function(response){
            if(response.status==400){
               toastr.error(response.data.exception);
             }else if(response.status==200){
               vm.reviewDetails=response.data.Reviews;
             }
        }); 


    }

    vm.tupleCount=function(){
      userDashboardServices.tupleCountAPI(function(response){

         if(response.status==400){
                toastr.error("Could Not get the Tuple Count");
                //Go to Login Page
            }else if(response.status==200){

              var scope = $scope.$new();
              scope.tupleCount=response.data.tuples;

             $scope.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/views/user/tupleModalForm.html',
                size: 'md',
                scope: scope,
                windowClass: 'd-modal'
             });

            }
      });
    }



    vm.Tags={
      Restaurants:"Restaurant",
      NightLife:"nightLife",
      Shopping:"shopping",
      American:"american",
      Chinese:"chinese",
      Mexican:"mexican",
      Indian:"indian",
      ActiveLife:"active life",
      Golf:"golf",
      Gym:"gym",
      Yoga:"yoga",
      Fashion:"fashion",
      Bookstore:"bookstore",
      Bar:"bar",
      wineBar:"wineBar",
      carWash:"carWash",
      gas:"gas service station",
      carDealer:"car dealer",
      hairSalon:"hair salon",
      Tattoo:"tattoo",
      fastFood:"fast food",
      cafeteria:"cafeteria",
      cafe:"cafe",
      barbeque:"barbeque",
      burger:"burger",
      hotdog:"hot dog",
      pizza:"pizza",
      salad:"salad",
      danceStudio:"dance studio",
      museum:"museum",
      cinema:"cinema",
      realEstate:"real estate"
    }

  vm.priceRange=$stateParams.PriceRange;

  vm.priceRangeValue1={};
  vm.priceRangeValue2={};
  vm.priceRangeValue3={};
  vm.priceRangeValue4={};
  vm.priceRangeValue1.checked=false;
  vm.priceRangeValue2.checked=false;
  vm.priceRangeValue3.checked=false;
  vm.priceRangeValue4.checked=false;

    if(typeof vm.priceRange == "string" && vm.priceRange!=null && vm.priceRange!=undefined ){

    if(vm.priceRange=="1" ){
       vm.priceRangeValue1.checked=true;
    }

     if(vm.priceRange=="2" ){
        vm.priceRangeValue2.checked=true;
    }

     if(vm.priceRange=="3" ){
        vm.priceRangeValue3.checked=true;
    }

     if(vm.priceRange=="4"){
        vm.priceRangeValue4.checked=true;
    }

  }else if(typeof vm.priceRange!="string" && vm.priceRange!=null && vm.priceRange!=undefined ){

    for(var i=0;i<vm.priceRange.length;i++){

    if(vm.priceRange[i]=="1" ){
       vm.priceRangeValue1.checked=true;
    }

     if(vm.priceRange[i]=="2"){
        vm.priceRangeValue2.checked=true;
    }

     if(vm.priceRange[i]=="3"){
        vm.priceRangeValue3.checked=true;
    }

     if(vm.priceRange[i]=="4"){
        vm.priceRangeValue4.checked=true;
    }

  }

}

vm.searchResultsAPI=function(Tags,priceRange,Desc){
      var tags=[];
      var prices=[];

     // console.log(Tags);

      if(Tags)
      {
         tags.push(Tags);
      }

      if(priceRange.priceRangeValue1.checked){
        prices.push(1);
      }

      if(priceRange.priceRangeValue2.checked){
        prices.push(2);
      }

      if(priceRange.priceRangeValue3.checked){
        prices.push(3);
      }


      if(priceRange.priceRangeValue4.checked){
        prices.push(4);
      }

      //Remove From State Params
      if(!priceRange.priceRangeValue1.checked){

        if(typeof $stateParams.PriceRange== "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){

          if($stateParams.PriceRange=="1"){
              $stateParams.PriceRange=null;
          }

        }

        if(typeof $stateParams.PriceRange!= "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){
           $stateParams.PriceRange.splice($stateParams.PriceRange.indexOf("1"),1);
           if($stateParams.PriceRange.length<=0){
              $stateParams.PriceRange=null
           }
        }
        
      }

      if(!priceRange.priceRangeValue2.checked){
        
        if(typeof $stateParams.PriceRange== "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){

          if($stateParams.PriceRange=="2"){
              $stateParams.PriceRange=null;
          }

        }

        if(typeof $stateParams.PriceRange!= "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){
          $stateParams.PriceRange.splice($stateParams.PriceRange.indexOf("1"),1);
          if($stateParams.PriceRange.length<=0){
              $stateParams.PriceRange=null
           }
        }
      }

      if(!priceRange.priceRangeValue3.checked){
        
        if(typeof $stateParams.PriceRange== "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){

          if($stateParams.PriceRange=="3"){
              $stateParams.PriceRange=null;
          }

        }

        if(typeof $stateParams.PriceRange!= "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){
          $stateParams.PriceRange.splice($stateParams.PriceRange.indexOf("1"),1);
          if($stateParams.PriceRange.length<=0){
              $stateParams.PriceRange=null
           }
        }
      }

      if(!priceRange.priceRangeValue4.checked){
        
        if(typeof $stateParams.PriceRange== "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){

          if($stateParams.PriceRange=="4"){
              $stateParams.PriceRange=null;
          }

        }

        if(typeof $stateParams.PriceRange!= "string" && $stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined){
          $stateParams.PriceRange.splice($stateParams.PriceRange.indexOf("1"),1);
          if($stateParams.PriceRange.length<=0){
              $stateParams.PriceRange=null
           }
        }
      }




      if($stateParams.PriceRange!=null && $stateParams.PriceRange!=undefined && prices!=null){
        if(typeof $stateParams.PriceRange !="string"){

            for(var i=0;i<$stateParams.PriceRange.length;i++){

           if(!$stateParams.PriceRange.includes(1) && prices.includes(1)){

            prices.push(1);

           }

           if(!$stateParams.PriceRange.includes(2) && prices.includes(2)){
            
            prices.push(2);

           }

           if(!$stateParams.PriceRange.includes(3) && prices.includes(3)){
            
            prices.push(3);

           }

           if(!$stateParams.PriceRange.includes(4) && prices.includes(4)){
            
            prices.push(4);

           }
           
          }

        }
        else {

        if(!$stateParams.PriceRange=="1" && prices.includes(1))
        {
            prices.push(1);
        }

        if(!$stateParams.PriceRange=="2" && prices.includes(2))
        {
            prices.push(2);
        }

        if(!$stateParams.PriceRange=="3" && prices.includes(3))
        {
            prices.push(3);
        }

        if(!$stateParams.PriceRange=="4" && prices.includes(4))
        {
            prices.push(4);
        }
        
      }

    }

      if($stateParams.Tag!=null && $stateParams.Tag!=undefined && Tags!=null){
        if(typeof $stateParams.Tag !="string" )
        for(var i=0;i<$stateParams.Tag.length;i++){
           tags.push($stateParams.Tag[i]);
        }else {
          tags.push($stateParams.Tag);
        } 
      }

      var city;
      var state;
      if($stateParams.City==undefined || $stateParams.City ==null){
        city=userDetailsLocalStorage.City;
        state=userDetailsLocalStorage.State;
      }

      if($stateParams.City!=undefined || $stateParams.City !=null){
        city=$stateParams.City;
        state=$stateParams.State;
      }


      //$state.go('search',{City:userDetailsLocalStorage.City,State:userDetailsLocalStorage.State,Tag:tags})
      $state.go('search',{City:city,State:state,Tag:tags,PriceRange:prices});
    }

    vm.searchByKeyword=function(keyword){
     $stateParams.Tag=null;
     $stateParams.PriceRange=null;
     $state.go('search',{City:$stateParams.City,State:$stateParams.State,FindDesc:keyword,Tag:null,PriceRange:null});
    
    }

    vm.resetFilters=function(){
      $state.go('search',{City:$stateParams.City,State:$stateParams.State,FindDesc:null,Tag:null,PriceRange:null});
    }


    vm.goToProfilePage=function(){
        $state.go('profile',{id:userDetails.UserId})
    }


    vm.logout=function(){
       userDashboardServices.logout(function(response){
            if(response.status==400){
                toastr.error(response.data.exception);
                //Go to Login Page
            }else if(response.status==200){
               authenticationService.ClearCredentials();
               toastr.success("You Have logged out of the Glocal Application");
                $state.go('login');    
            }
       });
    }

    vm.businessReviewsSortBy=function(sortBy){
        var businessId=$state.params.id;
        var sortBy=sortBy;
        //var offset=$scope.offset;

        businessService.getBusinessReviewsSortBy(businessId,sortBy,function(response){
            if(response.status==400){
               toastr.error(response.data.exception);
             }else if(response.status==200){
               vm.reviewDetails=response.data.Reviews;
             }
        }); 
    }

    vm.businessAnalyticsModalForm=function(){
        var scope = $scope.$new();
        scope.ReviewDistribution=vm.ReviewDistribution;
        scope.RatingDistribution=vm.RatingDistribution;

        //Line Chart Config Start
        scope.lineChartLabels=[];
        scope.lineChartSeries=[];

        scope.lineChartSeries.push('CountOfReviews');
        scope.lineChartSeries.push('AverageRating');

        scope.lineChartData=[];

        var reviews=[];
        var avgRating=[];


        for(var i=0;i<vm.ReviewDistribution.length;i++){
            scope.lineChartLabels.push(vm.ReviewDistribution[i].Year);
            reviews.push(vm.ReviewDistribution[i].Count);
            avgRating.push(vm.ReviewDistribution[i].Average_Rating);
        }

        scope.lineChartData.push(reviews);
        scope.lineChartData.push(avgRating);
  
        scope.lineChartOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        scope.lineChartOptions = {
        scales: {
          yAxes: [
            {
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left'
            },
            {
              id: 'y-axis-2',
              type: 'linear',
              display: true,
              position: 'right'
            }
          ]
        }
      };

      //Line Chart Config Ended

      //Pie Chart Config Start 
      scope.pieChartLabels = [];
      scope.pieChartData=[];

      for(var i=0;i<vm.RatingDistribution.length;i++){
        scope.pieChartLabels.push(vm.RatingDistribution[i].Rating+" Star");
        scope.pieChartData.push(vm.RatingDistribution[i].Count);
      }

         $scope.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/views/business/businessPageModalForm.html',
                size: 'md',
                scope: scope,
                windowClass: 'd-modal'
        });
    }


    //Map Experimentation
    // vm.image = {
    //   url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    //   size: [20, 32],
    //   origin: [0,0],
    //   anchor: [0, 32]
    // };
    
    // location=[]
    // location.push(vm.business.Business_Name);
    // location.push(vm.business.Longitude);
    // location.push(vm.business.Latitude);

    // vm.locations=location;
    vm.coords=vm.business.Latitude + ',' + vm.business.Longitude;



  

}).directive('fontawesomestar', function () {
    return {
        restrict: 'E',
        template:
            '<i ng-repeat="star in stars" class="fa fa-border fa-star fa-2x" aria-hidden="true">' +
            '</i>',
        scope: {
            ratingvalue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
            console.log("entered");
            console.log(scope.ratingvalue);
            scope.stars = [];
            for (var i = 1; i <= scope.ratingvalue; i++) {
                scope.stars.push(i);
            }
        }
    }
}).directive('fontawesomedollar', function () {
    return {
        restrict: 'E',
        template:
            '<i ng-repeat="star in stars" class="fa fa-border fa-usd fa-lg" aria-hidden="true">' +
            '</i>',
        scope: {
            ratingvalue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
            console.log("entered");
            console.log(scope.ratingvalue);
            scope.stars = [];
            for (var i = 1; i <= scope.ratingvalue; i++) {
                scope.stars.push(i);
            }
        }
    }
}).directive('fontawesomestarsmall', function () {
    return {
        restrict: 'E',
        template:
            '<i ng-repeat="star in stars" class="fa fa-border fa-star" aria-hidden="true">' +
            '</i>',
        scope: {
            ratingvalue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
            console.log("entered");
            console.log(scope.ratingvalue);
            scope.stars = [];
            for (var i = 1; i <= scope.ratingvalue; i++) {
                scope.stars.push(i);
            }
        }
    }
});
