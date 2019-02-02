var _=require("lodash");

module.exports={
	getFileExtension: function(fullFileName) {
		var fileExtensionArray = fullFileName.split(".");
		var fileExtensionArrayLength = fileExtensionArray.length;
		var fileExtension = fileExtensionArray[fileExtensionArrayLength - 1];
		return (fileExtension.toLowerCase());
	},
}
