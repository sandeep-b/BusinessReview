'use strict';

var _=require("lodash");
var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var UserAcessToken=require("./userAccessTokenService.js");
var tableName="BUSINESS";
var errorMessages={
	businessNotPresent:"The given business does not exist",
	businessIdValidationFailed:"The Given Business Id is invalid",
	reviewDistributionFailed:"The Review Distribution is not present for the given business",
	ratingDistributionFailed:"The Rating Distribution is not present for the given business",
	getReviewsFailed:"The Reviews for the business was not obtained",
	limitFailed:"The limit provided is not valid",
	offsetFailed:"The offset provided is not valid",
	sortByFailed:"The Sort By provided is not valid",
	sqlError:"The given query could not get executed"
};
var async=require("async");


class BusinessService{

	find(self,callback){
		knex(tableName).where(self.businessParams).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else{
				self.businessParams=response[0];
				return callback(null,self);
			}
		});
	}

	findBusiness(headerParams,params,callback){

		var self=this;
		var userAcessToken=new UserAcessToken();
		self.BUSINESS_ID=params.BUSINESS_ID;
		self.headerParams=headerParams;

		if(_.isNull(self.BUSINESS_ID) || !_.isInteger(_.parseInt(self.BUSINESS_ID)) || _.isUndefined(self.BUSINESS_ID)){
			return callback({exception:errorMessages.businessIdValidationFailed})	
		}else{
			self.BUSINESS_ID=parseInt(self.BUSINESS_ID);
		}

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			//getBusinessDetails,
			getBusinessDetailsDetails_revised,
			getBusinessDetailsDetails_revised_reviewRating,
			TagsForBusiness
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});
	}

	findBusinessTags(headerParams,params,callback){

		var self=this;
		var userAcessToken=new UserAcessToken();
		self.BUSINESS_ID=params.BUSINESS_ID;
		self.headerParams=headerParams;

		if(_.isNull(self.BUSINESS_ID) || !_.isInteger(_.parseInt(self.BUSINESS_ID)) || _.isUndefined(self.BUSINESS_ID)){
			return callback({exception:errorMessages.businessIdValidationFailed})	
		}else{
			self.BUSINESS_ID=parseInt(self.BUSINESS_ID);
		}

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			getNumberTagsForBusiness,
			getTextTagsForBusiness,
			hoursTagForABusiness
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});

	}

	// Rating Distribution
	ratingDistributionOfBusiness(headerParams,params,callback){

		var self=this;
		var userAcessToken=new UserAcessToken();
		self.BUSINESS_ID=params.BUSINESS_ID;
		self.headerParams=headerParams;

		if(_.isNull(self.BUSINESS_ID) || !_.isInteger(_.parseInt(self.BUSINESS_ID)) || _.isUndefined(self.BUSINESS_ID)){
			return callback({exception:errorMessages.businessIdValidationFailed})	
		}else{
			self.BUSINESS_ID=parseInt(self.BUSINESS_ID);
		}

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			reviewDistribution,
			ratingDistribution
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});
	}

	reviewForABusiness(headerParams,params,callback){
		var userAcessToken=new UserAcessToken();
		var self=this;
		self.BUSINESS_ID=params.businessId;
		self.params=params;
		self.headerParams=headerParams;


		//Business Id Validation

		if(_.isNull(self.BUSINESS_ID) || !_.isInteger(_.parseInt(self.BUSINESS_ID)) || _.isUndefined(self.BUSINESS_ID)){
			return callback({exception:errorMessages.businessIdValidationFailed})	
		}else{
			self.BUSINESS_ID=parseInt(self.BUSINESS_ID);
		}

		//limit Validation

		if(params.limit){
			if(_.isNull(params.limit) ||!_.isInteger(_.parseInt(params.limit)) || _.isUndefined(params.limit)){
				return callback({exception:errorMessages.limitFailed})
			}
		}

		//offset Validation

		if(params.offset){
			if(_.isNull(params.offset) ||!_.isInteger(_.parseInt(params.offset)) || _.isUndefined(params.offset)){
				return callback({exception:errorMessages.offsetFailed})
			}
		}

		//sortBy Validation

		if(params.sortBy){
			if(_.isNull(params.sortBy) ||!_.isInteger(_.parseInt(params.sortBy)) || _.isUndefined(params.sortBy) ||
			   _.indexOf([0,1,2,3], parseInt(params.sortBy))<0){
				return callback({exception:errorMessages.sortByFailed})
			}
		}

 		

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			queryConstructionForReview,
			getReviewsForBusiness
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});
	}

	getBusiness(headerParams,params,callback){

		var userAcessToken=new UserAcessToken();
		var self=this;
		//self.BUSINESS_ID=params.businessId;
		self.params=params;
		self.headerParams=headerParams;

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			queryConstructionForGetBusiness,
			getBusinesses
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});

	}

	firstReviewer(headerParams,params,callback){
		var userAcessToken=new UserAcessToken();
		var self=this;
		self.BUSINESS_ID=params.businessId;
		self.params=params;
		self.headerParams=headerParams;


		if(_.isNull(self.BUSINESS_ID) || !_.isInteger(_.parseInt(self.BUSINESS_ID)) || _.isUndefined(self.BUSINESS_ID)){
			return callback({exception:errorMessages.businessIdValidationFailed})	
		}else{
			self.BUSINESS_ID=parseInt(self.BUSINESS_ID);
		}

		async.waterfall([
			async.apply(userAcessToken.findBasedOnHeaderParameters,self),
			firstReviewer
			],function(err,response){
			if(err){
				return callback({exception:err.exception});
			}else{
				return callback(null,response);
			}
		});

	}
}

