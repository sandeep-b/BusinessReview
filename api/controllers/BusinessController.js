/**
 * BusinessController
 *
 * @description :: Server-side logic for managing Businesses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var BusinessService=require("../../serviceLayer/businessService.js");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);

module.exports = {

	findBusiness:function(req,res){
		var params={
			BUSINESS_ID:req.query.businessId
		};

		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

		var businessService=new BusinessService();
		businessService.findBusiness(headerParams,params,function(error,response){
			if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						Business:response
 					})
 				}
		});
	},

	findBusinessTags:function(req,res){
		var params={
			BUSINESS_ID:req.query.businessId
		};


		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};


		var businessService=new BusinessService();
		businessService.findBusinessTags(headerParams,params,function(error,response){
			if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						TextTags:response.textTags,
 						NumberTags:response.numberTags,
 						Hours:response.hours
 					})
 				}
		});
	},

	ratingDistributionOfBusiness:function(req,res){
		var params={
			BUSINESS_ID:req.query.businessId
		};

		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

		var businessService=new BusinessService();
		businessService.ratingDistributionOfBusiness(headerParams,params,function(error,response){
			if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						ReviewDistribution:response.reviewDistribution,
 						RatingDistribution:response.ratingDistribution
 					})
 				}
		});
	},

	reviewForABusiness:function(req,res){
		var params=req.query;

		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

		var businessService=new BusinessService();
		businessService.reviewForABusiness(headerParams,params,function(error,response){
			if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						Reviews:response.reviews,
 					})
 				}
		});

	},

	getBusiness:function(req,res) {
		var params=req.query;

		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

		var businessService=new BusinessService();
		businessService.getBusiness(headerParams,params,function(error,response){
			if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						businesses:response.businesses,
 					})
 				}
		});
	},

	firstReviewer:function(req,res){
		var params=req.query;

		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

		var businessService=new BusinessService();

		businessService.firstReviewer(headerParams,params,function(error,response){
			if(error){
 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						firstReviewer:response.firstReviewer,
 					})
 				}
		});
	}


};

