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

		var query2 = 'select tag_id, tagid.tag_name, font_size from ( select tag_name, (round(percentage/10,0) * 3) + 10 as font_size from ( select tag_name, round((count/sum)*100)as percentage from ( select * from ( select tag_name, count(tag_name) as count  from ( select * from ( select review_id, user_id, review.business_id, rating, text, creation_time, tag_id, tag_name from review inner join ( select config_tag.tag_id, tag_name, business_id from config_tag, business_tag where config_tag.tag_id = business_tag.tag_id ) btag on btag.business_id = review.business_id ) where user_id = '+'\''+USERID+'\''+' ) group by tag_name order by count desc ) where rownum < 6 ) t1 full join ( select sum(count) as sum from ( select tag_name, count(tag_name) as count  from ( select * from ( select review_id, user_id, review.business_id, rating, text, creation_time, tag_id, tag_name from review inner join ( select config_tag.tag_id, tag_name, business_id from config_tag, business_tag where config_tag.tag_id = business_tag.tag_id ) btag on btag.business_id = review.business_id ) where user_id = '+'\''+USERID+'\''+') group by tag_name order by count desc ) where rownum < 6 ) t2 on t2.sum = t2.sum ) )tagid inner join config_tag on tagid.tag_name = config_tag.tag_name';

	knex.raw(query2).asCallback(function(err,response) {

		return callback(null, response);});

			}
			
		}
	}