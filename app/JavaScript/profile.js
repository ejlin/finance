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

var curr_user;
var name = "";
var net;
var earning_power;
var assetsLen;
var assetsBullets = new Array();
var assetsBulletsWorth = new Array();
var assetsBulletsType = new Array();
var liabilitiesBullets = new Array();

/** 
  * Name:         setup_profile()
  * Parameters:   name =  The name of the user
  *               worth = The current net worth of the user. Default is 0 for 
  *                       new users
  * Return:       None
  * Description:  This function will set up the current user's profile such as
  *               name, net worth, etc. 
  **/

function setup_profile() 
{
  firebase.auth().onAuthStateChanged(function(user) 
  {
  if (user) 
  {
    curr_user = user;
    document.getElementById('profile_name').innerHTML = "Welcome " + user.displayName + ","; 
    var profile_quick_glance_text = document.getElementById('profile_quick_glance_text').innerHTML;
    //TODO
    var curr_user_net = database.ref('users/' + user.uid + '/net_worth');
      curr_user_net.on('value', function(snapshot) 
      {
      net = snapshot.val();
      document.getElementById('profile_worth_text').innerHTML = "$" + convert_with_commas(parseInt(net));            
    });
    var assets_len = 0;
    var curr_user_assets_len = database.ref('users/' + user.uid + '/assets_len');
    curr_user_assets_len.on('value', function(snapshot) 
    {
      assetsLen = snapshot.val();
      if (assetsLen > assetsBullets.length)
      {
        restore_assets();
      }
    });   
    // User is signed in.
  } else {
    // No user is signed in.
  }
});
}

/** 
  * Name:         restore_assets()
  * Parameters:   assets_len = The length of the user's assets
  * Return:       None
  * Description:  This function will update the current assets of the
  *               user according to the asset length passed in. 
  **/

function restore_assets(){
  var counter = 0;
  while (counter < assetsLen)
  {   
    var curr_user_assets_name = database.ref('users/' + curr_user.uid + '/assets/' + counter + '/name_worth/');
    curr_user_assets_name.once('value', function(snapshot) 
    {
      var str = snapshot.val();
      var name = str.replace(/[0-9]/g, '');
      var worth = parseInt(str);
      restore_asset_bullet(name, worth);
    });
    counter++;
  }
}

/** 
  * Name:         convert_with_commas()
  * Parameters:   num = The number to convert
  * Return:       Returns the number with commas every thousand.
  * Description:  This function will place appropriate commas to resemble actual money
  * Source (Optional): Found at: 
  * "https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript"
  **/

function convert_with_commas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 
  * Name:         add_net()
  * Parameters:   asset = The new asset to add to the current net worth
  * Return:       Returns the update to Firebase
  * Description:  This function will update the current net worth of the
  *               user according to the new asset passed in. 
  **/

function add_net(asset)
{
  net += parseFloat(asset);
  document.getElementById('profile_worth_text').innerHTML = "$" + convert_with_commas(net);
  var updates = {};
  updates['/users/' + curr_user.uid + '/net_worth/'] = net;
  return database.ref().update(updates);  
}

/** 
  * Name:         add_earning_power()
  * Parameters:   asset = The new asset to add to the current earning power
  * Return:       Returns the update to Firebase
  * Description:  This function will update the current earning power of the
  *               user according to the new asset passed in. 
  **/

function add_earning_power(asset)
{
  //TODO
  return;
}

/** 
  * Name:         restore_asset_bullet()
  * Parameters:   name = The name of the asset
  *               worth = The worth of the asset
  * Return:       None
  * Description:  This function will restore existing assets for returning users 
  **/

function restore_asset_bullet(name, worth)
{
  if (assetsLen > assetsBullets.length){
    var input = document.createElement("P");
    input.style.padding = '15px 15px 15px 15px';
    input.setAttribute("class", "profile_asset_bullet");
    assetsBullets.push(input);
    assetsBulletsWorth.push(worth); 
    input.innerHTML = name;
    input.onmouseover = function()
    {
      input.innerHTML = "$" + convert_with_commas(worth);
    }
    input.onmouseout = function()
    {
      input.innerHTML = name;
    }
    var para = document.getElementById("profile_assets_box");
    var child =  document.getElementById("profile_add_assets_button");
    document.getElementById('profile_assets_placeholder').appendChild(input); 
    para.scrollTop = para.scrollHeight;
  }
}

/** 
  * Name:         add_asset()
  * Parameters:   name = The name of the asset to be added
  *               worth = The worth of the asset to be added
  * Return:       None
  * Description:  This function will update the current assets of the user
  *               in the assets box
  **/

function add_asset(name, worth, type) 
{ 
  var input = document.createElement("P");
  input.style.padding = '15px 15px 15px 15px';
  input.setAttribute("class", "profile_asset_bullet");
  assetsBullets.push(input);
  assetsBulletsWorth.push(worth);
  assetsBulletsType.push(type);    
  input.innerHTML = name;
  input.onmouseover = function(){
    input.innerHTML = "$" + convert_with_commas(worth);
  }
  input.onmouseout = function(){
    input.innerHTML = name;
  }
  var para = document.getElementById("profile_assets_box");
  var child =  document.getElementById("profile_add_assets_button");
  document.getElementById('profile_assets_placeholder').appendChild(input); 
  para.scrollTop = para.scrollHeight;
  database.ref('users/' + curr_user.uid + '/assets/' + assetsLen).set({
    name_worth: (worth + name),
  });
  var updates = {};
  updates['/users/' + curr_user.uid + '/assets_len/'] = assetsLen + 1;
  return database.ref().update(updates);
}

