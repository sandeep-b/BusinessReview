'use strict';


var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="USER_IMAGE";
var errorMessages={
	userNotPresent:"The given user does not exist"
}

class UserImageService{
	find(self,callback){
		knex(tableName).where(self.userImageParams).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:errorMessages.userNotPresent})
			}else if(response.length>0){
				self.imageDetails=response[0];
				self.imagePresent=true;
				return callback(null,self);
			}else if(response.length<=0){
				self.imagePresent=false;
				return callback(null,self);
			}
		});
	}
}

module.exports=UserImageService;