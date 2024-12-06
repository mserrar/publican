/// <reference path="XO.js">
/// <reference path="Item.js">
/// <reference path="en/BinTransferString.js" />
// ***************************************************************************************
// XO7 
//
// ***************************************************************************************
// <sName:> js/Packing.js 
// <sDesc:> Publican Bin Transfer
// ***************************************************************************************
//
// Note: 
//
//
// ***************************************************************************************
// History
// 2013.02.05 CDR Creation
// 2013.02.07 CDR Started Multi support
// 2013.02.08 CDR Completed Multi support
// 2013.02.13 CDR Erased =EC= when unable to do it
//                Added WHSE Transfer support (G.Move.Type)
// 2013.02.14 CDR Reload this page on MULTI-OUT completed. (Change to MULTI-IN)
// 2013.02.15 CDR Added inLOCNCODE parameter to PC_GetItemMoveInfo
// 2013.02.18 CDR Added RECV type support
// 2013.02.22 CDR Bug correction in view
//            CDR Return to selector from RECV goes to BIN
// 2013.02.25 CDR Added translation support
// 2013.02.26 CDR Added FakeSelect support in View
//                Put &nbsp; for spaces in "x / y" to avoid line break
//                Changed In-Transit type to INTR
//                Added RECV type support
// 2013.02.28 CDR Converted calls to XO.CallPublicanWebService
//                Changed CompleteMove and SwitchMoveStatus to UpdateMoveStatus
// 2013.03.08 CDR Changed UpdateMoveStatus(4) to UpdateMoveStatus(5) for Switch
//                Added UpdateMoveStatus(4) for Cancel Doc
//                Added CancelDoc tag to location and item fields
//                Made reload on Entry completed when status is Move-Out (002)
// 2013.05.02 CDR Added Serial/Lot support
// 2013.05.08 CDR Added FakeSelect on qty for SIN/Serial/SingleLot
// 2013.08.19 CDR Gestion améliorée de série/lot/SIN (Single Move Recover)
// ***************************************************************************************

var GlobalTableBinTransfer = null;
var GlobalTableBinTransferHead = null;
var GlobalTableBinTransferBody = null;
var GlobalTrLocation = null;
var GlobalTrVendor = null;

var GlobalViewTable = null;
var GlobalViewTableHead = null;
var GlobalViewTableBody = null;
var GlobalTrViewNavigation = null;

var GlobalFootCieWhse = null;
var GlobalTrMoveNbr = null;

var GlobalViewFocusBack = null;

var GlobalMultiBin = null;
var GlobalMultiQty = null;

var GlobalLinesCount = 0;
var GlobalLinesFulfilled = 0;

var GlobalTabFix = false;

var db = new Array();
var GlobalTotalPage = 0;
var GlobalCurrentPage = 0;

/// <var name="G">Globals</var>
var G = {
    /// <field name="Move">Informations on the current Move</field>
    Move: {
        /// <field name="Nbr">Move number</field>
        Nbr: 0,
        /// <field name="Type">Move type: BIN, INTR, RECV or WHSE</field>
        Type: "BIN",
        /// <field name="Status">Move status: 001 (Single), 002 (Multi-Out), 003 (Multi-In), 004 (Complete)</field>
        Status: "001",
        /// <field name="Location">From location</field>
        Location: "",
        /// <field name="RefNum">Reference number (for INTR and RECV types)</field>
        RefNum: "",
        /// <field name="PONumber">PO number for RECV type</field>
        PONumber: "",
        /// <field name="Vendor">Vendor name for RECV type</field>
        Vendor: "",
    },

    /// <field name="Item">Informations on the current item</field>
    Item: new ItemInfo(),
    /// <field name="QtyLeft">Qty of current item remaining</field>
    QtyLeft: null,

    // To return to selector
    MoveTypes: {
        "BIN": "BIN",
        "INTR": "BIN",
        "RECV": "RECV",
        "WHSE": "WHSE"
    },

    MoveModes: {
        "001": "Single",
        "002": "Multi-Out",
        "003": "Multi-In"
    },

    /// <field name="CC">Clear Context</field>
    CC: {
        ToBinInfo: 1,
        FromBinInfo: 2,
        SerLotInfo: 3,
        ItemInfo: 4,
        LocationInfo: 5,
        MoveInfo: 6
    },

    TranslationBatch: {
        // Main layout
        lblTextMode: "Mode",
        lblTextMoveNbr: "MoveNbr",
        lblTextVendor: "Vendor",
        lblTextLocation: "Location",
        lblTextItem: "Item",
        lblTextFromBin: "FromBin",
        lblTextQtyOut: "QtyOut",
        lblTextQtyLeft: "QtyLeft",
        lblTextToBin: "ToBin",
        lblTextQtyIn: "QtyIn",
    
        // View layout
        lblTextItemCol: "Item",
        lblTextBinCol: "Bin",
        lblTextToMoveCol: "ToMove"
    }
};

