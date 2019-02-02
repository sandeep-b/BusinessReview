/**
 * LogoutController
 *
 * @description :: Server-side logic for managing Logouts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var LogoutService=require("../../serviceLayer/logoutService.js");

 module.exports = {
 update:function(req,res){

 		var userId = req.headers['id'];
 		var token =req.headers['token'];

 		var params={
 			userId:userId,
 			token:token
 		}

 		var logoutService=new LogoutService();


		logoutService.logout(params, function(err,response) { 
			if(err){
				return res.badRequest({
					code:sails.config.globals.badRequestCode,
 					exception:err.exception
				})
			}else if(response){
				return res.ok({
 						code:sails.config.globals.okRequestCode,
 						message:response.message
 				});
			}		
	    });
 
 	}
 }

