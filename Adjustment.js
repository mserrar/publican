/// <reference path="XO.js"/>
/// <reference path="ScanInfo.js"/>
/// <reference path="en/AdjustmentString.js"/>
/// <reference path="../Adjustment.html"/>
// ***************************************************************************************
// XO7
//
// ***************************************************************************************
// <sName:> js/Adjustment.js 
// <sDesc:> Publican Adjustment
// ***************************************************************************************
//
// Note: 
// Copie de POReceiving.js
//
// ***************************************************************************************
// History
// 2013.12.27 CDR Creation
// 2013.12.30 CDR Focus si champ manquant quand on entre la qté (FocusFirstIfEmpty)
// 2014.02.08 CDR Deux derniers items scannés en bas
// ***************************************************************************************

/// <var name="G">Globals</var>
var G = {
    Config: {
        ADJWHSE: false,
        ADJUSER: false,
        ADJREASON: false,
        ADJGROUPING: 0 // Devrait produire une erreur
    },

    /// <field name="Item">Informations on the current item</field>
    Item: new ScanInfo(true),

    /// <field name="CC">Clear Context</field>
    CC: {
        Qty: 1,
        Bin: 2,
        Item: 3,
        Reason: 4,
        User: 5,
        Location: 6
    },

    /// <field name="TabFix">Used to fix Tab key on qty</field>
    TabFix: false,

    /*
    /// <field name="View">Globals for view</field>
    View: {
        CurrentPage: 0,
        TotalPages: 0,
        Table: [],
        Columns: [
            {
                DBName: "ITEMNMBR",
                PropertyName: "Item",
                Indexed: false,
                ReadFunction: function (content, itemRef, xmlNode) {
                    var itm = new ScanInfo();
                    itm.LoadXML(xmlNode);
                    return itm;
                }
            }, {
                DBName: "QTYRECEIVED",
                PropertyName: "Qty",
                Indexed: false,
                ReadFunction: function (content, itemRef, xmlNode) {
                    var qty = new ScanQty(itemRef.Item);
                    qty.SetQty(content);
                    return qty;
                }
            }, {
                DBName: "QTYORDERED",
                PropertyName: "QtyOrdered",
                Indexed: false,
                ReadFunction: function (content, itemRef, xmlNode) {
                    var qty = new ScanQty(itemRef.Item);
                    qty.SetQty(content);
                    return qty;
                }
            }
        ],
        FocusRestore: null,
        /// <field name="DrawObjectFunction" type="Function">
        ///     Function to draw one object of the table loaded.
        ///     Format:
        ///     f(tableObject, viewBody)
        /// </field>
        DrawObjectFunction: null,
        FilterButtons: {
            btnViewFilterPartial: "P",
            btnViewFilterOver: "O",
            btnViewFilterComplete: "E",
            btnViewFilterNotReceived: "T",
            btnViewFilterAll: ""
        },
        FirstFilter: "btnViewFilterAll",
        SelectedFilter: null,
        SelectedFilterValue: "",
        SelectedFilterColor: "#FFF"
    },
    */

    /// <field name="TranslationBatch">All label ids to translate</field>
    TranslationBatch: {
        // Main layout
        /*
        lblTextItemSin: "ItemSin",
        lblTextQty: "QtyReceived",
        lblTextItem: "Item",
        lblTextDesc: "ItemDesc"
        */

        // View
    },

    /// <field name="Events">All events to listen</field>
    Events: {
        txtLocation: {
            change: txtLocation_change,
            keyup: txtLocation_keyup
        },
        txtUserId: {
            change: txtUserId_change,
            keyup: txtUserId_keyup
        },
        txtReasonCode: {
            change: txtReasonCode_change,
            keyup: txtReasonCode_keyup
        },
        txtItem: {
            change: txtItem_change,
            keyup: txtItem_keyup
        },
        txtBin: {
            change: txtBin_change,
            keyup: txtBin_keyup
        },
        txtQty: {
            keydown: txtQty_keydown,
            keyup: txtQty_keyup
        },
        /*
        txtViewAction: {
            keyup: txtViewAction_keyup
        },
        btnNextPage: {
            click: CallNext
        },
        btnPreviousPage: {
            click: CallPrevious
        }
        */
    }
};

