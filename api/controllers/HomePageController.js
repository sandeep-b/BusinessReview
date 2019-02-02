/**
 * HomePageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var HomePageService=require("../../serviceLayer/homePageService.js");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);

 module.exports = {

 	top3Business:function(req,res){

 		var params={
 			USER_ID:req.headers['id'],
 			TOKEN:req.headers['token']
 		};

 		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

 		var homePageService=new HomePageService();
 		homePageService.top3Business(headerParams,params,function(error,response){
 			if(error){
 				return res.badRequest({
 					code:sails.config.globals.badRequestCode,
 					exception:error.exception
 				});
 			}else{
 				return res.ok({
 					code:sails.config.globals.okRequestCode,
 					Business:response
 				});
 			}
 		});
 	},

 	top3Review:function(req,res){

 		var params={
 			USER_ID:req.headers['id'],
 			TOKEN:req.headers['token']
 		};

 		var headerParams={
  			USER_ID:req.headers['id'],
  			TOKEN:req.headers['token']
  		};

 		var homePageService=new HomePageService();
 		homePageService.top3Review(headerParams,params,function(error,response){
 			if(error){
 				return res.badRequest({
 					code:sails.config.globals.badRequestCode,
 					exception:error.exception
 				});
 			}else{
 				return res.ok({
 					code:sails.config.globals.okRequestCode,
 					Review:response
 				});
 			}
 		});
 	}
 };

