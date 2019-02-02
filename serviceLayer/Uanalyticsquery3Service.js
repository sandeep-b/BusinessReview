var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="REVIEW";


module.exports={

	retrieve:function(query,callback) {

		var USERID;
		

				

		if(query.user_id == null || query.user_id == '') {
			
			//console.log("Incorrect query user_id");
			return callback(null ,"Incorrect query user_id");
		}

		if(query.user_id){
			USERID = query.user_id;
			
			//console.log(USERID);

		var query3 = 'select creation_time, count(review_id) as reviews_given from ( select * from ( select review_id, user_id, review.business_id, rating, text, creation_time, tag_id, tag_name from review inner join ( select config_tag.tag_id, tag_name, business_id from config_tag, business_tag where config_tag.tag_id = business_tag.tag_id ) btag on btag.business_id = review.business_id ) where user_id = '+'\''+USERID+'\''+' )  group by creation_time order by creation_time asc';

	knex.raw(query3).asCallback(function(err,response) {

		return callback(null, response);});

			}
			
		}
	}