XO.AddModule("Adjustment", false, {
    Init: function () {
        XO.GetSessionInfo();
        XO.LoadStrings("AdjustmentString.js");
        XO.TranslateBatch(G.TranslationBatch);
        XO.AddEvents(G.Events);

        LoadConfig();

        FocusFirst(["txtLocation", "txtUserId", "txtReasonCode", "txtItem"]);
    }
});

function ReturnToMenu() {
    XO.ChangeLocation(XO.Url.MainMenu, true, null);
}

function Format2Digits(number) {
    return (number < 10 ? "0" : "") + number;
}

function FocusFirstIfEmpty(inControlsId) {
    /// <summary>
    ///     Positionne le curseur sur le premier champ
    ///     qui est vide. Renvoie vrai lorsqu'un des
    ///     controles est selectionne. Sinon,
    ///     revoie faux.
    /// </summary>
    /// <param name="inControlsId" type="Array" elementType="String">
    ///     Liste des id des controles
    /// </param>
    /// <returns type="Boolean"/>

    var element = null;

    for (var i = 0; i < inControlsId.length; ++i) {
        element = XO.Id(inControlsId[i]);
        if (element.value === "") {
            element.select();
            return true;
        }
    }

    return false;
}

function FocusFirst(inControlsId) {
	/// <summary>
    ///     Positionne le curseur sur le premier champ
    ///     qui n'est pas en lecture seule. Renvoie vrai
    ///     lorsqu'un des controles est selectionne. Sinon,
    ///     revoie faux.
	/// </summary>
    /// <param name="inControlsId" type="Array" elementType="String">
    ///     Liste des id des controles
    /// </param>
    /// <returns type="Boolean"/>

    var element = null;

    for (var i = 0; i < inControlsId.length; ++i) {
        element = XO.Id(inControlsId[i]);
        if (element.readOnly === false) {
            XO.FakeSelect(element);
            return true;
        }
    }

    return false;
}

function LoadConfig() {
    var xmlDoc = XO.CallWebService(
        XO.WS.PB.ADJ.GetConfig,
        {
            inSession: XO.Session.SessionId,
            inLANG: XO.Session.LanguageId
        },
        XO.WS.PB.Url
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        // Lire config

        var nodes = xmlDoc.getElementsByTagName("Table");

        for (var i = 0; i < nodes.length; ++i) {
            G.Config[XO.ReadField(nodes[i], "CONFIGKEY")] = XO.ReadIntField(nodes[i], "CONFIGVALUE");
        }

        var element = XO.Id("txtLocation");
        element.readOnly = !G.Config.ADJWHSE;
        if (element.readOnly) {
            element.value = XO.Session.WhseId;
            element.style.border = "none";
        }
        else {
            element.style.border = "";
        }

        element = XO.Id("txtUserId");
        element.readOnly = !G.Config.ADJUSER;
        if (element.readOnly) {
            element.value = XO.Session.UserId;
            element.style.border = "none";
        }
        else {
            element.style.border = "";
        }

        element = XO.Id("txtReasonCode");
        element.readOnly = !G.Config.ADJREASON;
        if (element.readOnly) {
            element.value = "";
            element.style.border = "none";
        }
        else {
            element.style.border = "";
        }

        return true;
    }
}

function PC_ValidateLocation(inLOCNCODE) {
    /// <returns type="Boolean"/>

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ValidateLocation,
        {
            inLOCNCODE: inLOCNCODE
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        XO.SetValue("txtLocation", XO.ReadField(xmlDoc, "LOCNCODE"));
        return true;
    }
}

function PB_ValidateUser(inUserId) {
    /// <returns type="Boolean"/>

    var xmlDoc = XO.CallWebService(
        XO.WS.PB.ValidateUser,
        {
            inSession: XO.Session.SessionId,
            inUserId: inUserId,
            inLANG: XO.Session.LanguageId
        },
        XO.WS.PB.Url
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        XO.SetValue("txtUserId", XO.ReadField(xmlDoc, "USERID"));
        return true;
    }
    
    return true;
}