function init()
{
    XO.Init();
    XO.GetSessionInfo();
    XO.LoadStrings("BinTransferString.js");
    XO.TranslateBatch(G.TranslationBatch);

    G.QtyLeft = new QtyInfo(G.Item);

    GlobalTableBinTransfer = XO.Id("tblBinTransfer");
    GlobalTableBinTransferHead = XO.Id("tblBinTransferHead");
    GlobalTableBinTransferBody = XO.Id("tblBinTransferBody");
    GlobalTrVendor = XO.Id("trVendor");
    GlobalTrLocation = XO.Id("trLocation");

    GlobalViewTable = XO.Id("tblView");
    GlobalViewTableHead = XO.Id("tblViewHead");
    GlobalViewTableBody = XO.Id("tblViewBody");
    GlobalTrViewNavigation = XO.Id("trViewNavigation");

    GlobalFootCieWhse = XO.Id("tfootCieWhse");
    GlobalTrMoveNbr = XO.Id("trMoveNbr");

    GlobalMultiBin = XO.Id("txtToBin");
    GlobalMultiQty = XO.Id("txtQtyIn");

    XO.FixEnterPIE(XO.Id("txtViewAction"));
    XO.FixEnterPIE(XO.Id("txtQtyOut"));
    XO.FixEnterPIE(XO.Id("txtQtyIn"));

    var urlVars = XO.GetUrlVars();
    if (urlVars.hasOwnProperty("MoveNbr")) {
        G.Move.Nbr = parseInt(urlVars["MoveNbr"]);
        if (isNaN(G.Move.Nbr)) {
            G.Move.Nbr = 0;
            XO.ShowCachedError(4000);
            ReturnToSelector();
            return;
        }
    }
    if (urlVars.hasOwnProperty("MoveType")) {
        G.Move.Type = urlVars["MoveType"].toUpperCase();

        if (!G.MoveTypes.hasOwnProperty(G.Move.Type)) {
            G.Move.Type = "BIN";
        }

        if (G.Move.Type === "WHSE") {
            G.Move.Status = "002";
        }
    }

    XO.SetLabelText("lblQtySum", "0&nbsp;/&nbsp;0");

    PrintMoveInfo();

    if (G.Move.Type === "WHSE" && G.Move.Status === "003") {
        XO.Id("txtLocation").select();
    }
    // ItemInfo
    else if (G.Item.ItemNmbr !== "") {
        XO.Id("txtToBin").select();
    }
    else {
        XO.Id("txtItem").select();
    }
}

function IsSingleMode() {
    return G.Move.Status === "001";
}

function IsMultiOutMode() {
    return G.Move.Status === "002";
}

function IsMultiInMode() {
    return G.Move.Status === "003";
}

function ReturnToSelector() {
    XO.ChangeLocation(G.Move.Type === "RECV" ? XO.Global.ReceivingUrl : XO.Global.BinTransferSelectorUrl, true, { MoveType: G.MoveTypes[G.Move.Type], EmptyAction: 1 });
}

function UpdateLinesCounts(xmlElement) {
    /// <summary>
    ///     Updates the lines counts.
    /// </summary>
    /// <param name="xmlElement" type="Node">
    ///     XML node to read values from.
    /// </param>

    GlobalLinesCount = parseInt(XO.ReadField(xmlElement, "LINES_COUNT"));
    GlobalLinesFulfilled = parseInt(XO.ReadField(xmlElement, "LINES_FULFILLED"));

    XO.SetLabelText("lblQtySum", GlobalLinesFulfilled + "&nbsp;/&nbsp;" + GlobalLinesCount);
}

// ShowViewTable
// Hides main table and displays view table.
// Return nothing.
function ShowViewTable(focusBack) {
    GlobalViewFocusBack = focusBack;
    GlobalTableBinTransfer.style.display = "none";

    // Structure changes
    GlobalViewTableHead.insertBefore(
        GlobalTrMoveNbr,
        GlobalTrViewNavigation
    );

    GlobalViewTable.insertBefore(
        GlobalFootCieWhse,
        GlobalViewTableBody
    );

    PC_GetMoveItemsLeft();

    GlobalViewTable.style.display = "";
    XO.SetValue("txtViewAction", "");
    XO.Id("txtViewAction").select();
}

// HideViewTable
// Hides view table and displays main table.
// Return nothing.
function HideViewTable() {
    GlobalViewTable.style.display = "none";

    // Structure changes
    GlobalTableBinTransferHead.insertBefore(
        GlobalTrMoveNbr,
        GlobalTrVendor
    );

    GlobalTableBinTransfer.insertBefore(
        GlobalFootCieWhse,
        GlobalTableBinTransferBody
    );

    GlobalTableBinTransfer.style.display = "";

    GlobalViewFocusBack.value = "";
    GlobalViewFocusBack.select();
}

