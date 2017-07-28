/******************************************************************************/
/******************************************************************************/
/**                                                                          **/
/**   Name: Eric Lin                                                         **/
/**   Last Modified: July 27th, 2017                                         **/
/**   File Name: profile.js                                                  **/
/**   Description: JavaScript file for 'profile.html'. Contains the backend  **/
/**   code.                                                                  **/
/**                                                                          **/
/******************************************************************************/
/******************************************************************************/

/******************************************************************************/
/*                            GLOBAL VARIABLES                                */
/******************************************************************************/

var name = "";
var net = 0.0;
var assetsBullets = new Array();
var assetsBulletsWorth = new Array();
var liabilitiesBullets = new Array();

/** 
  * Name:         display_name()
  * Parameters:   None
  * Return:       None
  * Description:  This function will display the current user's name by 
  *               setting the innerText of a div. 
  **/

function display_name()
{
    //TODO
    document.getElementById('profile_name').innerHTML = "Welcome asdfasfs"; //+ name + ",";     
}


/** 
  * Name:         setup_profile()
  * Parameters:   name =  The name of the user
  *               worth = The current net worth of the user. Default is 0 for 
  *                       new users
  * Return:       None
  * Description:  This function will set up the current user's profile such as
  *               name, net worth, etc. 
  **/

function setup_profile(name, worth) 
{
  window.location.href = "profile.html";    
  console.log(name);
  display_name();
}

/** 
  * Name:         add_net()
  * Parameters:   asset = The new asset to add to the current net worth
  * Return:       None
  * Description:  This function will update the current net worth of the
  *               user according to the new asset passed in. 
  **/

function add_net(asset){
  net += parseFloat(asset);
  document.getElementById('profile_worth_text').innerHTML = "$" + net;
}

/** 
  * Name:         add_asset()
  * Parameters:   name = The name of the asset to be added
  *               worth = The worth of the asset to be added
  * Return:       None
  * Description:  This function will update the current assets of the user
  *               in the assets box
  **/

function add_asset (name, worth) {
    var input = document.createElement("P");
    input.style.padding = '15px 15px 15px 15px';
    input.setAttribute("class", "profile_asset_bullet");
    assetsBullets.push(input);
    assetsBulletsWorth.push(worth); 
    input.innerHTML = name;
    input.onmouseover = function(){
      input.innerHTML = "$" + worth;
    }
    input.onmouseout = function(){
      input.innerHTML = name;
    }
    var para = document.getElementById("profile_assets_box");
    var child =  document.getElementById("profile_add_assets_button");
    document.getElementById('profile_assets_placeholder').appendChild(input); 
    para.scrollTop = para.scrollHeight;
}

/** 
  * Name:         add_liabilities()
  * Parameters:   name = The name of the liability to be added
  *               worth = The worth of the liability to be added
  * Return:       None
  * Description:  This function will update the current liabilities of the user
  *               in the liabilities box
  **/

function add_liabilities (name, worth) {
    var input = document.createElement("INPUT");
    input.setAttribute("class", "profile_liabilities_bullet");
    liabilitiesBullets.push(input);
    var para = document.getElementById("profile_liabilities_box");
    var child =  document.getElementById("profile_add_liabilities_button");
    document.getElementById('profile_liabilities_placeholder').appendChild(input);
    para.scrollTop = para.scrollHeight;    
  
}

/** 
  * Name:         remove_asset()
  * Parameters:   None
  * Return:       None
  * Description:  This function will remove the last added asset
  **/

function remove_asset(){
  var element = assetsBullets[assetsBullets.length - 1];
  var elementWorth = assetsBulletsWorth[assetsBulletsWorth.length - 1];
  net -= elementWorth;
  element.parentNode.removeChild(element);
  assetsBullets.splice(assetsBullets.length - 1, 1);
  assetsBulletsWorth.splice(assetsBulletsWorth.length - 1, 1);
  document.getElementById('profile_worth_text').innerHTML = "$" + net;
}

/** 
  * Name:         remove_liabilities()
  * Parameters:   None
  * Return:       None
  * Description:  This function will remove the last added liability
  **/

function remove_liabilities(){
  var element = liabilitiesBullets[liabilitiesBullets.length - 1];
  element.parentNode.removeChild(element);
  liabilitiesBullets.splice(liabilitiesBullets.length - 1, 1);
  update_net();
}

