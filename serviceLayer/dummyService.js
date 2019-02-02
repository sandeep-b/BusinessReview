var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="CLASS";
var async=require("async");

// Err handling messages
var error={
	insert:{
		insertUnsuccessful:"The Insert was not successful",
		
	},
	where:{
		whereUnsuccessful:"The Where clause was unsucessful"
	},
	update:{
		updateUnsuccessful:"The Update clause was unsucessful"
	}
}

module.exports={

	create:function(params,callback){
		knex(tableName).insert(params).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:error.insert.insertUnsuccessful})
			}else{
				return callback(null);
			}
		});
	},

	retrieve:function(params,callback){

		var retrieveParams={};
		if(params.classId){
			retrieveParams.CLASSID=params.classId;
		}

		if(params.title){
			retrieveParams.TITLE=params.title;
		}

		if(params.time){
			retrieveParams.TIME=params.time;
		}

		if(params.location){
			retrieveParams.LOCATION=params.location;
		}

		if(params.room){
			retrieveParams.ROOM=params.room;
		}

		if(params.department){
			retrieveParams.DEPARTMENT=params.department;
		}

		if(params.professor){
			retrieveParams.PROFESSOR=params.professor;
		}

		knex(tableName).where(retrieveParams).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:error.where.whereUnsuccessful})
			}else{
				console.log(response);
				return callback(null,response);
			}
		});
	},

	update:function(query,params,callback){

		var retrieveParams={};
		var queryParams={};

		//Update Parameters 
		if(params.classId){
			retrieveParams.CLASSID=params.classId;
		}

		if(params.title){
			retrieveParams.TITLE=params.title;
		}

		if(params.time){
			retrieveParams.TIME=params.time;
		}

		if(params.location){
			retrieveParams.LOCATION=params.location;
		}

		if(params.room){
			retrieveParams.ROOM=params.room;
		}

		if(params.department){
			retrieveParams.DEPARTMENT=params.department;
		}


		if(params.professor){
			retrieveParams.PROFESSOR=params.professor;
		}

		// Query Parameters 
		if(query.classId){
			queryParams.CLASSID=query.classId;
		}

		if(query.title){
			queryParams.TITLE=query.title;
		}

		if(query.time){
			queryParams.TIME=query.time;
		}

		if(query.location){
			queryParams.LOCATION=query.location;
		}

		if(query.room){
			queryParams.ROOM=query.room;
		}

		if(query.department){
			queryParams.DEPARTMENT=query.department;
		}

		if(query.professor){
			queryParams.PROFESSOR=query.professor;
		}	

		//update Operation
		knex(tableName).where(queryParams).update(retrieveParams).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:error.update.updateUnsuccessful})
			}else{
				console.log(response);
				return callback(null);
			}
		});

	},

	delete:function(params,callback){

		var retrieveParams={};
		if(params.classId){
			retrieveParams.CLASSID=params.classId;
		}

		if(params.title){
			retrieveParams.TITLE=params.title;
		}

		if(params.time){
			retrieveParams.TIME=params.time;
		}

		if(params.location){
			retrieveParams.LOCATION=params.location;
		}

		if(params.room){
			retrieveParams.ROOM=params.room;
		}

		if(params.department){
			retrieveParams.DEPARTMENT=params.department;
		}

		if(params.professor){
			retrieveParams.PROFESSOR=params.professor;
		}

		knex(tableName).where(retrieveParams).del().asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:error.where.whereUnsuccessful})
			}else{
				console.log(response);
				return callback(null);
			}
		});
	},

	testGet:function(params,callback){
		var query="select * from (select * from ("+
				   "Select ROUND(AVG(review.RATING),1) as rating , "+
				   "review.BUSINESS_ID as TOP_BUSINESS_ID, COUNT(review.REVIEW_ID) as countReviews,"+
				   "ROUND(ROUND(AVG(review.RATING),1)*COUNT(review.REVIEW_ID)/(select count(*) from REVIEW),4) as hotFactor "+
				   "from REVIEW review "+
   				   "inner join BUSINESS business on business.BUSINESS_ID=review.BUSINESS_ID "+
				   "where business.STATE=(SELECT STATE from USER_INFO where USER_ID=10000251) "+
				   "group by review.BUSINESS_ID "+
				   "order by hotFactor desc "+
				   ") TOP_BUSINESS "+
				   "where rownum<=3) TOP_3_BUSINESS "+
				   "inner join BUSINESS business on business.BUSINESS_ID=TOP_3_BUSINESS.TOP_BUSINESS_ID "+
				   "LEFT join BUSINESS_IMAGE business_image on business_image.BUSINESS_ID=business.BUSINESS_ID " + 
				   "left join IMAGE image on image.IMAGE_ID=business_image.IMAGE_ID";

		console.log(query);

		knex.raw(query).asCallback(function(err,response){
			if(err){
				console.log(err);
				return callback({exception:error.where.whereUnsuccessful})
			}else{
				console.log(response);
				var response1=response;
				async.each(response1,function(file, AsyncCallback){
					console.log(file);
					var query=" select config_tag.TAG_NAME \"tag_name\" FROM BUSINESS_TAG business_tag "+
    						  " INNER join CONFIG_TAG config_tag on config_tag.TAG_ID=business_tag.TAG_ID "+
    						  " where business_tag.BUSINESS_ID="+file.TOP_BUSINESS_ID;
    				knex.raw(query).asCallback(function(err,response1){
    					if(err){
							console.log(err);
							return AsyncCallback({exception:error.where.whereUnsuccessful})
						}else{
							console.log(response1);
							return AsyncCallback(null);
						}
    				});
				},function(err) {
    				if( err ) {
      				 console.log('A file failed to process');
      				 return callback(null,response);
    			} else {
      				console.log('All files have been processed successfully');
      				return callback(null,response);
    			}
    		});
				
			}
		});
	},


}