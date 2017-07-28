/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**   Name: Eric Lin                                                         **/
/**   Last Modified: July 27th, 2017                                         **/
/**   File Name: signup.js                                                   **/
/**   Description: JavaScript file for 'signup.html'. Contains the backend   **/
/**   code to manage functionality for a user signup.                        **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/*                            GLOBAL VARIABLES                                */
/******************************************************************************/

var curr_user;

/** 
  * Name:         validate_signup_input()
  * Parameters:   None
  * Return:       None
  * Description:  This function will validate the input the user uses to 
  *               sign up for a new account. If successfully validated, this
  *               function will call the Firebase API to create a new account
  *               in Firebase. 
  **/

function validate_signup_input()
{
  var first_name = document.getElementById('signup_first_name').value;
  var last_name = document.getElementById('signup_last_name').value;
  var email = document.getElementById('signup_email').value;
  var password = document.getElementById('signup_password').value;
  var confirm_password = document.getElementById('signup_confirm_password').value;
  var name = first_name + " " + last_name;
  
  if (password == confirm_password)
  {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) 
    {
      curr_user = firebase.auth().currentUser;
      curr_user.updateProfile(
      {
        displayName: name,
      }).then(function() 
              {
                setup_profile(name, 0);        
              }).catch(function(error) 
              {
                //TODO
                // An error happened.
              });

    },function(error) 
      {
        //TODO
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  }
}

