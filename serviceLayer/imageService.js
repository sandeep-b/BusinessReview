'use strict';

var _=require("lodash");
var utils=require("../utils/utils.js");
var fileValidation=require("../validations/fileValidation.js");
var businessValidation=require("../validations/businessValidation.js");
var userValidation=require("../validations/userValidation.js");

var UserAcessToken=require("./userAccessTokenService.js");
var BusinessService=require("./businessService.js");
var UserService=require("./userService.js");
var UserImageService=require("./userImageService.js");
var BusinessImageService=require("./businessImageService.js");
var BusinessOwnershipService=require("./businessOwnershipService.js");
var S3Service=require("./s3Service.js");
var Chance = require('chance');
var chance = new Chance();
var md5 = require('md5');
var Promise = require('bluebird');

var errorMessages={
    imageValidationFailed:"The given image is not valid.",
    imageNotPresent:"The given image is not present",
    imageUpdateNotSuccessful:"The given image could not be updated."
}

var knex=require('knex')(sails.config.connections.knexConnectionParameters);
var tableName="IMAGE";

class ImageService {

    upload(headerParams,params,callback){

        var self=this;
        var s3Service=new S3Service();
        var userAcessToken=new UserAcessToken();
        self.USER_ID=params.USER_ID;
        self.BUSINESS_ID=params.BUSINESS_ID;
        self.IMAGE=params.IMAGE;
        self.headerParams=headerParams;

        if(self.IMAGE.isNoop){
            self.IMAGE.upload(function() {});
            return callback({exception:errorMessages.imageNotPresent});
        }

        if(!self.IMAGE.isNoop){
            self.FILENAME = self.IMAGE._files[0].stream.filename;
            self.FILESIZEINBYTES = self.IMAGE._files[0].stream.byteCount;
            self.FILEEXTENSIONVALUE = utils.getFileExtension(self.FILENAME);
            console.log(self.FILESIZEINBYTES);
        }
        
        async.waterfall([
            async.apply(imageValidation,self),
            userAcessToken.findBasedOnHeaderParameters,
            decisionOnTypeOfImageUpload,
            basicValidationForImageUpload,
            businessOwnerValidation,
            idValidationForImageUpload,
            imagePresenceValidation,
            getImageURL,
            s3Service.removeFileFromS3,
            fileNameGeneration,
            s3Service.uploadFile,
            imageTableUpdatesAfterUpload,
            imageUploadResponse
            ],function(err,response){
                if(err){
                    return callback({exception:err.exception});
                }else{
                    return callback(null,response);
                }
            });

    }

    find(self,callback){

        console.log(self.userImagePresent+" "+ self.businessImagePresent);

        if(self.userImagePresent || self.businessImagePresent){
           knex(tableName).where({IMAGE_ID:self.imageDetails.IMAGE_ID}).asCallback(function(err,response){
            if(err){
                console.log(err);
                return callback({exception:errorMessages.userNotPresent})
            }else{
                self.imageDetails.IMAGE_URL=response[0].IMAGE_URL;
                return callback(null,self);
            }
        }); 
       }else{
        self.imageDetails={};
        self.imageDetails.IMAGE_ID=undefined;
        return callback(null,self);
    }
   }
}

module.exports = ImageService;

function imageValidation(self,callback){
    fileValidation.fileValidation(self.FILESIZEINBYTES,self.FILEEXTENSIONVALUE,function(status){
        if(status){
            console.log(status);
            return callback(null,self);
        }else{
            self.IMAGE.upload(function() {});
            return callback({exception:errorMessages.imageValidationFailed});
        }
    });
}

function decisionOnTypeOfImageUpload(self,callback){
    console.log("enterd 2");
    if(self.USER_ID && !self.BUSINESS_ID){
        self.userImageUpload=true;
    }else {
        self.businessImageUpload=true;
    }
    return callback(null,self);
}

function basicValidationForImageUpload(self,callback){
    if(self.businessImageUpload){

        businessValidation.businessIdValidation(self,function(err,response){
            if(err){
                return callback({exception:err.exception});
            }else{
                return callback(null,self);
            }
        });

    }else if(self.userImageUpload){

     userValidation.userIdValidation(self,function(err,response){
        if(err){
            return callback({exception:err.exception});
        }else{
            return callback(null,self);
        }
    });

  }
}

function businessOwnerValidation(self,callback){
    if(self.USER_ID && self.BUSINESS_ID){
        var businessOwnershipService=new BusinessOwnershipService();
        var params={
            OWNER_ID:parseInt(self.USER_ID),
            BUSINESS_ID:self.BUSINESS_ID
        };
        businessOwnershipService.find(params,function(err,response){
            if(err){
                return callback({exception:err.exception});
            }else{
                return callback(null,self);
            }
        });
    }else {
        return callback(null,self)
    }
}

