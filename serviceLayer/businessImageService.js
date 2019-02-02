'use strict';

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="BUSINESS_IMAGE";
var errorMessages={
	businessNotPresent:"The given business does not exist"
}

class BusinessImageService{

	find(self,callback){
		knex(tableName).where(self.businessImageParams).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
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

module.exports=BusinessImageService;