function PC_ValidateReasonCode(inREASONCD) {
    /// <returns type="Boolean"/>
    /*
    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ValidateUser,
        {
            inREASONCD: inREASONCD
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        XO.SetValue("txtUserId", XO.ReadField(xmlDoc, "USERID"));
        return true;
    }
    */

    return true;
}

function PC_ValidateItemSin(inItemSin) {
    /// <returns type="Boolean"/>

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ValidateItemSin,
        {
            inItemSin: inItemSin
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        G.Item.LoadXML(xmlDoc);

        G.Item.NoEditQty = XO.ReadBoolField(xmlDoc, "NOEDITQTY");
        G.Item.SinQty = new ScanQty(G.Item);
        G.Item.SinQty.SetQty(XO.ReadField(xmlDoc, "SINQTY"));

        if (G.Item.SinQty.IsNotZero()) {
            XO.SetLabelText("lblSinQty", G.Item.SinQty.GetQty());
            //XO.SetValue("txtQty", G.Item.SinQty.GetQty());
        }

        XO.SetLabelText("lblUOM", G.Item.IsSIN ? G.Item.SinUnit : G.Item.Unit);
        //XO.SetLabelText("lblItem", G.Item.ItemNmbr);
        XO.SetLabelText("lblDesc", G.Item.Description1 + " (" + G.Item.ItemNmbr + ")");

        return true;
    }
}

function PC_ValidateBin(inBIN) {
    /// <returns type="Boolean"/>

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ValidateBIN,
        {
            inWhse: XO.GetValue("txtLocation"),
            inBIN: inBIN
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        XO.SetValue("txtBin", XO.ReadField(xmlDoc, "BIN"));
        return true;
    }
}

function ADJ_AddEntry(inQty) {
    /// <returns type="Boolean"/>

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ADJ.ValidateQty,
        {
            inLOCNCODE: XO.GetValue("txtLocation"),
            inUSERID: XO.GetValue("txtUserId"),
            inREASONCD: XO.GetValue("txtReasonCode"),
            inSINNUMBER: G.Item.SINNbr,
            inITEMNMBR: G.Item.ItemNmbr,
            inUOM: G.Item.IsSIN ? G.Item.SinUnit : G.Item.Unit,
            inBIN: XO.GetValue("txtBin"),
            inQTY: inQty,
            inSTOCKUOM: G.Item.Unit,
            inNoEditQty: G.Item.NoEditQty,
            inSINQTY: G.Item.SinQty.GetQty(),
            inISSIN: G.Item.IsSIN
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        if (xmlDoc != null && XO.ReadBoolField(xmlDoc, "CONFIRM")) {
            if (confirm(XO.ReadField(xmlDoc, "MSGTEXT"))) {
                // Continue plus loin...
            }
            else {
                return false;
            }
        }
        else {
            XO.ShowError(xmlDoc);
            return false;
        }
    }

    // Deux cas:
    //   Pas d'erreur
    //   Avertissement (confirmé)
    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ADJ.AddEntry,
        {
            inLOCNCODE: XO.GetValue("txtLocation"),
            inUSERID: XO.GetValue("txtUserId"),
            inREASONCD: XO.GetValue("txtReasonCode"),
            inSINNUMBER: G.Item.SINNbr,
            inITEMNMBR: G.Item.ItemNmbr,
            inUOM: G.Item.IsSIN ? G.Item.SinUnit : G.Item.Unit,
            inBIN: XO.GetValue("txtBin"),
            inQTY: inQty,
            inSTOCKUOM: G.Item.Unit,
            inNoEditQty: G.Item.NoEditQty,
            inSINQTY: G.Item.SinQty.GetQty(),
            inISSIN: G.Item.IsSIN,
            inMode: 0,
            inADJGROUPING: G.Config.ADJGROUPING
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return false;
    }
    else {
        // Avant-dernier
        XO.SetLabelText("lblLast2Time", XO.Id("lblLast1Time").innerHTML);
        XO.SetLabelText("lblLast2Item", XO.Id("lblLast1Item").innerHTML);
        XO.SetLabelText("lblLast2Bin", XO.Id("lblLast1Bin").innerHTML);
        XO.SetLabelText("lblLast2Qty", XO.Id("lblLast1Qty").innerHTML);

        // Dernier
        var scanQty = new ScanQty(G.Item);
        scanQty.SetQty(inQty);

        var date = new Date();

        XO.SetLabelText("lblLast1Time", Format2Digits(date.getHours()) + ":" + Format2Digits(date.getMinutes()));
        XO.SetLabelText("lblLast1Item", XO.GetValue("txtItem"));
        XO.SetLabelText("lblLast1Bin", XO.GetValue("txtBin"));
        XO.SetLabelText("lblLast1Qty", scanQty.GetQty());

        return true;
    }
}

