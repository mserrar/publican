<%@ WebService Language="C#" Class="XO7.Publican.PublicanGPCardsWS" %>
<%@ Assembly Src="PublicanWS.cs" %>
// ***************************************************************************************
// XO7
// Publican
// ***************************************************************************************
// <sName:> PublicanGP.asmx
// <sDesc:> Publican Web Service Tables IO for Dynamics GP
// <sversion:> 1.0
// ***************************************************************************************
// Notes:
// 
// ***************************************************************************************
// History
// 2013.03.29 CDR Creation
// ***************************************************************************************

using System;
using System.Data;
using System.Web.Services;

namespace XO7.Publican
{
    public class PublicanGPCardsWS: PublicanWS
    {
        /*
        -------------- History PC_SinMasterIO ------------------------
        2014.03.29 CDR Create
        */

        [WebMethod]

        public string PC_SinMasterIO(string inSession, string inAction, Int64 inRowId, string inTimeStamp,
            string inSINNUMBER, string inSINTYPECODE, int inSINSTATUS,
            string inITEMNMBR, string inDESCR1, string inDESCR2,
            string inSTOCKUOM, float inSTOCKQTY, string inSINUOM, float inSINQTY,
            string inSERLTNUM, string inLOCNCODE, string inBIN,
            string inCUSTNMBR, string inCUSTADCD)
        {
            Session session = GetSession(ReadGuid(inSession));
            return ExecuteProcedure
            (
                CreateGPConnection(session),
                "PC_SinMasterIOSp",
                NewInPrm("@inAction", SqlDbType.NChar, 10, inAction),
                NewInPrm("@inLANG", SqlDbType.Int, 0, session.LanguageId),
                NewInPrm("@inRowId", SqlDbType.BigInt, 0, inRowId),
                NewInPrm("@inTimeStamp", SqlDbType.DateTime, 0, inTimeStamp),
                NewInPrm("@inSINNUMBER", SqlDbType.Char, 50, inSINNUMBER),
                NewInPrm("@inSINTYPECODE", SqlDbType.Char, 4, inSINTYPECODE),
                NewInPrm("@inSINSTATUS", SqlDbType.Int, 0, inSINSTATUS),
                NewInPrm("@inITEMNMBR", SqlDbType.NVarChar, sLenItemType, inITEMNMBR),
                NewInPrm("@inDESCR1", SqlDbType.NChar, 50, inDESCR1),
                NewInPrm("@inDESCR2", SqlDbType.NChar, 50, inDESCR2),
                NewInPrm("@inSTOCKUOM", SqlDbType.NVarChar, sLenUOMType, inSTOCKUOM),
                NewInPrm("@inSTOCKQTY", SqlDbType.Float, 0, inSTOCKQTY),
                NewInPrm("@inSINUOM", SqlDbType.NVarChar, sLenUOMType, inSINUOM),
                NewInPrm("@inSINQTY", SqlDbType.Float, 0, inSINQTY),
                NewInPrm("@inSERLTNUM", SqlDbType.NVarChar, sLenSerialType, inSERLTNUM),
                NewInPrm("@inLOCNCODE", SqlDbType.NVarChar, sLenLOCNType, inLOCNCODE),
                NewInPrm("@inBIN", SqlDbType.Char, sLenBinType, inBIN),
                NewInPrm("@inCUSTNMBR", SqlDbType.Char, 15, inCUSTNMBR),
                NewInPrm("@inCUSTADCD", SqlDbType.Char, 15, inCUSTADCD)
            ).GetXml();
        }
    }
}