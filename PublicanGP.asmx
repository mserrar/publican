<%@ WebService Language="C#" Class="XO7.Publican.PublicanGPWS" %>
<%@ Assembly Src="PublicanWS.cs" %>
// ***************************************************************************************
// XO7
// Publican
// ***************************************************************************************
// <sName:> PublicanGP.asmx
// <sDesc:> Publican Web Service connector to Dynamics GP
// <sversion:> 1.0
// ***************************************************************************************
// Notes:
// 
// ***************************************************************************************
// History
// 2012.12.17 RDO REVIEW WS Names
// 2013.03.04 CDR Created Session class
// 2013.03.26 CDR Modified header
// 2013.04.04 CDR Changed namespace to XO7.Publican
//                Changed base class to PublicanWS
// 2013.04.08 CDR Renamed from Publican.asmx to PublicanGP.asmx
//                Converted all functions to ExecuteProcedure/NewInPrm
// 2013.07.05 CDR Splitted into different sections
// 2013.12.14 CDR Ajout des procedures de receiving
//                Ajout des fonctions de Picking/Shipping Console
// 2013.12.20 CDR PC_ValidateItemSinSp maintenant generique
// 2013.12.27 CDR Atout procedures Adjustment
// 2014.01.06 rdo Merge des deux version (adjustment et receiving)
// ***************************************************************************************

using System.Data;
using System.Web.Services;

namespace XO7.Publican
{
    public class PublicanGPWS: PublicanWS
    {
        #region GENERIC
        /*
         * ------------------------------ GENERIC ------------------------------
         */

        /*
        -------------- History PC_GetAllItems ------------------------
        2013.06.21 CDR Creation
        */

        [WebMethod]