// PrintMoveInfo
// Prints Move info on page. (Ask for infos if not new Move#)
// Returns nothing.
function PrintMoveInfo() {
    if (G.Move.Nbr != 0) {
        if (PC_GetMoveInfo()) {
            XO.SetLabelText("lblMoveNbr", G.Move.Nbr + (G.Move.PONumber !== "" ? "&nbsp;&nbsp;&nbsp;" + XO.String.POPrefix + "&nbsp;" + G.Move.PONumber : ""));
        }
        else {
            G.Move.Nbr = 0;
            ReturnToSelector();
            return;
        }
    }

    if (G.Move.Nbr === 0) {
        XO.SetLabelText("lblMoveNbr", "New");
    }

    AdjustLayout();
}

function IsPureBinTransfer() {
    /// <summary>
    ///     Returns true if this is a pure BIN Transfer.
    /// </summary>
    /// <return type="bool"/>
    return G.Move.Type === "BIN";
}

function IsBinTransfer() {
    /// <summary>
    ///     Returns true if this is a BIN Transfer (or INTR or RECV).
    /// </summary>
    /// <return type="bool"/>
    return G.Move.Type === "BIN" || G.Move.Type === "INTR" || G.Move.Type === "RECV";
}

// AdjustLayout
// Adjusts layout depending on move type
// Returns nothing.
function AdjustLayout() {
    var cssDisplay = (IsSingleMode() ? "" : "none");

    XO.Id("trFromBin").style.display = cssDisplay;
    XO.Id("trQtyOut").style.display = cssDisplay;

    XO.SetLabelText("lblTextToBin", IsMultiOutMode() ? XO.String.FromBin : XO.String.ToBin);
    XO.SetLabelText("lblTextQtyIn", IsSingleMode() ? XO.String.QtyIn : XO.String.Qty);
    
    GlobalTrVendor.style.display = (G.Move.Vendor === "" ? "none" : "");
    GlobalTrLocation.style.display = (G.Move.Type === "WHSE" && IsMultiInMode() ? "" : "none");
    XO.SetValue("txtLocation", IsBinTransfer() || IsMultiOutMode() ? sGlobalWhseID : "");

    XO.SetLabelText("lblMode", (G.Move.RefNum === "" ? G.MoveModes[G.Move.Status] : XO.String.RefNumPrefix[G.Move.Type] + " " + G.Move.RefNum));
    XO.SetLabelText("lblVendor", G.Move.Vendor);
}

// SwitchMode
// Switches from Single, Multi-Out
// Returns true if MoveNbr == 0.
function SwitchMode() {
    if (IsPureBinTransfer() && G.Move.Nbr === 0) {
        G.Move.Status = (IsSingleMode() ? "002" : "001");
        AdjustLayout();
        return true;
    }
    // Return to mode Multi-Out from Multi-In
    else if (G.Move.Nbr != 0) {
        if (PC_UpdateMoveStatus(5)) {
            XO.ChangeLocation(XO.Global.BinTransferUrl, true, { MoveNbr: G.Move.Nbr });
            return true;
        }
        else {
            return false;
        }
    }
    else {
        XO.ShowCachedError(4000);
        return false;
    }
}

function SetSerialVisible(visible) {
    XO.Id("trSerLot").style.display = (visible ? "" : "none");
    if (visible) {
        XO.SetLabelText("lblTextSerLot", (G.Item.Tracking === 3 ? XO.String.Lot : XO.String.Serial));
    }
}

function ParseItemInfo(xmlDoc) {
    /// <summary>
    ///     Reads item info from xml document.
    /// </summary>
    /// <param name="xmlDoc" type="Node">XML node to read values from</param>

    G.Item.LoadXML(xmlDoc);

    XO.Id("txtSerLot").readOnly = false;
    XO.Id("txtFromBin").readOnly = false;
    GlobalMultiBin.readOnly = false;
    
    SetSerialVisible(G.Item.IsTracked());

    if (G.Item.IsSIN || G.Item.IsTracked()) {
        var qtyText = G.Item.GetQty();
        if (G.Item.Qty > 0) {
            XO.SetValue("txtQtyOut", qtyText);
            XO.SetValue("txtQtyIn", qtyText);
        }

        XO.SetValue("txtSerLot", G.Item.SerLotNbr);
        if (G.Item.IsSIN && G.Item.SerLotNbr !== "") {
            XO.Id("txtSerLot").readOnly = true;
        }

        if (G.Item.Bin !== "") {
            if (IsSingleMode()) {
                XO.SetValue("txtFromBin", G.Item.Bin);
                XO.Id("txtFromBin").readOnly = true;
            }
            else if (IsMultiOutMode()) {
                GlobalMultiBin.value = G.Item.Bin;
                GlobalMultiBin.readOnly = true;
            }
        }
    }

    XO.SetLabelText("lblDescription", "(" + G.Item.ItemNmbr + ") " + G.Item.Description);
    XO.SetLabelText("lblUOM", G.Item.Unit);
}

