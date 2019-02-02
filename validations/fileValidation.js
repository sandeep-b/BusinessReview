var _=require("lodash");

var bytes=1024;
var imageFileSizeMin = 0.0009765625; //0.0029296875; // Image File Size Minimum in MB
var imageFileSizeMax = 7.0000000000; //Image file Size Maximum in MB
var supportedImageFormats = ['jpg', 'jpeg', 'png']; // different file extensions supported for Images

module.exports={
	
	fileValidation: function(fileSize, fileExtension,callback) {
        var flag = 0;
        var sizeInMb = parseFloat(fileSize / (bytes * bytes)); //computed size in MB
        var fileExtension = fileExtension.toLowerCase();

        if (sizeInMb > imageFileSizeMax || sizeInMb < imageFileSizeMin) {
            return callback(false);
        } else {
            supportedImageFormats.forEach(function(ext) {
                if (ext === fileExtension) {
                    flag = 1;
                }
            });
            if (flag == 0) {
                return callback(false);
            } else {
                return callback(true);
            }
        }
    },

}