function idValidationForImageUpload(self,callback){
    if(self.userImageUpload){

        self.userParams={
            USER_ID:self.USER_ID
        };

        var userService=new UserService();

        userService.find(self,function(err,response){
            if(err){
                return callback({exception:err.exception});
            }else{
                return callback(null,response);
            }
        });

    }else if(self.businessImageUpload){

     self.businessParams={
        BUSINESS_ID:self.BUSINESS_ID
    };

    var businessService=new BusinessService();

    businessService.find(self,function(err,response){
        if(err){
            return callback({exception:err.exception});
        }else{
            return callback(null,response);
        }
    });
} 
}

function imagePresenceValidation(self,callback){
    if(self.userImageUpload){

        self.userImageParams={
            USER_ID:self.USER_ID
        };

        var userImageService=new UserImageService();
        userImageService.find(self,function(error,response){
            if(error){
                return callback({exception:error.exception});
            }else if(response.imagePresent){
                response.userImagePresent=true;
                return callback(null,response);
            }else{
               response.userImagePresent=false;
               return callback(null,response); 
            }
        });
    }else if(self.businessImageUpload){

       self.businessImageParams={
        BUSINESS_ID:self.BUSINESS_ID
    };

    var businessImageService=new BusinessImageService();
    businessImageService.find(self,function(error,response){
        if(error){
            return callback({exception:error.exception});
        }else if(response.imagePresent){
            response.businessImagePresent=true;
            return callback(null,response);
        }else if(!response.imagePresent){
            response.businessImagePresent=false;
            return callback(null,response); 
        }
    });
}
}

function getImageURL(self,callback){
    var imageService=new ImageService();
    imageService.find(self,function(err,response){
        if(err){
            return callback({exception:err.exception});
        }else{
            return callback(null,response);
        }
    });
}


function fileNameGeneration(self,callback){
    var randomKey = chance.string({
        length: 5,
        pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    });


    if(self.USER_ID && !self.BUSINESS_ID){
        self.s3fileName="user"+md5(self.USER_ID)+randomKey+"."+self.FILEEXTENSIONVALUE;

    }else{
        self.s3fileName="business"+md5(self.BUSINESS_ID)+randomKey+"."+self.FILEEXTENSIONVALUE;       
    }
    return callback(null,self);
}

function imageTableUpdatesAfterUpload(self,callback){
    if(!_.isUndefined(self.imageDetails.IMAGE_ID)){
            // WE need to update only the image Table
            knex.table(tableName)
            .where({IMAGE_ID:self.imageDetails.IMAGE_ID})
            .update({IMAGE_URL:decodeURI(self.uploadedFiles[0].extra.Location)})
            .asCallback(function(err, rows){
                if(err){
                    return callback({exception:errorMessages.imageUpdateNotSuccessful})
                }else{
                    return callback(null,self)
                }
            });

        }else{
            // we need to create a new entry into image table and then based on user image or business image, we need to update the corresponding tables
            knex.transaction(function(trx) {

              knex.insert({IMAGE_URL:decodeURI(self.uploadedFiles[0].extra.Location)})
              .into(tableName)
              .transacting(trx)
              .returning(["IMAGE_URL","IMAGE_ID"])
              .then(function(response){
                var imgResponse=response[0];
                console.log(imgResponse);

                if(self.USER_ID && !self.BUSINESS_ID){

                    return knex.insert({USER_ID:self.USER_ID,IMAGE_ID:imgResponse.IMAGE_ID})
                    .into("USER_IMAGE")
                    .transacting(trx);

                }else if(self.BUSINESS_ID){

                 return knex.insert({BUSINESS_ID:self.BUSINESS_ID,IMAGE_ID:imgResponse.IMAGE_ID})
                 .into("BUSINESS_IMAGE")
                 .transacting(trx);
             }

         })
              .then(trx.commit)
              .catch(trx.rollback);
          }).
            then(function(inserts) {
                return callback(null,self);
            })
            .catch(function(error) {
                console.error(error);
                return callback({exception:error})
            });
        }
    }

    function imageUploadResponse(self,callback){
        var image=[{}];
        image[0].ImageId=self.imageDetails.IMAGE_ID,
        image[0].ImageUrl=decodeURI(self.uploadedFiles[0].extra.Location);

        if(self.USER_ID && !self.BUSINESS_ID){
            image[0].UserId=self.USER_ID;
            image[0].BusinessId=null;
        }else{
            image[0].BusinessId=self.BUSINESS_ID;
            image[0].UserId=self.USER_ID;
        }
        
       
        return callback(null,image);
    }

    function find(self,callback) {
        knex(tableName).where(self.imageId).asCallback(function(err,response){
            if(err){
                console.log(err);
                return callback({exception:errorMessages.imageNotPresent})
            }else{
                self.imageParams=response[0];
                return callback(null,self);
            }
        });
    }

