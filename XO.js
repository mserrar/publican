/// <reference path="GlobalFunct.js" />
// ***************************************************************************************
// XO7 
//
// ***************************************************************************************
// <sName:> js/XO.js 
// <sDesc:> XO namespace for Publican
// ***************************************************************************************
//
// Notes:
//  XML documentation help:
//  http://msdn.microsoft.com/en-us/library/hh542725.aspx
//
// ***************************************************************************************
// History
// 2013.01.10 CDR Creation
// 2013.01.11 CDR Added XO.CallWebService to simplify web services
// 2013.01.14 CDR Modified XO.ChangeLocation to make it support parameters
// 2013.01.16 CDR Added UpdatePickStatus, GetPickInfo, GetNextItemToPick, PickValidateInput in WS
//                Added XO.ValidateEntryCompleted
// 2013.01.21 CDR Created XO.FormatFloat
// 2013.01.21 CDR Added ValidateQtyPicked in WS
// 2013.01.28 CDR Added Debuging functions (F9 key to toggle)
// 2013.02.02 CDR Added WS.PC.GetOrderInfo, WS.PC.GetBoxInfo
//                Added null checking in ReadField
// 2013.02.07 CDR Added WS.PC: GetMoveInfo, GetItemMoveInfo, InsertMoveOut,
//                             InsertMoveIn, GetMoveItemsLeft, CompleteMove
//                Created: XO.SetLabelText(labelId, value)
//                         XO.SetValue(inputId, value)
//                Added SpecialValue.ViewItems and SpecialValue.Switch for Bin Transfer
// 2013.02.08 CDR Added XO.Global.BinTransferSelectorUrl
//                Added in XO.Global: BinTransferUrl, RxSQLDate, RxZeros, SpecialValue.New
//                Added XO.RemoveZeros, XO.ParseSQLDate
// 2013.02.11 CDR Changed EntryCompleted from "=ENTRYCOMPLETED=" to "=EC="
//                Changed <TAG> to =TAG= for BIN MOVE and <SWITCH> to =SW=
// 2013.02.13 CDR Added in XO.WS.PC : GetBinQtyPicked, ValidateLocation
// 2013.02.14 CDR Modified XO.ChangeLocation to consider url with parameters ("url.html?prm=value")
// 2013.02.19 CDR Hardcoded XO.String: Msg4000, Msg9101
// 2013.02.20 CDR Added some debugging info
// 2013.02.22 CDR Added fixed height adjustment at loading
// 2013.02.22 CDR Added XO.FixEnterPIE, XO.FakeSelect for scanner behavior
// 2013.02.25 CDR Added XO.TranslateBatch as { labelId: "String name", etc. }
//                Made only one global XMLHttp request object (XO.XHR)
// 2013.02.26 CDR Added XO.WS.PC.Receiving
//                Added XO.Global.ReceivingUrl
// 2013.02.27 CDR Added XO.WS.PC.SwitchMoveStatus
//                Added window.parent.PublicanSession support
// 2013.02.28 CDR Added XO.CallPublicanWebService (auto adds session parameter)
//                Removed XO.WS.PC: SwitchMoveStatus and CompleteMove
//                Replaced by: XO.WS.PC.UpdateMoveStatus
// 2013.03.01 CDR Added XO.WS.PC.GetPackedItems
//                Worked on documentation
// 2013.03.08 CDR Added XO.IsSpecialValue(entry, specialValueName)
//                And made XO.ValidateEntryCompleted use it
// 2013.03.21 CDR Added XO.AddEvent, XO.AddEvents, XO.RemoveEvent, XO.ReadStructure
//                Added XO.Session object (will now replace global session variables)
// 2013.04.08 CDR Added XO.GlobaleSpecialValue.Print and XO.WS.PP for PublicanPrinting
//                Added Url in each XO.WS
// 2013.04.09 CDR Adjusted AddClass and RemoveClass regexp
// 2013.04.11 CDR Splited Print tag into PrintDefault and PrintDialog
//                Renamed from Namespace.js to XO.js
// 2013.04.22 CDR Added XO.WS.PB.GetNextItemMethod
// 2013.04.25 CDR Rewrited XO.ContainsErrorMessage
// 2013.05.09 CDR Rewrited as var XO = { ... }; instead of var XO = new function() { ... }();
//                Added documentation
// 2013.05.10 CDR Added XO.LoadXMLTable and XO.SeekTableIndex
//                Added XO.WS.PC.StockCountSelector
// 2013.05.16 CDR Added XO.Url with StockCount and StockCountSelector
//                Added XO.Url.MainMenu and XO.Url.Login and changed to use it at logout
//                Added XO.ParseXMLDocument to uniformize XML decoding
//                Added XO.WS.PC.ValidateStockCountLocation
//                Added XO.WS.PC.ValidateStockCountBin
// 2013.05.29 CDR Added auto init
// 2013.05.31 CDR Added XO.WS.PC.GetNextItemToCount, XO.WS.PC.SetStockCountedQty
//                Added XO.TrimInput
//                Corrected FakeSelect to put cursor at end
//                Removed All hasOwnProperty
// 2013.06.14 CDR Added warning when user quits Publican and session is open
//                (In XO.Init and XO.ChangeLocation)
// 2013.06.17 CDR Added in XO.WS.PC: GetStockCountLocations, GetStockCountBins, GetStockCountItems
// 2013.08.02 CDR Removed XO.CallWebServiceAsync (was used only with Cresswell)
// 2013.08.19 CDR XO.FakeSelect auto-fix Enter Key on PocketIE
// 2013.10.16 CDR Support des nombres négatifs dans XO.ReadIntField()
// 2013.10.17 CDR XO.ShowError n'affiche le numéro que s'il est > 0
// 2013.12.13 CDR Changement dans XO.CreateXMLDocument: xmlDoc.load -> xmlDoc.loadXML
//                Ajouts dans XO.Url: POReceiving et PORecSelector
//                Ajouts dans XO.WS.PC:
//                  RecSelector, RecUpdateStatus, RecGetInfo, RecGetItemCount,
//                  RecGetItemDtlInfo, RecValidateItemSinSp, RecUpdate, RecGetItems
// 2013.12.20 CDR Changement de XO.WS.PC.RecUpdateStatus pour UpdatePORecStatus
//                Correction PC_ValidateItemSin (sans Sp et sans Rec)
//                Ajout de XO.WS.PC.RecValidateQty
// 2013.12.21 CDR Ajout de XO.WS.PC.POREC.ValidateItemSin
//                Changement de XO.WS.PC.RecGetItems pour POREC.GetItems
// 2013.12.23 CDR Ajout de XO.Url.PORecPosting
// 2013.12.27 CDR Ajout de XO.WS.PC.ADJ.AddEntry et XO.WS.PB.GetConfig
//                Ajout du parametre optionnel acceptNegative dans XO.CreateNumberRegExp
//                Ajout de XO.WS.PB.ValidateUser, XO.WS.PC.ADJ.ValidateQty
// ***************************************************************************************

