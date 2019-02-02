
var _=require("lodash");
var err={
	businessIdValidationFailed:"Please provide a valid business"
};

module.exports={
	businessIdValidation:function(self,callback){
		if(!_.isNull(self.BUSINESS_ID) && _.isInteger(_.parseInt(self.BUSINESS_ID)) && self.BUSINESS_ID.length>0){
			return callback(null,self);
		}else{

			return callback({exception:err.businessIdValidationFailed});
		}
	}
}