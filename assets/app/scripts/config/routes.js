(function () {

	angular.module('myApp').factory('routes', routes);

	function routes() {

		return {
			getTop3Reviews:"/v1/top3Reviews",
			getTop3Business:"/v1/top3Business",
			userDetails:"/user_details?UserID=:id",
			basicBusinessDetails:'/v1/business?businessId=:id',
			basicBusinessTags:'/v1/business/tags?businessId=:id',
			businessReviews:'/v1/business/reviews?businessId=:id&keyword=:keyword&offset=:offset&sortBy=:sortBy',
			forgetPassword:'/v1/forgetPassword',
			login:'/v1/login',
			logout:'/v1/logout',
			businessDashboard:'/v1/business/details',
			getStates:'/v1/states',
			userDetailsSettings:'/user_settings',
			changePassword:'/change_password',
			imageUpload:'/v1/image',
			firstReview:'/v1/business/firstReviewer?businessId=:id',
			reviewDisributionBusiness:'/v1/business/reviewDistribution?businessId=:id',
			createReview:'/edit_Review',
			getSearchDetails:'/search_business?',
			businessAnalysis:'/v1/business/analysis?businessId=:id',
			userTopTags:'/uanb?user_id=:id',
			getTuples:'/tuples?',
			roles:'/v1/userTypes',
			signUp:'/v1/signup',
			uana:'/uana?user_id=:id'
		}

	}
})();