// PC_GetMoveInfo
// Get Move info from server and loads in global vars.
// Returns true if the MOVENBR was valid.
function PC_GetMoveInfo() {
    var result = true;

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.GetMoveInfo,
        {
            inMOVENBR: G.Move.Nbr,
            inLOCNCODE: sGlobalWhseID
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        result = false;
        XO.ShowError(xmlDoc);
    }
    else {
        G.Move.Type = XO.ReadField(xmlDoc, "MOVETYPE");
        G.Move.Status = XO.ReadField(xmlDoc, "STATUSID");
        G.Move.Location = XO.ReadField(xmlDoc, "LOCNCODE");
        G.Move.RefNum = XO.ReadField(xmlDoc, "REFNUM");
        G.Move.PONumber = XO.ReadField(xmlDoc, "PONUMBER");
        G.Move.Vendor = XO.ReadField(xmlDoc, "VENDNAME");
        UpdateLinesCounts(xmlDoc);

        var item = XO.ReadField(xmlDoc, "ITEMNMBR");
        if (item != "") {
            // Single Move recover
            //XO.SetValue("txtItem", item);
            ParseItemInfo(xmlDoc);

            XO.SetValue("txtItem", G.Item.GetIdentifier());
            XO.SetValue("txtFromBin", XO.ReadField(xmlDoc, "FROMBIN"));

            var qtyOut = new QtyInfo(G.Item);
            var qtyIn = new QtyInfo(G.Item);

            qtyOut.SetQty(parseFloat(XO.ReadField(xmlDoc, "QTYOUT")));
            qtyIn.SetQty(parseFloat(XO.ReadField(xmlDoc, "QTYIN")));

            G.QtyLeft = qtyOut.Substract(qtyIn);

            XO.SetValue("txtQtyOut", qtyOut.GetQty());
            XO.SetLabelText("lblQtyLeft", G.QtyLeft.GetQty());

            XO.Id("txtItem").readOnly = true;
            XO.Id("txtFromBin").readOnly = true;
            XO.Id("txtQtyOut").readOnly = true;
        }
    }

    return result;
}

// PC_GetItemMoveInfo
// Gets and prints infos about entered item.
// Returns true if item was valid.
function PC_GetItemMoveInfo(serLotNum) {
    var result = true;

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.GetItemMoveInfo,
        {
            inMOVENBR: G.Move.Nbr,
            inMOVETYPE: G.Move.Type,
            inLOCNCODE: XO.GetValue("txtLocation"),
            inITEMNMBR: XO.GetValue("txtItem"),
            inSERLTNUM: serLotNum
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        result = false;
        XO.ShowError(xmlDoc);
    }
    else {
        ParseItemInfo(xmlDoc);
    }

    return result;
}

// PC_ValidateBin
// Validates bin in current whse.
// whse: in which whse
// bin : bin to validate
// Returns BIN name if bin is valid.
function PC_ValidateBin(whse, bin) {
    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ValidateBIN,
        {
            inWhse: XO.Trim(whse),
            inBIN: XO.Trim(bin)
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return "";
    }
    else {
        return XO.ReadField(xmlDoc, "BIN");
    }
}

// PC_InsertMoveOut
// Creates a Move Out entry.
// qty: Qty to insert
// Returns true if operation succeeded.
function PC_InsertMoveOut(qtyInfo) {
    var result = true;

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.InsertMoveOut,
        {
            inMOVENBR: G.Move.Nbr,
            inMOVETYPE: G.Move.Type,
            inSTATUSID: G.Move.Status,
            inUSERID: sGlobalUserID,
            inSINNUMBER: G.Item.SINNbr,
            inITEMNMBR: G.Item.ItemNmbr,
            inUOM: G.Item.Unit,
            inSERLTNUM: G.Item.SerLotNbr,
            inLOCNCODE: XO.GetValue("txtLocation"),
            inBIN: (IsSingleMode() ?
                XO.GetValue("txtFromBin") :
                GlobalMultiBin.value
            ),
            inQTY: qtyInfo.GetQty()
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        result = false;
        XO.ShowError(xmlDoc);
    }
    else {
        G.Move.Nbr = parseInt(XO.ReadField(xmlDoc, "MOVENBR"));
        XO.SetLabelText("lblMoveNbr", G.Move.Nbr);

        if (IsSingleMode()) {
            G.QtyLeft = qtyInfo;
            XO.SetLabelText("lblQtyLeft", G.QtyLeft.GetQty());
            XO.Id("txtItem").readOnly = true;
            XO.Id("txtFromBin").readOnly = true;
            XO.Id("txtQtyOut").readOnly = true;
        }

        UpdateLinesCounts(xmlDoc);
    }

    return result;
}