/** 
  * Name:         add_liabilities()
  * Parameters:   name = The name of the liability to be added
  *               worth = The worth of the liability to be added
  * Return:       None
  * Description:  This function will update the current liabilities of the user
  *               in the liabilities box
  **/

function add_liabilities (name, worth) 
{
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

function remove_asset()
{
  if (assetsBulletsType[assetsBulletsType.length - 1] != "salary")
  {
    var element = assetsBullets[assetsBullets.length - 1];
    var elementWorth = assetsBulletsWorth[assetsBulletsWorth.length - 1];
    net -= elementWorth;
    element.parentNode.removeChild(element);
    assetsBullets.splice(assetsBullets.length - 1, 1);
    assetsBulletsWorth.splice(assetsBulletsWorth.length - 1, 1);
    assetsBulletsType.splice(assetsBulletsType.length - 1, 1);  
    document.getElementById('profile_worth_text').innerHTML = "$" + convert_with_commas(net);
    database.ref('users/' + curr_user.uid + '/assets/' + (assetsLen - 1)).remove();
    var updates = {};
    updates['/users/' + curr_user.uid + '/net_worth'] = net;
    updates['/users/' + curr_user.uid + '/assets_len/'] = assetsLen - 1;
    return database.ref().update(updates);
  }
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
  * Name:         hide_assets_menu()
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
  * Name:         show_assets_menu()
  * Parameters:   None
  * Return:       None
  * Description:  This function will display the menu of the assets modal
  **/

function show_assets_menu() {
  var others_input = document.getElementsByClassName('property_input');
  for (var i = 0; i < others_input.length; i++){
    others_input[i].style.display = "none";
    others_input[i].value = "";
  }

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
  hide_assets_menu();
  show('assets_modal_back');
  var others_input = document.getElementsByClassName('property_input');
  for (var i = 0; i < others_input.length; i++)
  {
    others_input[i].style.display = "block";
  }
}

/** 
  * Name:         open_rent()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the 'rent' tab of the assets modal.
  **/

function open_rent()
{
  hide_assets_menu();
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
  hide_assets_menu();
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
  hide_assets_menu();
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
  hide_assets_menu();
  show('assets_modal_back');
  var others_input = document.getElementsByClassName('others_input');
  for (var i = 0; i < others_input.length; i++)
  {
    others_input[i].style.display = "block";
  }
}

function read_address_xml(xml)
{
  var i;
  var xmlDoc = xml.responseXML;
  var x = xmlDoc.getElementsByTagName("street");
  console.log(x);  
}

/** 
  * Name:         save_property()
  * Parameters:   None
  * Return:       None
  * Description:  This function will save the 'other asset' the user inputs
  **/

function save_property()
{
  var zillowID = "X1-ZWz193nbeoak97_6wmn8";
  var zillowID = "X1-ZWz193nbeoak97_6wmn8";
  var zillowHTML =  "http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=";
  var zillowAddress = "&address=";
  var zillowCityStateZip = "&citystatezip=";
  var delim = "-";
  var property = document.getElementById('asset_property_name');
  var property_name = property.value;

  var address_id = document.getElementById('asset_address');
  var address = address_id.value;

  var city_id = document.getElementById('asset_city');
  var city = city_id.value;

  var zip_id = document.getElementById('asset_zip');
  var zip = zip_id.value;
  
  var state_id = document.getElementById('asset_state_dropdown');
  var state = state_id.value;
  
  address = address.trim().replace(/[' ']/g, '-');  
  city = city.trim().replace(/[' ']/g, '-');
  var zillowGET = zillowHTML + zillowID + zillowAddress + address + zillowCityStateZip + city + delim + state + delim + zip;  
  if ( property_name != "" && address != "" && city != "" && zip != "" && state != "")
  {
    var myXML = ""
    var request = new XMLHttpRequest();
    request.open("GET", zillowGET, false);
    request.send();
    myXML = request.responseXML;
    var x = myXML.getElementsByTagName("amount");
    var worth = x[0].childNodes[0].nodeValue; 
    add_asset(property_name, worth, "property");
    add_net(worth);
    close_assets_modal();
  }
  else{
    if (property_name == "")
    {
      property.className += " formInvalid";
    }
    if (address == "")
    {
      address_id.className += " formInvalid";
    }
    if (city == "")
    {
      city_id.className += " formInvalid";
    }
    if (zip == "")
    {
      zip_id.className += " formInvalid";
    }
    if (state == "")
    {
      state.className += " formInvalid";
    }
  }
}

/** 
  * Name:         save_salary()
  * Parameters:   None
  * Return:       None
  * Description:  This function will save the 'salary asset' the user inputs
  **/

function save_salary()
{
  assetsBulletsType.push("salary");
  var name = document.getElementById('asset_salary_name')
  var salary = document.getElementById('asset_salary_worth');
  var time = document.getElementById('salary_dropdown');
  var worth = salary.value * parseInt(time.value);
  if ( time.value == "12")
  {
    worth = (worth * 0.9615);
  }
  add_asset(name.value, worth, "salary");
  close_assets_modal();
  if (name.value == "")
  {
    name.className += " formInvalid";
  }
  if (salary.value == "")
  {
    salary.className += " formInvalid";
  }
  if (time.value == "")
  {
    time.className += " formInvalid";
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
  assetsBulletsType.push("other");  
  var name_id = document.getElementById('other_asset_name');
  var name = name_id.value;
  var worth_id = document.getElementById('other_asset_worth');
  var worth = worth_id.value;
  if ( name != "" && worth != "")
  {
    add_asset(name, worth, "other");
    add_net(worth);
    close_assets_modal();
  }
  else
  {
    if (name == "")
    {
      name_id.className += " formInvalid";
    }
    if (worth == "")
    {
      worth_id.className += " formInvalid";
    }
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