/// <var name="XO">
///     XO is the main static class for the Javascript part of Publican.
///     It handles Web Services, translations, configuration, constants,
///     static variables, session, modules, debugging, XML functions,
///     HTML functions, events, etc.
/// </var>
var XO = {
    /// <field name="Global" type="Object">Global constants/variables container</field>
    Global: {
        LanguagePath: "/Apps/js",
        LoginUrl: "/Apps/PublicanLogin.html",
        MainMenuUrl: "/Apps/PublicanMainMenu.html",
        PickSelectorUrl: "/Apps/PickSelector.html",
        PickingUrl: "/Apps/Picking.html",
        BinTransferSelectorUrl: "/Apps/BinTransferSelector.html",
        BinTransferUrl: "/Apps/BinTransfer.html",
        ReceivingUrl: "/Apps/Receiving.html",
        WSNSPrefix: "http://tempuri.org/",
        RxSQLDate: /(\d{4})[-\/ ](\d\d)[-\/ ](\d\d)[T ](\d\d):(\d\d)/i, // (-(\d\d))?(\.(\d{1,3})?)
        RxZeros: /0*(\d+)/i,
        SpecialValue: {
            EntryCompleted: "=EC=",
            CancelBox: "=CANCELBOX=",
            CancelDoc: "=CANCELDOC=",
            Exit: "<<EXIT>>",
            ViewItems: "=VIEW=",
            Switch: "=SW=",
            New: "=NEW=",
            PrintDefault: "=PRINT=",
            PrintDialog: "=PRINTGEN=",
            NextPage: "<+>",
            PreviousPage: "<->"
        }
    },

    /// <field name="Url" type="Object">All URLs</field>
    Url: {
        Login: "/Apps/PublicanLogin.html",
        MainMenu: "/Apps/PublicanMainMenu.html",
        PickSelector: "/Apps/PickSelector.html",
        StockCountSelector: "/Apps/StockCountSelector.html",
        StockCount: "/Apps/StockCount.html",
        PORecSelector: "/Apps/PORecSelector.html",
        POReceiving: "/Apps/POReceiving.html",
        PORecPosting: "/Apps/PORecPosting.html"
    },

    /// <field name="WS" type="Object">Web services names container</field>
    WS: {
        /// <field name="UseSOAP" type="Boolean">
        ///     Make XML calls to Web Services.
        ///     More structured but larger content.
        /// </field>
        UseSOAP: true,
        //AsyncEnabled: false,
        //Timeout: 10000,
        //ExtendedTimeout: 60000,
        /// <field name="PB" type="Object">PublicanMain web service</field>
        PB: {
            Url: "/WS/PublicanMain.asmx",
            ValidateUserPassword: "PB_ValidateUserPassword",
            ValidateAccessToMenu: "PB_ValidateAccessToMenu",
            InitSession: "PB_InitSession",
            GetSessionInfo: "PB_GetSessionInfo",
            UpdateSession: "PB_UpdateSession",
            RemoveSession: "PB_RemoveSession",
            GetMenuEntries: "PB_GetMenuEntries",
            GetCieWhse: "PB_GetCieWhse",
            GetNextItemMethod: "PB_GetNextItemMethod",
            ValidateUser: "PB_ValidateUser",
            ADJ: {
                GetConfig: "PB_ADJ_GetConfig"
            }
        },
        /// <field name="PC" type="Object">PublicanGP web service</field>
        PC: {
            Url: "/WS/PublicanGP.asmx",
            StockInquiry: "PC_StockInquiry",
            PickSelector: "PC_PickSelector",
            UpdatePickStatus: "PC_UpdatePickStatus",
            GetPickInfo: "PC_GetPickInfo",
            GetNextItemToPick: "PC_GetNextItemToPick",
            PickValidateInput: "PC_PickValidateInput",
            ValidateBIN: "PC_ValidateBIN",
            ValidateQtyPicked: "PC_ValidateQtyPicked",
            ConfirmPickQty: "PC_ConfirmPickQty",
            GetOrderInfo: "PC_GetOrderInfo",
            GetBoxInfo: "PC_GetBoxInfo",
            GetItemPackingInfo: "PC_GetItemPackingInfo",
            ConfirmPackQty: "PC_ConfirmPackQty",
            CancelBox: "PC_CancelBox",
            UpdatePackStatus: "PC_UpdatePackStatus",
            GetPackedItems: "PC_GetPackedItems",
            GetMoveInfo: "PC_GetMoveInfo",
            GetItemMoveInfo: "PC_GetItemMoveInfo",
            InsertMoveOut: "PC_InsertMoveOut",
            InsertMoveIn: "PC_InsertMoveIn",
            GetMoveItemsLeft: "PC_GetMoveItemsLeft",
            UpdateMoveStatus: "PC_UpdateMoveStatus",
            BinTransferSelector: "PC_BinTransferSelector",
            GetBinQtyPicked: "PC_GetBinQtyPicked",
            ValidateLocation: "PC_ValidateLocation",
            Receiving: "PC_Receiving",
            StockCountSelector: "PC_StockCountSelector",
            ValidateStockCountLocation: "PC_ValidateStockCountLocation",
            ValidateStockCountBin: "PC_ValidateStockCountBin",
            GetNextItemToCount: "PC_GetNextItemToCount",
            SetStockCountedQty: "PC_SetStockCountedQty",
            GetStockCountLocations: "PC_GetStockCountLocations",
            GetStockCountBins: "PC_GetStockCountBins",
            GetStockCountItems: "PC_GetStockCountItems",
            RecSelector: "PC_RecSelector",
            UpdatePORecStatus: "PC_UpdatePORecStatus",
            RecGetInfo: "PC_RecGetInfo",
            RecGetItemCount: "PC_RecGetItemCount",
            RecGetItemDtlInfo: "PC_RecGetItemDtlInfo",
            RecValidateQty: "PC_RecValidateQty",
            RecUpdate: "PC_RecUpdate",
            ValidateItemSin: "PC_ValidateItemSin",
            POREC: {
                ValidateItemSin: "PC_POREC_ValidateItemSin",
                GetItems: "PC_POREC_GetItems",
                UpdateGP: "PC_POREC_UpdateGP"
            },
            ADJ: {
                ValidateQty: "PC_ADJ_ValidateQty",
                AddEntry: "PC_ADJ_AddEntry"
            }
        },
        /// <field name="PP" type="Object">PublicanPrinting web service</field>
        PP: {
            Url: "/WS/PublicanPrinting.asmx",
            GetPrinters: "PP_GetPrinters",
            PrintPackageContentList: "PP_PrintPackageContentList"
        }
    },

    /// <field name="Session" type="Object">[readonly] Session variables</field>
    Session: {
        SessionId: "",
        UserId: "",
        LanguageId: "",
        CieId: "",
        WhseId: "",
        MenuId: "",
        ParentMenuId: ""
    },

    /// <field name="Keys" type="Object">[readonly] Key names constants (to avoid values)</field>
    Keys: {
        BackSpace: 8,
        Tab: 9,
        Enter: 13,
        SpaceBar: 32,
        Delete: 46,
        F2: 113,
        F3: 114,
        F8: 119,
        F9: 120,
        F10: 121
    },

    /// <field name="String" type="Object">All strings loaded from language files</field>
    String: {},

    /// <field name="Initialized" type="Boolean">[readonly] true if Init has been called</field>
    Initialized: false,

    /// <field name="DebugElement" type="HTMLDivElement">
    ///     DIV element that contains all debuging info.
    /// </field>
    DebugElement: document.createElement("div"),

    /// <field name="XHR" type="XMLHttpRequest">
    ///     Global Xml Http Request for synchronous Web Service calls
    /// </field>
    XHR: (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Msxml2.XMLHTTP")),

    /// <field name="Modules" type="Object">Loaded modules</field>
    Modules: {},

    //*******************************************************

    CheckDebugKey: function (e) {
        /// <summary>
        ///     Check if user pressed the debug key and calls XO.ToggleDebug()
        /// </summary>
        /// <param name="e" type="KeyboardEvent"></param>
        /// <returns type="void"/>

        if (e.keyCode === this.Keys.F9) {
            this.ToggleDebug();
        }
        /*else if (e.ctrlKey && e.shiftKey && e.keyCode === 'X'.charCodeAt(0)) {
            alert("CTRL + SHIFT + X");
        }*/
    },

    ToggleDebug: function () {
        /// <summary>
        ///     Toggle debug displaying.
        /// </summary>
        /// <returns type="void"/>

        if (this.DebugElement.visible) {
            this.DebugElement.visible = false;
            document.body.removeChild(this.DebugElement);
        }
        else {
            this.DebugElement.visible = true;
            document.body.appendChild(this.DebugElement);
        }
    },

    Debug: function (text) {
        /// <summary>
        ///     Add text to the debug log.
        /// </summary>
        /// <param name="text" type="String">Text to add</param>
        /// <returns type="void"/>

        this.DebugElement.appendChild(document.createElement("pre")).appendChild(document.createTextNode(text));
    },

    AddModule: function (moduleName, asGlobal, moduleObject) {
        /// <summary>
        ///     Add a module in XO.Modules
        /// </summary>
        /// <param name="moduleName" type="String">Module name. Ex: "Printing" (then use it with XO.Modules.Printing)</param>
        /// <param name="asGlobal" type="Boolean">Register as global in XO. Ex when true: XO.Printing will be the same as XO.Modules.Printing</param>
        /// <param name="moduleObject" type="Object">The module object to add. Ex: { MyNumber: 1, MyText : "hello" }</param>
        /// <returns type="void"/>

        if (this.Modules[moduleName] != null) {
            this.Debug("Module already loaded: " + moduleName);
        }
        else {
            this.Modules[moduleName] = moduleObject;
            if (asGlobal) {
                if (this[moduleName] != null) {
                    this.Debug("Can't make global module: " + moduleName);
                }
                else {
                    this[moduleName] = moduleObject;
                }
            }

            if (this.Initialized) {
                this.TryInitModule(moduleName, moduleObject);
            }
        }
    },

    TryInitModule: function (moduleName, moduleObject) {
        /// <summary>
        ///     [private] Initialize a module.
        /// </summary>
        /// <param name="moduleName" type="String">Name of the module to initialize</param>
        /// <param name="moduleObject" type="Object">The module object to initialize</param>
        /// <returns type="void"/>

        if (moduleObject.Init) {
            try {
                moduleObject.Init();
            }
            catch (err) {
                this.Debug("Module XO.Modules." + moduleName + " failed to init: " + err.message + " " + err.description);
            }
        }
    },

    Init: function () {
        /// <summary>
        ///     Inits global variables.
        /// </summary>
        /// <returns type="void"/>

        if (this.Initialized) {
            this.Debug("XO.Init called twice.");
            return;
        }

        this.Session.LanguageId = sGlobalLanguageID = this.GetSystemLanguage();
        this.Debug("Language: " + this.Session.LanguageId);
        this.Debug("User agent: " + window.navigator.userAgent);
        this.Debug("Size: " + window.screen.width + "x" + window.screen.height);
        this.Debug("Resolution: " + window.screen.availWidth + "x" + window.screen.availHeight);
        /*this.Debug("Device DPI: " + window.screen.deviceXDPI + "x" + window.screen.deviceYDPI);
        this.Debug("Logical DPI: " + window.screen.logicalXDPI + "x" + window.screen.logicalYDPI);
        this.Debug("System DPI: " + window.screen.systemXDPI + "x" + window.screen.systemYDPI);*/
        XO_InitGlobals();
        this.AddEvent(document.body, "keyup", function (e) { XO.CheckDebugKey(e); });

        var pageContentCell = this.Id("pageContentCell");
        if (pageContentCell) {
            pageContentCell.style.height = (document.body.clientHeight - 48) + "px";
        }

        window.onbeforeunload = function () {
            if (XO.Session.SessionId != "") {
                return XO.String.SessionIsOpen;
            }
        };

        this.Initialized = true;

        for (var moduleName in this.Modules) {
            this.TryInitModule(moduleName, this.Modules[moduleName]);
        }
    },

    AddEvents: function (events) {
        /// <summary>
        ///     Add event listeners from event definition of this form: <br/>
        /// {
        ///     myButtonId: {
        ///         click: myButtonId_click_function,
        ///         keyup: someFunction,
        ///         ...
        ///     },
        ///     myInputId: {
        ///         change: function_onChange,
        ///         ...
        ///     }
        ///     ...
        /// }
        /// </summary>
        /// <param name="events" type="Object">Events definition</param>
        /// <returns type="void"/>

        var id = "";
        var eventName = "";
        var element = null;

        for (id in events) {
            for (eventName in events[id]) {
                this.AddEvent(this.Id(id), eventName, events[id][eventName]);
            }
        }
    },

    AddEvent: function (element, eventName, functionRef) {
        /// <summary>
        ///      Add an event listener to an element
        /// </summary>
        /// <param name="element" type="Node">Element to listen on</param>
        /// <param name="eventName" type="String">Event name</param>
        /// <param name="functionRef" type="Function">Callback function</param>
        /// <returns type="void"/>

        if (element.addEventListener) {
            element.addEventListener(eventName, functionRef, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + eventName, functionRef);
        }
        else {
            element["on" + eventName] = functionRef;
        }
    },

    RemoveEvent: function (element, eventName, functionRef) {
        /// <summary>
        ///      Remove an event listener to an element
        /// </summary>
        /// <param name="element" type="Element">Element to remove from</param>
        /// <param name="eventName" type="String">Event name</param>
        /// <param name="functionRef" type="Function">Callback function to remove</param>
        /// <returns type="void"/>

        if (element.removeEventListener) {
            element.removeEventListener(eventName, functionRef, false);
        }
        else if (element.detachEvent) {
            element.detachEvent("on" + eventName, functionRef);
        }
        else {
            element["on" + eventName] = null;
        }
    },

    GetTarget: function (e) {
        /// <summary>
        ///      Get the event's source element.
        /// </summary>
        /// <param name="e" type="Event">Event to get target from</param>
        /// <returns type="Element"/>

        //return e.currentTarget || e.target || e.srcElement;
        return e.srcElement || e.target || e.currentTarget;
    },

    CancelEvent: function (e) {
        /// <summary>
        ///      Cancel an event.
        /// </summary>
        /// <param name="e" type="Event">Event to cancel</param>
        /// <returns type="Boolean"/>

        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
        /*if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            e.cancelBubble = true;
        }*/

        return false;
    },

    GetSystemLanguage: function () {
        /// <summary>
        ///     Gets the system language.
        /// </summary>
        /// <returns type="Number">1 for english or 2 for french</returns>

        return /^fr/i.test(window.navigator.systemLanguage) ? 2 : 1;
    },

    LoadStrings: function (fileName) {
        /// <summary>
        ///     Loads a language file.
        /// </summary>
        /// <param name="fileName" type="String">File name in "en" and "fr"</param>
        /// <returns type="void"/>

        try {
            this.XHR.open("GET", sGPublicanHost + sGlobalPublicanRoot + this.Global.LanguagePath + "/" + (this.Session.LanguageId === 2 ? "fr" : "en") + "/" + fileName, false);
            this.XHR.send();

            eval(this.XHR.responseText);
        }
        catch (err) {
            this.Debug("Failed to load strings from " + fileName + "\nResponse: " + this.XHR.responseText + "\nError: " + err.description);
        }
    },

    TranslateBatch: function (batch) {
        /// <summary>
        ///     Translates a batch of labels.
        /// </summary>
        /// <param name="batch" type="Object">Batch to translate</param>
        /// <returns type="void"/>

        var labelId;

        for (labelId in batch) {
            XO.SetLabelText(labelId, XO.String[batch[labelId]] != null ? XO.String[batch[labelId]] : "{" + batch[labelId] + "}");
        }
    },

    ChangeLocation: function (newLocation, autoSendSessionId, parameters) {
        /// <summary>
        ///     Sets the document.location to the Publican relative location given.
        /// </summary>
        /// <param name="newLocation" type="String">
        ///     Path to load. Ex: "/Apps/PublicanLogin.html"
        /// </param>
        /// <param name="autoSendSessionId" type="Boolean">
        ///     If set to true, SessionId paramter will be set.
        ///     This should be true in most cases.
        /// </param>
        /// <param name="parameters" type="Object">
        ///     An object with all parameters/values to send.
        ///     Ex: { PickNumber: 1, param: value }
        /// </param>
        /// <returns type="void"/>

        if (typeof parameters != "object" ||
            parameters == null) {
            parameters = {};
        }
        if (autoSendSessionId) {
            parameters["SessionId"] = this.Session.SessionId; //sGlobalSessionID;
        }

        var parametersStr = "";
        var paramName = null;
        var completeURL = sGPublicanHost + sGlobalPublicanRoot + newLocation;

        for (paramName in parameters) {
            parametersStr += "&" + paramName + "=" + encodeURIComponent(parameters[paramName]);
        }

        if (parametersStr.length > 0) {
            completeURL += (completeURL.indexOf("?") >= 0 ? "&" : "?") + parametersStr.substr(1);
        }

        window.onbeforeunload = null;
        document.location = completeURL;
    },

    XmlEncode: XO_XmlEncode,
    GetUrlVars: getUrlVars,
    Trim: trim,
    Id: function (id) {
        /// <summary>
        ///     Get an element by its id.
        /// </summary>
        /// <param name="id" type="String">Id of the element</param>
        /// <returns type="Element"/>

        return document.getElementById(id);
    },
    GetValue: function (id) {
        /// <summary>
        ///     Get the value of an input element by its id.
        /// </summary>
        /// <param name="id" type="String">Id of the input element</param>
        /// <returns type="String"/>

        return this.Id(id).value;
    },
    SetValue: function (inputId, value) {
        /// <summary>
        ///     Set the value of an input element.
        /// </summary>
        /// <param name="inputId" type="String">Id of the input element</param>
        /// <param name="value" type="String">Value to set</param>
        /// <returns type="void"/>

        this.Id(inputId).value = value;
    },
    SetLabelText: function (labelId, value) {
        /// <summary>
        ///     Set the content of an element.
        /// </summary>
        /// <param name="labelId" type="String">Id of the element</param>
        /// <param name="value" type="String">Content to set</param>
        /// <returns type="void"/>

        this.Id(labelId).innerHTML = value;
    },
    TrimInput: function (inputRef) {
        /// <summary>
        ///     Trim the text in an input.
        /// </summary>
        /// <param name="inputRef" type="HTMLInputElement">Input element reference</param>
        /// <returns type="HTMLInputElement"/>

        if (inputRef != null && inputRef.value != null) {
            inputRef.value = this.Trim(inputRef.value);
        }
        return inputRef;
    },

    RemoveZeros: function (str) {
        /// <summary>
        ///     Removes begining zeros of a number (as String).
        /// </summary>
        /// <param name="str" type="String">String to remove zeros</param>
        /// <returns type="String">Corrected string</returns>

        return str.replace(this.Global.RxZeros, "$1");
    },

    ParseSQLDate: function (str) {
        /// <summary>
        ///     Parses a String to a Date
        /// </summary>
        /// <param name="str" type="String">String to parse</param>
        /// <returns type="Date" mayBeNull="true">Parsed date</returns>

        // This function is callable without valid context
        if (this !== XO) {
            return XO.ParseSQLDate(str);
        }

        var rxResult = this.Global.RxSQLDate.exec(str);

        if (rxResult != null && rxResult.length > 0) {
            var date = new Date();

            date.setFullYear(
                parseInt(this.RemoveZeros(rxResult[1])),
                parseInt(this.RemoveZeros(rxResult[2])) - 1,
                parseInt(this.RemoveZeros(rxResult[3]))
            );
            date.setHours(
                parseInt(this.RemoveZeros(rxResult[4])),
                parseInt(this.RemoveZeros(rxResult[5])),
                0,
                0
            );

            return date;
        }
        else {
            return null;
        }
    },

    ReadStructure: function (xmlRow, structure, prefix) {
        /// <summary>
        ///     Read structure from xmlRow depending on structure property names. (prefix + [upper case property name])
        /// </summary>
        /// <param name="xmlRow" type="Element">XML row to read from</param>
        /// <param name="structure" type="Object">Structure to read</param>
        /// <param name="prefix" type="String">Prefix to add before the property name to get xml node name</param>
        /// <returns type="void"/>

        var propertyName = "";
        for (propertyName in structure) {
            structure[propertyName] = this.ReadField(xmlRow, prefix + propertyName.toUpperCase());
        }
    },

    IsSpecialValue: function (entry, specialValueName) {
        /// <summary>
        ///     Checks if the entry parameter equals XO.Global.SpecialValue[specialValueName].
        /// </summary>
        /// <param name="entry" type="String">Entry to check</param>
        /// <param name="specialValueName" type="String">Special value name in XO.SpecialValue</param>
        /// <returns type="Boolean">True if entry matches the special value</returns>

        return entry.toUpperCase() === this.Global.SpecialValue[specialValueName].toUpperCase();
    },

    ValidateEntryCompleted: function (entry) {
        /// <summary>
        ///     Checks if the entry parameter equals XO.Global.SpecialValue.EntryCompleted.
        /// </summary>
        /// <param name="entry" type="String">Entry to check</param>
        /// <returns type="Boolean">True if entry matches the Entry Completed tag</returns>

        return this.IsSpecialValue(entry, "EntryCompleted");
    },

    FormatFloat: function (value, decimals) {
        /// <summary>
        ///     Format the given value to string with given number of decimals.
        /// </summary>
        /// <param name="value" type="Number">Floating number to format</param>
        /// <param name="decimals" type="Number">Number of decimals to keep</param>
        /// <returns type="String">Formatted number as string</returns>

        var a = Math.pow(10, decimals);
        return (Math.round(value * a) / a).toFixed(decimals);
    },

    CreateNumberRegExp: function (decimals, acceptNegative) {
        /// <summary>
        ///     Create a RegExp to validate numbers with decimals.
        /// </summary>
        /// <param name="decimals" type="Number">Number of decimals for the number</param>
        /// <param name="acceptNegative" type="Boolean" optional="true" mayBeNull="true">
        ///     Definie si les nombres negatifs sont acceptes.
        /// </param>
        /// <returns type="RegExp">Formatted number as string</returns>
        var rdo = 0;
        acceptNegative = true;
        return new RegExp("^(" + (acceptNegative ? "-?" : "") + "[0-9]+" + (decimals > 0 ? "(\\.[0-9]{0," + decimals + "})?" : "") + ")$", "i");
    },

    ContainsErrorMessage: function (xmlDoc) {
        /// <summary>
        ///     Test if the received xml contains an error message.
        /// </summary>
        /// <param name="xmlDoc" type="Document">The received xml document from a Web Service</param>
        /// <returns type="Boolean">True if the xmlDoc contains an error message.</returns>
        return this.ReadIntField(xmlDoc, "MSGNBR") !== 0;
    },

    ShowError: function (xmlDoc) {
        /// <summary>
        ///     Print the given error to the user.
        /// </summary>
        /// <param name="xmlDoc" type="Document">The received xml document from a Web Service</param>
        /// <returns type="void"/>

        if (xmlDoc != null) {
            var msgNbr = this.ReadField(xmlDoc, "MSGNBR");
            var text = this.ReadField(xmlDoc, "MSGTEXT");

            if (msgNbr > 0) {
                text += " (" + msgNbr + ")";
            }

            alert(text);
        }
        else {
            alert("XML response is null!");
        }
    },

    ShowCachedError: function (errorNumber) {
        /// <summary>
        ///     Print the given error to the user. (loaded from languages files)
        /// </summary>
        /// <param name="errorNumber" type="Number">Error number. Ex: 4000</param>
        /// <returns type="void"/>

        try {
            alert(this.String["Msg" + errorNumber] + " (" + errorNumber + ")");
        }
        catch (err) {
            alert("Unknown error.\nErreur inconnue.\n#" + errorNumber);
        }
    },

    // XO.PrintError [DEPRECATED] Use XO.ShowError
    PrintError: function (xmlDoc) {
        this.ShowError(xmlDoc);
    },

    // XO.PrintCachedError [DEPRECATED] Use XO.ShowCachedError
    PrintCachedError: function (errorNumber) {
        this.ShowCachedError(errorNumber);
    },

    CreateXMLDocument: function (content) {
        if (window.DOMParser) {
            return (new DOMParser()).parseFromString(content, "text/xml");
        }
        else {
            var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
            xmlDoc.loadXML(content);
            return xmlDoc;
        }
    },

    CallWebService: function (functionName, parameters, relativeWSUrl) {
        /// <summary>
        ///     Call a web service with given parameters.
        /// </summary>
        /// <param name="functionName" type="String">Name of function to call in Web Service. Ex: "PB_RemoveSession"</param>
        /// <param name="parameters" type="Object">Parameters object to send to the function. Ex: { param1: "value", param2: 5, ..., lastParam: "bye" }</param>
        /// <param name="relativeWSUrl" type="String">Url of the Web Service (relative to Publican root path) Ex: "/WS/PublicanMain.asmx"</param>
        /// <returns type="Document">Result as XML Document</returns>

        var debugText = "XO.CallWebService: " + functionName + "(" + relativeWSUrl + ")\r\nParameters:\r\n";
        var paramName;
        var paramValue;

        var postContent = "";

        for (paramName in parameters) {
            paramValue = (typeof parameters[paramName] === "boolean" ? (parameters[paramName] ? "true" : "false") : parameters[paramName].toString());
            debugText += paramName + ": " + paramValue + "\r\n";
            postContent += paramName + "=" + encodeURIComponent(paramValue) + "&";
        }
        postContent = postContent.substring(0, postContent.length - 1);

        debugText += "Returned:\r\n";

        if (this.WS.UseSOAP) { // SOAP
            var xmlDoc = XO_SoapExecute(
                functionName,
                this.Global.WSNSPrefix + functionName,
                parameters,
                sGPublicanHost + sGlobalPublicanRoot + relativeWSUrl + "?op=" + functionName
            );
        }
        else { // POST
            this.XHR.open("POST", sGPublicanHost + sGlobalPublicanRoot + relativeWSUrl + "/" + functionName, false);
            this.XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            this.XHR.setRequestHeader("Content-Length", postContent.length);
            if (this.XHR.timeout) {
                this.XHR.timeout = 5000;
            }
            this.XHR.send(postContent);

            //var xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
            var xmlDoc = null;

            if (this.XHR.readyState == 4 && this.XHR.status == 200) {
                //xmlDoc.loadXML(this.XHR.responseText);
                xmlDoc = this.CreateXMLDocument(this.XHR.responseText);

                if (xmlDoc &&
                     typeof xmlDoc.childNodes != "undefined" &&
                            xmlDoc.childNodes.length == 0) {
                    alert(xmlDoc.xml);
                    xmlDoc = null;
                }
                else {
                    try {
                        //xmlDoc.loadXML(xmlDoc.getElementsByTagName("string")[0].firstChild.data);
                        xmlDoc = this.CreateXMLDocument(this.ReadField(xmlDoc, "string"));
                    }
                    catch (err) {
                        alert("Request failed:\n" + xmlDoc.xml);
                        xmlDoc = null;
                    }
                }
            }
            else {
                if (this.XHR.readyState == 0) {
                    alert("Server not responding!");
                }
                else {
                    document.body.appendChild(document.createElement("pre")).appendChild(document.createTextNode(
                        "XML Http error: \r\nreadyState: " + this.XHR.readyState + "\r\nHTTP return code: " + this.XHR.status + "\r\nSent:\r\n" + postContent + "\r\n\r\nResponse text:\r\n" + this.XHR.responseText
                    ));
                }
            }
        }

        debugText += (xmlDoc ? xmlDoc.xml : "null");
        this.Debug(debugText);
        return xmlDoc;
    },

    CallPublicanWebService: function (functionName, parameters) {
        /// <summary>
        ///     Calls a Publican GP Web Service. (Session and language automatic)
        /// </summary>
        /// <param name="functionName" type="String">Web method to call</param>
        /// <returns type="Document" mayBeNull="true" value="">XML Document</returns>

        parameters.inSession = this.Session.SessionId; //sGlobalSessionID;
        parameters.inLANG = this.Session.LanguageId; //sGlobalLanguageID;
        return this.CallWebService(functionName, parameters, sGlobalPublicanWSUrl);
    },

    ReadField: function (xmlRow, fieldName) {
        /// <summary>
        ///     Read a field from an element.
        /// </summary>
        /// <param name="xmlRow" type="Element">The XML element or document representing the row.</param>
        /// <param name="fieldName" type="String">The tag name of the node to read. Ex: ITEMNMBR</param>
        /// <returns type="String"/>
        
        if (xmlRow != null) {
            var elements = xmlRow.getElementsByTagName(fieldName);

            if (elements.length > 0) {
                var element = elements[0];
                if (element.firstChild) {
                    return this.Trim(element.firstChild.data);
                }
                else {
                    return "";
                }
            }
            else {
                return "";
            }
        }
        else {
            return "";
        }
    },

    ReadIntField: function (xmlRow, fieldName) {
        /// <summary>
        ///     Read an integer field from an element.
        /// </summary>
        /// <param name="xmlRow" type="Element">The XML element or document representing the row.</param>
        /// <param name="fieldName" type="String">The tag name of the node to read. Ex: QTY</param>
        /// <returns type="Number"/>

        var text = this.ReadField(xmlRow, fieldName);
        if (/^-?[\d]+$/.test(text)) {
            return parseInt(text);
        }
        else {
            return 0;
        }
    },

    ReadBoolField: function (xmlRow, fieldName) {
        /// <summary>
        ///     Read a boolean field from an element.
        /// </summary>
        /// <param name="xmlRow" type="Element">The XML element or document representing the row.</param>
        /// <param name="fieldName" type="String">The tag name of the node to read. Ex: ISSIN</param>
        /// <returns type="Boolean"/>

        var text = this.ReadField(xmlRow, fieldName);
        return /^(1|true)$/i.test(text);
    },

    LoadXMLTable: function (xmlNode, rowTag, columns) {
        /// <summary>
        ///     Read a table from an XML document.
        ///     Sample column object: {
        ///         DBName: "ITEMNMBR",
        ///         PropertyName: "ItemNumber",
        ///         Indexed: true, /* Can be used with XO.SeekTableIndex */
        ///         ReadFunction: function(content, item, srcNode) {
        ///             return XO.Trim(content);
        ///         }
        ///     }
        /// </summary>
        /// <param name="xmlNode" type="Element">The XML document or node dataset.</param>
        /// <param name="rowTag" type="String">The tag name of each item node. Ex: "Item"</param>
        /// <param name="columns" type="Array" elementType="Object">An array of columns. Ex: [ column1, column2, ... ]</param>
        /// <returns type="Array" elementType="Object"/>

        var jsTable = [];
        var rowElements = xmlNode.getElementsByTagName(rowTag);
        var content = null;
        var column = null;
        var newItem = null;

        jsTable.Columns = columns;
        jsTable.Indexes = {};
        jsTable.length = rowElements.length;

        for (var i = 0; i < rowElements.length; ++i) {
            newItem = {};
            for (var colNum = 0; colNum < columns.length; ++colNum) {
                column = columns[colNum];
                content = XO.ReadField(rowElements[i], column.DBName);

                if (column.ReadFunction == null)
                    newItem[column.PropertyName] = content;
                else
                    newItem[column.PropertyName] = column.ReadFunction(content, newItem, rowElements[i]);

                if (column.Indexed) {
                    if (jsTable.Indexes[column.PropertyName] == null) {
                        jsTable.Indexes[column.PropertyName] = {};
                    }
                    jsTable.Indexes[column.PropertyName][newItem[column.PropertyName].toUpperCase()] = newItem;
                }
            }
            jsTable[i] = newItem;
        }

        return jsTable;
    },

    SeekTableIndex: function (jsTable, indexName, seekValue) {
        /// <summary>
        ///     Get the object where [indexName] = seekValue.
        /// </summary>
        /// <param name="jsTable" type="Object">Table to check index in</param>
        /// <param name="indexName" type="String">Index name. Ex: ItemNmbr</param>
        /// <param name="seekValue" type="String">Index value. Ex: "MYITEM"</param>
        /// <returns type="Object"/>

        var upperCaseValue = seekValue.toUpperCase();
        return (jsTable.Indexes[indexName][upperCaseValue] != null ? jsTable.Indexes[indexName][upperCaseValue] : null);
    },

    RemoveChildNodes: function (element) {
        /// <summary>
        ///     Remove all children of an html element.
        /// </summary>
        /// <param name="element" type="Element">Element to remove children from</param>
        /// <returns type="void"/>
        
        while (element.firstChild != null) {
            element.removeChild(element.firstChild);
        }
    },

    AddClass: function (element, cssClass) {
        /// <summary>
        ///     Adds a css class.
        /// </summary>
        /// <param name="element" type="Element">Element to add class from</param>
        /// <param name="cssClass" type="String">Class name to add</param>
        /// <returns type="void"/>

        var rxClass = new RegExp("^ *" + cssClass + " *$|^ *" + cssClass + "(?= )| +" + cssClass + " *$| +" + cssClass + "(?= )");
        if (!rxClass.test(element.className)) {
            element.className = this.Trim(element.className + " " + cssClass);
        }
    },

    RemoveClass: function (element, cssClass) {
        /// <summary>
        ///     Removes a css class.
        /// </summary>
        /// <param name="element" type="Element">Element to remove class from</param>
        /// <param name="cssClass" type="String">Class name to remove</param>
        /// <returns type="void"/>

        var rxClass = new RegExp("^ *" + cssClass + " *$|^ *" + cssClass + "(?= )| +" + cssClass + " *$| +" + cssClass + "(?= )");
        element.className = this.Trim(element.className.replace(rxClass, " "));
    },

    FakeSelect: function (inputField) {
        /// <summary>
        ///     Simmulate the select() without explicitly selecting.
        ///     This function is a fix for PocketIE.
        /// </summary>
        /// <param name="inputField" type="HTMLInputElement">Field to fake-select</param>
        /// <returns type="void"/>

        if (inputField.IsFixedPIE == null) {
            this.FixEnterPIE(inputField);
        }

        this.AddClass(inputField, "FakeSelected");

        inputField.ValueIsRepeatable = true;
        inputField.focus();

        var selection = document.selection.createRange();
        selection.moveStart('character', inputField.value.length);
        selection.moveEnd('character', 0);
        selection.select();
    },

    FixEnterPIE_keydown: function (e) {
        /// <summary>
        ///     [private] Event function for keydown for FakeSelect
        /// </summary>
        /// <param name="e" type="Event">Event</param>
        /// <returns type="void"/>

        var myfield = XO.GetTarget(e);

        if (myfield.ValueIsRepeatable && e.keyCode !== XO.Keys.Enter) {
            myfield.ValueIsRepeatable = false;
            XO.RemoveClass(myfield, "FakeSelected");
            myfield.value = "";
        }
        else if (e.keyCode === XO.Keys.Enter) {
            myfield.ValueIsRepeatable = false;
            XO.RemoveClass(myfield, "FakeSelected");
            myfield.style.color = "";
        }
    },

    FixEnterPIE: function (inputField) {
        /// <summary>
        ///     Add listener on keydown for FakeSelect support
        /// </summary>
        /// <param name="inputField" type="HTMLInputElement">Field to fix</param>
        /// <returns type="void"/>

        if (inputField.IsFixedPIE) {
            return;
        }
        this.AddEvent(inputField, "keydown", this.FixEnterPIE_keydown);
        inputField.IsFixedPIE = true;
    },

    // XO.UpdateSessionValues
    // Updates the session fields in the screen.
    // Returns nothing.
    UpdateSessionValues: function () {
        this.Session.SessionId = sGlobalSessionID;
        this.Session.UserId = sGlobalUserID;
        this.Session.LanguageId = sGlobalLanguageID;
        this.Session.CieId = sGlobalCieID;
        this.Session.WhseId = sGlobalWhseID;
        this.Session.MenuId = sGlobalMenuID;
        this.Session.ParentMenuId = sGlobalParentMenuID;

        if (window.parent && window.parent != window) {
            this.Debug("Found parent frame. Setting session info.");
            window.parent.PublicanSession = this.Session;
        }

        if (this.Id("headUserId") != null)
            this.Id("headUserId").innerHTML = this.Session.UserId;
        if (this.Id("footCie") != null)
            this.Id("footCie").innerHTML = this.String.FootCompany + ": " + this.Session.CieId;
        if (this.Id("footWhse") != null)
            this.Id("footWhse").innerHTML = this.String.FootSite + ": " + this.Session.WhseId;
    },

    GetSessionInfo: function () {
        if (window.parent != null && window.parent.PublicanSession != null) {
            this.Debug("Found parent frame with session info. Avoiding PC_GetSessionInfo call.");

            this.Session = window.parent.PublicanSession;
            sGlobalSessionID = this.Session.SessionId;
            sGlobalUserID = this.Session.UserId;
            sGlobalLanguageID = this.Session.LanguageId;
            sGlobalCieID = this.Session.CieId;
            sGlobalWhseID = this.Session.WhseId;
            sGlobalMenuID = this.Session.MenuId;
            sGlobalParentMenuID = this.Session.ParentMenuId;
        }
        else {
            XO_GetSessionInfo();

            this.Session.SessionId = sGlobalSessionID;
            this.Session.UserId = sGlobalUserID;
            this.Session.LanguageId = sGlobalLanguageID;
            this.Session.CieId = sGlobalCieID;
            this.Session.WhseId = sGlobalWhseID;
            this.Session.MenuId = sGlobalMenuID;
            this.Session.ParentMenuId = sGlobalParentMenuID;
        }

        if (this.Session.LanguageId == 2) {
            this.String.FootCompany = "Cie";
            this.String.FootSite = "Entr.";
        }
        else {
            this.String.FootCompany = "Cie";
            this.String.FootSite = "Whse";
        }

        XO.LoadStrings("ErrorsString.js");

        this.UpdateSessionValues();
    },

    UpdateSession: function (newCieId, newWhseId, newMenuId, setAsDefault) {
        /// <summary>
        ///     Change current session values
        /// </summary>
        /// <param name="newCieId" type="String">Change current company (XO.Session.CieId to keep current)</param>
        /// <param name="newWhseId" type="String">Change current warehouse (XO.Session.WhseId to keep current)</param>
        /// <param name="newMenuId" type="String">Change current menu (XO.Session.MenuId to keep)</param>
        /// <param name="setAsDefault" type="Boolean">True if user wants to set this cie/whse as default</param>
        /// <returns type="void"/>

        var xmlSessionResult = this.CallWebService(
            this.WS.PB.UpdateSession,
            {
                inSessionId: this.Session.SessionId,
                inCieId: newCieId,
                inWhseId: newWhseId,
                inMenuId: newMenuId,
                inSetDefault: setAsDefault
            },
            sGlobalPublicanMainWSUrl
        );

        XO_ParseSessionValues(xmlSessionResult);
        this.UpdateSessionValues();     // Should be called by XO_ParseSessionValues in future
    },

    Logout: function () {
        /// <summary>
        ///     Log out and return to the login page
        /// </summary>
        /// <returns type="void"/>

        this.CallWebService(
            this.WS.PB.RemoveSession,
            { inSessionId: this.Session.SessionId },
            sGlobalPublicanMainWSUrl
        );

        if (window.parent) {
            window.parent.PublicanSession = null;
        }
        this.ChangeLocation(this.Url.Login, false, null);
    }
};

XO.AddEvent(window, "load", function () {
    XO.Init();
});