module.exports=BusinessService;

function firstReviewer(self,callback){
	var sql="select * from (select "+
			"user_info.USER_ID as \"UserId\", "+
			"user_info.FIRST_NAME||' '||nvl(user_info.LAST_NAME,'') as \"FullName\", "+
			"image.IMAGE_URL, "+
			"(select count(*) from REVIEW review "+
 			"where review.USER_ID=user_info.USER_ID "+
 			"GROUP BY review.USER_ID "+
			") as \"countReviews\" "+
			"from REVIEW reviews "+
			"inner join USER_INFO user_info on user_info.USER_ID=reviews.USER_ID "+
			"left join USER_IMAGE user_image on user_image.USER_ID=user_info.USER_ID "+
			"left join IMAGE image on image.IMAGE_ID=user_image.IMAGE_ID "+
			"where reviews.BUSINESS_ID="+self.BUSINESS_ID+" "+
			"order by reviews.CREATION_TIME asc) "+
			"where rownum<=1"

			console.log(sql);

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.firstReviewer=response;
				return callback(null,self);
			}else if(response.length<=0){
				self.firstReviewer=[];
				return callback(null,self);
			}
	});

}


function getBusinessDetails(self,callback){

	var sql="select business.BUSINESS_ID as \"Business_Id\","+
			"business.BUSINESS_NAME as \"Business_Name\","+
			"(business.ADDRESS_LINE1 ||nvl(business.ADDRESS_LINE2,'')) as \"Address_Line\","+
			"business.CITY as \"City\", business.STATE as \"State\",business.ZIP as \"Zip\","+
			"nvl(business.PHONE,'') as \"Phone\",nvl(business.WEBSITE,'') as \"Website\","+
			"business.LATITUDE as \"Latitude\",business.LONGITUDE as \"Longitude\","+
			"business.PRICE_RANGE as \"Price_Range\", business.STATUS as \"Status\","+
			"image.IMAGE_ID as \"Image_Id\", image.IMAGE_URL as \"Image_Url\","+
			"review_details.countReview as \"CountReviews\",review_details.avg_rating as \"Rating\""+
			"from (select count(*) as countReview,"+ 
			" AVG(review.RATING) as avg_rating from REVIEW review"+
			" where review.BUSINESS_ID="+self.BUSINESS_ID +
			" group by review.BUSINESS_ID) review_details,"+
			" BUSINESS business "+
			" left join BUSINESS_IMAGE business_image on business_image.BUSINESS_ID=business.BUSINESS_ID "+
			" left join IMAGE image on image.IMAGE_ID=business_image.IMAGE_ID "+
			" where business.BUSINESS_ID="+self.BUSINESS_ID;

			console.log(sql);

	   knex.raw(sql).asCallback(function(err,response){
		if(err || response.length<=0){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else{
				self.Business=response;
				return callback(null,self);
			}
	});
}

function getBusinessDetailsDetails_revised(self,callback){

	var sql="select business.BUSINESS_ID as \"Business_Id\","+
			"business.BUSINESS_NAME as \"Business_Name\","+
			"(business.ADDRESS_LINE1 ||nvl(business.ADDRESS_LINE2,'')) as \"Address_Line\","+
			"business.CITY as \"City\", business.STATE as \"State\",business.ZIP as \"Zip\","+
			"nvl(business.PHONE,'') as \"Phone\",nvl(business.WEBSITE,'') as \"Website\","+
			"business.LATITUDE as \"Latitude\",business.LONGITUDE as \"Longitude\","+
			"business.PRICE_RANGE as \"Price_Range\", business.STATUS as \"Status\","+
			"image.IMAGE_ID as \"Image_Id\", image.IMAGE_URL as \"Image_Url\""+
			" from BUSINESS business "+
			" left join BUSINESS_IMAGE business_image on business_image.BUSINESS_ID=business.BUSINESS_ID "+
			" left join IMAGE image on image.IMAGE_ID=business_image.IMAGE_ID "+
			" where business.BUSINESS_ID="+self.BUSINESS_ID;

			console.log(sql);

	   knex.raw(sql).asCallback(function(err,response){
		if(err || response.length<=0){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else{
				self.Business=response;
				return callback(null,self);
			}
	});

}

function getBusinessDetailsDetails_revised_reviewRating(self,callback){

	var sql="select count(*) as \"countReview\", AVG(review.RATING) as "+
			"\"avg_rating\" from REVIEW review where review.BUSINESS_ID="+
			self.BUSINESS_ID+ " group by review.BUSINESS_ID";

			console.log(sql);

	   knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length>0){
				self.Business[0].CountReviews=response[0].countReview;
				self.Business[0].Rating=response[0].avg_rating;
				return callback(null,self);
			}else if(response.length<=0){
				self.Business[0].CountReviews=0
				self.Business[0].Rating=0;
				return callback(null,self);
			}
	});
}

