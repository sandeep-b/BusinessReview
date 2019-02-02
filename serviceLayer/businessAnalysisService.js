'use strict';

var _=require("lodash");
var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var UserAcessToken=require("./userAccessTokenService.js");
var errorMessages={
	businessNotPresent:"The given business does not exist",
	businessIdValidationFailed:"The Given Business Id is invalid",
	reviewDistributionFailed:"The Review Distribution is not present for the given business",
	ratingDistributionFailed:"The Rating Distribution is not present for the given business",
	getReviewsFailed:"The Reviews for the business was not obtained",
	limitFailed:"The limit provided is not valid",
	offsetFailed:"The offset provided is not valid",
	sortByFailed:"The Sort By provided is not valid"
};
var async=require("async");


class BusinessAnalysisService{

	businessAnalysis(headerParams,params,callback){
		var self=this;
		var userAcessToken=new UserAcessToken();
		self.BUSINESS_ID=params.BUSINESS_ID;
		self.headerParams=headerParams;

		if(_.isNull(self.BUSINESS_ID) || !_.isInteger(_.parseInt(self.BUSINESS_ID)) || _.isUndefined(self.BUSINESS_ID)){
			return callback({exception:errorMessages.businessIdValidationFailed});	
		}else{
			self.BUSINESS_ID=parseInt(self.BUSINESS_ID);
		}

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			no_days_since_last_review_for_business,
			In_State_Out_State_Review_1,
			In_State_Out_State_Review_2,
			unique_user_logging_for_business,	
			review_distribution_for_business,
			review_rating_distribution_year_for_business,
			recent_year_review_distribution_per_month
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});
	}

}

module.exports=BusinessAnalysisService;

function no_days_since_last_review_for_business(self,callback){
	var sql="select ROUND(SYSDATE-temp.CREATION_TIME,0) as "+
	        "\"no_days_since_last_review\" from(select * from REVIEW "+
			"where BUSINESS_ID="+self.BUSINESS_ID+" "+
			"order by CREATION_TIME DESC) temp "+
			"where rownum<=1";

	console.log(sql);

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else{
				self.no_days_since_last_review=response[0];
				return callback(null,self);
			}
	});
}

function In_State_Out_State_Review_1(self,callback){
	var sql="select (select count(*) from REVIEW where BUSINESS_ID="+self.BUSINESS_ID+") as \"totalReview\", "+
			"count(*) as \"OutState\",((select count(*) from REVIEW where BUSINESS_ID="+self.BUSINESS_ID+")-count(*)) "+
			"as \"InState\" "+
			"from (select review.REVIEW_ID,user_info.USER_ID,business.BUSINESS_ID, "+
			"(CASE WHEN user_info.STATE <> business.STATE then "+
  			"1 else 0 end "+
			") as not_same_city_or_state "+
			"from REVIEW review "+
			"inner join USER_INFO user_info on user_info.USER_ID=review.USER_ID "+
			"inner join BUSINESS business on business.BUSINESS_ID=review.BUSINESS_ID "+
			"where business.BUSINESS_ID="+self.BUSINESS_ID+") temp where not_same_city_or_state=1 "+
			"group by temp.BUSINESS_ID";

			console.log(sql);

	 knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.totalReview=response[0].totalReview;
				self.OutStateReview=response[0].OutState;
				self.InStateReview=response[0].InState;
				return callback(null,self);
			}else if(response.length<=0){
				self.totalReview=0;
				self.OutStateReview=0;
				self.InStateReview=0;
				return callback(null,self);
			}
	});
}

function In_State_Out_State_Review_2(self,callback){

	if(self.totalReview==0){

		var sql="select (select count(*) from REVIEW where BUSINESS_ID="+self.BUSINESS_ID+") as \"totalReview\", "+
			"count(*) as \"InState\",((select count(*) from REVIEW where BUSINESS_ID="+self.BUSINESS_ID+")-count(*)) "+
			"as \"OutState\" "+
			"from (select review.REVIEW_ID,user_info.USER_ID,business.BUSINESS_ID, "+
			"(CASE WHEN user_info.STATE <> business.STATE then "+
  			"1 else 0 end "+
			") as not_same_city_or_state "+
			"from REVIEW review "+
			"inner join USER_INFO user_info on user_info.USER_ID=review.USER_ID "+
			"inner join BUSINESS business on business.BUSINESS_ID=review.BUSINESS_ID "+
			"where business.BUSINESS_ID="+self.BUSINESS_ID+") temp where not_same_city_or_state=0 "+
			"group by temp.BUSINESS_ID";

			console.log(sql);

	 knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.totalReview=response[0].totalReview;
				self.OutStateReview=response[0].OutState;
				self.InStateReview=response[0].InState;
				return callback(null,self);
			}else if(response.length<=0){
				self.totalReview=0;
				self.OutStateReview=0;
				self.InStateReview=0;
				return callback(null,self);
			}
	   });
	}else{
		return callback(null,self);
	}
	
}

function unique_user_logging_for_business(self,callback){
	var sql="select count(DISTINCT USER_ID) as \"unique_user_logging\",BUSINESS_ID  from REVIEW "+
			"where BUSINESS_ID="+self.BUSINESS_ID+" "+ 
			"group BY BUSINESS_ID";

	console.log(sql);

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.uniqueUsersLogging=response[0].unique_user_logging;
				return callback(null,self);
			}else if(response.length<=0){
				self.uniqueUsersLogging=0;
				return callback(null,self);
			}
	});

}

function review_distribution_for_business(self,callback){
	var sql="select RATING,count(RATING) as count_rating from REVIEW "+
	        "where BUSINESS_ID="+self.BUSINESS_ID+" "+
			"group by RATING "+
			"ORDER BY RATING DESC";

	console.log(sql);

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.reviewDistribution=response;
				return callback(null,self);
			}else if(response.length<=0){
				self.reviewDistribution=[];
				return callback(null,self);
			}
	});
}

function review_rating_distribution_year_for_business(self,callback){
	var sql="select EXTRACT(YEAR from CREATION_TIME) as \"year\", "+
			"count(RATING) as \"count_rating\", "+
			"AVG(RATING) as \"avg_rating\" "+
			"from REVIEW "+
			"where BUSINESS_ID="+self.BUSINESS_ID+" "+
			"GROUP BY BUSINESS_ID,EXTRACT(YEAR from CREATION_TIME) "+
			"ORDER BY EXTRACT(YEAR from CREATION_TIME) DESC";

	console.log(sql);

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.reviewYearDistribution=response;
				return callback(null,self);
			}else if(response.length<=0){
				self.reviewYearDistribution=[];
				return callback(null,self);
			}
	});
}

function recent_year_review_distribution_per_month(self,callback){

	var sql="select EXTRACT(MONTH from CREATION_TIME) as \"month_num\", "+ 
			"trim(to_char(CREATION_TIME, 'Month')) as \"month\", " +
			"count(RATING) as \"count_rating\", "+
			"AVG(RATING) as \"avg_rating\" "+
			"from REVIEW "+
			" where BUSINESS_ID="+self.BUSINESS_ID+" "+
			" and EXTRACT(YEAR from CREATION_TIME)=2016 "+
			" GROUP BY BUSINESS_ID,EXTRACT(MONTH from CREATION_TIME),to_char(CREATION_TIME, 'Month') "+
			" order by EXTRACT(MONTH from CREATION_TIME) ASC";

	console.log(sql);

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.reviewDistributionPerMonth=response;
				return callback(null,self);
			}else if(response.length<=0){
				self.reviewDistributionPerMonth=[];
				return callback(null,self);
			}
	});
}