// Clear
// Clears fields depending on context.
// context: ClearTypeInfo
// Returns nothing.
function Clear(context) {
    var focusInput = null;

    if (context >= G.CC.Qty) {
        XO.SetValue("txtQty", "");

        focusInput = XO.Id("txtQty");
    }

    if (context >= G.CC.Bin) {
        XO.SetValue("txtBin", "");

        focusInput = XO.Id("txtBin");
    }

    if (context >= G.CC.Item) {
        XO.SetValue("txtItem", "");
        //XO.SetLabelText("lblItem", "");
        XO.SetLabelText("lblDesc", "");
        XO.SetLabelText("lblUOM", "");
        XO.SetLabelText("lblSinQty", "");

        focusInput = XO.Id("txtItem");
    }

    if (context >= G.CC.Reason) {
        if (XO.Id("txtReasonCode").readOnly === false) {
            XO.SetValue("txtReasonCode", "");
            focusInput = XO.Id("txtReasonCode");
        }
        // Si lecture seule, on passe a User
        else if (context === G.CC.Reason) {
            context = G.CC.User;
        }
    }

    if (context >= G.CC.User) {
        if (XO.Id("txtUserId").readOnly === false) {
            XO.SetValue("txtUserId", "");
            focusInput = XO.Id("txtUserId");
        }
        // Si lecture seule, on passe a Location
        else if (context === G.CC.User) {
            context = G.CC.Location;
        }
    }

    if (context >= G.CC.Location) {
        if (XO.Id("txtLocation").readOnly === false) {
            XO.SetValue("txtLocation", "");
            focusInput = XO.Id("txtLocation");
        }
    }

    if (focusInput != null) {
        focusInput.select();
    }
}

function txtLocation_change(e) {
    /// <param name="e" type="ChangeEvent"/>
    var myfield = XO.TrimInput(XO.GetTarget(e));

    if (myfield.value === "") {
        Clear(G.CC.Location);
    }
    else {
        if (!PC_ValidateLocation(myfield.value)) {
            Clear(G.CC.Location);
            return XO.CancelEvent(e);
        }
    }

    return true;
}

function txtUserId_change(e) {
    /// <param name="e" type="ChangeEvent"/>
    var myfield = XO.TrimInput(XO.GetTarget(e));

    if (myfield.value === "") {
        Clear(G.CC.User);
    }
    else {
        if (!PB_ValidateUser(myfield.value)) {
            Clear(G.CC.User);
            return XO.CancelEvent(e);
        }
    }

    return true;
}

function txtReasonCode_change(e) {
    /// <param name="e" type="ChangeEvent"/>
    var myfield = XO.TrimInput(XO.GetTarget(e));

    if (myfield.value === "") {
        Clear(G.CC.Reason);
    }
    else {
        if (!PC_ValidateReasonCode(myfield.value)) {
            Clear(G.CC.Reason);
            return XO.CancelEvent(e);
        }
    }

    return true;
}

