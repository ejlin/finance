const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var net = 0.0;
var assetsBullets = new Array();
var assetsBulletsWorth = new Array();
var liabilitiesBullets = new Array();

function assetsBullet () {
  this.type = "asset";
}

assetsBullet.prototype.getInfo = function(){
  return this.type;
};

function property (address) {
  this.address = address;
}

/*
function createAsset () {
  var asset = new assetsBullet()
}
*/

  

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1000, height: 800, minWidth: 1000, minHeight: 800})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app/signup.html'),
    protocol: 'file:',
    slashes: true
  }))

  //win.webContents.openDevTools()
  

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will take care of signon
function signup_login () {
  var username = document.getElementById('signup_username').value;
  var password = document.getElementById('signup_password').value;
  
  if (username == "tgih1999" && password == "jianwu13"){
      document.addEventListener('DOMContentLoaded', function() { 
      setup_profile();  
    }, false);
    window.location.href = "profile.html";    

  } 
}

function setup_profile () {

  var assetLen = assetsBullets.length;
    
  document.getElementById('profile_welcome_text').innerHTML = "Welcome Eric,"; 
  update_net();  
}

function update_net(){
  
  var assetLen = assetsBullets.length;
  var liabilitiesLen = liabilitiesBullets.length;

  net = 0.0;
  for ( i = 0; i < assetLen; i++){
    if (!isNaN(parseFloat(assetsBullets[i].value))){
      net += parseFloat(assetsBullets[i].value);
    }
  }
  for (i = 0; i < liabilitiesLen; i++){
    if (!isNaN(parseFloat(liabilitiesBullets[i].value))){
      net -= parseFloat(liabilitiesBullets[i].value);
    }
  }
  
  document.getElementById('profile_worth_text').innerHTML = "$" + net;
}


function add_asset (name, worth) {
    var input = document.createElement("P");
    input.style.padding = '15px 10px 10px 10px';
    input.setAttribute("class", "profile_asset_bullet");
    assetsBullets.push(input);
    assetsBulletsWorth.push(worth);
    input.innerHTML = assetsBullets.length + ". " + name;        
    var para = document.getElementById("profile_assets_box");
    var child =  document.getElementById("profile_add_assets_button");
    document.getElementById('profile_assets_placeholder').appendChild(input); 
    para.scrollTop = para.scrollHeight;
}

function add_liabilities () {
    var input = document.createElement("INPUT");
    input.setAttribute("class", "profile_liabilities_bullet");
    liabilitiesBullets.push(input);
    var para = document.getElementById("profile_liabilities_box");
    var child =  document.getElementById("profile_add_liabilities_button");
    document.getElementById('profile_liabilities_placeholder').appendChild(input);
    para.scrollTop = para.scrollHeight;    
  
}

function remove_asset(){
  var element = assetsBullets[assetsBullets.length - 1];
  var elementWorth = assetsBulletsWorth[assetsBulletsWorth.length - 1];
  net -= elementWorth;
  element.parentNode.removeChild(element);
  assetsBullets.splice(assetsBullets.length - 1, 1);
  assetsBulletsWorth.splice(assetsBulletsWorth.length - 1, 1);
  document.getElementById('profile_worth_text').innerHTML = "$" + net;
}

function remove_liabilities(){
  var element = liabilitiesBullets[liabilitiesBullets.length - 1];
  element.parentNode.removeChild(element);
  liabilitiesBullets.splice(liabilitiesBullets.length - 1, 1);
  update_net();
}


// When the user clicks on the button, open the modal 
function open_assets_modal() {
    var assets_menu = document.getElementById('assets_add_menu');
    assets_menu.style.display = "block";
    show_menu();
}

// When the user clicks on <span> (x), close the modal
function close_assets_modal() {
    var assets_menu = document.getElementById('assets_add_menu');    
    assets_menu.style.display = "none";
}

function hide_menu() {
  var logos = document.getElementsByClassName('modal_logo');
  for (var i = 0; i < logos.length; i++){
    logos[i].style.display = "none";
  }
}

function show_menu() {
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

function show(id){
  document.getElementById(id).style.display = "block";
}

function hide(id){
  document.getElementById(id).style.display = "none";
}

function open_others(){
  hide_menu();
  show('assets_modal_back');
  var others_input = document.getElementsByClassName('others_input');
  for (var i = 0; i < others_input.length; i++){
    others_input[i].style.display = "block";
  }
}

function add_net(asset){
  net += parseFloat(asset);
  document.getElementById('profile_worth_text').innerHTML = "$" + net;
}

function save_other(){
  var name = document.getElementById('asset_name').value;
  var worth = document.getElementById('asset_worth').value;
  if ( name != "" && worth != ""){
    add_asset(name, worth);
    add_net(worth);
    close_assets_modal();
  }
}








/*
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == assets_menu) {
        var assets_menu = document.getElementById('assets_add_menu');        
        assets_menu.style.display = "none";
    }
}


*/

///////////

function signout () {
    window.location.href = "signup.html";      
}









// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
