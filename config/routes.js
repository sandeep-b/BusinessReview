/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

 module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  'post /dummy':"dummyController.create",
  'get /dummy?':"dummyController.retrieve",
  'put /dummy?':"dummyController.update",
  'delete /dummy?':"dummyController.delete",
  'get /dummy/test':"dummyController.testGet",

  // Business API's
  'get /v1/business?':'BusinessController.findBusiness',
  'get /v1/business/tags?':'BusinessController.findBusinessTags',
  'get /v1/business/reviewDistribution?':'BusinessController.ratingDistributionOfBusiness',
  'get /v1/business/reviews?':'BusinessController.reviewForABusiness',
  'get /v1/business/analysis?':'BusinessAnalysisController.businessAnalysis',
  'get /v1/business/firstReviewer?':'BusinessController.firstReviewer',

  // Dashboard API's
  'get /v1/top3Business':'HomePageController.top3Business',
  'get /v1/top3Reviews':'HomePageController.top3Review',

  // Image Upload API
  'post /v1/image?':'ImageController.upload',
  
  'get /business_details?': 'BusinessDetailsController.retrieve',

  'get /business_settings?': 'BusinessSettingsController.retrieve',
  'post /business_settings?': 'BusinessSettingsController.create',
  'put /business_settings?': 'BusinessSettingsController.update',
  'delete /business_settings?': 'BusinessSettingsController.delete',
  
  'get /user_details?':'UserDetailsController.retrieve',
  
  'get /user_settings?':'UserSettingsController.retrieve',
  'put /user_settings?':'UserSettingsController.update',
  
  'put /change_password?':'ChangePasswordController.update',
  
  'get /edit_review?':"editReviewController.retrieve",
  'post /edit_review?':"editReviewController.create",
  'put /edit_review?':"editReviewController.update",
  'delete /edit_review?':"editReviewController.delete",
  
  'post /vote_review?':"voteReviewController.create",
  'delete /vote_review?':"voteReviewController.delete",
  'post /v1/forgetPassword':"ForgetPasswordController.forgetPassword",

  //'get /login':"loginController.create",
  'post /v1/login?':"loginController.retrieve",
  'put /v1/logout?':"logoutController.update",
  'delete /login?':"loginController.delete",
  'get /search_business?':"searchBusinessController.retrieve",
  'get /v1/business/details?':"BusinessController.getBusiness",
  'get /v1/states':"UserSettingsController.getStates",
  'get /uana?':"Uanalyticsquery1Controller.retrieve",
  'get /uanb?':"Uanalyticsquery2Controller.retrieve",
  'get /uanc?':"Uanalyticsquery3Controller.retrieve",
  'get /tuples?':"Uanalyticsquery1Controller.getTuples",
  'post /v1/signup':"loginController.signUp",
  'get /v1/userTypes':'loginController.getUserTypes'

  

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/


};
