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
var curr_liability_input;
var curr_stock_input;
var name = "";
var net;
var earning_power;
var assetsLen;
var assetsBullets = new Array();
var assetsBulletsWorth = new Array();
var assetsBulletsType = new Array();
var assetsBulletsData = new Array();

var liabiltiiesLen;
var liabilitiesBullets = new Array();
var liabilitiesBulletsWorth = new Array();
var liabilitiesBulletsType = new Array();
var liabilitiesBulletsData = new Array();

//var defaultCompanies = ["FB", "AAPL", "AMZN", "NFLX", "GOOGL", "SNAP"];
//var defaultCompaniesPrice = new Array();

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
  loader('start', 'loader');
  firebase.auth().onAuthStateChanged(function(user)
  {
    if (user)
    {
      var profile_name;
      var curr_user_net;
      var counter = 0;
      var curr_user_assets_len;
      var curr_user_liabilities_len;
      var profile_worth_text;
      var profile_quick_glance_text_net_worth;
      var profile_quick_glance_text_earning_power;
      var companiesLen;
      var user_earning_power_path = 'users/' + user.uid + '/earning_power';
      var user_net_worth_path = 'users/' + user.uid + '/net_worth';
      var user_assets_len_path = 'users/' + user.uid + '/assets_len';
      var user_liabilities_len_path = 'users/' + user.uid + '/liabilities_len';
      var user_companies_path = 'users/' + user.uid + '/companies';

      curr_user = user;

      profile_name = document.getElementById('profile_name');
      profile_worth_text = document.getElementById('profile_worth_text');
      profile_quick_glance_text_net_worth = document.getElementById('profile_quick_glance_text_net_worth');
      profile_quick_glance_text_earning_power = document.getElementById('profile_quick_glance_text_earning_power');

      profile_name.innerHTML = "Welcome " + user.displayName + ",";

      database.ref(user_net_worth_path).on('value', function(snapshot)
      {
        net = snapshot.val();
        profile_worth_text.innerHTML = "$" + convert_with_commas(net);
        profile_quick_glance_text_net_worth.innerHTML = "$" + convert_with_commas(net);
      });

      database.ref(user_earning_power_path).on('value', function(snapshot)
      {
        earning_power = snapshot.val();
        profile_quick_glance_text_earning_power.innerHTML = "$" + convert_with_commas(earning_power) + "/yr";
      });

      database.ref(user_assets_len_path).on('value', function(snapshot)
      {
        assetsLen = snapshot.val();
        if (assetsLen > assetsBullets.length)
          restore_assets();
        else
          loader('end', 'loader');
      });

      database.ref(user_liabilities_len_path).on('value', function(snapshot)
      {
        liabilitiesLen = snapshot.val();
        if (liabilitiesLen > liabilitiesBullets.length)
          restore_liabilities();
        else
          loader('end', 'loader');
      });

      database.ref(user_companies_path).on('value', function(snapshot)
      {
        companiesLen = snapshot.val();
        while (counter < companiesLen.length){
          post_stock_cards(companiesLen[counter++]);
        }
      });

    } else {
      loader('end', 'loader');
      window.location.href = "login.html";
    }
    var updates = {};
    var d = new Date();
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    var year = d.getFullYear();
    var day = days[d.getDay()];
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var hour = d.getHours();
    var minute = d.getMinutes();
    var seconds = d.getSeconds();
    updates['/users/' + curr_user.uid + '/last_active/'] =
      "(MM/DD/YYYY) = " + month + "/" + date + "/" + year + " : (" + hour + ":" + minute + ":" + seconds + ") : " + day;
    return database.ref().update(updates);
  });
}

/**
  * Name:         loader()
  * Parameters:   action = The action to take. Either start or end the loader
  *               loader = The loader to display
  * Return:       None
  * Description:  This function will determine the loading screen action
  **/

function loader(action, loader)
{
  var loader = document.getElementById(loader);
  var background_tint = document.getElementById('background_tint');
  if (action == "start")
  {
    loader.style.display = "block";
    background_tint.style.display = "block";
  }
  else if (action == "end")
  {
    loader.style.display = "none";
    background_tint.style.display = "none";
  }
  return;
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
    return (title.slice(0, len) + "...");
  return title;
}