/** 
  * Name:         open_assets_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the assets modal
  **/

function open_assets_modal() {
    var assets_menu = document.getElementById('assets_add_menu');
    assets_menu.style.display = "block";
    show_assets_menu();
}

/** 
  * Name:         close_assets_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will close the assets modal
  **/

function close_assets_modal() {
    var assets_menu = document.getElementById('assets_add_menu');    
    assets_menu.style.display = "none";
}

/** 
  * Name:         hide_menu()
  * Parameters:   None
  * Return:       None
  * Description:  This function will clear the menu display of
  *               the assets modal
  **/

function hide_assets_menu() {
  var logos = document.getElementsByClassName('modal_logo');
  for (var i = 0; i < logos.length; i++){
    logos[i].style.display = "none";
  }
}

/** 
  * Name:         show_menu()
  * Parameters:   None
  * Return:       None
  * Description:  This function will display the menu of the assets modal
  **/

function show_assets_menu() {
  var others_input = document.getElementsByClassName('salary_input');
  for (var i = 0; i < others_input.length; i++){
    others_input[i].style.display = "none";
    others_input[i].value = "";
  }

  var others_input = document.getElementsByClassName('others_input');
  for (var i = 0; i < others_input.length; i++){
    others_input[i].style.display = "none";
    others_input[i].value = "";
  }

  var logos = document.getElementsByClassName('modal_logo');
  for (var i = 0; i < logos.length; i++){
    logos[i].style.display = "block";
  }
  hide('assets_modal_back');
}

/** 
  * Name:         open_account()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'account' tab of the assets modal.
  **/

function open_account()
{
  hide_assets_menu();
  show('assets_modal_back');
}

/** 
  * Name:         open_property()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'property' tab of the assets modal.
  **/

function open_property()
{
  hide_menu();
  show('assets_modal_back'); 
}

/** 
  * Name:         open_rent()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'rent' tab of the assets modal.
  **/

function open_rent()
{
  hide_menu();
  show('assets_modal_back');
}

/** 
  * Name:         open_stocks()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'stocks' tab of the assets modal.
  **/

function open_stocks()
{
  hide_menu();
  show('assets_modal_back');
}

/** 
  * Name:         open_salary()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'salary' tab of the assets modal.
  **/


function open_salary()
{
  hide_menu();
  show('assets_modal_back');
  var others_input = document.getElementsByClassName('salary_input');
  for (var i = 0; i < others_input.length; i++)
  {
    others_input[i].style.display = "block";
  }
}

/** 
  * Name:         open_others()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'others' tab of the assets modal.
  **/

function open_others()
{
  hide_menu();
  show('assets_modal_back');
  var others_input = document.getElementsByClassName('others_input');
  for (var i = 0; i < others_input.length; i++)
  {
    others_input[i].style.display = "block";
  }
}

/** 
  * Name:         save_other()
  * Parameters:   None
  * Return:       None
  * Description:  This function will save the 'other asset' the user inputs
  **/

function save_other()
{
  var name = document.getElementById('other_asset_name').value;
  var worth = document.getElementById('other_asset_worth').value;
  if ( name != "" && worth != "")
  {
    add_asset(name, worth);
    add_net(worth);
    close_assets_modal();
  }
}

/** 
  * Name:         show()
  * Parameters:   id = The HTML id of the element to show 
  * Return:       None
  * Description:  This function will show the HTML elements of the passed in id
  **/

function show(id)
{
  document.getElementById(id).style.display = "block";
}

/** 
  * Name:         hide()
  * Parameters:   id = The HTML id of the element to hide 
  * Return:       None
  * Description:  This function will hide the HTML elements of the passed in id
  **/

function hide(id)
{
  document.getElementById(id).style.display = "none";
}

/** 
  * Name:         signout()
  * Parameters:   None
  * Return:       None
  * Description:  This function will sign a user out of their account
  *               and return them to the login page. All data of
  *               their account should be wiped locally. 
  **/

function signout() 
{
  firebase.auth().signOut().then(function() 
  {
    window.location.href = "login.html";      
  }).catch(function(error) 
  {
    //TODO
    // An error happened.
  });
}


function temp_login()
{
  window.location.href = "login.html";
}
//TODO
// Saving these functions for later to see if they can be of use. 

/*
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == assets_menu) {
        var assets_menu = document.getElementById('assets_add_menu');        
        assets_menu.style.display = "none";
    }
}


*/


