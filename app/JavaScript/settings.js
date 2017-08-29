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
        var user = firebase.auth().currentUser;
        user.updateEmail(to_change_value).then(function() {
          updates['/users/' + curr_user.uid + '/email/'] = to_change_value;
        }).catch(function(error) {
        });
      }
      else
      {
        //TODO: ERROR MESSAGING
      }
      break;
    default:
      break;
  }

  return database.ref().update(updates);
}
