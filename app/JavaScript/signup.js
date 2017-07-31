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
  * Name:         write_user_data()
  * Parameters:   userId = The identifying ID of the user in Firebase
  *               name = The name of the user in Firebase
  *               email = The name of the email in Firebase
  * Return:       None
  * Description:  This function will validate the input the user uses to 
  *               sign up for a new account. If successfully validated, this
  *               function will call the Firebase API to create a new account
  *               in Firebase. 
  **/

function write_user_data(userId, fname, lname, email, pass) {
  database.ref('users/' + userId).set({
    first_name: fname,
    last_name: lname,
    email: email,
    net_worth: 0,
    net_worth_yesterday: 0,
    assets_len : 0,
    liabilities_len : 0
  });
}

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
      write_user_data(user.uid, first_name, last_name, email, password);
      curr_user.updateProfile(
      {
        displayName: name,
        
      }).then(function() 
              {
                window.location.href = "profile.html";
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

