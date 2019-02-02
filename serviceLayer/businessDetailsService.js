var knex = require("knex")(sails.config.connections.knexConnectionParameters);
var errorMessage = {
    selectUnsuccessful: "The select was unsucessful.",
    insertUnsuccessful: "The insert was unsucessful.",
    updateUnsuccessful: "The update was unsucessful.",
    deleteUnsuccessful: "The delete was unsucessful."
};

module.exports = {
    retrieve: function (userID, query, callback) {
        async.waterfall([
            function checkMandatoryAttribute(callback) {
                if (query.BusinessID == null) {
                    return callback("Business ID must be provided.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].VIEW_BUSINESS >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to view Business.");
                    }
                });
            },
            function retrieveBusinessInfo(callback) {
                knex("VIEW_BUSINESS_INFO").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultBusinessInfo.length == 0) {
                        return callback("Invalid Business ID.");
                    }
                    return callback(null, resultBusinessInfo);
                });
            },
            function retrieveBusinessTag(resultBusinessInfo, callback) {
                knex("VIEW_BUSINESS_TAG").where({BUSINESS_ID: query.BusinessID}).asCallback(function (err, resultBusinessTag) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultBusinessTag);
                });
            },
            function retrieveBusinessHour(resultBusinessInfo, resultBusinessTag, callback) {
                knex("VIEW_BUSINESS_HOUR").where({BUSINESS_ID: query.BusinessID}).orderBy("WEEKDAY_ID", "asc").asCallback(function (err, resultBusinessHour) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultBusinessTag, resultBusinessHour);
                });
            },
            function retrieveBusinessAttrText(resultBusinessInfo, resultBusinessTag, resultBusinessHour, callback) {
                knex("VIEW_BUSINESS_ATTR_TEXT").where({BUSINESS_ID: query.BusinessID}).orderBy("ATTR_NAME", "asc").asCallback(function (err, resultBusinessAttrText) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText);
                });
            },
            function retrieveBusinessAttrNumber(resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, callback) {
                knex("VIEW_BUSINESS_ATTR_NUMBER").where({BUSINESS_ID: query.BusinessID}).orderBy("ATTR_NAME", "asc").asCallback(function (err, resultBusinessAttrNumber) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber);
                });
            },
            function retrieveBusinessAttrDate(resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, callback) {
                knex("VIEW_BUSINESS_ATTR_DATE").where({BUSINESS_ID: query.BusinessID}).orderBy("ATTR_NAME", "asc").asCallback(function (err, resultBusinessAttrDate) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, resultBusinessAttrDate);
                });
            },
            function retrieveReview(resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, resultBusinessAttrDate, callback) {
                var pageNumber = query.Page == null ? 1 : query.Page;
                var pageSize = query.PageSize == null ? 10 : (query.PageSize > 100 ? 100 : query.PageSize);
                var orderCondition1, orderCondition2;
                if (query.OrderBy == "2") {
                    orderCondition1 = "rating";
                    orderCondition1 += query.OrderSequence == "1" ? " asc" : " desc";
                    orderCondition2 = "creation_time desc";
                } else {
                    orderCondition1 = "creation_time";
                    orderCondition1 += query.OrderSequence == "1" ? " asc" : " desc";
                    orderCondition2 = "rating desc";
                }
                var queryGetReview = `
                select
                t.*,
                (select count(*) from vote where vote.review_id = t.review_id) as like_count,
                (select count(*) from review where review.user_id = user_info.user_id) as review_count,
                user_info.first_name,
                user_info.last_name,
                user_info.city,
                user_info.state,
                image.image_url
                from
                (select b.*
                from
                (select a.*, rownum rn
                from 
                (select *
                from review
                where business_id = ` + query.BusinessID + `
                order by ` + orderCondition1 + ", " + orderCondition2 + `
                ) a
                where rownum <= ` + pageNumber + ` * ` + pageSize + `
                ) b
                where b.rn > (` + pageNumber + ` - 1) * ` + pageSize + `
                ) t
                left join user_info
                on user_info.user_id = t.user_id
                left join user_image
                on user_image.user_id = user_info.user_id
                left join image
                on image.image_id = user_image.image_id
                order by t.rn asc
                `;
                knex.raw(queryGetReview).asCallback(function (err, resultReview) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    return callback(null, resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, resultBusinessAttrDate, resultReview);
                });
            },
            function getAccessingUserVotedReviewIDList(resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, resultBusinessAttrDate, resultReview, callback) {
                knex("VOTE").where({USER_ID: userID}).select("REVIEW_ID").asCallback(function (err, resultAccessingUserVotedReviewID) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    var accessingUserVotedReviewIDList = [];
                    for (var i = 0; i < resultAccessingUserVotedReviewID.length; i++) {
                        accessingUserVotedReviewIDList.push(resultAccessingUserVotedReviewID[i].REVIEW_ID.toString());
                    }
                    accessingUserVotedReviewIDList.sort();
                    return callback(null, resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, resultBusinessAttrDate, resultReview, accessingUserVotedReviewIDList);
                });
            },
            function generateJson(resultBusinessInfo, resultBusinessTag, resultBusinessHour, resultBusinessAttrText, resultBusinessAttrNumber, resultBusinessAttrDate, resultReview, accessingUserVotedReviewIDList, callback) {
                var json = [];
                for (var i = 0; i < resultBusinessInfo.length; i++) {
                    json.push({
                        BusinessID: resultBusinessInfo[i].BUSINESS_ID,
                        BusinessName: resultBusinessInfo[i].BUSINESS_NAME,
                        AddressLine1: resultBusinessInfo[i].ADDRESS_LINE1,
                        AddressLine2: resultBusinessInfo[i].ADDRESS_LINE2,
                        City: resultBusinessInfo[i].CITY,
                        State: resultBusinessInfo[i].STATE,
                        Zip: resultBusinessInfo[i].ZIP,
                        Phone: resultBusinessInfo[i].PHONE,
                        Website: resultBusinessInfo[i].WEBSITE,
                        Latitude: resultBusinessInfo[i].LATITUDE,
                        Longitude: resultBusinessInfo[i].LONGITUDE,
                        PriceRange: resultBusinessInfo[i].PRICE_RANGE,
                        Status: resultBusinessInfo[i].STATUS,
                        ModificationTime: dateFormat(resultBusinessInfo[i].MODIFICATION_TIME),
                        CreationTime: dateFormat(resultBusinessInfo[i].CREATION_TIME),
                        ImageURL: resultBusinessInfo[i].IMAGE_URL,
                        ReviewCount: resultBusinessInfo[i].REVIEW_COUNT,
                        AverageRating: resultBusinessInfo[i].AVERAGE_RATING,
                        Rating1Count: resultBusinessInfo[i].RATING_1_COUNT,
                        Rating2Count: resultBusinessInfo[i].RATING_2_COUNT,
                        Rating3Count: resultBusinessInfo[i].RATING_3_COUNT,
                        Rating4Count: resultBusinessInfo[i].RATING_4_COUNT,
                        Rating5Count: resultBusinessInfo[i].RATING_5_COUNT,
                        BusinessTag: [],
                        BusinessHour: [],
                        BusinessAttr: [],
                        Review: []
                    });
                    for (var j = 0; j < resultBusinessTag.length; j++) {
                        json[i].BusinessTag.push({
                            TagID: resultBusinessTag[j].TAG_ID,
                            TagName: resultBusinessTag[j].TAG_NAME
                        });
                    }
                    for (var j = 0; j < resultBusinessHour.length; j++) {
                        json[i].BusinessHour.push({
                            HourID: resultBusinessHour[j].HOUR_ID,
                            WeekdayID: resultBusinessHour[j].WEEKDAY_ID,
                            WeekdayName: resultBusinessHour[j].WEEKDAY_NAME,
                            OpenTime: resultBusinessHour[j].OPEN_TIME_TEXT,
                            CloseTime: resultBusinessHour[j].CLOSE_TIME_TEXT
                        });
                    }
                    for (var j = 0; j < resultBusinessAttrText.length; j++) {
                        json[i].BusinessAttr.push({
                            AttrID: resultBusinessAttrText[j].ATTR_ID,
                            AttrName: resultBusinessAttrText[j].ATTR_NAME,
                            AttrValue: resultBusinessAttrText[j].TEXT_VALUE
                        });
                    }
                    for (var j = 0; j < resultBusinessAttrNumber.length; j++) {
                        json[i].BusinessAttr.push({
                            AttrID: resultBusinessAttrNumber[j].ATTR_ID,
                            AttrName: resultBusinessAttrNumber[j].ATTR_NAME,
                            AttrValue: resultBusinessAttrNumber[j].NUMBER_VALUE
                        });
                    }
                    for (var j = 0; j < resultBusinessAttrDate.length; j++) {
                        json[i].BusinessAttr.push({
                            AttrID: resultBusinessAttrDate[j].ATTR_ID,
                            AttrName: resultBusinessAttrDate[j].ATTR_NAME,
                            AttrValue: dateFormat(resultBusinessAttrDate[j].DATE_VALUE)
                        });
                    }
                    for (var j = 0; j < resultReview.length; j++) {
                        json[i].Review.push({
                            ReviewID: resultReview[j].REVIEW_ID,
                            UserID: resultReview[j].USER_ID,
                            BusinessID: resultReview[j].BUSINESS_ID,
                            Rating: resultReview[j].RATING,
                            Text: resultReview[j].TEXT,
                            ModificationTime: dateFormat(resultReview[j].MODIFICATION_TIME),
                            CreationTime: dateFormat(resultReview[j].CREATION_TIME),
                            LikeCount: resultReview[j].LIKE_COUNT,
                            UserFirstName: resultReview[j].FIRST_NAME,
                            UserLastName: resultReview[j].LAST_NAME,
                            UserCity: resultReview[j].CITY,
                            UserState: resultReview[j].STATE,
                            UserReviewCount: resultReview[j].REVIEW_COUNT,
                            UserImageURL: resultReview[j].IMAGE_URL,
                            LikedByAccessingUser: isMemberOf(accessingUserVotedReviewIDList, resultReview[j].REVIEW_ID.toString()) ? "Yes" : "No"
                        });
                    }
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
    }
};

//return date in format m/d/yyyy
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

