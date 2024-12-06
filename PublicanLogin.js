/// <reference path="XO.js" />
/// <reference path="en/PublicanLogin.js" />
// ***************************************************************************************
// XO7 
//
// ***************************************************************************************
// <sName:> js/PublicanLogin.js
// <sDesc:> LOGIN for Publican
// ***************************************************************************************
// History
// 2013.01.07 CDR Creation
// 2013.01.08 CDR Added XO_SoapExecute  NOTE: Put it in GlobalFunct.js?
// 2013.01.09 CDR Reorganized code and added documentation, removed XO_SoapExecute from here
// 2013.01.10 CDR Changed some functions to XO namespace
// 2013.02.28 CDR Added delete session support
// 2013.03.04 CDR Changed return value name in PB_InitSession
// 2013.03.21 CDR Changed to manually send SessionId parameter to main menu
// ***************************************************************************************

// SendLogin
// Tries to login with the values entered in user/password fields.
// Returns nothing
function SendLogin() {
    var userId = XO.GetValue("txtUserId");

    var xmlLoginResponse = XO.CallWebService(
        XO.WS.PB.ValidateUserPassword,
        {
            inUser: userId,
            inPassword: XO.GetValue("txtPassword"),
            inLanguage: sGlobalLanguageID
        },
        sGlobalPublicanMainWSUrl
    );

    if (xmlLoginResponse.getElementsByTagName("CONNECTION").length == 0) {
        XO.PrintError(xmlLoginResponse);
    }
    else {
        var xmlAccessResponse = XO.CallWebService(
            XO.WS.PB.ValidateAccessToMenu,
            {
                inUser: userId,
                inMenuType: 1 /* Main menu for HandHeld */
            },
            sGlobalPublicanMainWSUrl
        );

        if (xmlAccessResponse.getElementsByTagName("ACCESS").length == 0) {
            XO.PrintError(xmlAccessResponse);
        }
        else {
            sGlobalSessionID = "";

            var xmlSessionResponse = XO.CallWebService(
                XO.WS.PB.InitSession,
                {
                    inUser: userId,
                    inDelOthers: 0,
                    inLANG: sGlobalLanguageID
                },
                sGlobalPublicanMainWSUrl
            );

            if (xmlSessionResponse == null || XO.ContainsErrorMessage(xmlSessionResponse)) {
                if (XO.ReadField(xmlSessionResponse, "ALLOWDELETE") === "true") {
                    if (confirm(
                            XO.ReadField(xmlSessionResponse, "MSGTEXT") + "\n" +
                            XO.String.SessionDate + " " + XO.ReadField(xmlSessionResponse, "STARTDATETIME") + "\n" +
                            XO.String.CieId + " " + XO.ReadField(xmlSessionResponse, "CIEID") + "\n" +
                            XO.String.WhseId + " " + XO.ReadField(xmlSessionResponse, "SITEID") + "\n" +
                            XO.String.DeleteQuestion
                        )) {
                        
                        var xmlSessionResponse = XO.CallWebService(
                            XO.WS.PB.InitSession,
                            {
                                inUser: userId,
                                inDelOthers: 1,
                                inLANG: sGlobalLanguageID
                            },
                            sGlobalPublicanMainWSUrl
                        );

                        if (xmlSessionResponse == null || XO.ContainsErrorMessage(xmlSessionResponse)) {
                            XO.PrintError(xmlSessionResponse);
                        }
                        else {
                            sGlobalSessionID = XO.ReadField(xmlSessionResponse, "SESSIONID");
                        }
                    }
                }
                else {
                    XO.PrintError(xmlSessionResponse);
                }
            }
            else {
                sGlobalSessionID = XO.ReadField(xmlSessionResponse, "SESSIONID");
            }

            if (sGlobalSessionID !== "") {
                XO.ChangeLocation(sGPublicPublicanMainMenuURL, false, { SessionId: sGlobalSessionID });
            }
        }
    }
}

// KeyUpOnFields
// e : KeyboardEvent
// Returns false if the key was Enter.
function KeyUpOnFields(e) {
    if (e.keyCode == XO.Keys.Enter) {
        if (e.srcElement.id == "txtPassword") {
            SendLogin();
            XO.Id("txtUserId").value = "";
            XO.Id("txtPassword").value = "";
            XO.Id("txtUserId").select();
        }
        else
            XO.Id("txtPassword").select();
        
        return false;
    }

    return true;
}

// OverrideTab
// Overrides the default Tab handling.
// e : KeyboardEvent
// Returns false if the key was Enter.
function OverrideTab(e){
    if (e.keyCode == XO.Keys.Tab) {
        if (e.srcElement.id == "txtUserId")
            XO.Id("txtPassword").select();
        else
            XO.Id("txtUserId").select();

        return false;
    }
    else if (e.keyCode == XO.Keys.Enter) {
        return false;
    }
    else
        return true;
}

// init
// Initializes the current page
// Returns nothing.
function init() {
    XO.Init();
    XO.LoadStrings("PublicanLogin.js");
    XO.Id("headTitle").innerHTML = "Publican/" + XO.String.Title;
    XO.Id("lblUser").innerHTML = XO.String.User;
    XO.Id("lblPassword").innerHTML = XO.String.Password;
    XO.Id("txtUserId").select();
}
