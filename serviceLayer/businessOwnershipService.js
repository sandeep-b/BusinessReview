'use strict'

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="BUSINESS_OWNERSHIP";
var errorMessages={
	businessNotPresent:"The given business owner is not valid"
}

class BusinessOwnershipService{

	find(self,callback){
		knex(tableName).where(self).asCallback(function(err,response){
			if(err || response.length<=0){
				console.log(err);
				return callback({exception:errorMessages.businessNotPresent})
			}else{
				return callback(null,self);
			}
		});
	}
}

module.exports=BusinessOwnershipService;