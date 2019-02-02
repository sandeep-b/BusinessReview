/**
 * LoginController
 *
 * @description :: Server-side logic for managing Logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var LoginService=require("../../serviceLayer/loginService.js");
var knex=require('knex')(sails.config.connections.knexConnectionParameters);
 module.exports = {

 retrieve:function(req,res){

		var params=req.body;

		var loginService=new LoginService();

		loginService.login(params, function(err,response) { 
			if(err){
				return res.badRequest({
					code:sails.config.globals.badRequestCode,
 					exception:err.exception
				})
			}else if(response){
				return res.ok({
 						code:sails.config.globals.okRequestCode,
 						loginDetails:response.loginDetails
 				});
			}		
	    });
    },

 signUp:function(req,res){

 	var params=req.body;

		var loginService=new LoginService();

		loginService.signUp(params, function(err,response) { 
			if(err){
				return res.badRequest({
					code:sails.config.globals.badRequestCode,
 					exception:err.exception
				})
			}else if(response){
				return res.ok({
 						code:sails.config.globals.okRequestCode,
 						loginDetails:response.loginDetails
 				});
			}		
	    });
 },


 getUserTypes:function(req,res){


		var query="select USER_TYPE_ID as \"UserTypeId\",USER_TYPE_NAME as \"UserTypeName\" "+
		" from CONFIG_USER_TYPE where USER_TYPE_NAME!='System Admin'"

		knex.raw(query).asCallback(function(err,response){
		if(err){
				console.log(err);
				return res.badRequest({exception:"Could not find the number of tuples"})
			}else if(response.length>0){
				return res.ok({userTypes:response});
			}else if(response.length<=0){
				 return res.badRequest({exception:"Could not find the number of tuples"})
			}
	   });

 },

};

