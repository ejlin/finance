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
var curr_asset_input;
var curr_stock_input;
var name = "";
var net;
var earning_power;
var assetsLen;
var assetsBullets = new Array();
var assetsBulletsWorth = new Array();
var assetsBulletsType = new Array();
var assetsBulletsData = new Array();
var liabilitiesBullets = new Array();
var defaultCompanies = ["FB", "AAPL", "AMZN", "NFLX", "GOOGL", "SNAP"];
var defaultCompaniesPrice = new Array();

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
  start_load();  
  firebase.auth().onAuthStateChanged(function(user) 
  {
    if (user) 
    {
      curr_user = user;
      document.getElementById('profile_name').innerHTML = "Welcome " + user.displayName + ","; 
      var profile_quick_glance_text = document.getElementById('profile_quick_glance_text').innerHTML;
      var curr_user_net = database.ref('users/' + user.uid + '/net_worth');
      curr_user_net.on('value', function(snapshot) 
      {
        net = snapshot.val();
        document.getElementById('profile_worth_text').innerHTML = "$" + convert_with_commas(parseInt(net)); 
        document.getElementById('profile_quick_glance_text_net_worth').innerHTML = "$" + convert_with_commas(parseInt(net));      
      });
      var curr_user_earning_power = database.ref('users/' + user.uid + '/earning_power');
      curr_user_earning_power.on('value', function(snapshot)
      {
        earning_power = snapshot.val();
        document.getElementById('profile_quick_glance_text_earning_power').innerHTML = "$" + convert_with_commas(parseInt(earning_power)) + "/yr";            
      });
      var counter = 0;
      while ( counter < defaultCompanies.length)
      {
        post_stock_cards(defaultCompanies[counter++]);
      }
      
      var assets_len = 0;
      var curr_user_assets_len = database.ref('users/' + user.uid + '/assets_len');
      curr_user_assets_len.on('value', function(snapshot) 
      {
        assetsLen = snapshot.val();
        if (assetsLen > assetsBullets.length)
        {
          restore_assets();
        }
        else if (assetsLen == 0)
        {
          end_load();
        }
      });  
    } else {
      end_load();
      window.location.href = "login.html";
    }
  });

}

/** 
  * Name:         end_load()
  * Parameters:   None
  * Return:       None
  * Description:  This function will start the loading screen
  **/

function start_load()
{
  var loader = document.getElementById('loader');
  var background_tint = document.getElementById('background_tint');
  loader.style.display = "block";
  background_tint.style.display = "block";
}

/** 
  * Name:         end_load()
  * Parameters:   None
  * Return:       None
  * Description:  This function will delete the loading screen
  **/

function end_load()
{
  var loader = document.getElementById('loader');
  var background_tint = document.getElementById('background_tint');
  loader.style.display = "none";
  background_tint.style.display = "none";
}

/** 
  * Name:         truncate_title()
  * Parameters:   title = The string to truncate
  * Return:       A truncated version of the string or the original string if
  *               there is no need to truncate it
  * Description:  This function will truncate a string if it is too long or return
  *               the original string if it is not. 
  **/

function truncate_title(title, len)
{
  if (title.length > len)
  {
    return (title.slice(0, len) + "...");
  }
  return title;
}

/** 
  * Name:         post_news()
  * Parameters:   company_ticker = The ticker for the company to post news of
  * Return:       None
  * Description:  This function will post worthy news from the company mentioned
  **/

function post_news(company_ticker)
{
  var https = require("https");
  var username = "8de2ab9294eb7387e13bed32e87c5ed2";
  var password = "382da3d89f22a7e554dc1770ec1a055d";
  var auth = "Basic " + new Buffer(username + ':' + password).toString('base64');

  var request = https.request({
    method: "GET",
    host: "api.intrinio.com",
    path: "/news?identifier=" + company_ticker,
    headers: {
        "Authorization": auth
    }
  }, function(response) {
    var json = "";
    response.on('data', function (chunk) {
        json += chunk;
        
    });
    response.on('end', function() {
      var company = JSON.parse(json);
      var headline = document.createElement("A");
      headline.setAttribute("class", "profile_news_bullet");
      try{
        headline.innerHTML = truncate_title(company_ticker + ": " + company.data[0].title, 45);
        headline.href = company.data[0].url;
        headline.title = company.data[0].title;
        headline.target = "_blank";
      }
      catch(err){
        headline.innerHTML = "No News currently available";    
      }
      document.getElementById('profile_news_placeholder').appendChild(headline);
    });
  });

  request.end();
}