/**
  * Name:         renew_stock_cards()
  * Parameters:   None
  * Return:       Post the stock cards in our defaultCompanies array
  * Description:  This function will post our stock cards in our stock section
  **/

function renew_stock_cards()
{
  var node;
  var counter = 0;
  var user_companies_path = 'users/' + curr_user.uid + '/companies';

  node = document.getElementById('profile_news_placeholder');

  while (node.hasChildNodes())
  {
    node.removeChild(node.firstChild);
  }

  database.ref(user_companies_path).on('value', function(snapshot)
  {
    companiesLen = snapshot.val();
    while (counter < companiesLen.length){
      post_stock_cards("" + companiesLen[counter++]);
    }
  });

  return;
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
      try
      {
        stock_card.innerHTML = company_ticker;
        var stock_card_price = document.createElement("P");
        //TODO: FIX THIS
        current_close = parseFloat(company["Time Series (1min)"][(Object.keys(company["Time Series (1min)"])[0])]["4. close"]);
        stock_card_price.innerHTML = "$" + current_close.toFixed(2);
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
  * Name:         is_letter()
  * Parameters:   str = The character to check
  * Return:       bool = True or False
  * Description:  This function will return true or false depending on
  *               whether the char is a letter ([a-z] || [A-Z])
  **/

function is_letter(str) {
  return str.length === 1 && (str.match(/[a-z]/i) || str.match(/[A-Z]/i));
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
    if (is_letter(str.charAt(i)))
    {
      return str.slice(i, len - 3);
    }
  }
  return str;
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
  return;
}

function grow_liability(input)
{
  input.setAttribute("class", "grow_profile_liabilities_bullets");
  curr_liability_input = input;
  shrink_liability(input);
  return;

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
      var edit_button = document.getElementById('profile_edit_assets_button');
      edit_button.style.display = "none";
    }
  }
}

