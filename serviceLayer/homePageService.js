'use strict'

var _=require("lodash");
var utils=require("../utils/utils.js");
var async=require("async");
var userValidation=require("../validations/userValidation.js");
var errorMessage={
    top3BusinessUnsuccessful:"Could not find top 3 reviews for a given user"
}
var UserAcessToken=require("./userAccessTokenService.js");
var knex=require('knex')(sails.config.connections.knexConnectionParameters);

class HomePageService{

    top3Business(headerParams,params,callback){
        var self=this;
        var userAcessToken=new UserAcessToken();
        self.USER_ID=params.USER_ID;
        self.TOKEN=params.TOKEN;
        self.headerParams=headerParams;

        async.waterfall([
            async.apply(userIdValidation,self),
            userAcessToken.findBasedOnHeaderParameters,
            findTop3Business,
            getTagsForTheTopThreeBusiness,
            findTop3BusinessResponse
            ],function(err,response){
                if(err){
                    return callback({exception:err.exception});
                }else{
                    return callback(null,response);
                }
            });
    }

    top3Review(headerParams,params,callback){
        var self=this;
        var userAcessToken=new UserAcessToken();
        self.USER_ID=params.USER_ID;
        self.TOKEN=params.TOKEN;
        self.headerParams=headerParams;

         async.waterfall([
            async.apply(userIdValidation,self),
            userAcessToken.findBasedOnHeaderParameters,
            findTop3Review
            ],function(err,response){
                if(err){
                    return callback({exception:err.exception});
                }else{
                    return callback(null,response);
                }
            });
    }

}

module.exports=HomePageService;

function userIdValidation(self,callback){

   userValidation.userIdValidation(self,function(err,response){
    if(err){
        return callback({exception:err.exception});
    }else{
        return callback(null,self);
    }
});
}

function findTop3Business(self,callback){

var query=" select "+
    "TOP_3_BUSINESS.RATING \"Rating\", TOP_3_BUSINESS.TOP_BUSINESS_ID  \"Business_ID\","+
    "TOP_3_BUSINESS.COUNTREVIEWS \"CountReviews\","+
    "business.BUSINESS_NAME \"Business_Name\","+
    "business.PRICE_RANGE \"Price_Range\","+
    "business.CREATION_TIME \"Creation_Time\","+
    "image.IMAGE_URL \"Image_Url\" "+
    " from (select * from ( "+
      " Select ROUND(AVG(review.RATING),1) as rating , "+
      " review.BUSINESS_ID as TOP_BUSINESS_ID, COUNT(review.REVIEW_ID) as countReviews, "+
      " ROUND(ROUND(AVG(review.RATING),1)*COUNT(review.REVIEW_ID)/(select count(*) from REVIEW),4) as hotFactor "+
      " from REVIEW review "+
      " inner join BUSINESS business on business.BUSINESS_ID=review.BUSINESS_ID "+
      " where business.STATE=(SELECT STATE from USER_INFO where USER_ID="+self.USER_ID+") "+
      " group by review.BUSINESS_ID "+
      " order by hotFactor desc "+ 
      " ) TOP_BUSINESS "+ 
" where rownum<=3) TOP_3_BUSINESS "+
" inner join BUSINESS business on business.BUSINESS_ID=TOP_3_BUSINESS.TOP_BUSINESS_ID"+
" LEFT join BUSINESS_IMAGE business_image on business_image.BUSINESS_ID=business.BUSINESS_ID"+
" left join IMAGE image on image.IMAGE_ID=business_image.IMAGE_ID";

console.log(query);

knex.raw(query).asCallback(function(err,response){
    if(err){
        console.log(err);
        return callback({exception:errorMessage.top3BusinessUnsuccessful});
    }else{
        console.log(response);
        self.top3Business=response;
        return callback(null,self);
    }
});
}

function getTagsForTheTopThreeBusiness(self,callback){
    var Tags=[];
    var index=0;

    async.each(self.top3Business,function(top3Business_detail,asyncCallback){

        var query=" select config_tag.TAG_NAME \"tag_name\" FROM BUSINESS_TAG business_tag "+
        " INNER join CONFIG_TAG config_tag on config_tag.TAG_ID=business_tag.TAG_ID "+
        " where business_tag.BUSINESS_ID="+top3Business_detail.Business_ID;

        knex.raw(query).asCallback(function(err,getTagResponse){
            if(err){
                console.log(err);
                return asyncCallback({exception:errorMessage.top3BusinessUnsuccessful})
            }else{
                self.top3Business[index].Tags=getTagResponse;
                index++;
                return asyncCallback(null);
            }
        });
    },function(err) {
        if(err) {
           return callback({exception:err.exception});
       } else {
        return callback(null,self);
    }
  });
}

function findTop3BusinessResponse(self,callback){
    var top3Business={};
    top3Business.Business=self.top3Business;
    return callback(null,top3Business.Business);
}

function findTop3Review(self,callback){

    var query="select * from( "+
              "select review.REVIEW_ID as \"Review_Id\", "+
              "review.USER_ID as \"User_Id\","+ 
              "review.BUSINESS_ID as \"Business_Id\","+
              "review.RATING as \"Rating\","+
              "review.TEXT as \"Text\","+
              "business.BUSINESS_NAME as \"Business_Name\","+
              "review.CREATION_TIME as \"Creation_Time\","+
              "user_info.FIRST_NAME||' '||nvl(user_info.LAST_NAME,'') as \"FullName\","+
              "(Select COUNT(*) from REVIEW where USER_ID=user_info.USER_ID) as \"CountReview\", "+
              "image.IMAGE_URL as \"ImageUrl\" "+
              "from REVIEW review "+
              " inner join BUSINESS business on business.BUSINESS_ID=review.BUSINESS_ID "+
              " inner join USER_INFO user_info on user_info.USER_ID=REVIEW.USER_ID "+
              " left join USER_IMAGE user_image on user_image.USER_ID=user_info.USER_ID"+
              " left join IMAGE image on image.IMAGE_ID=user_image.IMAGE_ID"+
              " where user_info.STATE=(SELECT STATE from USER_INFO where USER_ID="+self.USER_ID+") "+
              " and review.USER_ID!="+self.USER_ID+" "+
              " order by review.CREATION_TIME desc, review.RATING desc "+
              " ) TOP_3_REVIEWS "+
              " where rownum<=3 ";

console.log(query);

knex.raw(query).asCallback(function(err,response){
    if(err){
        console.log(err);
        return callback({exception:errorMessage.top3BusinessUnsuccessful});
    }else{
        console.log(response);
        self.top3Reviews=response;
        return callback(null,self.top3Reviews);
    }
 });

}