function TagsForBusiness(self,callback){
		var sql="select business_tag.TAG_ID as \"Id\",config_tag.TAG_NAME as \"TagName\""+  
				" from BUSINESS_TAG business_tag"+
				" inner join CONFIG_TAG config_tag on config_tag.TAG_ID=business_tag.TAG_ID"+
				" where business_tag.BUSINESS_ID="+self.BUSINESS_ID;

	    console.log(sql);

	    knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else{
				self.Business[0].Tags=response;
				return callback(null,self.Business);
			}
	});
}

function getNumberTagsForBusiness(self,callback){
		var sql="select "+
				"config_business_attr.ATTR_NAME as \"Attribute_Name\", "+
				"business_attr_number.NUMBER_VALUE as \"Attribute_Value\" "+
				"from CONFIG_BUSINESS_ATTR config_business_attr "+
				"inner join BUSINESS_ATTR_NUMBER business_attr_number "+ 
				"on business_attr_number.ATTR_ID=config_business_attr.ATTR_ID "+
				"where business_attr_number.BUSINESS_ID="+self.BUSINESS_ID;

	    console.log(sql);

	    knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length<=0){
				self.numberTags=[];
				return callback(null,self);
			}else if(response.length>0){
				self.numberTags=response;
				return callback(null,self);
			}
	});
}

