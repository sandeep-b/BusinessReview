var knex = require("knex")(sails.config.connections.knexConnectionParameters);
var errorMessage = {
    selectUnsuccessful: "The select was unsucessful.",
    insertUnsuccessful: "The insert was unsucessful.",
    updateUnsuccessful: "The update was unsucessful.",
    deleteUnsuccessful: "The delete was unsucessful."
};

module.exports = {
    create: function (userID, params, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (params.length != 1) {
                    return callback("Incorrect format.");
                }
                if (params[0].ReviewID == null || params[0].ReviewID === "") {
                    return callback("Review ID must be provided.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].CREATE_VOTE >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to vote Review.");
                    }
                });
            },
            function checkLength(callback) {
                //no length check for Review
                return callback(null);
            },
            function checkReview(callback) {
                knex("REVIEW").where({REVIEW_ID: params[0].ReviewID}).asCallback(function (err, resultReviewInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultReviewInfo.length == 0) {
                        return callback("Invalid Review ID.");
                    }
                    return callback(null);
                });
            },
            function createVote(callback) {
                var queryCreateVote = `
                begin
                pack_vote.proc_handle_vote('create', ` + userID + `, ` + params[0].ReviewID + `);
                commit;
                end;
                `;
                knex.raw(queryCreateVote).asCallback(function (err, result) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.insertUnsuccessful);
                    }
                    return callback(null, "Vote was created.");
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

    delete: function (userID, query, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (query.ReviewID == null) {
                    return callback("Review ID must be provided.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].DELETE_VOTE >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to detele Review.");
                    }
                });
            },
            function deleteVote(callback) {
                var queryDeleteVote = `
                begin
                pack_vote.proc_handle_vote('delete', ` + userID + `, ` + query.ReviewID + `);
                commit;
                end;
                `;
                knex.raw(queryDeleteVote).asCallback(function (err, result) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.deleteUnsuccessful);
                    }
                    return callback(null, "Vote was deleted.");
                });
            }
        ], function (err, response) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, response);
            }
        });
    }
};