/** 
  * Name:         post_stock_cards()
  * Parameters:   company_ticker = The ticker for the company to post news of
  * Return:       None
  * Description:  This function will post current stock prices from the company mentioned
  **/

function post_stock_cards(company_ticker)
{
  var https = require("https");
  var current_close = 0;  
  var request = https.request({
    method: "GET",
    host: "www.alphavantage.co",
    path: "/query?function=TIME_SERIES_INTRADAY&symbol=" + company_ticker + "&interval=1min&apikey=3D451BF2VJIU2EVD"
  }, function(response) {
    var json = "";
    response.on('data', function (chunk) {
        json += chunk;
        
    });
    response.on('end', function() {
      var placeholder = document.getElementById('profile_news_placeholder');
      var company = JSON.parse(json);
      var stock_card = document.createElement("P");
      stock_card.setAttribute("class", "profile_news_bullet");
      var last_log = company["Meta Data"]["3. Last Refreshed"];
      try{       
        stock_card.innerHTML = company_ticker;
        var stock_card_price = document.createElement("P"); 
        current_close = parseFloat(company["Time Series (1min)"][(Object.keys(company["Time Series (1min)"])[0])]["4. close"]);
        defaultCompaniesPrice.push(current_close);
        stock_card_price.innerHTML = "$" + current_close; //company_ticker;
        stock_card.appendChild(stock_card_price);
        placeholder.appendChild(stock_card);
        stock_card.onclick = function()
        {
          grow_stock_card(stock_card);
        }
        var yahoo_link = document.createElement("IMG");
        yahoo_link.setAttribute("class", "stock_card_hover");
        yahoo_link.onclick = function()
        {
          window.open("https://finance.yahoo.com/quote/" + company_ticker + "/");
        }
        yahoo_link.src = "../Images/exit.png";
        yahoo_link.target = "_blank";
        stock_card.appendChild(yahoo_link);      
      }
      catch(err){
        stock_card.innerHTML = "No News currently available";    
      }
      placeholder.appendChild(stock_card);
    });
  });

  request.end();
}


/** 
  * Name:         parse_string()
  * Parameters:   str = The string to convert
  * Return:       None
  * Description:  This function will return the truncated string without the worth
  **/

function parse_string(str)
{
  var len = str.length;
  for (var i = 0; i < len; i++)
  {
    if (isNaN(parseInt(str.charAt(i))) )
    {
      return str.slice(i + 1, len - 3);
    }
  }
}

/** 
  * Name:         grow()
  * Parameters:   input = The element to grow
  * Return:       None
  * Description:  This function will grow the passed in element
  **/

function grow(input)
{
  input.setAttribute("class", "grow_profile_asset_bullets");
  curr_asset_input = input;
  shrink(input);  
}

/** 
  * Name:         grow_stock_card()
  * Parameters:   input = The element to grow
  * Return:       None
  * Description:  This function will grow the passed in element
  **/

function grow_stock_card(input)
{
  if (curr_stock_input)
  {
    curr_stock_input.setAttribute("class", "profile_news_bullet");     
  }
  input.setAttribute("class", "grow_stock_card");
  curr_stock_input = input;
  shrink_stock_card(input);
}

/** 
  * Name:         shrink()
  * Parameters:   input = The element to shrink
  * Return:       None
  * Description:  This function will shrink the passed in element
  **/

function shrink(input)
{
  window.onclick = function(event) {
    if (event.target != input) {
      input.setAttribute("class", "profile_asset_bullet");
      for (var i = 0; i < assetsBullets.length; i++)
      {
        if (event.target == assetsBullets[i]) {
          return;
        }
      }
      var button = document.getElementById('profile_remove_assets_button');
      button.style.display = "none";
    }
  }
}

/** 
  * Name:         shrink()
  * Parameters:   input = The element to shrink
  * Return:       None
  * Description:  This function will shrink the passed in element
  **/