// PC_InsertMoveIn
// Creates a Move In entry.
// qty: Qty to insert
// Returns true if operation succeeded.
function PC_InsertMoveIn(qtyInfo) {
    var result = true;

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.InsertMoveIn,
        {
            inMOVENBR: G.Move.Nbr,
            inSINNUMBER: G.Item.SINNbr,
            inITEMNMBR: G.Item.ItemNmbr,
            inUOM: G.Item.Unit,
            inSERLTNUM: G.Item.SerLotNbr,
            inLOCNCODE: XO.GetValue("txtLocation"),
            inBIN: XO.GetValue("txtToBin"),
            inQTY: qtyInfo.GetQty()
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        result = false;
        XO.ShowError(xmlDoc);
    }
    else {
        if (IsSingleMode()) {
            G.QtyLeft = G.QtyLeft.Substract(qtyInfo);
            XO.SetLabelText("lblQtyLeft", G.QtyLeft.GetQty());
        }
        UpdateLinesCounts(xmlDoc);
    }

    return result;
}

function PC_UpdateMoveStatus(mode) {
    /// <summary>
    ///     Updates a Move status.
    /// </summary>
    /// <param name="mode" type="Number">
    ///     1: Select, 2: Release, 3: Complete, 4: Back to Multi-Out
    /// </param>
    /// <returns type="bool">true if succeeded</returns>

    var result = true;

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.UpdateMoveStatus,
        {
            inMOVENBR: G.Move.Nbr,
            inUser: sGlobalUserID,
            inMode: mode
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        result = false;
        XO.ShowError(xmlDoc);
    }

    return result;
}

// PC_ValidateLocation
// Validates a location.
// location : Location to validate
// Returns location name if location exists.
function PC_ValidateLocation(location) {
    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.ValidateLocation,
        { inLOCNCODE: XO.Trim(location) }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        return "";
    }
    else {
        return XO.ReadField(xmlDoc, "LOCNCODE");
    }
}

// Clear
// Clears fields depending on context.
// context: ClearTypeInfo
// Returns nothing.
function Clear(context) {
    var focusInput = null;

    /* To Bin info */
    if (context >= G.CC.ToBinInfo) {
        if (XO.Id("txtToBin").readOnly && context === G.CC.ToBinInfo) {
            if (G.Item.IsTracked() && !G.Item.IsSIN) {
                context = G.CC.SerLotInfo;
            }
            else {
                context = G.CC.ItemInfo;
            }
        }

        XO.SetValue("txtToBin", "");
        XO.SetValue("txtQtyIn", "");

        focusInput = XO.Id("txtToBin");
    }

    /* From Bin info */
    if (context >= G.CC.FromBinInfo) {
        // If it's a SIN with a BIN,
        // force clear SIN number.
        if (XO.Id("txtFromBin").readOnly && context === G.CC.FromBinInfo) {
            if (G.Item.IsTracked() && !G.Item.IsSIN) {
                context = G.CC.SerLotInfo;
            }
            else {
                context = G.CC.ItemInfo;
            }
        }

        XO.SetValue("txtFromBin", "");
        XO.SetValue("txtQtyOut", "");
        XO.Id("txtQtyOut").readOnly = false;

        focusInput = XO.Id("txtFromBin");
    }

    if (context >= G.CC.SerLotInfo) {
        XO.SetValue("txtSerLot", "");
        if (context === G.CC.SerLotInfo && !PC_GetItemMoveInfo("")) {
            context = G.CC.ItemInfo;
        }

        focusInput = XO.Id("txtSerLot");
    }

    /* Item info */
    if (context >= G.CC.ItemInfo) {
        XO.SetLabelText("lblDescription", "");
        XO.SetLabelText("lblUOM", "");
        XO.SetValue("txtItem", "");
        XO.Id("txtFromBin").readOnly = false;
        XO.Id("txtItem").readOnly = false;

        SetSerialVisible(false);

        G.Item.Clear();
        G.QtyLeft.Qty = 0;

        focusInput = XO.Id("txtItem");
    }

    /* Location info */
    if (context >= G.CC.LocationInfo) {
        XO.SetValue("txtLocation", IsBinTransfer() || IsMultiOutMode() ? sGlobalWhseID : "");

        focusInput = XO.Id("txtLocation");
    }

    /* Move info */
    if (context >= G.CC.MoveInfo) {
        XO.SetLabelText("lblMode", "");
        XO.SetLabelText("lblMoveNbr", "");

        G.Move.Nbr = 0;
        G.Move.Status = "001";
        PrintMoveInfo();

        focusInput = XO.Id("txtItem");
    }

    if (focusInput != null) {
        focusInput.select();
    }
}