function getTextTagsForBusiness(self,callback){
		var sql="select  "+
				"config_business_attr.ATTR_NAME as \"Attribute_Name\", "+
				"business_attr_text.TEXT_VALUE as \"Attribute_Value\" "+
				"from BUSINESS_ATTR_TEXT business_attr_text "+
				"inner join CONFIG_BUSINESS_ATTR config_business_attr on "+
				"business_attr_text.ATTR_ID=config_business_attr.ATTR_ID "+
				"where business_attr_text.BUSINESS_ID="+self.BUSINESS_ID;

	    console.log(sql);

	    knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length<=0){
				self.textTags=[];
				return callback(null,self);
			}else if(response.length>0){
				self.textTags=response;
				return callback(null,self);
			}
	});
}

function reviewDistribution(self,callback){
	var sql="select EXTRACT(year from CREATION_TIME) as \"Year\" ,count(EXTRACT(year from CREATION_TIME)) "+ 
			"as \"Count\",ROUND(AVG(RATING),1)as \"Average_Rating\" "+
			"from REVIEW "+
			"where BUSINESS_ID="+self.BUSINESS_ID+" group by EXTRACT(year from CREATION_TIME) "+
			"order by \"Year\"  desc";

	  knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.reviewDistributionFailed});
			}else if(response.length<=0){
				self.reviewDistribution=[];
				return callback(null,self);
			}else if(response.length>0){
				self.reviewDistribution=response;
				return callback(null,self);
			}
	});
}

function ratingDistribution(self,callback){
	var sql="select RATING as \"Rating\",count(RATING)as \"Count\" from REVIEW "+
			"where BUSINESS_ID="+self.BUSINESS_ID+" GROUP by RATING "+
			"order by \"Rating\" DESC";

	 knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.ratingDistributionFailed})
			}else if(response.length<=0){
				self.ratingDistribution=[];
				return callback(null,self);
			}else if(response.length>0){
				self.ratingDistribution=response;
				return callback(null,self);
			}
	});
}

