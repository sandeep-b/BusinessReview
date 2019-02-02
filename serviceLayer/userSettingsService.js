var knex = require("knex")(sails.config.connections.knexConnectionParameters);
var errorMessage = {
    selectUnsuccessful: "The select was unsucessful.",
    insertUnsuccessful: "The insert was unsucessful.",
    updateUnsuccessful: "The update was unsucessful.",
    deleteUnsuccessful: "The delete was unsucessful."
};
var userMaxLength = {
    FirstName: 50,
    LastName: 50,
    City: 50,
    State: 5
};

var _=require("lodash");

module.exports = {
    retrieve: function (userID, query, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                //no mandatory attribute
                return callback(null);
            },            
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].VIEW_USER_SETTINGS >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to view User Settings.");
                    }
                });
            },
            function retrieveUserInfo(callback) {
                knex("VIEW_USER_INFO").where({USER_ID: userID}).asCallback(function (err, resultUserInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultUserInfo);
                });
            },
            function generateJson(resultUserInfo, callback) {
                var json = [];
                for (var i = 0; i < resultUserInfo.length; i++) {
                    json.push({
                        UserID: resultUserInfo[i].USER_ID,
                        Email: resultUserInfo[i].EMAIL,
                        FirstName: resultUserInfo[i].FIRST_NAME,
                        LastName: resultUserInfo[i].LAST_NAME,
                        City: resultUserInfo[i].CITY,
                        State: resultUserInfo[i].STATE,
                        ModificationTime: dateFormat(resultUserInfo[i].MODIFICATION_TIME),
                        CreationTime: dateFormat(resultUserInfo[i].CREATION_TIME),
                        ImageURL: resultUserInfo[i].IMAGE_URL
                    });
                }
                return callback(null, json);
            }
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    },
    update: function (userID, params, callback) {

        var params=params;
       
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (params.length === 0) {
                    return callback("Incorrect format.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].MODIFY_USER_SETTINGS >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to modify User Settings.");
                    }
                });
            },
            // function checkLength(callback){

            //     if(params[0].FirstName){
            //       if (params[0].FirstName != null && params[0].FirstName !== "") {
            //         if (params[0].FirstName.length > userMaxLength.FirstName) {
            //             return callback("First Name exceeds max length " + userMaxLength.FirstName);
            //         }
            //       }
            //     }


            //    if(params[0].LastName){
            //       if (params[0].LastName != null && params[0].LastName !== "") {
            //         if (params[0].LastName.length > userMaxLength.LastName) {
            //             return callback("Last Name exceeds max length " + userMaxLength.LastName);
            //         }
            //     }
            //    }
                
            //     if(params[0].City){
            //       if (params[0].City != null && params[0].City !== "") {
            //         if (params[0].City.length > userMaxLength.City) {
            //             return callback("City exceeds max length " + userMaxLength.City);
            //         }
            //       }
            //     }
                

            //     if(params[0].State){
            //       if (params[0].State != null && params[0].State !== "") {
            //         if (params[0].State.length > userMaxLength.State) {
            //             return callback("State exceeds max length " + userMaxLength.State);
            //         }
            //       }
            //     }
                
            //     return callback(null);
            // },
            // function getDropOptionList(callback){
            //     knex("CONFIG_DROPDOWN").whereIn("DROP_CATEGORY", ["State"]).asCallback(function (err, resultDropOption) {
            //         if (err) {
            //             console.log(err);
            //             return callback(errorMessage.selectUnsuccessful);
            //         }
            //         var dropOptionList = [];
            //         for (var i = 0; i < resultDropOption.length; i++) {
            //             dropOptionList.push(resultDropOption[i].DROP_CATEGORY.toString() + resultDropOption[i].DROP_OPTION.toString());
            //         }
            //         dropOptionList.sort();
            //         return callback(null, dropOptionList);
            //     });
            // },
            // function checkValueAgainstDropOptionList(dropOptionList, callback) {
            //     if (params[0].State != null && params[0].State !== "") {
            //         if (!isMemberOf(dropOptionList, "State" + params[0].State.toString())) {
            //             return callback("Invalid State.");
            //         }
            //     }
            //     return callback(null);
            // },
            function checkState(callback){

                console.log(params);

                if ('State' in params[0]){
                    var sql=" select * from CONFIG_DROPDOWN config where config.DROP_CATEGORY=\'State\' "+
                        " and DROP_OPTION=\'"+params[0].State+"\'"

                knex.raw(sql).asCallback(function(err,response){
                    if(err || response.length<=0){
                            console.log(err);
                            return callback("The given state is not correct.");
                    }else {
                        return callback(null);
                    }
                }); 
             } else{
                return callback(null);
             }   
         },
            function updateUserInfo(callback) {
                var updateParams = {};
                if (params[0].FirstName != null && params[0].FirstName !== "") {
                    updateParams.FIRST_NAME = params[0].FirstName;
                }
                if (params[0].LastName != null && params[0].LastName !== "") {
                    updateParams.LAST_NAME = params[0].LastName;
                }
                if (params[0].City != null && params[0].City !== "") {
                    updateParams.CITY = params[0].City;
                }
                if (params[0].State != null && params[0].State !== "") {
                    updateParams.STATE = params[0].State;
                }
                if (Object.keys(updateParams).length == 0) {
                    return callback("Nothing to update.");
                }
                knex("USER_INFO").where({USER_ID: userID}).update(updateParams).asCallback(function (err, resultUpdate) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.updateUnsuccessful);
                    }
                    return callback(null, "User Details were updated Successfully");
                });
            }
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    },

  getStates:function (callback){
     var sql=" select * from CONFIG_DROPDOWN config where config.DROP_CATEGORY=\'State\' ";

                knex.raw(sql).asCallback(function(err,response){
                    if(err || response.length<=0){
                            console.log(err);
                            return callback("The given state is not correct.");
                    }else {
                        return callback(null, response);
                    }
                }); 
  },

};

function dateFormat(date) {
    return date == null ? null : (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

//check if key is in ascending order array
function isMemberOf(array, key) {
    var low = 0;
    var high = array.length - 1;
    var middle;
    while (low <= high) {
        middle = Math.floor((low + high) / 2);
        if (array[middle] < key) {
            low = middle + 1;
        } else if (array[middle] > key) {
            high = middle - 1;
        } else {
            return true;
        }
    }
    return false;
}