function txtLocation_change(e) {
    var myfield = XO.GetTarget(e);

    if (myfield.value === "") {
        Clear(G.CC.LocationInfo);
    }
    else if (XO.IsSpecialValue(myfield.value, "ViewItems")) {
        ShowViewTable(myfield);
        return false;
    }
    else if (XO.ValidateEntryCompleted(myfield.value)) {
        if (PC_UpdateMoveStatus(3)) {
            if (IsMultiOutMode()) {
                XO.ChangeLocation(XO.Global.BinTransferUrl, true, { MoveNbr: G.Move.Nbr });
            }
            else {
                ReturnToSelector();
            }
        }
        else {
            myfield.value = "";
        }

        return false;
    }
    else if (XO.IsSpecialValue(myfield.value, "CancelDoc")) {
        if (PC_UpdateMoveStatus(4)) {
            ReturnToSelector();
        }
        else {
            myfield.value = "";
            return false;
        }
    }
    else if (XO.IsSpecialValue(myfield.value, "Switch")) {
        SwitchMode();
        myfield.value = "";
        return false;
    }
    else {
        var locnName = PC_ValidateLocation(myfield.value);
        if (locnName === "") {
            Clear(G.CC.LocationInfo);
            return false;
        }
        else if (locnName === G.Move.Location) {
            XO.ShowCachedError(4000);
            Clear(G.CC.LocationInfo);
            myfield.value = "";
            return false;
        }
        else {
            myfield.value = locnName;
        }
    }

    return true;
}

function txtItem_change(e) {
    var myfield = XO.GetTarget(e);

    if (myfield.value === "") {
        Clear(G.CC.ItemInfo);
    }
    else if (XO.IsSpecialValue(myfield.value, "ViewItems")) {
        ShowViewTable(myfield);
        return false;
    }
    else if (XO.ValidateEntryCompleted(myfield.value)) {
        if (PC_UpdateMoveStatus(3)) {
            if (IsMultiOutMode()) {
                XO.ChangeLocation(XO.Global.BinTransferUrl, true, { MoveNbr: G.Move.Nbr });
            }
            else {
                ReturnToSelector();
            }
        }
        else {
            myfield.value = "";
        }

        return false;
    }
    else if (XO.IsSpecialValue(myfield.value, "CancelDoc")) {
        if (PC_UpdateMoveStatus(4)) {
            ReturnToSelector();
        }
        else {
            myfield.value = "";
            return false;
        }
    }
    else if (XO.IsSpecialValue(myfield.value, "Switch")) {
        SwitchMode();
        myfield.value = "";
        return false;
    }
    else {
        if (!PC_GetItemMoveInfo("")) {
            Clear(G.CC.ItemInfo);
            return false;
        }
        else {
            myfield.value = G.Item.GetIdentifier();
        }
    }

    return true;
}

function txtSerLot_change(e) {
    var myfield = XO.GetTarget(e);

    if (myfield.value === "") {
        Clear(G.CC.SerLotInfo);
    }
    else {
        if (!PC_GetItemMoveInfo(myfield.value)) {
            Clear(G.CC.SerLotInfo);
            return false;
        }
        else {
            myfield.value = G.Item.SerLotNbr;
        }
    }

    return true;
}

function txtFromBin_change(e) {
    var myfield = XO.GetTarget(e);

    if (myfield.value == "") {
        Clear(G.CC.FromBinInfo);
    }
    else {
        var binName = PC_ValidateBin(sGlobalWhseID, myfield.value);
        if (binName === "") {
            Clear(G.CC.FromBinInfo);
            return false;
        }
        else {
            myfield.value = binName;
        }
    }

    return true;
}

function txtToBin_change(e) {
    var myfield = XO.GetTarget(e);

    if (myfield.value === "") {
        Clear(G.CC.ToBinInfo);
    }
    else {
        var binName = PC_ValidateBin(XO.GetValue("txtLocation"), myfield.value);
        if (binName === "") {
            Clear(G.CC.ToBinInfo);
            return false;
        }
        else {
            myfield.value = binName;
        }
    }

    return true;
}

function txtLocation_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (myfield.value === "") {
            if (G.Move.Nbr != 0) {
                if (IsMultiInMode() &&
                    GlobalLinesFulfilled == GlobalLinesCount
                ) {
                    PC_UpdateMoveStatus(3);
                }
                else {
                    PC_UpdateMoveStatus(2);
                }
            }
            ReturnToSelector();
        }
        else {
            try {
                XO.Id("txtItem").select();
            }
            catch (err) { /* Validation can raise exception */ }
        }

        return false;
    }

    return true;
}

function txtItem_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (myfield.value === "") {
            if (G.Move.Type === "WHSE" && IsMultiInMode()) {
                Clear(G.CC.LocationInfo);
            }
            else {
                if (G.Move.Nbr != 0) {
                    if (IsSingleMode() || (
                        IsMultiInMode() &&
                        GlobalLinesFulfilled == GlobalLinesCount
                    )) {
                        PC_UpdateMoveStatus(3);
                    }
                    else {
                        PC_UpdateMoveStatus(2);
                    }
                }
                ReturnToSelector();
            }
            return false;
        }
        else {
            try {
                if (IsSingleMode()) {
                    XO.Id("txtFromBin").select();
                    if (XO.Id("txtFromBin").readOnly) {
                        if (XO.Id("txtQtyOut").readOnly) {
                            XO.Id("txtToBin").select();
                        }
                        else if (XO.GetValue("txtQtyOut") !== "") {
                            XO.FakeSelect(XO.Id("txtQtyOut"));
                        }
                        else {
                            XO.Id("txtQtyOut").select();
                        }
                    }
                }
                else {
                    GlobalMultiBin.select();
                    if (GlobalMultiBin.readOnly) {
                        if (GlobalMultiQty.value !== "") {
                            XO.FakeSelect(GlobalMultiQty);
                        }
                        else {
                            GlobalMultiQty.select();
                        }
                    }
                }

                if (G.Item.IsTracked() && !XO.Id("txtSerLot").readOnly) {
                    XO.Id("txtSerLot").select();
                }
            }
            catch (err) { /* Validation can raise exception */ }
        }

        return false;
    }

    return true;
}

