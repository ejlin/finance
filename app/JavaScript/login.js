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
  
  if ( email == "" || password == "")
  {
    return;
  }

  if ( email.indexOf('@') == -1)
  {
    email_fail();
    reset_password();
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password).then(function() 
  {
    window.location.href = "profile.html";
  }).catch(function(error) 
  {
    login_fail();
    reset_password();
  });
}

/** 
  * Name:         login_fail()
  * Parameters:   None
  * Return:       None
  * Description:  This function will display an error message on failure
  *               to authenticate their account
  **/

function login_fail()
{
  var fail_text = document.getElementById('login_fail');
  fail_text.innerHTML = "Incorrect email/password combination. Try again";
  fail_text.style.display = "block";
}

/** 
  * Name:         email_fail()
  * Parameters:   None
  * Return:       None
  * Description:  This function will display an error message on failure
  *               to include a valid email address
  **/
  
function email_fail()
{
  var fail_login_username = document.getElementById('login_username');
  
  fail_login_username.value = "";
  fail_login_username.className += " formInvalid";
 
  var fail_text = document.getElementById('login_fail');
  fail_text.innerHTML = "Invalid email. Try again";
  fail_text.style.display = "block";
  
  fail_login_username.onclick = function(){
    fail_login_username.placeholder = "Email";
  }
}

/** 
  * Name:         reset_password()
  * Parameters:   None
  * Return:       None
  * Description:  This function will reset the inputted password form
  **/

function reset_password()
{
  var fail_login_password = document.getElementById('login_password');
  fail_login_password.value = "";
}

/** 
  * Name:         N/A
  * Parameters:   e
  * Return:       None
  * Description:  This function will listen for an Enter key press
  *               which will attempt to login the user
  **/

window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;
   if (key == 13) {
     signup_login();
   }
}
