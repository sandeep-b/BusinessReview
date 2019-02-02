/**
 * DummyController
 *
 * @description :: Server-side logic for managing dummies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var services=require("../../serviceLayer/Uanalyticsquery1Service");
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
	},

	getTuples:function(req,res){

		//Change the OWNER NAME 

		var query="select SUM(NUM_ROWS) as \"TotalTupleCount\" from all_tables where OWNER='CXU'";

		knex.raw(query).asCallback(function(err,response){
		if(err){
				console.log(err);
				return res.badRequest({exception:"Could not find the number of tuples"})
			}else if(response.length>0){
				return res.ok({tuples:response[0].TotalTupleCount});
			}else if(response.length<=0){
				 return res.badRequest({exception:"Could not find the number of tuples"})
			}
	   });

	}

	
};