function txtSerLot_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (myfield.value === "") {
            Clear(G.CC.ItemInfo);
        }
        else {
            try {
                if (IsSingleMode()) {
                    XO.Id("txtFromBin").select();
                    if (XO.Id("txtFromBin").readOnly) {
                        if (XO.Id("txtQtyOut").readOnly) {
                            XO.Id("txtToBin").select();
                        }
                        else if (XO.GetValue("txtQtyOut") !== "") {
                            XO.FakeSelect(XO.Id("txtQtyOut"));
                        }
                        else {
                            XO.Id("txtQtyOut").select();
                        }
                    }
                }
                else {
                    GlobalMultiBin.select();
                    if (GlobalMultiBin.readOnly) {
                        if (GlobalMultiQty.value !== "") {
                            XO.FakeSelect(GlobalMultiQty);
                        }
                        else {
                            GlobalMultiQty.select();
                        }
                    }
                }
            }
            catch (err) { /* Validation can raise exception */ }
        }

        return false;
    }

    return true;
}

function txtFromBin_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (myfield.value === "") {
            if (G.Item.IsTracked() && !G.Item.IsSIN) {
                Clear(G.CC.SerLotInfo);
            }
            else {
                Clear(G.CC.ItemInfo);
            }
        }
        else {
            try {
                if (XO.GetValue("txtQtyOut") !== "") {
                    XO.FakeSelect(XO.Id("txtQtyOut"));
                }
                else {
                    XO.Id("txtQtyOut").select();
                }
            }
            catch (err) { /* Validation can raise exception */ }
        }

        return false;
    }

    return true;
}

function txtQtyOut_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (IsSingleMode() && (
            e.keyCode === XO.Keys.Enter ||
            e.keyCode === XO.Keys.Tab && GlobalTabFix
        )) {
        GlobalTabFix = false;
        if (G.QtyLeft.IsZero()) {
            if (myfield.value === "") {
                Clear(G.CC.FromBinInfo);
            }
            else if (G.Item.IsValidQty(myfield.value)) {
                var qtyInfo = new QtyInfo(G.Item);
                qtyInfo.SetQty(myfield.value);
                if (!PC_InsertMoveOut(qtyInfo)) {
                    myfield.value = "";
                }
                else {
                    myfield.value = qtyInfo.GetQty();
                    XO.Id("txtToBin").select();
                }
            }
            else {
                // NON STANDARD
                alert("Invalid format!");
                myfield.value = "";
            }
        }
        else {
            XO.Id("txtToBin").select();
        }

        return false;
    }

    return true;
}

function txtToBin_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter) {
        if (myfield.value === "") {
            if (IsSingleMode()) {
                Clear(G.CC.ToBinInfo);
            }
            else {
                if (G.Item.IsTracked() && !G.Item.IsSIN) {
                    Clear(G.CC.SerLotInfo);
                }
                else {
                    Clear(G.CC.ItemInfo);
                }
            }
        }
        else {
            try {
                if (XO.GetValue("txtQtyIn") !== "") {
                    XO.FakeSelect(XO.Id("txtQtyIn"));
                }
                else {
                    XO.Id("txtQtyIn").select();
                }
            }
            catch (err) { /* Validation can raise exception */ }
        }

        return false;
    }

    return true;
}

function txtQtyIn_keydown(e) {
    if (e.keyCode === XO.Keys.Tab) {
        GlobalTabFix = true;
        return false;
    }

    return true;
}

function txtQtyIn_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode === XO.Keys.Enter ||
        e.keyCode === XO.Keys.Tab && GlobalTabFix) {
        GlobalTabFix = false;
        if (myfield.value === "") {
            Clear(G.CC.ToBinInfo);
        }
        else if (G.QtyLeft.IsNotZero() || !IsSingleMode()) {
            if (G.Item.IsValidQty(myfield.value)) {
                var qtyInfo = new QtyInfo(G.Item);
                qtyInfo.SetQty(myfield.value);
                if (IsMultiOutMode()) {
                    if (PC_InsertMoveOut(qtyInfo)) {
                        Clear(G.CC.ItemInfo);
                    }
                    else {
                        myfield.select();
                    }
                }
                else {
                    if (PC_InsertMoveIn(qtyInfo)) {
                        if (IsMultiInMode() || G.QtyLeft.IsZero()) {
                            Clear(G.CC.ItemInfo);
                        }
                        else {
                            Clear(G.CC.ToBinInfo);
                        }
                    }
                    else {
                        myfield.select();
                    }
                }
            }
            else {
                // NON STANDARD
                alert("Invalid format!");
            }
        }

        return false;
    }

    return true;
}

