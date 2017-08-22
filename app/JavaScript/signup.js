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
    earning_power: 0,
    assets_len : 0,
    liabilities_len : 0,
    companies: ["FB", "AMZN", "AAPL", "NFLX", "GOOGL"]
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
  var toReturn = false;

  var signup_input = document.getElementsByClassName('signup_input');
  for (var i = 0; i < signup_input.length; i++)
  {
    if (signup_input[i].value == "")
    {
      toReturn = true;
      signup_input[i].className += " formInvalid";
    }
  }
  if (toReturn)
  {
    return;
  }

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
                save_date_signup();
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
      });
  }
  else
  {
    password_mismatch();
  }
}

function save_date_signup()
{
  var updates = {};
  var d = new Date();
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  var year = d.getFullYear();
  var day = days[d.getDay()];
  var date = d.getDate();
  var month = d.getMonth();
  month++;
  updates['/users/' + curr_user.uid + '/signup_day/'] = "(MM/DD/YYYY) = " + month + "/" + date + "/" + year + " : " + day;
  return database.ref().update(updates);
}

/**
  * Name:         password_mismath()
  * Parameters:   None
  * Return:       None
  * Description:  This function will take care of the case when the
  *               user inputs two different passwords
  **/

function password_mismatch()
{
  var password = document.getElementById('signup_password');
  var confirm_password = document.getElementById('signup_confirm_password');
  password.value = "";
  confirm_password.value = "";
  confirm_password.className += " formInvalid";
  confirm_password.placeholder = "Passwords don't match!";
}

/**
  * Name:         N/A
  * Parameters:   e
  * Return:       None
  * Description:  This function will listen for an Enter key press
  *               which will attempt to sign up the user
  **/

window.onkeyup = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;

   if (key == 13) {
     validate_signup_input();
   }
}
