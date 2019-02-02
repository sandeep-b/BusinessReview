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
                if (query.City == null) {
                    return callback("City must be provided.");
                }
                if (query.State == null) {
                    return callback("State must be provided.");
                }
                return callback(null);
            },
            function checkUserPermission(callback) {
                knex("VIEW_USER_PERMISSION").where({USER_ID: userID}).asCallback(function (err, resultUserPermission) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    if (resultUserPermission[0].SEARCH_BUSINESS >= 1) {
                        return callback(null);
                    } else {
                        return callback("No permission to search Business.");
                    }
                });
            },
            function retrieveBusiness(callback) {
                console.log(query.PriceRange);
                var city = query.City.toLowerCase();
                var state = query.State.toLowerCase();
                var findDesc = query.FindDesc == null ? "" : query.FindDesc.toLowerCase().replace("+", " ");
                var tagList = query.Tag == null ? [] : query.Tag.toLowerCase().replace("+", " ").split(",");
                //var priceRangeList = query.PriceRange == null ? [] : query.PriceRange.split(",");
                var priceRangeList = query.PriceRange? query.PriceRange:[];
                var pageNumber = query.Page == null ? 1 : query.Page;
                var pageSize = query.PageSize == null ? 100 : (query.PageSize > 100 ? 100 : query.PageSize);
                var nameAndTagCondition = "";
                if (findDesc != "" || tagList.length > 0) {
                    nameAndTagCondition += "and (business_id in (select distinct business_id from business_tag where tag_id in (select tag_id from config_tag where lower(tag_name) ";
                    if (tagList.length > 0) {
                        nameAndTagCondition += "in ('" + tagList[0] + "'";
                        for (var i = 1; i < tagList.length; i++) {
                            nameAndTagCondition += ", '" + tagList[i] + "'";
                        }
                        nameAndTagCondition += ")))";
                    } else {
                        nameAndTagCondition += "like '%" + findDesc + "%'))";
                    }
                    if (findDesc != "") {
                        if (tagList.length > 0) {
                            nameAndTagCondition += " and ";
                        } else {
                            nameAndTagCondition += " or ";
                        }
                        nameAndTagCondition += "lower(business_name) like '%" + findDesc + "%'";
                    }
                    nameAndTagCondition += ")";
                }
                var priceRangeCondtion = "";
                if (priceRangeList.length > 0) {
                    priceRangeCondtion += "and price_range in ('" + priceRangeList[0] + "'";
                    for (var i = 1; i < priceRangeList.length; i++) {
                        priceRangeCondtion += ", '" + priceRangeList[i] + "'";
                    }
                    priceRangeCondtion += ")";
                }
                var orderCondition = "";
                if (query.OrderBy == 2) {
                    orderCondition = "order by average_rating desc";
                } else if (query.OrderBy == 3) {
                    orderCondition = "order by review_count desc";
                }
                var queryGetBusiness = `
                select t.*,
                image.image_url
                from
                (select b.*
                from
                (select a.*, rownum rn
                from
                (select
                business.*,
                (select count(*) from review where review.business_id = business.business_id) as review_count,
                (select round(nvl(avg(rating), 0), 1) from review where review.business_id = business.business_id) as average_rating,
                count(*) over () row_count
                from business
                where lower(city) = '` + city + `'
                and lower(state) = '` + state + `'
                ` + nameAndTagCondition + `
                ` + priceRangeCondtion + `
                ` + orderCondition + `
                ) a
                where rownum <= ` + pageNumber + ` * ` + pageSize + `
                ) b
                where b.rn > (` + pageNumber + ` - 1) * ` + pageSize + `
                ) t
                left join business_image
                on business_image.business_id = t.business_id
                left join image
                on image.image_id = business_image.image_id
                order by t.rn asc
                `;

                console.log(queryGetBusiness);

                knex.raw(queryGetBusiness).asCallback(function (err, resultBusinessInfo) {
                    if (err) {
                        console.log(err);
                        return callback(errorMessage.selectUnsuccessful);
                    }
                    var businessIDList = [];
                    for (var i = 0; i < resultBusinessInfo.length; i++) {
                        businessIDList.push(resultBusinessInfo[i].BUSINESS_ID);
                    }
                    return callback(null, resultBusinessInfo, businessIDList);
                });
            },
            function retrieveBusinessTag(resultBusinessInfo, businessIDList, callback) {
                if (businessIDList.length > 0) {
                    knex("VIEW_BUSINESS_TAG").whereIn("BUSINESS_ID", businessIDList).asCallback(function (err, resultBusinessTag) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        return callback(null, resultBusinessInfo, businessIDList, resultBusinessTag);
                    });
                } else {
                    return callback(null, resultBusinessInfo, businessIDList, []);
                }
            },
            function retrieveNewestReview(resultBusinessInfo, businessIDList, resultBusinessTag, callback) {
                if (businessIDList.length > 0) {
                    var idInCondition = "'" + businessIDList[0] + "'";
                    for (var i = 1; i < businessIDList.length; i++) {
                        idInCondition += ", '" + businessIDList[i] + "'";
                    }
                    var queryGetReview = `
                    select t.*,
                    image.image_url
                    from
                    (select a.*
                    from
                    (select review.*, row_number() over (partition by business_id order by creation_time desc) as rn
                    from review
                    where business_id in (` + idInCondition + `)
                    ) a
                    where a.rn = 1
                    ) t
                    left join user_image
                    on user_image.user_id = t.user_id
                    left join image
                    on image.image_id = user_image.image_id
                    `;
                    
                    console.log(queryGetReview);

                    knex.raw(queryGetReview).asCallback(function (err, resultReview) {
                        if (err) {
                            console.log(err);
                            return callback(errorMessage.selectUnsuccessful);
                        }
                        return callback(null, resultBusinessInfo, resultBusinessTag, resultReview);
                    });
                } else {
                    return callback(null, resultBusinessInfo, resultBusinessTag, []);
                }
            },
            function generateJson(resultBusinessInfo, resultBusinessTag, resultReview, callback) {
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
                        BusinessTag: [],
                        Review: [],
                        RowCount: resultBusinessInfo[i].ROW_COUNT
                    });
                    for (var j = 0; j < resultBusinessTag.length; j++) {
                        if (json[i].BusinessID == resultBusinessTag[j].BUSINESS_ID) {
                            json[i].BusinessTag.push({
                                TagID: resultBusinessTag[j].TAG_ID,
                                TagName: resultBusinessTag[j].TAG_NAME
                            });
                        }
                    }
                    for (var j = 0; j < resultReview.length; j++) {
                        if (json[i].BusinessID == resultReview[j].BUSINESS_ID) {
                            json[i].Review.push({
                                ReviewID: resultReview[j].REVIEW_ID,
                                UserID: resultReview[j].USER_ID,
                                BusinessID: resultReview[j].BUSINESS_ID,
                                Rating: resultReview[j].RATING,
                                Text: resultReview[j].TEXT,
                                ModificationTime: dateFormat(resultReview[j].MODIFICATION_TIME),
                                CreationTime: dateFormat(resultReview[j].CREATION_TIME),
                                UserImageURL: resultReview[j].IMAGE_URL
                            });
                        }
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
