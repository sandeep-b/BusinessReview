angular.module("myApp").controller('businessMetricsController',
function($state,toastr,$localStorage,authenticationService,userDashboardServices,
    $stateParams,getBusinessAnalyticsResolve,$uibModal
    ){

	var vm=this;
  vm.businessMetrics=getBusinessAnalyticsResolve;

    var userDetails=JSON.parse($localStorage.get('user'));
    vm.userDetails=userDetails;
    console.log(userDetails);

    vm.userName=userDetails.FirstName+" "+userDetails.LastName;
    console.log(vm.userName);


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

     vm.businessAPI=function(){
        $state.go('businessDashboard');
    }

    vm.goToProfilePage=function(){
        $state.go('profile',{id:userDetails.UserId})
    }
    //Graphs Start

    //Review Distribution Yearly

     vm.linelabels=[];
     for(var i=0;i<vm.businessMetrics.ReviewYearlyDistribution.length;i++){
         vm.linelabels.push(vm.businessMetrics.ReviewYearlyDistribution[i].year)
     }
     vm.lineSeries=[];
     vm.lineSeries.push('Review Count');
     vm.lineSeries.push('Average Rating');

     var count=[];
     var avgRating=[];


        for(var i=0;i<vm.businessMetrics.ReviewYearlyDistribution.length;i++){
            count.push(vm.businessMetrics.ReviewYearlyDistribution[i].count_rating);
            avgRating.push(vm.businessMetrics.ReviewYearlyDistribution[i].avg_rating);
        }
       vm.lineChartData=[];
       vm.lineChartData.push(count);
       vm.lineChartData.push(avgRating);

  // vm.lineChartdatasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  // vm.lineChartoptions = {
  //   scales: {
  //     yAxes: [
  //       {
  //         id: 'y-axis-1',
  //         type: 'linear',
  //         display: true,
  //         position: 'left'
  //       },
  //       {
  //         id: 'y-axis-2',
  //         type: 'linear',
  //         display: true,
  //         position: 'right'
  //       }
  //     ]
  //   }
  // };
  vm.linecolors = ['#45b7cd', '#ff6384', '#ff8e72'];
  vm.lineChartdatasetOverride = [ {
        label: "Count Reviews",
        borderWidth: 1,
        type: 'bar'
      },
      {
        label: "Average Rating",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
      }];

 // Line Chart ended 

 // Review Distribution
 vm.doughLabels=[];
 vm.doughData=[];
 for(var i=0;i< vm.businessMetrics.ReviewDistribution.length;i++){
  vm.doughLabels.push(vm.businessMetrics.ReviewDistribution[i].RATING+" Star Rating");
  vm.doughData.push(vm.businessMetrics.ReviewDistribution[i].COUNT_RATING)
 }

 // Review Distribution Ended

 //2016 Review distribution Monthly
 vm.lineChartLabels1=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
 vm.lineChartLabelsDataCount=[0,0,0,0,0,0,0,0,0,0,0,0];
 vm.lineChartLabelsDataAvgRating=[0,0,0,0,0,0,0,0,0,0,0,0];
 vm.lineSeries1 = ['Count Reviews','Average Rating'];
 for(var i=0;i<vm.businessMetrics.ReviewDistributionPerMonth2016.length;i++){
  if(vm.businessMetrics.ReviewDistributionPerMonth2016[i].month_num){
     vm.lineChartLabelsDataCount[vm.businessMetrics.ReviewDistributionPerMonth2016[i].month_num-1]=vm.businessMetrics.ReviewDistributionPerMonth2016[i].count_rating;
     vm.lineChartLabelsDataAvgRating[vm.businessMetrics.ReviewDistributionPerMonth2016[i].month_num-1]=vm.businessMetrics.ReviewDistributionPerMonth2016[i].avg_rating;
   }
 }

 vm.lineChartData1=[];
 vm.lineChartData1.push(vm.lineChartLabelsDataCount);
 vm.lineChartData1.push(vm.lineChartLabelsDataAvgRating);

vm.datasetOverrideLineChart1 = [{ yAxisID: 'y-axis-1' },{ yAxisID: 'y-axis-2' }];
vm.datasetOverrideLineChart1Options = {
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

 //2016 Review distribution Monthly ended

    //Graphs End

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


    var userDetailsLocalStorage=JSON.parse($localStorage.get('user'));
    vm.userDetailsLocalStorage=userDetailsLocalStorage;
    vm.userNameLocalStorage=userDetailsLocalStorage.FirstName+" "+userDetailsLocalStorage.LastName;


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

      if($stateParams.Tag!=null && $stateParams.Tag!=undefined ){//&& Tags!=null
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

      //Trial Testing
      var orderBy;
      if($stateParams.orderBy!=undefined || $stateParams.orderBy!=null){
        if(Desc!=undefined || Desc!=null){
           if($stateParams.orderBy!=Desc){
              orderBy=Desc;
           }
        }else{
          orderBy=$stateParams.orderBy;
        }
      }else{
        orderBy=Desc;
      }


      //$state.go('search',{City:userDetailsLocalStorage.City,State:userDetailsLocalStorage.State,Tag:tags})
      $state.go('search',{City:city,State:state,Tag:tags,PriceRange:prices,orderBy:orderBy});
    }

    vm.searchByKeyword=function(keyword){
     var tags=[];
     var PriceRange=[];
     var orderBy;

     $stateParams.Tag=null;

     if($stateParams.Tag!=undefined || $stateParams.Tag!=null ){
        if(typeof $stateParams.Tag!="string"){
            for(var i=0;i<$stateParams.Tag.length;i++){
                tags.push($stateParams.Tag[i]);
          }
        }else{
             tags.push($stateParams.Tag);
        }
     }

     if($stateParams.PriceRange!=undefined || $stateParams.PriceRange!=null ){
        if(typeof $stateParams.PriceRange!="string"){
            for(var i=0;i<$stateParams.PriceRange.length;i++){
                PriceRange.push($stateParams.PriceRange[i]);
          }
        }else{
             PriceRange.push($stateParams.PriceRange);
        }
     }

     if($stateParams.orderBy!=undefined || $stateParams.orderBy!=null){
        orderBy=$stateParams.orderBy;
      }

     $stateParams.PriceRange=null;
     $state.go('search',{City:$stateParams.City,State:$stateParams.State,FindDesc:keyword,Tag:tags,PriceRange:PriceRange,orderBy:orderBy});
    
    }

    vm.resetFilters=function(){
      $state.go('search',{City:$stateParams.City,State:$stateParams.State,FindDesc:null,Tag:null,PriceRange:null});
    }


});