function shrink_stock_card(input)
{
  window.onclick = function(event) {
    if (event.target != input) {
      input.setAttribute("class", "profile_news_bullet");
      for (var i = 0; i < assetsBullets.length; i++)
      {
        if (event.target == assetsBullets[i]) {
          return;
        }
      }
    }
  }
}


/** 
  * Name:         show_assets_button()
  * Parameters:   idx = The index of the element to remove
  * Return:       None
  * Description:  This function will show the remove asset button if
  *               any of the assets bullet is clicked.
  **/

function show_assets_button(input)
{
  var minus_button = document.getElementById('profile_remove_assets_button');
  var edit_button = document.getElementById('profile_edit_assets_button');
  edit_button.style.display = "block";
  minus_button.style.display = "block";
  minus_button.onclick = function()
  {
    remove_asset(input);
  }

}

/** 
  * Name:         hide_remove_assets_button()
  * Parameters:   None 
  * Return:       None
  * Description:  This function will hide the remove asset button if
  *               clicked away from anything other than another
  *               asset bullet. 
  **/
  
function hide_remove_assets_button()
{
  window.onclick = function(event) {
    for (var i = 0; i < assetsBullets.length; i++)
    {
      if (event.target == assetsBullets[i]) {
        return;
      }
    }
    var button = document.getElementById('profile_remove_assets_button');
    button.style.display = "none";
    var edit_button = document.getElementById('profile_edit_assets_button');
    edit_button.style.display = "none";
  }
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
      var name = parse_string(str);
      var worth = parseInt(str);
      var type = str.slice(str.length-2, str.length);
      restore_asset_bullet(name, worth);
    });
    counter++;
  }
  var loader = document.getElementById('loader');
  var background_tint = document.getElementById('background_tint');
  loader.style.display = "none";
  background_tint.style.display = "none";
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
  document.getElementById('profile_quick_glance_text_net_worth').innerHTML = "$" + convert_with_commas(net);
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
  earning_power += parseFloat(asset);
  document.getElementById('profile_quick_glance_text_earning_power').innerHTML = "$" + convert_with_commas(earning_power) + "/yr";
  var updates = {};
  updates['/users/' + curr_user.uid + '/earning_power/'] = earning_power;
  return database.ref().update(updates);  
}

/** 
  * Name:         asset_bullet()
  * Parameters:   name = The name of the bullet
  *               worth = The worth of the bullet
  *               type = The type of the bullet
  *               element = The element type to create
  *               class_name = The class to attach it to
  * Return:       None
  * Description:  This function will create a bullet object for assets 
  **/

function asset_bullet(name, worth, type, element, class_name)
{
  var idx = assetsBullets.length;
  var input = document.createElement(element);
  input.setAttribute("class", class_name);
  assetsBullets.push(input);
  assetsBulletsWorth.push(worth);
  assetsBulletsType.push(type);
  assetsBulletsData.push(worth + "_" + name + ":" + type);  
  input.innerHTML = truncate_title(name, 25);
  input.draggable = "true";
  input.onclick = function()
  {
    if (curr_asset_input)
    {
      curr_asset_input.setAttribute("class", class_name);
    }
    grow(input);
    show_assets_button(input);    
  }
  input.onmouseover = function()
  {
    input.innerHTML = "$" + convert_with_commas(worth);
  }
  input.onmouseout = function()
  {
    input.innerHTML = truncate_title(name, 25);
  }
  hide_remove_assets_button();
  return input;
}

/** 
  * Name:         restore_asset_bullet()
  * Parameters:   name = The name of the asset
  *               worth = The worth of the asset
  * Return:       None
  * Description:  This function will restore existing assets for returning users 
  **/