function queryConstructionForReview(self,callback){

	var rowNumberClause,orderByClause,offsetClause,limitClause,keywordClause;
	offsetClause="";
	limitClause="";
	keywordClause="";

	if(self.params.sortBy){
		if(self.params.sortBy=="0"){
			rowNumberClause="ROW_NUMBER() OVER (ORDER BY review.CREATION_TIME DESC) as rno ";
			orderByClause="ORDER BY review.CREATION_TIME DESC ";
		}else if(self.params.sortBy=="1"){
			rowNumberClause="ROW_NUMBER() OVER (ORDER BY review.CREATION_TIME ASC) as rno ";
			orderByClause="ORDER BY review.CREATION_TIME ASC ";
		}else if(self.params.sortBy=="2"){
			rowNumberClause="ROW_NUMBER() OVER (ORDER BY review.RATING DESC) as rno ";
			orderByClause="ORDER BY review.RATING DESC ";
		}else if(self.params.sortBy=="3"){
			rowNumberClause="ROW_NUMBER() OVER (ORDER BY review.RATING ASC) as rno ";
			orderByClause="ORDER BY review.RATING ASC ";
		}else{
			rowNumberClause="ROW_NUMBER() OVER (ORDER BY review.CREATION_TIME DESC) as rno ";
	    	orderByClause="ORDER BY review.CREATION_TIME DESC ";	
		}
	}else{
		rowNumberClause="ROW_NUMBER() OVER (ORDER BY review.CREATION_TIME DESC) as rno ";
	    orderByClause="ORDER BY review.CREATION_TIME DESC ";
	}

	if(self.params.offset){
		offsetClause=" rno>="+(parseInt(self.params.offset));
	}

	if(self.params.limit){
		limitClause=" rno<"+(parseInt(self.params.limit)+1);
	}

	if(self.params.keyword){
		keywordClause=" and (lower(user_info.FIRST_NAME||' '||nvl(user_info.LAST_NAME,'')) like '%"+_.toLower(self.params.keyword)+"%' "+
					  " or lower(user_info.CITY) like '%"+_.toLower(self.params.keyword)+"%' "+
					  " or lower(user_info.STATE) like '%"+_.toLower(self.params.keyword)+"%' )";

	}

	console.log(rowNumberClause);

	// var sql="select * from ( "+
	// 		"select review.REVIEW_ID as \"Review_Id\",review.BUSINESS_ID as \"Business_Id\", "+
	// 		"review.USER_ID as \"User_Id\", review.RATING as \"Rating\", "+
	// 		"review.TEXT as \"Text\",review.CREATION_TIME as \"Creation_time\", "+
	// 		"countReviews.count as \"Review_Count\", "+
	// 		"user_info.FIRST_NAME||' '||nvl(user_info.LAST_NAME,'') as \"FullName\" ,"+
	// 		"user_info.CITY as \"City\", user_info.STATE as \"State\", image.IMAGE_URL as \"Image_Url\", "+
	// 		rowNumberClause+" "+
	// 		"from REVIEW review "+
	// 		"inner join USER_INFO user_info on user_info.USER_ID=review.USER_ID "+
	// 		"inner join(select USER_ID,COUNT(*) as count from REVIEW where USER_ID=review.USER_ID group by USER_ID) "+
	// 		"countReviews on countReviews.USER_ID=user_info.USER_ID "+
	// 		"left join USER_IMAGE user_image on user_image.USER_ID=user_info.USER_ID "+
	// 		"left join IMAGE image on image.IMAGE_ID=user_image.IMAGE_ID "+
	// 		"where review.BUSINESS_ID="+self.BUSINESS_ID+" "+keywordClause+" "+orderByClause+
	// 		")temp ";

	// var sql="select * from ( "+
	// 		"select review.REVIEW_ID as \"Review_Id\",review.BUSINESS_ID as \"Business_Id\", "+
	// 		"review.USER_ID as \"User_Id\", review.RATING as \"Rating\", "+
	// 		"review.TEXT as \"Text\",review.CREATION_TIME as \"Creation_time\", "+
	// 		//"countReviews.count as \"Review_Count\", "+
	// 		"user_info.FIRST_NAME||' '||nvl(user_info.LAST_NAME,'') as \"FullName\" ,"+
	// 		"user_info.CITY as \"City\", user_info.STATE as \"State\", image.IMAGE_URL as \"Image_Url\", "+
	// 		rowNumberClause+", "+
	// 		" (select COUNT(*) from REVIEW reviews1 where reviews1.USER_ID=review.USER_ID group by USER_ID) as \"Review_Count\" "+
	// 		"from REVIEW review "+
	// 		"inner join USER_INFO user_info on user_info.USER_ID=review.USER_ID "+
	// 		//"inner join(select USER_ID,COUNT(*) as count from REVIEW where USER_ID=review.USER_ID group by USER_ID) "+
	// 		//"countReviews on countReviews.USER_ID=user_info.USER_ID "+
	// 		"left join USER_IMAGE user_image on user_image.USER_ID=user_info.USER_ID "+
	// 		"left join IMAGE image on image.IMAGE_ID=user_image.IMAGE_ID "+
	// 		"where review.BUSINESS_ID="+self.BUSINESS_ID+" "+keywordClause+" "+orderByClause+
	// 		")temp ";

	var sql="select * from (select temp.*,ROWNUM rno from ( "+
			"select review.REVIEW_ID as \"Review_Id\",review.BUSINESS_ID as \"Business_Id\", "+
			"review.USER_ID as \"User_Id\", review.RATING as \"Rating\", "+
			"review.TEXT as \"Text\",review.CREATION_TIME as \"Creation_time\", "+
			//"countReviews.count as \"Review_Count\", "+
			"user_info.FIRST_NAME||' '||nvl(user_info.LAST_NAME,'') as \"FullName\" ,"+
			"user_info.CITY as \"City\", user_info.STATE as \"State\", image.IMAGE_URL as \"Image_Url\", "+
			//rowNumberClause+", "+
			" (select COUNT(*) from REVIEW reviews1 where reviews1.USER_ID=review.USER_ID group by USER_ID) as \"Review_Count\" "+
			"from REVIEW review "+
			"inner join USER_INFO user_info on user_info.USER_ID=review.USER_ID "+
			//"inner join(select USER_ID,COUNT(*) as count from REVIEW where USER_ID=review.USER_ID group by USER_ID) "+
			//"countReviews on countReviews.USER_ID=user_info.USER_ID "+
			"left join USER_IMAGE user_image on user_image.USER_ID=user_info.USER_ID "+
			"left join IMAGE image on image.IMAGE_ID=user_image.IMAGE_ID "+
			"where review.BUSINESS_ID="+self.BUSINESS_ID+" "+keywordClause+" "+orderByClause+
			")temp) ";


	if(offsetClause.length>0 && limitClause.length>0){
		sql=sql+" where "+offsetClause+" and "+limitClause;
	}

	if(offsetClause.length>0 && limitClause.length<=0){
		sql=sql+" where "+offsetClause;
	}

	if(offsetClause.length<=0 && limitClause.length>0){
		sql=sql+" where "+limitClause;
	}
	
	console.log(sql);	

	self.params.sql=sql;

	return callback(null,self);

}

