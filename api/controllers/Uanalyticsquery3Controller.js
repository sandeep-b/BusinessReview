/**
 * DummyController
 *
 * @description :: Server-side logic for managing dummies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var services=require("../../serviceLayer/Uanalyticsquery3Service");
 var knex=require('knex')(sails.config.connections.knexConnectionParameters);

 module.exports = {

	

	retrieve:function(req,res){
	
		var query = req.query;

		services.retrieve(query,function(err,response){
			if(err){
				console.log(err);
				return res.badRequest({
					exception:"badRequest"
				});
			}else{
				return res.ok({
					
			
					response

					
				});
			}
		}); 
	}

	
};
