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

		var query1 =
'select t4.rating, coalesce(number_given,0) as number_given, coalesce(average_given,0) as average_given,coalesce(plot_against,0) as  plot_against, coalesce(plot_line,0) as plot_line from ( select t2.rating, number_given ,average_given from ( select count(user_id) as number_given, rating from ( select user_id, rating from (select user_id, rating from review order by user_id desc ) where user_id = '+'\''+USERID+'\''+') group by rating order by rating desc ) t1 right join ( select count (USER_ID) as average_given, rating from review group by rating order by rating desc )  t2 on t1.rating = t2.rating ) t3 inner join ( select rating,plot_against, round((multwithavgdivby10*avgno)/10) as plot_line from ( select t2.rating, round((average_given/10000)*number_given) as plot_against,round(average_given/1000) as multwithavgdivby10 from ( select count(user_id) as number_given, rating from ( select user_id, rating from (select user_id, rating from review order by user_id desc ) where user_id = '+'\''+USERID+'\''+') group by rating order by rating desc ) t1 right join ( select count (USER_ID) as average_given, rating from review group by rating order by rating desc )  t2 on t1.rating = t2.rating )t6 full join ( select avg(number_given) as avgno from ( select count(user_id) as number_given, rating from ( select user_id, rating from (select user_id, rating from review order by user_id desc ) where user_id = '+'\''+USERID+'\''+') group by rating order by rating desc ) tavg1 right join ( select count (USER_ID) as average_given, rating from review group by rating order by rating desc )tavg2 on tavg1.rating = tavg2.rating )tright on tright.avgno = tright.avgno )t4 on t3.rating = t4.rating';

	
		knex.raw(query1).asCallback(function(err,response) {

		return callback(null, response);});

			}
			
		}
	}