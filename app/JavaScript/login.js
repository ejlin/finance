/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**   Name: Eric Lin                                                         **/
/**   Last Modified: July 27th, 2017                                         **/
/**   File Name: login.js                                                    **/
/**   Description: JavaScript file for 'login.html'. Contains the backend    **/
/**   code to manage functionality for a user login.                         **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/


/** 
  * Name:         signup_login()
  * Parameters:   None
  * Return:       None
  * Description:  This function will validate the input the user uses to 
  *               login to an account. If successfully validated, this
  *               function will call the Firebase API to sign the user in
  **/

function signup_login () {
  var email = document.getElementById('login_username').value;
  var password = document.getElementById('login_password').value;
  
  firebase.auth().signInWithEmailAndPassword(email, password).then(function() 
  {
    setup_profile("eric", 0);
  }).catch(function(error) 
  {
  //TODO
  // An error happened.
  });
}