function shrink_liability(input)
{
  window.onclick = function(event) {
    if (event.target != input) {
      input.setAttribute("class", "profile_liabilities_bullet");
      for (var i = 0; i < liabilitiesBullets.length; i++)
      {
        if (event.target == liabilitiesBullets[i]) {
          return;
        }
      }
      var button = document.getElementById('profile_remove_liabilities_button');
      button.style.display = "none";
      var edit_button = document.getElementById('profile_edit_liabilities_button');
      edit_button.style.display = "none";
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
  edit_button.onclick = function()
  {
    console.log("here");
    open_edit_assets_modal(input);
  }
}

function show_liability_button(input)
{
  var minus_button = document.getElementById('profile_remove_liabilities_button');
  var edit_button = document.getElementById('profile_edit_liabilities_button');
  edit_button.style.display = "block";
  minus_button.style.display = "block";
  minus_button.onclick = function()
  {
    remove_liability(input);
  }
  edit_button.onclick = function()
  {
    open_edit_liabilities_modal(input);
  }
}

/**
  * Name:         restore_assets()
  * Parameters:   assets_len = The length of the user's assets
  * Return:       None
  * Description:  This function will update the current assets of the
  *               user according to the asset length passed in.
  **/

function restore_assets()
{
  var counter = 0;

  while (counter < assetsLen)
  {
    var curr_user_assets_name = database.ref('users/' + curr_user.uid + '/assets/' + counter + '/name_worth/');
    curr_user_assets_name.once('value', function(snapshot)
    {
      var str = snapshot.val();
      var name = parse_string(str);
      var worth = parseFloat(str);
      var type = str.slice(str.length-2, str.length);
      restore_asset_bullet(name, worth, type);
    });
    counter++;
  }
  var loader = document.getElementById('loader');
  var background_tint = document.getElementById('background_tint');
  loader.style.display = "none";
  background_tint.style.display = "none";
}

function restore_liabilities()
{
  var counter = 0;

  while (counter < liabilitiesLen)
  {
    var curr_user_liabilities_name = database.ref('users/' + curr_user.uid + '/liabilities/' + counter + '/name_worth/');
    curr_user_liabilities_name.once('value', function(snapshot)
    {
      var str = snapshot.val();
      var name = parse_string(str);
      var worth = parseFloat(str);
      var type = str.slice(str.length-2, str.length);
      restore_liabilities_bullet(name, worth, type);
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
  return (parseFloat(num).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

function subtract_net(asset)
{
  net -= parseFloat(asset);
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

function subtract_earning_power(asset)
{
  earning_power -= parseFloat(asset);
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
    show_assets_button(curr_asset_input);
  }
  input.onmouseover = function()
  {
    input.innerHTML = "$" + convert_with_commas(worth);
  }
  input.onmouseout = function()
  {
    input.innerHTML = truncate_title(name, 25);
  }
  return input;
}

function liability_bullet(name, worth, type, element, class_name)
{
  var input = document.createElement(element);
  input.setAttribute("class", class_name);
  liabilitiesBullets.push(input);
  liabilitiesBulletsWorth.push(worth);
  liabilitiesBulletsType.push(type);
  liabilitiesBulletsData.push(worth + "_" + name + ":" + type);
  input.innerHTML = truncate_title(name, 25);
  input.draggable = "true";
  input.onclick = function()
  {
    if (curr_liability_input)
    {
      curr_liability_input.setAttribute("class", class_name);
    }
    grow_liability(input);
    show_liability_button(curr_liability_input);
  }
  input.onmouseover = function()
  {
    input.innerHTML = "($" + convert_with_commas(worth) + ")";
  }
  input.onmouseout = function()
  {
    input.innerHTML = truncate_title(name, 25);
  }
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

    var parentNode;
    var profile_assets_placeholder;
    var element;

    parentNode = document.getElementById("profile_assets_box");
    profile_assets_placeholder = document.getElementById('profile_assets_placeholder');
    element = asset_bullet(name, worth, type, "P", "profile_asset_bullet");

    profile_assets_placeholder.appendChild(element);
    parentNode.scrollTop = 0;
  }
}

function restore_liabilities_bullet(name, worth, type)
{
  if (liabilitiesLen > liabilitiesBullets.length){

    var parentNode;
    var profile_liabilities_placeholder;
    var element;

    parentNode = document.getElementById("profile_liabilities_box");
    profile_liabilities_placeholder = document.getElementById('profile_liabilities_placeholder');
    element = liability_bullet(name, worth, type, "P", "profile_liabilities_bullet");

    profile_liabilities_placeholder.appendChild(element);
    parentNode.scrollTop = 0;
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
  var asset_url = 'users/' + curr_user.uid + '/assets/' + assetsLen;

  var para = document.getElementById("profile_assets_box");
  var child =  document.getElementById("profile_add_assets_button");
  document.getElementById('profile_assets_placeholder').appendChild(asset_bullet(name, worth, type, "P", "profile_asset_bullet"));
  para.scrollTop = para.scrollHeight;
  database.ref(asset_url).set({
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
  *               type = The type of liability to be added
  * Return:       None
  * Description:  This function will update the current liabilities of the user
  *               in the liabilities box
  **/

function add_liabilities (name, worth, type)
{
  var liability_url = 'users/' + curr_user.uid + '/liabilities/' + liabilitiesLen;

  var para = document.getElementById("profile_liabilities_box");
  var child =  document.getElementById("profile_add_liabilities_button");
  document.getElementById('profile_liabilities_placeholder').appendChild(liability_bullet(name, worth, type, "P", "profile_liabilities_bullet"));
  para.scrollTop = para.scrollHeight;
  database.ref(liability_url).set({
    name_worth: (worth + "_" + name + ":" + type),
  });
  var updates = {};
  updates['/users/' + curr_user.uid + '/liabilities_len/'] = liabilitiesLen + 1;
  return database.ref().update(updates);
}

/**
  * Name:         remove_asset()
  * Parameters:   input = The input to remove
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
  else if (type != "pr" && type != "ot" && type != "st" && (earning_power - elementWorth) >= 0)
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
    updates['/users/' + curr_user.uid + '/assets/' + i + '/name_worth/'] = assetsBulletsData[i + 1];
  }
  for (var i = idx; i < assetsBulletsData.length - 1; i++)
  {
    assetsBulletsData[i] = assetsBulletsData[i+1];
  }
  assetsBullets.splice(assetsBullets.length - 1, 1);
  assetsBulletsWorth.splice(assetsBulletsWorth.length - 1, 1);
  assetsBulletsType.splice(assetsBulletsType.length - 1, 1);
  assetsBulletsData.splice(assetsBulletsData.length - 1, 1);

  assetsLen--;
  database.ref('/users/' + curr_user.uid + '/assets/' + (assetsLen)).remove();
  updates['/users/' + curr_user.uid + '/assets_len/'] = assetsLen;

  return database.ref().update(updates);
}


function remove_liability(input)
{
  var idx = 0;
  for (var i = 0; i < liabilitiesBullets.length; i++)
  {
    if (liabilitiesBullets[i] == input)
    {
      idx = i;
    }
  }
  var updates = {};
  var element = liabilitiesBullets[idx];
  var elementWorth = parseFloat(liabilitiesBulletsWorth[idx]);
  var type = liabilitiesBulletsType[idx];
  if (type == "Ot" || type == "de")
  {
    net += elementWorth;
    document.getElementById('profile_worth_text').innerHTML = "$" + convert_with_commas(net);
    document.getElementById('profile_quick_glance_text_net_worth').innerHTML = "$" + convert_with_commas(net);
    updates['/users/' + curr_user.uid + '/net_worth/'] = net;
  }
  else if (type == "lo" ||  type == "ta" || type == "RE" || type == "bi" || type == "oT")
  {
    earning_power += elementWorth;
    document.getElementById('profile_quick_glance_text_earning_power').innerHTML = "$" + convert_with_commas(earning_power) + "/yr";
    updates['/users/' + curr_user.uid + '/earning_power/'] = earning_power;
  }
  element.parentNode.removeChild(element);
  for (var i = idx; i < liabilitiesBullets.length - 1; i++)
  {
    liabilitiesBullets[i] = liabilitiesBullets[i + 1];
    liabilitiesBullets[i].setAttribute ("onclick", null);
    liabilitiesBullets[i].onclick = function()
    {
      show_liabilities_button(liabilitiesBullets[i]);
    }
    liabilitiesBulletsWorth[i] = liabilitiesBulletsWorth[i + 1];
    liabilitiesBulletsType[i] = liabilitiesBulletsType[i + 1];
    updates['/users/' + curr_user.uid + '/liabilities/' + i + '/name_worth/'] = liabilitiesBulletsData[i + 1];
  }
  for (var i = idx; i < liabilitiesBulletsData.length - 1; i++)
  {
    liabilitiesBulletsData[i] = liabilitiesBulletsData[i+1];
  }
  liabilitiesBullets.splice(liabilitiesBullets.length - 1, 1);
  liabilitiesBulletsWorth.splice(liabilitiesBulletsWorth.length - 1, 1);
  liabilitiesBulletsType.splice(liabilitiesBulletsType.length - 1, 1);
  liabilitiesBulletsData.splice(liabilitiesBulletsData.length - 1, 1);

  liabilitiesLen--;
  database.ref('/users/' + curr_user.uid + '/liabilities/' + (liabilitiesLen)).remove();
  updates['/users/' + curr_user.uid + '/liabilities_len/'] = liabilitiesLen;

  return database.ref().update(updates);
}

/**
  * Name:         open_assets_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the assets modal
  **/

function open_assets_modal()
{
  var assets_menu = document.getElementById('assets_add_menu');
  assets_menu.style.display = "block";
  show_assets_menu();
}

function open_liabilities_modal()
{
  var liabilities_menu = document.getElementById('liabilities_add_menu');
  liabilities_menu.style.display = "block";
  show_liabilities_menu();
}

function open_edit_assets_modal(input)
{
  var edit_assets_menu = document.getElementById('edit_asset_menu');
  edit_assets_menu.style.display = "block";
  show_edit_assets(input);
}

function open_edit_liabilities_modal(input)
{
  var edit_liabilities_menu = document.getElementById('edit_liability_menu');
  edit_liabilities_menu.style.display = "block";
  show_edit_liabilities(input);
}

function open_modal(type, element)
{
  var menu = document.getElementById(type);
  menu.style.display = "block";
  show_helper_menu(element);
}

/**
  * Name:         close_assets_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will close the assets modal
  **/

function close_modal(type)
{
  var menu = document.getElementById(type);
  menu.style.display = "none";
}

/*
function close_liabilities_modal()
{
  var liabilities_menu = document.getElementById('liabilities_add_menu');
  liabilities_menu.style.display = "none";
}
*/

function save_edit_asset()
{
  var updates = {};
  var edit_asset_input = document.getElementById('edit_asset_name');
  var edit_asset_input_val = edit_asset_input.value;
  var idx;

  for ( var i = 0; i < assetsBullets.length; i++)
  {
    if (assetsBullets[i] == curr_asset_input)
    {
      idx = i;
    }
  }

  var worth = assetsBulletsWorth[idx];
  var type = assetsBulletsType[idx];
  assetsBulletsData[idx] = "" + worth + "_" + edit_asset_input_val + ":" + type;

  if (edit_asset_input.value != "")
  {
    curr_asset_input.innerHTML = edit_asset_input_val;
    curr_asset_input.onmouseout = function()
    {
      curr_asset_input.innerHTML = truncate_title(edit_asset_input_val, 25);
    }
    updates['/users/' + curr_user.uid + '/assets/' + idx + '/name_worth/'] = assetsBulletsData[idx];
    close_modal('edit_asset_menu');
  }
  else
  {
    edit_asset_input.className += " formInvalid";
  }
  return database.ref().update(updates);
}

function save_edit_liability()
{
  var updates = {};
  var edit_liability_input = document.getElementById('edit_liability_name');
  var edit_liability_input_val = edit_liability_input.value;
  var idx;

  for ( var i = 0; i < liabilitiesBullets.length; i++)
  {
    if (liabilitiesBullets[i] == curr_liability_input)
    {
      idx = i;
    }
  }

  var worth = liabilitiesBulletsWorth[idx];
  var type = liabilitiesBulletsType[idx];
  liabilitiesBulletsData[idx] = "" + worth + "_" + edit_liability_input_val + ":" + type;

  if (edit_liability_input.value != "")
  {
    curr_liability_input.innerHTML = edit_liability_input_val;
    curr_liability_input.onmouseout = function()
    {
      curr_liability_input.innerHTML = truncate_title(edit_liability_input_val, 25);
    }
    updates['/users/' + curr_user.uid + '/liabilities/' + idx + '/name_worth/'] = liabilitiesBulletsData[idx];
    close_modal('edit_liability_menu');
  }
  else
  {
    edit_liability_input.className += " formInvalid";
  }
  return database.ref().update(updates);
}

/**
  * Name:         hide_assets_menu()
  * Parameters:   None
  * Return:       None
  * Description:  This function will clear the menu display of
  *               the assets modal
  **/

function hide_assets_menu()
{
  var logos = document.getElementsByClassName('modal_logo');
  for (var i = 0; i < logos.length; i++)
  {
    logos[i].style.display = "none";
  }
}

function hide_liabilities_menu()
{
  var logos = document.getElementsByClassName('liabilities_modal_logo');
  for (var i = 0; i < logos.length; i++)
  {
    logos[i].style.display = "none";
  }
}


function hide_assets_menu_helper(asset_type)
{
  var others_input = document.getElementsByClassName(asset_type);
  for (var i = 0; i < others_input.length; i++){
    others_input[i].style.display = "none";
    others_input[i].value = "";
  }
}

function hide_liabilities_menu_helper(asset_type)
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

function show_assets_menu()
{
  hide_assets_menu_helper('account_input');
  hide_assets_menu_helper('property_input');
  hide_assets_menu_helper('rent_input');
  hide_assets_menu_helper('salary_input');
  hide_assets_menu_helper('stock_input');
  hide_assets_menu_helper('others_input');
  var logos = document.getElementsByClassName('modal_logo');
  for (var i = 0; i < logos.length; i++){
    logos[i].style.display = "block";
  }
  hide('assets_modal_back');
}

function show_liabilities_menu()
{
  hide_liabilities_menu_helper('bill_input');
  hide_liabilities_menu_helper('taxes_liabilities_input');
  hide_liabilities_menu_helper('rent_liabilities_input');
  hide_liabilities_menu_helper('loans_liabilities_input');
  hide_liabilities_menu_helper('liabilities_others_input');
  hide_liabilities_menu_helper('debt_liabilities_input');
  var logos = document.getElementsByClassName('liabilities_modal_logo');
  for (var i = 0; i < logos.length; i++){
    logos[i].style.display = "block";
  }
  hide('liabilities_modal_back');
}

function show_edit_assets(input)
{
  curr_asset_input = input;
  var edit_assets_modal = document.getElementsByClassName('edit_asset_modal_input');
  for (var i = 0; i < edit_assets_modal.length; i++)
  {
    edit_assets_modal[i].style.display = "block";
  }
  var edit_input = document.getElementById('edit_asset_name');
  edit_input.placeholder = input.innerHTML;
}

function show_edit_liabilities(input)
{
  curr_liability_input = input;
  var edit_liabilities_modal = document.getElementsByClassName('edit_liability_modal_input');
  for (var i = 0; i < edit_liabilities_modal.length; i++)
  {
    edit_liabilities_modal[i].style.display = "block";
  }
  var edit_input = document.getElementById('edit_liability_name');
  edit_input.placeholder = input.innerHTML;
}

/**
  * Name:         open_asset()
  * Parameters:   type = The type of asset to open in our modal
  * Return:       None
  * Description:  This function will open the tab in the assets modal of 'type'
  **/

function open_asset(type)
{
  hide_assets_menu();
  show('assets_modal_back');
  var asset_input = document.getElementsByClassName(type);
  for (var i = 0; i < asset_input.length; i++)
  {
    asset_input[i].style.display = "block";
  }
  return;
}

/**
  * Name:         open_liabilities()
  * Parameters:   type = The type of liabilities to open in our modal
  * Return:       None
  * Description:  This function will open the tab in the liabilities modal of 'type'
  **/

function open_liabilities(type)
{
  hide_liabilities_menu();
  show('liabilities_modal_back');
  if (type == 'taxes_liabilities_input')
  {
    var dropdown = document.getElementById('taxes_dropdown');
    while (dropdown.length > 1)
    {
      dropdown.remove(dropdown.length - 1);
    }
    for ( var i = 0; i < assetsBulletsData.length; i++)
    {
      var option = document.createElement("option");
      var name = parse_string(assetsBulletsData[i]);
      var worth = parseInt(assetsBulletsData[i]);
      option.text = "" + name + " : $" + worth;
      option.value = assetsBulletsData[i];
      dropdown.add(option);
    }
  }
  var liabilities_input = document.getElementsByClassName(type);
  for (var i = 0; i < liabilities_input.length; i++)
  {
    liabilities_input[i].style.display = "block";
  }
  return;
}

/**
  * Name:         read_address_xml()
  * Parameters:   xml = The xml to read
  * Return:       None
  * Description:  This function will read addresses of the xml of tag name type
  **/

function read_address_xml(xml, type)
{
  var xmlDoc = xml.responseXML;
  var x = xmlDoc.getElementsByTagName(type);
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
    close_modal('assets_add_menu');
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
    close_modal('assets_add_menu');
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
  var worth = salary.value * parseFloat(time.value);
  if (name.value != "" && salary.value != "" && time.value != "")
  {
    if ( time.value == "12")
    {
      worth = (worth * 0.9615);
    }
    add_asset(name.value, worth, "sa");
    add_earning_power(worth);
    close_modal('assets_add_menu');
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
  var num_shares_id = document.getElementById('stock_asset_worth');
  var num_shares = num_shares_id.value;

  var company_name_id = document.getElementById('stock_asset_company');
  var company_ticker = company_name_id.value;

  var name_id = document.getElementById('stock_asset_name');
  var name = name_id.value;

  if (company_ticker == "")
  {
    num_shares_id.className += " formInvalid";
  }
  if (num_shares == "")
  {
    num_shares = 0;
  }
  if (name == "")
  {
    name_id.className += " formInvalid";
  }

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
      var company = JSON.parse(json);
      try
      {
        current_close = parseFloat(company["Time Series (1min)"][(Object.keys(company["Time Series (1min)"])[0])]["4. close"]);
        defaultCompanies.push(company_ticker);
        defaultCompaniesPrice.push(current_close);
        var worth = current_close * num_shares;
        add_asset(name, worth, "st");
        add_net(worth);
        close_modal('assets_add_menu');
      }
      catch(err){
        company_name_id.value = "";
        company_name_id.placeholder = "Invalid symbol";
      }
    });
  });
  request.end();
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
    close_modal('assets_add_menu');
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


function save_tax_liabilities()
{
  var name_id = document.getElementById('tax_liability_name');
  var percentage_id = document.getElementById('tax_liability_company');
  var salary_id = document.getElementById('taxes_dropdown');

  var name = name_id.value;
  var percentage = percentage_id.value;
  var salary = salary_id.value;

  var type = salary.slice(salary.length-2, salary.length);

  if ( isNaN(parseFloat(percentage)))
  {
    percentage_id.className += " formInvalid";
    percentage_id.value = "";
    percentage_id.placeholder = "Must be a number";
    return;
  }

  if ( salary == "")
  {
    salary_id.className += " formInvalid";
  }

  var worth = parseFloat(salary);
  worth = (parseFloat(percentage)/100.0) * worth;
  console.log(worth);

  add_liabilities(name, worth, "ta");
  subtract_earning_power(worth);
  close_modal('liabilities_add_menu');
}

function save_rent_liabilities()
{
  var name_id = document.getElementById('rent_liability_name');
  var worth_id = document.getElementById('rent_liability_company');
  var time_id = document.getElementById('rent_dropdown');

  var name = name_id.value;
  var worth = worth_id.value;
  var time = time_id.value;

  worth = parseFloat(worth);
  time = parseFloat(time);
  worth = worth * time;

  add_liabilities(name, worth, "RE");
  subtract_earning_power(worth);
  close_modal('liabilities_add_menu');
}

function save_loans_liabilities()
{
  console.log("here");
  var name_id = document.getElementById('loans_liability_name');
  var worth_id = document.getElementById('loans_liability_worth');
  var interest_id = document.getElementById('loans_liability_interest');
  var time_id = document.getElementById('loans_dropdown');

  var name = name_id.value;
  var worth = worth_id.value;
  var interest = interest_id.value;
  var time = time_id.value;

  interest /= 100.0;
  interest += 1.0;

  worth *= interest;

  worth *= time;

  add_liabilities(name, worth, "lo");
  subtract_earning_power(worth);
  close_modal('liabilities_add_menu');
}

function save_bill_liabilities()
{
  var name_id = document.getElementById('liability_bill_name');
  var worth_id = document.getElementById('liability_bill_worth');
  var time_id = document.getElementById('bill_dropdown');

  var name = name_id.value;
  var worth = worth_id.value;
  var time = time_id.value;

  worth = parseFloat(worth);
  time = parseFloat(time);
  worth = worth * time;

  add_liabilities(name, worth, "bi");
  subtract_earning_power(worth);
  close_modal('liabilities_add_menu');
}

function save_debt_liabilities()
{
  var name_id = document.getElementById('liability_debt_name');
  var worth_id = document.getElementById('liability_debt_worth');

  var name = name_id.value;
  var worth = worth_id.value;

  add_liabilities(name, worth, "de");
  subtract_net(worth);
  close_modal('liabilities_add_menu');
}

function save_other_liabilities()
{
  var name_id = document.getElementById('other_liability_name');
  var worth_id = document.getElementById('other_liability_worth');
  var time_id = document.getElementById('liability_others_dropdown');

  var name = name_id.value;
  var worth = worth_id.value;
  var time = time_id.value;

  if (time == "reoccurring")
  {
    add_liabilities(name, worth, "oT");
    subtract_earning_power(worth);
  }
  else if (time == "single")
  {
    add_liabilities(name, worth, "Ot");
    subtract_net(worth);
  }
  close_modal('liabilities_add_menu');

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
  show('delete_menu');
  var delete_modal = document.getElementsByClassName('delete_modal');
  for (var i = 0; i < delete_modal.length; i++)
  {
    delete_modal[i].style.display = "block";
  }
}

/**
  * Name:         open_bug_modal()
  * Parameters:   None
  * Return:       None
  * Description:  This function will open the bug modal
  **/

function open_bug_modal()
{
  show('bug_report_menu');
  var bug_modal = document.getElementsByClassName('report_bug_content');
  for (var i = 0; i < bug_modal.length; i++)
  {
    bug_modal[i].style.display = "block";
  }
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
  hide('delete_menu');
  return database.ref().update(updates);
}

function submit_bug()
{
  emailjs.send("<YOUR SERVICE ID>","financr",{name: "Financr", notes: "Check this out!"});
}

function temp_login()
{
  window.location.href = "login.html";
}

function load_settings()
{
  window.location.href = "settings.html";
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
