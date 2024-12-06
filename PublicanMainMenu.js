/// <reference path="XO.js" />
/// <reference path="en/PublicanMainMenu.js" />
// ***************************************************************************************
// XO7 
//
// ***************************************************************************************
// <sName:> js/PublicanMainMenu.js
// <sDesc:> MAIN MENU for Publican
// ***************************************************************************************
// History
// 2013.01.09 CDR Creation
// 2013.01.10 CDR Changed some functions to XO namespace
// 2013.01.17 CDR Changed ul to table for menu items to center it
// 2013.02.27 CDR Set false to new parameter of XO.UpdateSession
// ***************************************************************************************

// GLOBALS
var GlobalMenuList = [];
var GlobalFctLoadUrl = 1;
var GlobalSelectRow = null;
var GlobalTxtSelect = null;

// init
// Initializes the current page
// Returns nothing.
function init() {
    XO.Init();
    XO.GetSessionInfo();
    XO.LoadStrings("PublicanMainMenu.js");
    XO.Id("lblSelect").innerHTML = XO.String.Select + ":";
    XO.Id("headTitle").innerHTML = "Publican/" + XO.String.Title;
    GlobalSelectRow = XO.Id("trSelect");
    GlobalTxtSelect = XO.Id("txtSelect");
    LoadMenuEntries();
    GlobalTxtSelect.select();
}

// LoadMenu
// Change the current menu and logoff if it is "".
// Returns nothing.
function LoadMenu(menuId) {
    if (menuId == "") {
        XO.Logout();
    }
    else {
        XO.UpdateSession(sGlobalCieID, sGlobalWhseID, menuId, false);
        LoadMenuEntries();
    }
}

// CallMenuOrFunction
// Tries to call the menu or the function corresponding to the given number.
// Returns nothing.
function CallMenuOrFunction(num) {
    if (num == 9) {
        LoadMenu(sGlobalParentMenuID);
    }
    else {
        var chosenAction = null;

        for (var i = 0; i < GlobalMenuList.length; ++i) {
            if (num == GlobalMenuList[i].Sequence) {
                chosenAction = GlobalMenuList[i];
                break;
            }
            else if (num < GlobalMenuList[i].Sequence) {
                break;
            }
        }

        if (chosenAction == null) {
            XO.PrintCachedError(9101);
        }
        else if (chosenAction.IsMenu) {
            LoadMenu(chosenAction.Id);
        }
        else {
            if (chosenAction.FunctionType == GlobalFctLoadUrl) {
                XO.ChangeLocation(chosenAction.Execution, true, null);
            }
            else {
                alert("Unimplemented function type: " + chosenAction.FunctionType);
            }
        }
    }
}

// UpdateMenuEntries
// Updates menu entries in the page structure.
// Returns nothing.
function UpdateMenuEntries() {
    var menuListBody = XO.Id("menuListBody");

    // Clear all menu entries
    while (menuListBody.childNodes.length > 0)
        menuListBody.removeChild(menuListBody.childNodes[0]);

    menuListBody.appendChild(GlobalSelectRow);

    // Add from global
    for (var i = 0; i < GlobalMenuList.length; ++i) {
        menuListBody.appendChild(document.createElement("tr")).appendChild(document.createElement("td")).appendChild(document.createTextNode(GlobalMenuList[i].Sequence + ". " + GlobalMenuList[i].ShortDesc));
    }

    menuListBody.appendChild(document.createElement("tr")).appendChild(document.createElement("td")).appendChild(document.createTextNode("9. " + XO.String.Exit));

    XO.SetValue("txtSelect", "");
    XO.Id("txtSelect").select();
}

// LoadMenuEntries
// Gets the menu entries from the server.
// Returns nothing.
function LoadMenuEntries() {
    var xmlLoginResponse = XO.CallWebService(
        XO.WS.PB.GetMenuEntries,
        { insession: sGlobalSessionID },
        sGlobalPublicanMainWSUrl
    );

    var xmlEntries = xmlLoginResponse.getElementsByTagName("MenuEntry");

    if (xmlEntries.length == 0) {
        XO.PrintError(xmlLoginResponse);
    }
    else {
        GlobalMenuList.length = xmlEntries.length;

        for (var i = 0; i < GlobalMenuList.length; ++i) {
            GlobalMenuList[i] = {
                Id: XO.ReadField(xmlEntries[i], "ID"),
                IsMenu: (parseInt(XO.ReadField(xmlEntries[i], "IsMenu")) == 1),
                Sequence: parseInt(XO.ReadField(xmlEntries[i], "Sequence")),
                ShortDesc: XO.ReadField(xmlEntries[i], "ShortDesc"),
                FunctionType: parseInt(XO.ReadField(xmlEntries[i], "FCTTYPEID")),
                Execution: XO.ReadField(xmlEntries[i], "Execution")
            };
        }
        
        UpdateMenuEntries();
    }
}

// KeyUpOnSelectField
// e : KeyboardEvent
// Returns false if the key was a menu item.
function KeyUpOnSelectField(e) {
    // To catch numbers and keypad numbers
    //var num = e.keyCode - (e.keyCode < 96 ? 48 : 96);

    var myfield = e.srcElement;
    myfield.value = myfield.value.substring(myfield.value.length - 1);

    if (e.keyCode == XO.Keys.Enter) {
        var num = parseInt(e.srcElement.value);
        if (num >= 1 && num <= 9)
            CallMenuOrFunction(num);
        else
            XO.PrintCachedError(9101);

        e.srcElement.value = "";
        e.srcElement.select();
        return false;
    }

    return true;
}