function restore_asset_bullet(name, worth, type)
{
  if (assetsLen > assetsBullets.length){
    var para = document.getElementById("profile_assets_box");
    var child =  document.getElementById("profile_add_assets_button");
    document.getElementById('profile_assets_placeholder').appendChild(asset_bullet(name, worth, type, "P", "profile_asset_bullet")); 
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
  var para = document.getElementById("profile_assets_box");
  var child =  document.getElementById("profile_add_assets_button");
  document.getElementById('profile_assets_placeholder').appendChild(asset_bullet(name, worth, type, "P", "profile_asset_bullet")); 
  para.scrollTop = para.scrollHeight;
  database.ref('users/' + curr_user.uid + '/assets/' + assetsLen).set({
    name_worth: (worth + "_" + name + ":" + type),
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
  * Parameters:   idx = The index of the asset to remove
  * Return:       None
  * Description:  This function will remove the last added asset
  **/

function remove_asset(input)
{
  var idx = 0;
  for (var i = 0; i < assetsBullets.length; i++)
  {
    if (assetsBullets[i] == input)
    {
      idx = i;
    }
  }
  var updates = {};        
  var element = assetsBullets[idx];
  var elementWorth = assetsBulletsWorth[idx];
  var type = assetsBulletsType[idx];
  if (type != "sa" && type != "re" && type != "OT" && (net - elementWorth) >= 0)
  {
    net -= elementWorth;
    document.getElementById('profile_worth_text').innerHTML = "$" + convert_with_commas(net);
    document.getElementById('profile_quick_glance_text_net_worth').innerHTML = "$" + convert_with_commas(net);
    updates['/users/' + curr_user.uid + '/net_worth/'] = net;          
  }
  else if (type != "pr" && type != "ot" && (earning_power - elementWorth) >= 0)
  { 
    earning_power -= elementWorth;
    document.getElementById('profile_quick_glance_text_earning_power').innerHTML = "$" + convert_with_commas(earning_power) + "/yr";
    updates['/users/' + curr_user.uid + '/earning_power/'] = earning_power;  
  }
  element.parentNode.removeChild(element);        
  for (var i = idx; i < assetsBullets.length - 1; i++)
  {
    assetsBullets[i] = assetsBullets[i + 1];
    assetsBullets[i].setAttribute ("onclick", null);
    assetsBullets[i].onclick = function()   
    {
      show_assets_button(assetsBullets[i]);
    }
    assetsBulletsWorth[i] = assetsBulletsWorth[i + 1];
    assetsBulletsType[i] = assetsBulletsType[i + 1];
    console.log(assetsBulletsData[i + 1]);
    updates['/users/' + curr_user.uid + '/assets/' + i + '/name_worth/'] = assetsBulletsData[i + 1];       
  }
  for (var i = idx; i < assetsBulletsData.length - 1; i++)
  {
    assetsBulletsData[i] = assetsBulletsData[i+1];
  }
  assetsBullets.splice(assetsBullets.length - 1, 1);
  assetsBulletsWorth.splice(assetsBulletsWorth.length - 1, 1);
  assetsBulletsType.splice(assetsBulletsType.length - 1, 1);
  assetsBulletsType.splice(assetsBulletsData.length - 1, 1);
  
  assetsLen--;
  database.ref('/users/' + curr_user.uid + '/assets/' + (assetsLen)).remove();
  updates['/users/' + curr_user.uid + '/assets_len/'] = assetsLen;

  return database.ref().update(updates);   
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


function show_assets_menu_helper(asset_type)
{
  var others_input = document.getElementsByClassName(asset_type);
  for (var i = 0; i < others_input.length; i++){
    others_input[i].style.display = "none";
    others_input[i].value = "";
  }
} 

/** 
  * Name:         show_assets_menu()
  * Parameters:   None
  * Return:       None
  * Description:  This function will display the menu of the assets modal
  **/

function show_assets_menu() {
  show_assets_menu_helper('property_input');
  show_assets_menu_helper('rent_input');
  show_assets_menu_helper('salary_input');
  show_assets_menu_helper('stock_input');
  show_assets_menu_helper('others_input');
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
  var others_input = document.getElementsByClassName('rent_input');
  for (var i = 0; i < others_input.length; i++)
  {
    others_input[i].style.display = "block";
  }
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
  var others_input = document.getElementsByClassName('stock_input');
  for (var i = 0; i < others_input.length; i++)
  {
    others_input[i].style.display = "block";
  }
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
    add_asset(property_name, worth, "pr");
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
  * Name:         save_rent()
  * Parameters:   None
  * Return:       None
  * Description:  This function will save the 'salary asset' the user inputs
  **/

function save_rent()
{
  var name = document.getElementById('asset_rent_name')
  var rent= document.getElementById('asset_rent_worth');
  var time = document.getElementById('rent_dropdown');
  var worth = rent.value * parseInt(time.value);
  if (name.value != "" && rent.value != "" && time.value != "")
  {
    add_asset(name.value, worth, "re");
    add_earning_power(worth);
    close_assets_modal();
  }
  if (name.value == "")
  {
    name.className += " formInvalid";
  }
  if (rent.value == "")
  {
    rent.className += " formInvalid";
  }
  if (time.value == "")
  {
    time.className += " formInvalid";
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
  var name = document.getElementById('asset_salary_name')
  var salary = document.getElementById('asset_salary_worth');
  var time = document.getElementById('salary_dropdown');
  var worth = salary.value * parseInt(time.value);
  if (name.value != "" && salary.value != "" && time.value != "")
  {
    if ( time.value == "12")
    {
      worth = (worth * 0.9615);
    }
    add_asset(name.value, worth, "sa");
    add_earning_power(worth);
    close_assets_modal();
  }
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
  * Name:         save_stock()
  * Parameters:   None
  * Return:       None
  * Description:  This function will save the 'stock asset' the user inputs
  **/

function save_stock()
{

}

/** 
  * Name:         save_other()
  * Parameters:   None
  * Return:       None
  * Description:  This function will save the 'other asset' the user inputs
  **/

function save_other()
{
  var name_id = document.getElementById('other_asset_name');
  var name = name_id.value;
  var worth_id = document.getElementById('other_asset_worth');
  var worth = worth_id.value;

  var time_id = document.getElementById('others_dropdown');
  var time = time_id.value;

  if ( name_id.value != "" && worth_id.value != "" && time_id.value != "")
  {
    if (time == "reoccurring")
    {
      add_asset(name, worth, "OT");
      add_earning_power(worth);      
    }
    else if (time == "single")
    {
      add_asset(name, worth, "ot");
      add_net(worth);
    }
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
    if (time == "")
    {
      time_id.className += " formInvalid";
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

/** 
  * Name:         open_delete_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the delete modal 
  **/

function open_delete_modal()
{
  var delete_menu = document.getElementById('delete_menu');
  delete_menu.style.display = "block";
  var delete_modal = document.getElementsByClassName('delete_modal');
  for (var i = 0; i < delete_modal.length; i++)
  {
    delete_modal[i].style.display = "block";
  }
}

/** 
  * Name:         close_delete_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will close the delete modal 
  **/

function close_delete_modal()
{
  var delete_menu = document.getElementById('delete_menu');
  delete_menu.style.display = "none";
}

/** 
  * Name:         reset_account()
  * Parameters:   None
  * Return:       None
  * Description:  This function will reset the account of the current user 
  **/

function reset_account()
{
  var updates = {};
  document.getElementById('profile_worth_text').innerHTML = "$0"; 
  document.getElementById('profile_quick_glance_text_net_worth').innerHTML = "$0";
  document.getElementById('profile_quick_glance_text_earning_power').innerHTML = "$0/yr";            
  
  for (var i = 0; i < assetsBullets.length; i++)
  {
    assetsBullets[i].parentNode.removeChild(assetsBullets[i]);
  }
  while (assetsLen > 0)
  {
    database.ref('/users/' + curr_user.uid + '/assets/' + (assetsLen - 1)).remove();
    assetsLen--;
  }
  curr_asset_input;
  name = "";
  net = 0;
  earning_power = 0;
  assetsBullets = new Array();
  assetsBulletsWorth = new Array();
  assetsBulletsType = new Array();
  assetsBulletsData = new Array();
  liabilitiesBullets = new Array();

  updates['/users/' + curr_user.uid + '/assets_len/'] = 0;
  updates['/users/' + curr_user.uid + '/earning_power/'] = 0;
  updates['/users/' + curr_user.uid + '/net_worth/'] = 0;
  close_delete_modal();
  return database.ref().update(updates);
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

// How to request JSON API.
 /*
  var counter = 0;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status == 200) {
      var data = xhr.response;
      //console.log("here");
      //console.log(data.articles[0].title);
      while (data.data[counter] != null)
      {
        
      }
    } else {
      //TODO
    }
  };
  xhr.send(); */