        public string PC_GetAllItems(string inSession)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetAllItemsSp"
            ).GetXml();
        }

        /*
        -------------- History PC_ValidateItemSin ------------------------
        2013.12.14 CDR Creation
        2013.12.20 CDR Modifications des specs
        */

        [WebMethod]

        public string PC_ValidateItemSin(string inSession, string inItemSin)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_ValidateItemSinSp",
                NewInPrm("@inItemSin", SqlDbType.Char, 80, inItemSin),
                NewInPrm("@inLanguage", SqlDbType.Int, 0, session.LanguageId),
                NewInPrm("@inOutMode", SqlDbType.Int, 0, 1), /* Retour par resultset */
                NewOutPrm("@outSINNUMBER", SqlDbType.Char, sLenSINType),
                NewOutPrm("@outSINTYPECODE", SqlDbType.Char, 4),
                NewOutPrm("@outSINSTATUS", SqlDbType.Int, 0),
                NewOutPrm("@outITEMNMBR", SqlDbType.Char, sLenItemType),
                NewOutPrm("@outDESCR1", SqlDbType.NChar, 50),
                NewOutPrm("@outDESCR2", SqlDbType.NChar, 50),
                NewOutPrm("@outSTOCKUOM", SqlDbType.Char, sLenUOMType),
                NewOutPrm("@outSTOCKQTY", SqlDbType.Float, 0),
                NewOutPrm("@outSINUOM", SqlDbType.Char, sLenUOMType),
                NewOutPrm("@outSINQTY", SqlDbType.Float, 0),
                NewOutPrm("@outSERLTNUM", SqlDbType.Char, sLenSerialType),
                NewOutPrm("@outLOCNCODE", SqlDbType.Char, sLenLOCNType),
                NewOutPrm("@outBIN", SqlDbType.Char, sLenBinType),
                NewOutPrm("@outCUSTNMBR", SqlDbType.Char, 15),
                NewOutPrm("@outCUSTADCD", SqlDbType.Char, 15),
                NewOutPrm("@outCREATEDATE", SqlDbType.Date, 0),
                NewOutPrm("@outISSin", SqlDbType.Bit, 0),
                NewOutPrm("@outERR", SqlDbType.Int, 0),
                NewOutPrm("@outERRMSG", SqlDbType.NChar, 255)
            ).GetXml();
        }
        
        #endregion

        #region STOCK INQUIRY
        /*
         * ------------------------------ STOCK INQUIRY ------------------------------
         */
        
        /*
        -------------- History PC_StockInquiry ------------------------
        2012.12.17 RDO REVIEW WS Names
        2013.01.14 CDR Added vSession parameter
        2013.01.16 CDR Removed select command and put it in stored procedure
        2013.02.11 CDR Added inLANG parameter, renamed to inParameter
        */

        [WebMethod]

        public string PC_StockInquiry(string inSession, string inTag, string inWhse, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_StockInquirySp",
                NewInPrm("@inTag", SqlDbType.Char, sLenItemType, inTag),
                NewInPrm("@inWhse", SqlDbType.Char, sLenLOCNType, inWhse ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        #endregion

        #region STOCK MOVE
        /*
         * ------------------------------ STOCK MOVE ------------------------------
         */

        /*
        -------------- History PC_BinTransferSelector ------------------------
        2013.02.08 CDR Create
        2013.02.13 CDR Added WHSE support and changed parameter names
        */

        [WebMethod]

        public string PC_BinTransferSelector(string inSession, string inUSERID, string inLOCNCODE, string inMOVETYPE, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_BinTransferSelectorSp", sDefaultDataSetName, "MoveDocument",
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, inUSERID ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inMOVETYPE", SqlDbType.Char, 10, inMOVETYPE ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_Receiving ------------------------
        2013.02.26 CDR Create (copied from PC_BinTransferSelector)
        */

        [WebMethod]

        public string PC_Receiving(string inSession, string inLOCNCODE, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ReceivingSp", sDefaultDataSetName, "MoveDocument",
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetMoveInfo ------------------------
        2013.02.06 CDR Creation
        */

        [WebMethod]

        public string PC_GetMoveInfo(string inSession, int inMOVENBR, string inLOCNCODE, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetMoveInfoSp",
                NewInPrm("@inMOVENBR", SqlDbType.Int, 0, inMOVENBR),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetItemMoveInfo ------------------------
        2013.02.06 CDR Creation
        2013.02.07 CDR Added inMOVENBR parameter
        2013.05.02 CDR Added inSERLTNUM parameter
        2013.05.03 CDR Added inMOVETYPE parameter
        */

        [WebMethod]

        public string PC_GetItemMoveInfo(string inSession, int inMOVENBR, string inMOVETYPE, string inLOCNCODE, string inITEMNMBR, string inSERLTNUM, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetItemMoveInfoSp",
                NewInPrm("@inMOVENBR", SqlDbType.Int, 0, inMOVENBR),
                NewInPrm("@inMOVETYPE", SqlDbType.Char, 10, inMOVETYPE ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inSERLTNUM", SqlDbType.Char, sLenSerialType, inSERLTNUM ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_InsertMoveOut ------------------------
        2013.02.06 CDR Creation
        */

        [WebMethod]

        public string PC_InsertMoveOut(string inSession, int inMOVENBR, string inMOVETYPE,
                                       string inSTATUSID, string inUSERID, string inITEMNMBR,
                                       string inUOM, string inSERLTNUM, string inLOCNCODE,
                                       string inBIN, bool inISSIN, float inQTY, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_InsertMoveOutSp",
                NewInPrm("@inMOVENBR", SqlDbType.Int, 0, inMOVENBR),
                NewInPrm("@inMOVETYPE", SqlDbType.Char, 10, inMOVETYPE ?? ""),
                NewInPrm("@inSTATUSID", SqlDbType.Char, 3, inSTATUSID ?? ""),
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, inUSERID ?? ""),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM ?? ""),
                NewInPrm("@inSERLTNUM", SqlDbType.Char, sLenSerialType, inSERLTNUM ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inISSIN", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_InsertMoveIn ------------------------
        2013.02.06 CDR Creation
        */

        [WebMethod]

        public string PC_InsertMoveIn(string inSession, int inMOVENBR, string inITEMNMBR,
                                      string inUOM, string inSERLTNUM, string inLOCNCODE,
                                      string inBIN, bool inISSIN, float inQTY, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_InsertMoveInSp",
                NewInPrm("@inMOVENBR", SqlDbType.Int, 0, inMOVENBR),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM ?? ""),
                NewInPrm("@inSERLTNUM", SqlDbType.Char, sLenSerialType, inSERLTNUM ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inISSIN", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetMoveItemsLeft ------------------------
        2013.02.07 CDR Creation
        */

        [WebMethod]

        public string PC_GetMoveItemsLeft(string inSession, int inMOVENBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetMoveItemsLeftSp", "Items", "Item",
                NewInPrm("@inMOVENBR", SqlDbType.Int, 0, inMOVENBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_UpdateMoveStatus ------------------------
        2013.02.28 CDR Creation (replaced PC_CompleteMove)
        */

        [WebMethod]

        public string PC_UpdateMoveStatus(string inSession, int inMOVENBR, string inUser, short inMode, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_UpdateMoveStatusSp",
                NewInPrm("@inMOVENBR", SqlDbType.Int, 0, inMOVENBR),
                NewInPrm("@inUser", SqlDbType.Char, sLenUserType, inUser ?? ""),
                NewInPrm("@inMode", SqlDbType.SmallInt, 0, inMode),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        #endregion

        #region PACKING
        /*
         * ------------------------------ PACKING ------------------------------
         */
        
        /*
	    -------------- History PC_GetOrderInfo ------------------------
	    2013.02.04 CDR Creation
        2013.02.28 CDR Added inUser parameter
	    */

        [WebMethod]

        public string PC_GetOrderInfo(string inSession, string inSOPNUMBE, int inSOPTYPE, string inLOCNCODE, string inUser, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetOrderInfoSp",
                NewInPrm("@inSOPNUMBE", SqlDbType.Char, sLenSOPDocType, inSOPNUMBE ?? ""),
                NewInPrm("@inSOPTYPE", SqlDbType.SmallInt, 0, inSOPTYPE),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inUser", SqlDbType.Char, sLenUserType, inUser ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetBoxInfo ------------------------
        2013.02.04 CDR Creation
        2013.04.18 CDR Added inPACKNBR
        */

        [WebMethod]

        public string PC_GetBoxInfo(string inSession, int inPACKNBR, string inBOXNBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetBoxInfoSp",
                NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, inBOXNBR ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetItemPackingInfo ------------------------
        2013.02.04 CDR Creation
        */

        [WebMethod]

        public string PC_GetItemPackingInfo(string inSession, string inSOPNUMBE, int inSOPTYPE, string inLOCNCODE, string inBOXNBR, string inITEMNMBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetItemPackingInfoSp",
                NewInPrm("@inSOPNUMBE", SqlDbType.Char, sLenSOPDocType, inSOPNUMBE ?? ""),
                NewInPrm("@inSOPTYPE", SqlDbType.SmallInt, 0, inSOPTYPE),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, inBOXNBR ?? ""),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_ConfirmPackQty ------------------------
        2013.02.04 CDR Creation
        */

        [WebMethod]

        public string PC_ConfirmPackQty(string inSession, int inPICKNBR, int inPACKNBR, string inLOCNCODE, string inBOXNBR, string inITEMNMBR, string inSERLTNUM, float inQTYPACKED, bool inISSIN, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ConfirmPackQtySp",
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, inBOXNBR ?? ""),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inSERLTNUM", SqlDbType.Char, sLenSerialType, inSERLTNUM ?? ""),
                NewInPrm("@inISSIN", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inQTYPACKED", SqlDbType.Float, 0, inQTYPACKED),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_CancelBox ------------------------
        2013.02.04 CDR Creation
        */

        [WebMethod]

        public string PC_CancelBox(string inSession, int inPACKNBR, string inBOXNBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_CancelBoxSp",
                NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, inBOXNBR ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_UpdatePackStatus ------------------------
        2013.02.04 CDR Creation
        2013.02.28 CDR Added inUser parameter
        */

        [WebMethod]

        public string PC_UpdatePackStatus(string inSession, int inPACKNBR, string inUser, short inMode, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_UpdatePackStatusSp",
                NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                NewInPrm("@inUser", SqlDbType.Char, sLenUserType, inUser ?? ""),
                NewInPrm("@inMode", SqlDbType.SmallInt, 0, inMode),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetPackedItems ------------------------
        2013.03.01 CDR Creation (copied from PC_GetMoveItemsLeft)
        2013.04.08 CDR Removed inLANG parameter
        */

        [WebMethod]

        public string PC_GetPackedItems(string inSession, int inPACKNBR, string inBOXNBR)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetPackedItemsSp", "Items", "Item",
                NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, inBOXNBR ?? "")
            ).GetXml();
        }

        #endregion

        #region PICKING
        /*
         * ------------------------------ PICKING ------------------------------
         */
        
	    /*
	    -------------- History PC_GetPickInfo ------------------------
	    2012.12.17 RDO REVIEW WS Names
        2013.01.16 CDR Added inSession parameter
        2013.01.25 CDR Created SP and moved code to SP
	    */

        [WebMethod]

        public string PC_GetPickInfo(string inSession, long inPICKNBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetPickInfoSp",
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

	    /*
	    -------------- History PC_GetNextItemToPick ------------------------
	    2012.12.17 RDO REVIEW WS Names
        2013.01.16 CDR Added inSession parameter
        2013.01.22 CDR Converted to insertInputParameter
	    */

        [WebMethod]

        /* GET THE NEXT ITEM TO PICK FOR A PARTICULAR PICK, RETURNS MESSAGE HANDLED BY JAVASCRIPT WHEN NO MORE ITEM TO PICK */
        public string PC_GetNextItemToPick(string inSession, long inPICKNBR, int inLANG, string inITEM, string inMethod)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetNextItemtoPickSp",
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inITEM", SqlDbType.Char, sLenItemType, inITEM ?? ""),
                NewInPrm("@inMethod", SqlDbType.Char, sLenPickMethodType, inMethod ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }


	    /*
	    -------------- History PC_PickValidateInput ------------------------
	    2012.12.17 RDO REVIEW WS Names
        2013.01.16 CDR Added inSession parameter
        2013.01.22 CDR Converted to insertInputParameter
	    */

        [WebMethod]

        public string PC_PickValidateInput(string inSession, string inSTRING, long inPICKNBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ValidateInputSp",
                NewInPrm("@inString", SqlDbType.NVarChar, 80, inSTRING ?? ""),
                NewInPrm("@inContext", SqlDbType.BigInt, 0, 1), // Context 1 = Picking
                NewInPrm("@inDocument", SqlDbType.BigInt, 0, inPICKNBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }


	    /*
	    -------------- History PC_ConfirmPickQty ------------------------
	    2012.12.17 REVIEW WS Names
        2013.01.16 CDR Added inSession parameter
        2013.01.22 CDR Changed inQTY type from long to float
                       Made use of insertInputParameter
        2013.01.28 CDR Added SIN support
        2013.01.29 CDR Removed inSTRING parameter
        2013.01.31 CDR Corrected inQTY length to 0 (old value was sLenSerialType...)
	    */

        [WebMethod]

        public string PC_ConfirmPickQty(string inSession, string inITEM, string inBIN, string inWHSE, float inQTY, string inUOM, long inPICKNBR, string inSERIAL, bool inIsSIN, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ConfirmPickQtySp",
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inITEMNMBR", SqlDbType.NVarChar, sLenItemType, inITEM ?? ""),
                NewInPrm("@inBIN", SqlDbType.NVarChar, sLenBinType, inBIN ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.NVarChar, sLenLOCNType, inWHSE ?? ""),
                NewInPrm("@inLOT", SqlDbType.NVarChar, sLenLotType, ""),
                NewInPrm("@inSERIAL", SqlDbType.NVarChar, sLenSerialType, inSERIAL ?? ""),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inUOM", SqlDbType.NVarChar, sLenUOMType, inUOM ?? ""),
                NewInPrm("@inIsSIN", SqlDbType.Bit, 0, inIsSIN),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG),
                NewOutPrm("@outResult", SqlDbType.NVarChar, 80)
            ).GetXml();
        }

        /*
        -------------- History PC_ValidateLocation ------------------------
        2012.02.13 CDR CREATE
        */

        [WebMethod]

        public string PC_ValidateLocation(string inSession, string inLOCNCODE, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ValidateLocationSp",
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

	    /*
	    -------------- History PC_ValidateBIN ------------------------
	    2012.12.17 REVIEW WS Names
        2013.01.16 CDR Added inSession parameter
        2013.01.21 CDR Added inWhse parameter
                       Converted to insertInputParameter
	    */

        [WebMethod]

        public string PC_ValidateBIN(string inSession, string inWhse, string inBIN, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ValidateBinSp",
                NewInPrm("@inWhse", SqlDbType.NVarChar, sLenLOCNType, inWhse ?? ""),
                NewInPrm("@inBIN", SqlDbType.NVarChar, sLenBinType, inBIN ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG),
                NewOutPrm("@OutResult", SqlDbType.NVarChar, 80)
            ).GetXml();
        }

        /*
        -------------- History PC_GetBinQtyPicked ------------------------
        2012.02.13 CDR CREATE
        */

        [WebMethod]

        public string PC_GetBinQtyPicked(string inSession, int inPICKNBR, string inITEMNMBR, string inSERLTNUM, string inUOM, string inLOCNCODE, string inBIN, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetBinQtyPickedSp",
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM ?? ""),
                NewInPrm("@inSERLTNUM", SqlDbType.Char, sLenSerialType, inSERLTNUM ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_ValidateQtyPicked ------------------------
        2013.01.21 CDR CREATE
        2013.01.22 CDR Changed inQTY from int to float
        */

        [WebMethod]

        public string PC_ValidateQtyPicked(string inSession, int inPICKNBR, string inITEM,
                                           string inWHSE, string inBIN, float inQTY,
                                           string inSerial, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ValidateQtyPickedSp",
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inITEM", SqlDbType.NVarChar, sLenItemType, inITEM ?? ""),
                NewInPrm("@inWHSE", SqlDbType.NVarChar, sLenLOCNType, inWHSE ?? ""),
                NewInPrm("@inBIN", SqlDbType.NVarChar, sLenBinType, inBIN ?? ""),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inSerial", SqlDbType.NVarChar, sLenSerialType, inSerial ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

	    /*
	    -------------- History PC_PickSelector ------------------------
	    2012.12.17 REVIEW WS Names
        2013.01.11 ADDED vSession
        2013.01.14 ADDED "LOCNCODE='" + vWhse + "'" in WHERE clause
        2013.01.16 REMOVED query and put stored procedure
        2013.01.21 Changed SqlCommand constructor
	    */

        [WebMethod]

        public string PC_PickSelector(string vSession, string vUser, string vWhse, string vstat)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(vSession)),
                "PC_PickSelectorSp",
                NewInPrm("@vWhse", SqlDbType.Char, sLenLOCNType, vWhse ?? ""),
                NewInPrm("@vUser", SqlDbType.Char, sLenUserType, vUser ?? "")
            ).GetXml();
        }

	    /*
	    -------------- History PC_UpdatePickStatus ------------------------
	    2013.01.16 CDR CREATE
        2013.01.21 CDR Changed SqlCommand constructor
	    */

        [WebMethod]

        public string PC_UpdatePickStatus(string inSession, int inLanguage, string inUser, int inPickNum, int inMode)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_UpdatePickStatusSp",
                NewInPrm("@inPickNum", SqlDbType.Int, 0, inPickNum),
                NewInPrm("@inUser", SqlDbType.Char, sLenUserType, inUser ?? ""),
                NewInPrm("@inMode", SqlDbType.SmallInt, 0, inMode),
                NewInPrm("@inLanguage", SqlDbType.Int, 0, inLanguage)
            ).GetXml();
        }

        #endregion

        #region STOCK COUNT SCANNER
        /*
         * ------------------------------ STOCK COUNT SCANNER ------------------------------
         */

        /*
        -------------- History PC_StockCountSelector ------------------------
        2013.05.10 CDR Create
        */

        [WebMethod]

        public string PC_StockCountSelector(string inSession, int inCOUNTTYPE, string inLOCNCODE, string inUser, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_StockCountSelectorSp", sDefaultDataSetName, "StockCount",
                NewInPrm("@inCOUNTTYPE", SqlDbType.SmallInt, 0, inCOUNTTYPE),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inUser", SqlDbType.Char, sLenUserType, inUser ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_ValidateStockCountLocation ------------------------
        2013.05.16 CDR Create
        */

        [WebMethod]

        public string PC_ValidateStockCountLocation(string inSession, string inSTCKCNTID, string inLOCNCODE, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ValidateStockCountLocationSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_ValidateStockCountBin ------------------------
        2013.05.16 CDR Create
        */

        [WebMethod]

        public string PC_ValidateStockCountBin(string inSession, string inSTCKCNTID, string inLOCNCODE, string inZONE, string inBIN, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_ValidateStockCountBinSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inZONE", SqlDbType.Char, sLenZoneType, inZONE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetNextItemToCount ------------------------
        2013.05.30 CDR Create
        */

        [WebMethod]

        public string PC_GetNextItemToCount(string inSession, string inSTCKCNTID, string inLOCNCODE, string inZONE, string inBIN, string inInput, string inSerLot, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetNextItemToCountSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inZONE", SqlDbType.Char, sLenZoneType, inZONE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inInput", SqlDbType.Char, sLenItemType, inInput ?? ""),
                NewInPrm("@inSerLot", SqlDbType.Char, sLenSerialType, inSerLot ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_SetStockCountedQty ------------------------
        2013.05.30 CDR Create
        */

        [WebMethod]

        public string PC_SetStockCountedQty(string inSession, string inSTCKCNTID, string inLOCNCODE, string inZONE, string inBIN, string inITEMNMBR, string inSERLTNUM, float inQTY, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_SetStockCountedQtySp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inZONE", SqlDbType.Char, sLenZoneType, inZONE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inSERLTNUM", SqlDbType.Char, sLenSerialType, inSERLTNUM ?? ""),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetStockCountLocations ------------------------
        2013.06.17 CDR Create
        */

        [WebMethod]

        public string PC_GetStockCountLocations(string inSession, string inSTCKCNTID, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetStockCountLocationsSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetStockCountBins ------------------------
        2013.06.17 CDR Create
        */

        [WebMethod]

        public string PC_GetStockCountBins(string inSession, string inSTCKCNTID, string inLOCNCODE, string inZONE, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetStockCountBinsSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inZONE", SqlDbType.Char, sLenZoneType, inZONE ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_GetStockCountItems ------------------------
        2013.06.17 CDR Create
        */

        [WebMethod]

        public string PC_GetStockCountItems(string inSession, string inSTCKCNTID, string inLOCNCODE, string inZONE, string inBIN, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_GetStockCountItemsSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inZONE", SqlDbType.Char, sLenZoneType, inZONE ?? ""),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        #endregion

        #region STOCK COUNT CONSOLE
        /*
         * ------------------------------ STOCK COUNT CONSOLE ------------------------------
         */

        /*
        -------------- History PC_StockCountList ------------------------
        2013.07.05 CDR Create
        */
        
        [WebMethod]

        public string PC_StockCountList(string inSession, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_StockCountListSp",
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_LoadStockCountDetail ------------------------
        2013.07.05 CDR Create
        */

        [WebMethod]

        public string PC_LoadStockCountDetail(string inSession, string inSTCKCNTID, int inSEQNUMBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_LoadStockCountDetailSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inSEQNUMBR", SqlDbType.Int, 0, inSEQNUMBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_UpdateStockCount ------------------------
        2013.07.05 CDR Create
        */

        [WebMethod]

        public string PC_UpdateStockCount(string inSession, string inSTCKCNTID, int inSEQNUMBR, int inCOUNTTYPE, string inSTATUS, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_UpdateStockCountSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inSEQNUMBR", SqlDbType.Int, 0, inSEQNUMBR),
                NewInPrm("@inCOUNTTYPE", SqlDbType.SmallInt, 0, inCOUNTTYPE),
                NewInPrm("@inSTATUS", SqlDbType.Char, 10, inSTATUS ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_SyncStockCount ------------------------
        2013.07.05 CDR Create
        */

        [WebMethod]

        public string PC_SyncStockCount(string inSession, string inSTCKCNTID, int inSEQNUMBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_SyncStockCountSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inSEQNUMBR", SqlDbType.Int, 0, inSEQNUMBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PC_RemoveStockCount ------------------------
        2013.07.05 CDR Create
        */

        [WebMethod]

        public string PC_RemoveStockCount(string inSession, string inSTCKCNTID, int inSEQNUMBR, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateGPConnection(ReadGuid(inSession)),
                "PC_RemoveStockCountSp",
                NewInPrm("@inSTCKCNTID", SqlDbType.Char, sLenStockCountType, inSTCKCNTID ?? ""),
                NewInPrm("@inSEQNUMBR", SqlDbType.Int, 0, inSEQNUMBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        #endregion

        #region SHIPPING_CONSOLE
        /*
         * ------------------------------ SHIPPING CONSOLE ------------------------------
         */

        /*
        -------------- History PC_ShippingGetFilter ------------------------
        2013.09.07 CDR Creation
        */

        //[WebMethod]

        //public string PC_ShippingGetFilter(string inSession)
        //{
        //    Session session = GetSession(ReadGuid(inSession));
        //    return ExecuteProcedure
        //    (
        //        CreateGPConnection(session),
        //        "PC_ShippingGetFilter",
        //        NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
        //        NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
        //    ).GetXml();
        //}

        /*
        -------------- History PC_ShippingOrders ------------------------
        2013.09.07 CDR Creation
        */

        [WebMethod]

        public string PC_ShippingOrders(string inSession, string inLOCNCODE, int inDocType, int inRequired, int inIncludeStatus)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_ShippingOrdersSp",
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inDocType", SqlDbType.SmallInt, 0, inDocType),
                NewInPrm("@inRequired", SqlDbType.SmallInt, 0, inRequired),
                NewInPrm("@inIncludeStatus", SqlDbType.Int, 0, inIncludeStatus),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_ShippingAction ------------------------
        2013.09.14 CDR Creation
        */

        [WebMethod]

        public string PC_ShippingAction(string inSession, int inType, int inAction, string inDocList)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_ShippingActionSp",
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inType", SqlDbType.SmallInt, 0, inType),
                NewInPrm("@inAction", SqlDbType.SmallInt, 0, inAction),
                NewInPrm("@inDocList", SqlDbType.VarChar, 8000, inDocList ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        #endregion

        #region SHIPPING_CONSOLE
        /*
         * ------------------------------ PICKING CONSOLE ------------------------------
         */

        /*
        -------------- History PC_ShippingPicks ------------------------
        2013.10.05 CDR Creation
                       Ajout des parametres inITEMNMBR et inUOM
        */

        [WebMethod]

        public string PC_ShippingPicks(string inSession, string inLOCNCODE, int inPICKNBR, string inITEMNMBR, string inUOM, string inPRIORITY, string inPICKER, int inMode)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_ShippingPicksSp",
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE ?? ""),
                NewInPrm("@inPICKNBR", SqlDbType.Int, 0, inPICKNBR),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR ?? ""),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM ?? ""),
                NewInPrm("@inPRIORITY", SqlDbType.NChar, 3, inPRIORITY ?? ""),
                NewInPrm("@inPICKER", SqlDbType.Char, sLenUserType, inPICKER ?? ""),
                NewInPrm("@inMode", SqlDbType.SmallInt, 0, inMode),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        #endregion

        #region RECEIVING
        /*
         * ------------------------------ RECEIVING ------------------------------
         */

        /*
        -------------- History PC_RecSelector ------------------------
        2013.12.14 CDR Creation
        */

        [WebMethod]

        public string PC_RecSelector(string inSession, string inVENDORID)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_RecSelectorSp",
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, session.SiteId),
                NewInPrm("@inVENDORID", SqlDbType.Char, 15, inVENDORID),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_UpdatePORecStatus ------------------------
        2013.12.14 CDR Creation
        2013.12.20 CDR Modifications des specs
                       Renommé de PC_RecUpdateStatus a PC_UpdatePORecStatus
        */

        [WebMethod]

        public string PC_UpdatePORecStatus(string inSession, int inRECVNMBR, string inPONUMBER, int inMode)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_UpdatePORecStatusSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inPONUMBER", SqlDbType.Char, 17, inPONUMBER),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, session.SiteId),
                NewInPrm("@inUser", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLanguage", SqlDbType.Int, 0, session.LanguageId),
                NewInPrm("@inMode", SqlDbType.SmallInt, 0, inMode)
            ).GetXml();
        }

        /*
        -------------- History PC_RecGetInfo ------------------------
        2013.12.14 CDR Creation
        */

        [WebMethod]

        public string PC_RecGetInfo(string inSession, int inRECVNMBR, string inPONUMBER, string inSTATUSID)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_RecGetInfoSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_RecGetItemCount ------------------------
        2013.12.14 CDR Creation
        */

        [WebMethod]

        public string PC_RecGetItemCount(string inSession, int inRECVNMBR, string inPONUMBER, string inSTATUSID)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_RecGetItemCountSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_RecGetItemDtlInfo ------------------------
        2013.12.14 CDR Creation
        */

        [WebMethod]

        public string PC_RecGetItemDtlInfo(string inSession, int inRECVNMBR, string inITEMNMBR)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_RecGetItemDtlInfoSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_POREC_ValidateItemSin ------------------------
        2013.12.21 CDR Creation (copie de PC_ValidateItemSin)
        */

        [WebMethod]

        public string PC_POREC_ValidateItemSin(string inSession, string inItemSin, string inPONUMBER)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_POREC_ValidateItemSinSp",
                NewInPrm("@inItemSin", SqlDbType.Char, 80, inItemSin),
                NewInPrm("@inPONUMBER", SqlDbType.Char, 17, inPONUMBER),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, session.SiteId),
                NewInPrm("@inLanguage", SqlDbType.Int, 0, session.LanguageId),
                NewInPrm("@inOutMode", SqlDbType.Int, 0, 1), /* Retour par resultset */
                NewOutPrm("@outSINNUMBER", SqlDbType.Char, sLenSINType),
                NewOutPrm("@outSINTYPECODE", SqlDbType.Char, 4),
                NewOutPrm("@outSINSTATUS", SqlDbType.Int, 0),
                NewOutPrm("@outITEMNMBR", SqlDbType.Char, sLenItemType),
                NewOutPrm("@outDESCR1", SqlDbType.NChar, 50),
                NewOutPrm("@outDESCR2", SqlDbType.NChar, 50),
                NewOutPrm("@outSTOCKUOM", SqlDbType.Char, sLenUOMType),
                NewOutPrm("@outSTOCKQTY", SqlDbType.Float, 0),
                NewOutPrm("@outSINUOM", SqlDbType.Char, sLenUOMType),
                NewOutPrm("@outSINQTY", SqlDbType.Float, 0),
                NewOutPrm("@outSERLTNUM", SqlDbType.Char, sLenSerialType),
                NewOutPrm("@outLOCNCODE", SqlDbType.Char, sLenLOCNType),
                NewOutPrm("@outBIN", SqlDbType.Char, sLenBinType),
                NewOutPrm("@outCUSTNMBR", SqlDbType.Char, 15),
                NewOutPrm("@outCUSTADCD", SqlDbType.Char, 15),
                NewOutPrm("@outCREATEDATE", SqlDbType.Date, 0),
                NewOutPrm("@outISSin", SqlDbType.Bit, 0),
                NewOutPrm("@outERR", SqlDbType.Int, 0),
                NewOutPrm("@outERRMSG", SqlDbType.NChar, 255)
            ).GetXml();
        }

        /*
        -------------- History PC_RecValidateQty ------------------------
        2013.12.20 CDR Creation (selon modifications des specs)
        2013.12.21 CDR Ajout de @inLOCNCODE -> session.SiteId
                       Ajout des parametres: inSTOCKUOM, inNoEditQty, inSINQTY
        */

        [WebMethod]

        public string PC_RecValidateQty(string inSession, int inRECVNMBR, string inSINNUMBER, string inITEMNMBR, string inUOM, float inQTY, string inSTOCKUOM, bool inNoEditQty, float inSINQTY, bool inISSIN)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_RecValidateQtySp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, session.SiteId),
                NewInPrm("@inSINNUMBER", SqlDbType.Char, sLenSINType, inSINNUMBER),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inSTOCKUOM", SqlDbType.Char, sLenUOMType, inSTOCKUOM),
                NewInPrm("@inNoEditQty", SqlDbType.Bit, 0, inNoEditQty),
                NewInPrm("@inSINQTY", SqlDbType.Float, 0, inSINQTY),
                NewInPrm("@inISSin", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inOutMode", SqlDbType.Int, 0, 1), /* Retour par resultset */
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_RecUpdate ------------------------
        2013.12.14 CDR Creation
        2013.12.20 CDR Modifications des specs
                       Correction parametre @inUser -> @inUSERID
        2013.12.21 CDR Ajout de @inLOCNCODE -> session.SiteId
                       Ajout des parametres: inSTOCKUOM, inNoEditQty, inSINQTY
        */

        [WebMethod]

        public string PC_RecUpdate(string inSession, int inRECVNMBR, string inSINNUMBER, string inITEMNMBR, string inUOM, float inQTY, string inSTOCKUOM, bool inNoEditQty, float inSINQTY, bool inISSIN, int inMode)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_RecUpdateSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, session.SiteId),
                NewInPrm("@inSINNUMBER", SqlDbType.Char, sLenSINType, inSINNUMBER),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inSTOCKUOM", SqlDbType.Char, sLenUOMType, inSTOCKUOM),
                NewInPrm("@inNoEditQty", SqlDbType.Bit, 0, inNoEditQty),
                NewInPrm("@inSINQTY", SqlDbType.Float, 0, inSINQTY),
                NewInPrm("@inISSin", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inMode", SqlDbType.SmallInt, 0, inMode),
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_POREC_GetItems ------------------------
        2013.12.14 CDR Creation
        2013.12.21 CDR Ajout de @inLOCNCODE
        2013.12.23 CDR Changement de inFilter pour STATUSID
        */

        [WebMethod]

        public string PC_POREC_GetItems(string inSession, int inRECVNMBR, string inSTATUSID)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_POREC_GetItemsSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, session.SiteId),
                NewInPrm("@inSTATUSID", SqlDbType.Char, 1, inSTATUSID),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        /*
        -------------- History PC_POREC_UpdateGP ------------------------
        2013.12.23 CDR Creation
        2013.12.31 CDR Ajout de @inUSERID
        2014.01.03 CDR Déplacement d'une virgule causant une erreur
        */

        [WebMethod]

        public string PC_POREC_UpdateGP(string inSession, int inRECVNMBR, string inVNDDOCNM)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_POREC_UpdateGPSp",
                NewInPrm("@inRECVNMBR", SqlDbType.Int, 0, inRECVNMBR),
                NewInPrm("@inVNDDOCNM", SqlDbType.Char, 20, inVNDDOCNM),
		NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, session.UserId),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        #endregion
        
        #region ADJUSTMENT
        /*
         * ------------------------------ ADJUSTMENT ------------------------------
         */

        /*
        -------------- History PC_ADJ_ValidateQty ------------------------
        2013.12.27 CDR Creation
        */

        [WebMethod]

        public string PC_ADJ_ValidateQty(string inSession, string inLOCNCODE, string inUSERID, string inREASONCD,
            string inSINNUMBER, string inITEMNMBR, bool inISSIN, string inBIN, float inQTY, string inUOM,
            string inSTOCKUOM, bool inNoEditQty, float inSINQTY)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_ADJ_ValidateQtySp",
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE),
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, inUSERID),
                NewInPrm("@inREASONCD", SqlDbType.Char, 15, inREASONCD),
                NewInPrm("@inSINNUMBER", SqlDbType.Char, sLenSINType, inSINNUMBER),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR),
                NewInPrm("@inISSIN", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM),
                NewInPrm("@inSTOCKUOM", SqlDbType.Char, sLenUOMType, inSTOCKUOM),
                NewInPrm("@inNoEditQty", SqlDbType.Bit, 0, inNoEditQty),
                NewInPrm("@inSINQTY", SqlDbType.Float, 0, inSINQTY),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId),
                NewInPrm("@inOutMode", SqlDbType.Int, 0, 1) /* Retour par resultset */
            ).GetXml();
        }

        /*
        -------------- History PC_ADJ_AddEntry ------------------------
        2013.12.27 CDR Creation
        */

        [WebMethod]

        public string PC_ADJ_AddEntry(string inSession, string inLOCNCODE, string inUSERID, string inREASONCD,
            string inSINNUMBER, string inITEMNMBR, bool inISSIN, string inBIN, float inQTY, string inUOM,
            string inSTOCKUOM, bool inNoEditQty, float inSINQTY, int inADJGROUPING)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_ADJ_AddEntrySp",
                NewInPrm("@inLOCNCODE", SqlDbType.Char, sLenLOCNType, inLOCNCODE),
                NewInPrm("@inUSERID", SqlDbType.Char, sLenUserType, inUSERID),
                NewInPrm("@inREASONCD", SqlDbType.Char, 15, inREASONCD),
                NewInPrm("@inSINNUMBER", SqlDbType.Char, sLenSINType, inSINNUMBER),
                NewInPrm("@inITEMNMBR", SqlDbType.Char, sLenItemType, inITEMNMBR),
                NewInPrm("@inISSIN", SqlDbType.Bit, 0, inISSIN),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN),
                NewInPrm("@inQTY", SqlDbType.Float, 0, inQTY),
                NewInPrm("@inUOM", SqlDbType.Char, sLenUOMType, inUOM),
                NewInPrm("@inSTOCKUOM", SqlDbType.Char, sLenUOMType, inSTOCKUOM),
                NewInPrm("@inNoEditQty", SqlDbType.Bit, 0, inNoEditQty),
                NewInPrm("@inSINQTY", SqlDbType.Float, 0, inSINQTY),
                NewInPrm("@inADJGROUPING", SqlDbType.Int, 0, inADJGROUPING),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId)
            ).GetXml();
        }

        #endregion
    }
}