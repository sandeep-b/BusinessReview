angular.module("myApp").controller('reviewController',
function($state,toastr,$localStorage,authenticationService,userDashboardServices,
         basicBusinessDataResolve,businessService,$scope,basicBusinessReviewWithLimitResolve,
         $stateParams,basicBusinessDataTagResolve,$uibModal,basicBusinessReviewWithLimitResolve,
         reviewService
    ){

	var vm=this;

    console.log(basicBusinessReviewWithLimitResolve);

    vm.business=basicBusinessDataResolve;
    vm.reviewDetails=basicBusinessReviewWithLimitResolve;
    vm.TextTags=basicBusinessDataTagResolve.TextTags;
    vm.businessId=$stateParams.id;

    var userDetails=JSON.parse($localStorage.get('user'));
    var userDetailsLocalStorage=JSON.parse($localStorage.get('user'));
    vm.userDetails=userDetails;
    console.log(userDetails);

    vm.userName=userDetails.FirstName+" "+userDetails.LastName;
    console.log(vm.userName);

     vm.businessAPI=function(){
        $state.go('businessDashboard');
    }

    vm.goToProfilePage=function(){
        $state.go('profile',{id:userDetails.UserId})
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

    vm.createReview=function(review,businessId){
        var reviewDetails=[];
        reviewDetails.push({
            BusinessID:businessId,
            Rating:review.rating,
            Text:review.text
        });

        reviewService.createReview(reviewDetails,function(response){
            if(response.status==400){
                toastr.error("Could Not create this review. Please Try Again");
                //Go to Login Page
            }else if(response.status==200){
               $state.go('businessPage',{id:businessId});    
               toastr.success("Review was created successfully");
            }
       });


    }

    //vm.searchResults=getSearchDetailsResolve.message;
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

});
