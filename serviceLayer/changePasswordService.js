var knex = require("knex")(sails.config.connections.knexConnectionParameters);
var errorMessage = {
    selectUnsuccessful: "The select was unsucessful.",
    insertUnsuccessful: "The insert was unsucessful.",
    updateUnsuccessful: "The update was unsucessful.",
    deleteUnsuccessful: "The delete was unsucessful."
};
var bcrypt = require("bcrypt");
var passwordMaxLength = {
    Password: 20
};

module.exports = {
    update: function (userID,token,params, callback) {
        var self=this;

        async.waterfall([
            function checkMandatoryAttribute(callback) {
                // if (params.length != 1) {
                //     return callback("Incorrect format.");
                // }
                // if (params[0].CurrentPassword == null || params[0].CurrentPassword === "") {
                //     return callback("Current Password must be provided.");
                // }
                if (params[0].newPassword == null || params[0].newPassword === "" || !'newPassword' in params[0]) {
                    return callback("New Password must be provided.");
                }
                return callback(null);
            },

            function checkLength(callback) {
                if (params[0].newPassword.length > passwordMaxLength.Password) {
                    return callback("New Password exceeds max length " + passwordMaxLength.Password);
                }else{
                    return callback(null);
                }
            },

            function userAuthorisationCheck(callback){

                var sql="select * from VIEW_USER_PERMISSION view_user "+
                        "inner join USER_ACCESS_TOKEN user_access on user_access.USER_ID=view_user.USER_ID "+
                        "where user_access.USER_ID="+userID+" and user_access.TOKEN=\'"+token+"\' and "+
                        "view_user.MODIFY_USER_SETTINGS=1";

                console.log(sql);
                knex.raw(sql).asCallback(function(err,response){
                        if(err || response.length<=0){
                            console.log(err);
                            return callback("The user is not authorised");
                        }else if(response.length>0){
                                return callback(null);
                        }
                });
            },
            function getEmailId(callback){
                var sql="SELECT * from USER_INFO where USER_ID="+userID;

                console.log(sql);
                knex.raw(sql).asCallback(function(err,response){
                        if(err || response.length<=0){
                            console.log(err);
                            return callback({exception:"The user is not valid"});
                        }else if(response.length>0){
                                self.userDetails=response[0];
                                console.log(self.userDetails);
                                return callback(null);
                        }
                });
            },
            function updatePassword(callback){
               var sql="UPDATE USER_LOGIN_DATA SET PASSWORD=\'"+params[0].newPassword+"\' "+
                       "where USER_LOGIN_DATA.USERNAME=\'"+self.userDetails.EMAIL+"\'";

                console.log(sql);
                knex.raw(sql).asCallback(function(err,response){
                        if(err){
                            console.log(err);
                            return callback({exception:"The given email or password is incorrect"});
                        }else if(response){
                                return callback(null,"User Password was updated.");
                        }
                });
           }
            // function checkCurrentPassword(callback) {
            //     knex("USER_CREDENTIAL").where({USER_ID: userID}).asCallback(function (err, resultUserCredential) {
            //         if (err) {
            //             console.log(err);
            //             return callback(errorMessage.selectUnsuccessful);
            //         }
            //         if (resultUserCredential.length == 0) {
            //             return callback("No Password.");
            //         }
            //         var comparePassword = bcrypt.compareSync(params[0].CurrentPassword, resultUserCredential[0].PASSWORD);
            //         if (comparePassword == false) {
            //             return callback("Invalid Current Password.");
            //         }
            //         return callback(null);
            //     });
            // },
            // function updatePassword(callback) {
            //     const saltRounds = 10;
            //     var salt = bcrypt.genSaltSync(saltRounds);
            //     var hash = bcrypt.hashSync(params[0].NewPassword, salt);
            //     knex("USER_CREDENTIAL").where({USER_ID: userID}).update({PASSWORD: hash}).asCallback(function (err, resultUpdate) {
            //         if (err) {
            //             console.log(err);
            //             return callback(errorMessage.updateUnsuccessful);
            //         }
            //         return callback(null, "User Password was updated. User ID: " + userID);
            //     });
            // }

        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    }
};

