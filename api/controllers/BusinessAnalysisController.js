/**
 * BusinessAnalysisController
 *
 * @description :: Server-side logic for managing Businessanalyses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var BusinessAnalysisService=require("../../serviceLayer/businessAnalysisService.js");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);

module.exports = {
	
	businessAnalysis:function(req,res){
		
		var params={
			BUSINESS_ID:req.query.businessId
		};

		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

  		var businessAnalysisService=new BusinessAnalysisService();

  		businessAnalysisService.businessAnalysis(headerParams,params,function(error,response){
			if(error){

 					return res.badRequest({
 						code:sails.config.globals.badRequestCode,
 						exception:error.exception
 					});
 				}else{
 					return res.ok({
 						code:sails.config.globals.okRequestCode,
 						DaysSinceLastReview:response.no_days_since_last_review,
 						TotalReviews:response.totalReview,
 						OutStateReview:response.OutStateReview,
 						InStateReviews:response.InStateReview,
 						UniqueUsersLogging:response.uniqueUsersLogging,
 						ReviewDistribution:response.reviewDistribution,
 						ReviewYearlyDistribution:response.reviewYearDistribution,
 						ReviewDistributionPerMonth2016:response.reviewDistributionPerMonth
 					})
 				}
		});

	}

};

