'use strict';


var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="USER_INFO";
var errorMessages={
	userNotPresent:"The given user is not present"
}

class UserService{
	find(self,callback){

		knex(tableName).where(self.userParams).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:errorMessages.userNotPresent})
			}else{
				self.userParams=response[0];
				return callback(null,self);
			}
		});
	}
}


module.exports=UserService;