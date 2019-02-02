'use strict';


var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="USER_ACCESS_TOKEN";
var userNotAuthorized="The given user is not Authorised."

class UserAcessToken{
	
	find(params,callback){
		// SQL Query - Select * from USER_ACCESS_TOKEN where (params provided)
		knex.table(tableName).where(params).asCallback(function(err,response){
			if(err || response.length<=0){
				console.log(err+" "+response);
				return callback({exception:userNotAuthorized})
			}else{
				console.log(response);
				return callback(null,response);
			}
		});

	}

	findBasedOnHeaderParameters(self,callback){
		var params={
			USER_ID:self.headerParams.USER_ID,
			TOKEN:self.headerParams.TOKEN
		};

		knex.table(tableName).where(params).asCallback(function(err,response){
			if(err || response.length<=0){
				console.log(err+" "+response);
				return callback({exception:userNotAuthorized})
			}else{
				console.log(response);
				return callback(null,self);
			}
		});

	}
}

module.exports=UserAcessToken;