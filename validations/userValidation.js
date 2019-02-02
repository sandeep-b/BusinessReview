
var _=require("lodash");
var err={
	userIdValidationFailed:"Please provide a valid user"
};

module.exports={
	userIdValidation:function(self,callback){
		if(!_.isNull(self.USER_ID) && _.isInteger(_.parseInt(self.USER_ID)) && self.USER_ID.length>0){
			return callback(null,self);
		}else{

			return callback({exception:err.userIdValidationFailed});
		}
	}
}