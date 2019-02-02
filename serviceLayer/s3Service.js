'use strict';

var knox = require('knox');

//client specifications to connect to S3
var client = knox.createClient({
    key: sails.config.connections.s3Credentials.key,
    secret: sails.config.connections.s3Credentials.secret,
    bucket: sails.config.connections.s3Credentials.bucket
});

class S3Service{

    uploadFile(self,callback){

       self.IMAGE.upload({
        saveAs: self.s3fileName,
        adapter: require('skipper-s3'),
        key: sails.config.connections.s3Credentials.key,
        secret: sails.config.connections.s3Credentials.secret,
        bucket: sails.config.connections.s3Credentials.bucket
    }, function whenDone(error, uploadedFiles) {
        if (error) {
            return callback({exception:error});
        }
        self.uploadedFiles=uploadedFiles;
        console.log("s3 File "+ self.USER_ID);
        return callback(null, self);
    });

   }

   removeFileFromS3(self,callback){

       if(self.userImagePresent || self.businessImagePresent){
           var n = self.imageDetails.IMAGE_URL.lastIndexOf('/');
           var fileName = self.imageDetails.IMAGE_URL.substring(n + 1);
           client.deleteFile(fileName, function(error, response) {
            if (error){
                return callback({exception:error});
            }

            else if (response.statusCode != 204) {
                return callback({
                    exception: 'Invalid Status Code.'
                });
            } else{
                console.log(response.statusCode);
                return callback(null,self); 
            }

        });
       }
       else{
         return callback(null,self); 
     }
 }


}

module.exports=S3Service;