// ***************************************************************************************
// VIEW TABLE CODE SECTION 
// ***************************************************************************************

// PC_GetMoveItemsLeft
// Loads db with list of remaining items.
// Returns nothing.
function PC_GetMoveItemsLeft() {
    GlobalCurrentPage = 0;
    GlobalTotalPage = 0;

    var xmlDoc = XO.CallPublicanWebService(
        XO.WS.PC.GetMoveItemsLeft,
        {
            inMOVENBR: G.Move.Nbr,
            inLANG: sGlobalLanguageID
        }
    );

    if (xmlDoc == null || XO.ContainsErrorMessage(xmlDoc)) {
        XO.ShowError(xmlDoc);
        db.length = 0;
        GlobalTotalPage = 0;
    }
    else {
        var xmlRows = xmlDoc.getElementsByTagName("Item");
        db.length = xmlRows.length;

        for (var i = 0; i < xmlRows.length; ++i) {
            db[i] = {
                ItemNumber: XO.ReadField(xmlRows[i], "ITEMNMBR"),
                Description: XO.ReadField(xmlRows[i], "ITEMDESC"),
                Whse: XO.ReadField(xmlRows[i], "FROMLOCNCODE"),
                Bin: XO.ReadField(xmlRows[i], "FROMBIN"),
                QtyOut: parseFloat(XO.ReadField(xmlRows[i], "QTYOUT")),
                QtyIn: parseFloat(XO.ReadField(xmlRows[i], "QTYIN")),
                FloatPrecision: parseInt(XO.ReadField(xmlRows[i], "DECPLQTY"))
            };
        }

        GlobalTotalPage = Math.ceil(db.length / sGPublicDispScrollLines);
    }

    LoadViewPage(1);
}

function txtViewAction_keyup(e) {
    var myfield = XO.GetTarget(e);

    if (e.keyCode == XO.Keys.Enter) {
        if (myfield.value == "") {
            HideViewTable();
        }
        else if (XO.IsSpecialValue(myfield.value, "NextPage")) {
            CallNext();
            XO.FakeSelect(myfield);
        }
        else if (XO.IsSpecialValue(myfield.value, "PreviousPage")) {
            CallPrevious();
            XO.FakeSelect(myfield);
        }
        else {
            XO.ShowCachedError(4000);
            myfield.value = "";
        }

        return false;
    }

    return true;
}

// AppendCell
// Appends a cell to a table row.
// row     : Row to append a cell.
// colspan : Cell's colspan.
// txt     : Text to put in cell.
// cssClass: CSS class for cell.
// Returns nothing.
function AppendCell(row, colspan, txt, cssClass) {
    var newCell = row.insertCell(row.cells.length);
    newCell.colSpan = colspan;
    newCell.className = cssClass;
    newCell.innerHTML = txt;
}

// DrawViewTable
// Draws view table current page from db.
// Returns nothing.
function DrawViewTable() {
    var newRow;
    var dbRow;
    var startPos = (GlobalCurrentPage - 1) * sGPublicDispScrollLines;

    XO.RemoveChildNodes(GlobalViewTableBody);

    if (startPos >= 0) {
        for (var i = startPos; i < db.length && i < startPos + sGPublicDispScrollLines; ++i) {
            dbRow = db[i];
            newRow = GlobalViewTableBody.insertRow(-1);
            AppendCell(newRow, 1, dbRow.ItemNumber, "alignLeft");
            AppendCell(newRow, 2, dbRow.Bin, "alignLeft");
            AppendCell(newRow, 1, XO.FormatFloat(dbRow.QtyOut - dbRow.QtyIn, dbRow.FloatPrecision), "alignLeft");

            newRow = GlobalViewTableBody.insertRow(-1);
            AppendCell(newRow, 4, dbRow.Description, "alignLeft");
        }
    }
}

// LoadViewPage
// Displays the given view page.
// pageNumber : page to display
// Returns nothing.
function LoadViewPage(pageNumber) {
    if (pageNumber <= 0)
        pageNumber = GlobalTotalPage;
    else if (pageNumber > GlobalTotalPage)
        pageNumber = 1;

    if (pageNumber >= 1 && pageNumber <= GlobalTotalPage) {
        GlobalCurrentPage = pageNumber;

        XO.SetLabelText(
            "lblPageInfo",
            GlobalTotalPage != 0 ? GlobalCurrentPage + "&nbsp;/&nbsp;" + GlobalTotalPage : ""
        );
    }
    DrawViewTable();
}

function CallNext() {
    LoadViewPage(GlobalCurrentPage + 1);
}

function CallPrevious() {
    LoadViewPage(GlobalCurrentPage - 1);
}