function txtItem_change(e) {
    /// <param name="e" type="ChangeEvent"/>
    var myfield = XO.TrimInput(XO.GetTarget(e));

    if (myfield.value === "") {
        Clear(G.CC.Item);
    }
    else {
        if (!PC_ValidateItemSin(myfield.value)) {
            Clear(G.CC.Item);
            return XO.CancelEvent(e);
        }
        else {
            myfield.value = G.Item.GetIdentifier();
        }
    }

    return true;
}

function txtBin_change(e) {
    /// <param name="e" type="ChangeEvent"/>
    var myfield = XO.TrimInput(XO.GetTarget(e));

    if (myfield.value === "") {
        Clear(G.CC.Bin);
    }
    else {
        if (!PC_ValidateBin(myfield.value)) {
            Clear(G.CC.Bin);
            return XO.CancelEvent(e);
        }
    }

    return true;
}

function txtLocation_keyup(e) {
    /// <param name="e" type="KeyboardEvent"/>
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (XO.Trim(myfield.value) === "") {
            ReturnToMenu();

            return XO.CancelEvent(e);
        }
        else {
            FocusFirst(["txtUserId", "txtReasonCode", "txtItem"]);
        }

        return XO.CancelEvent(e);
    }

    return true;
}

function txtUserId_keyup(e) {
    /// <param name="e" type="KeyboardEvent"/>
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (XO.Trim(myfield.value) === "") {
            if (XO.Id("txtLocation").readOnly) {
                ReturnToMenu();
            }
            else {
                Clear(G.CC.Location);
            }

            return XO.CancelEvent(e);
        }
        else {
            FocusFirst(["txtReasonCode", "txtItem"]);
        }

        return XO.CancelEvent(e);
    }

    return true;
}

function txtReasonCode_keyup(e) {
    /// <param name="e" type="KeyboardEvent"/>
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (XO.Trim(myfield.value) === "") {
            if (XO.Id("txtLocation").readOnly &&
                XO.Id("txtUserId").readOnly) {
                ReturnToMenu();
            }
            else {
                Clear(G.CC.User);
            }

            return XO.CancelEvent(e);
        }
        else {
            FocusFirst(["txtItem"]);
        }

        return XO.CancelEvent(e);
    }

    return true;
}

function txtItem_keyup(e) {
    /// <param name="e" type="KeyboardEvent"/>
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (XO.Trim(myfield.value) === "") {
            if (XO.Id("txtLocation").readOnly &&
                XO.Id("txtUserId").readOnly &&
                XO.Id("txtReasonCode").readOnly) {
                ReturnToMenu();
            }
            else {
                Clear(G.CC.Reason);
            }

            return XO.CancelEvent(e);
        }
        else {
            XO.FakeSelect(XO.Id("txtBin"));
        }

        return XO.CancelEvent(e);
    }

    return true;
}

function txtBin_keyup(e) {
    /// <param name="e" type="KeyboardEvent"/>
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (XO.Trim(myfield.value) === "") {
            Clear(G.CC.Item);

            return XO.CancelEvent(e);
        }
        else {
            XO.FakeSelect(XO.Id("txtQty"));
        }

        return XO.CancelEvent(e);
    }

    return true;
}

function txtQty_keyup(e) {
    /// <param name="e" type="KeyboardEvent"/>
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter ||
        e.keyCode === XO.Keys.Tab && G.TabFix
    ) {
        G.TabFix = false;

        XO.TrimInput(myfield);

        if (myfield.value === "") {
            Clear(G.CC.Bin);
        }
        else if (!FocusFirstIfEmpty(["txtLocation", "txtUserId", "txtItem", "txtBin"])) {
            if (G.Item.IsValidQty(myfield.value)) {
                if (ADJ_AddEntry(parseFloat(myfield.value))) {
                    Clear(G.CC.Location);
                }
                else {
                    myfield.value = "";
                }
            }
            else {
                XO.ShowCachedError(4000);
            }
        }

        return XO.CancelEvent(e);
    }

    return true;
}

function txtQty_keydown(e) {
    /// <param name="e" type="KeyboardEvent"/>
    if (e.keyCode === XO.Keys.Tab) {
        G.TabFix = true;
        return XO.CancelEvent(e);
    }

    return true;
}
