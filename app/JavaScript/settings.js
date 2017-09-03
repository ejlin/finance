/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**   Name: Eric Lin                                                         **/
/**   Last Modified: July 27th, 2017                                         **/
/**   File Name: settings.js                                                 **/
/**   Description: JavaScript file for 'settings.html'. Contains the backend **/
/**   code.                                                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/*                            GLOBAL VARIABLES                                */
/******************************************************************************/

var curr_user;

function setup_settings()
{
  firebase.auth().onAuthStateChanged(function(user)
  {
    if (user)
    {
      curr_user = user;
    }
  });
}

function load_profile()
{
  window.location.href = "profile.html";
}

function change_successful_helper(element, element_button)
{
  element.style.transition = "0.5s";
  element.value = "Saved";
  element.style.width = "85%";
  element_button.style.display = "none";
  element.onclick = function()
  {
    element.style.transition = "0s";
    element.style.width = "78%";
    element.value = "";
    element_button.style.display = "block";
  }
}

function change_successful(type)
{
  switch(type)
  {
    case "First Name":
      var element = document.getElementById('first_name_input');
      var element_button = document.getElementById('first_name_input_button');
      change_successful_helper(element, element_button);
      break;
    case "Last Name":
      var element = document.getElementById('last_name_input');
      var element_button = document.getElementById('last_name_input_button');
      change_successful_helper(element, element_button);
      break;
    case "Email":
      var element = document.getElementById('email_input');
      var element_button = document.getElementById('email_input_button');
      change_successful_helper(element, element_button);
      break;
    case "Password":
      var element = document.getElementById('confirm_password_input');
      var element_button = document.getElementById('confirm_password_button');
      change_successful_helper(element, element_button);
      break;
    default:
      break;
  }
  console.log(type + " successful");
}

function update(type)
{
  var updates = {};
  var to_change_value;

  switch(type)
  {
    case 'first_name':
      to_change_value = document.getElementById('first_name_input').value;
      if (to_change_value != "")
      {
        updates['/users/' + curr_user.uid + '/first_name/'] = to_change_value;
        change_successful("First Name");
      }
      else
      {
        //TODO: ERROR MESSAGE
      }
      break;
    case 'last_name':
      to_change_value = document.getElementById('last_name_input').value;
      if (to_change_value != "")
      {
        updates['/users/' + curr_user.uid + '/last_name/'] = to_change_value;
        change_successful("Last Name");
      }
      else
      {
          //TODO: ERROR MESSAGING
      }
      break;
    case 'email':
      to_change_value = document.getElementById('email_input').value;
      if (to_change_value != "")
      {
        open_confirm_password_modal('email');
      }
      else
      {
        //TODO: ERROR MESSAGING
      }
      break;
    case 'password':
      to_change_value = document.getElementById('password_input').value;
      var confirm_password_value = document.getElementById('confirm_password_input').value;
      if (to_change_value != confirm_password_value || to_change_value == "")
      {
        return;
      }
      else
      {
        open_confirm_password_modal('password');
      }
    default:
      break;
  }

  return database.ref().update(updates);
}

function confirm_password_show()
{
  var elements = document.getElementsByClassName('confirm_password_hide');
  for (var i = 0; i < elements.length; i++)
  {
    elements[i].style.display = "block";
  }
}

window.onclick = function(event) {
  var password = document.getElementById('password_input');
  var confirm_password = document.getElementById('confirm_password_input');
  var confirm_password_button = document.getElementById('confirm_password_button');
  var reauthenticate_modal = document.getElementById('confirm_password_menu');

  if (event.target == password || event.target == confirm_password || event.target == confirm_password_button || reauthenticate_modal.style.display == "block") {
    return;
  }
  var elements = document.getElementsByClassName('confirm_password_hide');
  for (var i = 0; i < elements.length; i++)
  {
    elements[i].style.display = "none";
  }
  password.value = "";
  confirm_password.value = "";
}

function open_confirm_password_modal(type)
{
  show('confirm_password_menu');
  var confirm_password_modal = document.getElementsByClassName('confirm_password_modal');
  for (var i = 0; i < confirm_password_modal.length; i++)
  {
    confirm_password_modal[i].style.display = "block";
  }
  var save_button = document.getElementById('reauthenticate_button');
  save_button.onclick = function()
  {
    authenticate(type);
  }
}

function authenticate(type)
{
  var pass = document.getElementById('confirm_password_input_modal');
  var pass_value = pass.value;

  try
  {
    const user = firebase.auth().currentUser;
    const credentials = firebase.auth.EmailAuthProvider.credential(
      user.email,
      pass_value
    );
    user.reauthenticateWithCredential(credentials).then(function() {
      if (type == 'password')
      {
        var new_password = document.getElementById('password_input').value;
        if (new_password == "")
        {
          return;
        }
        user.updatePassword(new_password).then(function()
        {
          hide('confirm_password_menu');
          var pass = document.getElementById('confirm_password_input_modal');
          var new_pass = document.getElementById('password_input');
          var confirm_new_pass = document.getElementById('confirm_password_input');
          new_pass.value = "";
          confirm_new_pass.value = "";
          pass.value = "";
          return;
        }).catch(function(error)
        {
        });
      }
      else if (type == 'email')
      {
        var new_email = document.getElementById('email_input').value;
        if (new_email == "")
        {
          return;
        }
        user.updateEmail(new_email).then(function()
        {
          hide('confirm_password_menu');
          var updates = {};
          const user = firebase.auth().currentUser;
          var pass = document.getElementById('confirm_password_input_modal');
          pass.value = "";
          updates['/users/' + user.uid + '/email/'] = new_email;
          return database.ref().update(updates);
        }).catch(function(error)
        {
        });
      }
    }).catch(function(error) {
    });

  }
  catch(err)
  {
    pass_value = "";
    pass.style.color = "red";
  }
}
