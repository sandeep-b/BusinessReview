
var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var UserAccessTokenService=require("../../serviceLayer/userAccessTokenService.js");

module.exports = function(req, res, next) {

	var params={
		USER_ID:req.headers['id'],
		TOKEN:req.headers['token']
	};

	var userAccessTokenService=new UserAccessTokenService();
	
	userAccessTokenService.find(params,function(err,response){
		if(err){
			return res.badRequest({
				code:sails.config.globals.badRequestCode,
				exception:err.exception
			});
		}else{
			 return next();
		}
	});

  
};