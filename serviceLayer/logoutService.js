'use strict'

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var moment=require("moment");
var md5=require("md5");

class LogoutService{

	logout(params,callback){
		var self=this;
		self.userId=params.userId;
		self.token=params.token;

		async.waterfall([
		async.apply(validUserToken,self),
		deleteUserToken
		],function(error,response){
		if(error){
			return callback({exception:error.exception});
		}else if(response){
			return callback(null,response);
		}
	  });

	}
}

module.exports=LogoutService;

function validUserToken(self,callback){

	var sql="select user1.USER_ID  as \"UserId\", user1.USER_TYPE_ID as \"User_Type_Id\","+
			" user1.FIRST_NAME as \"FirstName\","+
			" user1.LAST_NAME as \"LastName\","+
			" user1.EMAIL as \"Email\", user1.CITY as \"City\", user1.STATE as \"State\","+
			" user_access_token.TOKEN as \"token\""+
			" from USER_INFO user1"+
			" inner join USER_ACCESS_TOKEN user_access_token on user_access_token.USER_ID=user1.USER_ID"+
			" where user1.USER_ID="+self.userId+" and user_access_token.token=\'"+self.token+"\'";


	console.log(sql);
	knex.raw(sql).asCallback(function(err,response){
		if(err || response.length<=0){
			console.log(err);
			return callback({exception:"Logout was not successful."});
		}else if(response.length>0){
			self.userDetails=response[0];
			console.log(self.userDetails);
		    return callback(null,self);
		}
	});
}

function deleteUserToken(self,callback){
	var sql="DELETE from USER_ACCESS_TOKEN where token = \'"+self.token+"\'";
	console.log(sql);
	knex.raw(sql).asCallback(function(err,response){
		if(err || !response){
			console.log(err);
			return callback({exception:"Logout was not successfule"});
		}else if(response){
			self.message="You were Logged out of the application";
			return callback(null,self);
		}
	});
}