function getReviewsForBusiness(self,callback){
	var sql=self.params.sql;

	knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.getReviewsFailed})
			}else if(response.length<=0){
				self.reviews=[];
				return callback(null,self);
			}else if(response.length>0){
				self.reviews=response;
				return callback(null,self);
			}
	});
}

function hoursTagForABusiness(self,callback){
	var sql="select config_weekday.WEEKDAY_NAME as \"Day\", "+
			"(to_char(business_hour.OPEN_TIME, 'HH')) || ':'  "+
			"||to_char(business_hour.OPEN_TIME, 'MI') || ' '|| "+
			"to_char(business_hour.OPEN_TIME, 'AM') "+
			"as  \"Open_time\", "+
			"(to_char(business_hour.CLOSE_TIME, 'HH')) || ':' "+
			"||to_char(business_hour.CLOSE_TIME, 'MI') ||' '||	"+
			"to_char(business_hour.CLOSE_TIME,'AM') "+
			"as \"Close_time\" "+
			"from BUSINESS_HOUR business_hour "+
			"inner join CONFIG_WEEKDAY config_weekday "+
			"on config_weekday.WEEKDAY_ID=business_hour.WEEKDAY_ID "+
			"where business_hour.BUSINESS_ID="+self.BUSINESS_ID+" "+
			"order by business_hour.WEEKDAY_ID";

	console.log(sql);

	    knex.raw(sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else if(response.length<=0){
				self.hours=[];
				return callback(null,self);
			}else if(response.length>0){
				self.hours=response;
				return callback(null,self);
			}
	});

}

function queryConstructionForGetBusiness(self,callback){
	var sql="select business.BUSINESS_ID as \"Business_Id\","+
			" business.BUSINESS_NAME as \"Business_Name\" "+
			" from BUSINESS_OWNERSHIP business_owner "+
			" inner join BUSINESS business on business.BUSINESS_ID=business_owner.BUSINESS_ID "+
			" where business_owner.OWNER_ID="+self.headerParams.USER_ID+" "
			" order by business_owner.CREATION_TIME DESC";
	console.log(sql);
	self.sql=sql;
	return callback(null,self);
}

function getBusinesses(self,callback){
	 knex.raw(self.sql).asCallback(function(err,response){
		if(err){
				console.log(err);
				return callback({exception:errorMessages.sqlError})
			}else if(response.length<=0){
				self.businesses=[];
				return callback(null,self);
			}else if(response.length>0){
				self.businesses=response;
				return callback(null,self);
			}
	});
}