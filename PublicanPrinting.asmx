<%@ WebService Language="C#" Class="XO7.Publican.PublicanPrintingWS" %>
<%@ Assembly Src="PublicanWS.cs" %>
<%@ Assembly Src="ReportPrinter.cs" %>
// ***************************************************************************************
// XO7
// Publican
// ***************************************************************************************
// <sName:> PublicanPrinting.asmx
// <sDesc:> Publican Web Service for printing functions
// <sversion:> 1.0
// ***************************************************************************************
// Notes:
// TODO Put file paths in a config file?
// ***************************************************************************************
// History
// 2013.04.04 CDR Creation (copy from PublicanMain.asmx)
// ***************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Web.Services;

namespace XO7.Publican
{
    public class PublicanPrintingWS : PublicanWS
    {
        private const string sReportPackageContentListFile = "\\Reports\\PackageContentList.rdl";

        private const int sErrorPrinterNotFound = 9202;

        protected Stream OpenReportDefinition(string reportFile)
        {
            return new FileStream(GetCompletePath(reportFile), FileMode.Open, FileAccess.Read, FileShare.Read);
        }

        /*
        -------------- History PP_GetPrinters  ------------------------
        2013.04.04 CDR Creation
        */

        [WebMethod]

        public string PP_GetPrinters(string inSession, string inFunctionId)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetPrintersSp", "Printers", "Printer",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inFunctionId", SqlDbType.NChar, sLenFunctionType, inFunctionId)
            ).GetXml();
        }

        /*
        -------------- History PP_PrintPackageContentList  ------------------------
        2013.04.04 CDR Creation
        2013.04.08 CDR Used inSession in GetPrinterInfo
        */

        [WebMethod]

        public string PP_PrintPackageContentList(string inSession, string inPRINTERID, int inPACKNBR, string inBOXNBR)
        {
            SqlConnection cnxMain = CreateMainConnection();
            SqlConnection cnxGP = null;

            Guid guid = ReadGuid(inSession);
            List<string> boxes = new List<string>();

            cnxMain.Open();

            string printerName = ((string)ExecuteProcedure
            (
                cnxMain,
                "PB_GetPrinterInfoSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, guid),
                NewInPrm("@inPRINTERID", SqlDbType.Char, sLenPrinterType, inPRINTERID)
            ).Tables[0].Rows[0]["ADDRESS"]).Trim();

            Publican.Session session = GetSession(guid, cnxMain);
            cnxGP = CreateGPConnection(session);

            cnxGP.Open();

            DataSet dsBoxes = ExecuteProcedure
            (
                cnxGP,
                "PC_GetPackedItemsSp",
                NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, "")
            );

            if ((inBOXNBR ?? "") == "")
            {
                foreach (DataRow drBox in dsBoxes.Tables[0].Rows)
                    boxes.Add((string)drBox["BOXNBR"]);
            }
            else
            {
                foreach (DataRow drBox in dsBoxes.Tables[0].Rows)
                    if (inBOXNBR == ((string)drBox["BOXNBR"]).Trim())
                    {
                        boxes.Add(inBOXNBR);
                        break;
                    }
            }

            string printResult = "";

            try
            {
                ReportPrinter rp = new ReportPrinter
                (
                    OpenReportDefinition(sReportPackageContentListFile),
                    printerName
                );

                foreach (string boxNbr in boxes)
                {
                    rp.Print
                    (
                        ExecuteProcedure
                        (
                            cnxGP,
                            "PC_PackageContentListSp", sDefaultDataSetName, "dsPackageContentList",
                            NewInPrm("@inPACKNBR", SqlDbType.Int, 0, inPACKNBR),
                            NewInPrm("@inBOXNBR", SqlDbType.Char, sLenBoxNbrType, boxNbr)
                        ).Tables[0]
                    );
                }

                printResult = "<PrintResult><SUCCESS>1</SUCCESS></PrintResult>";
            }
            /*catch (FileNotFoundException ex)
            {
                printResult = "<PrintResult><MSGNBR>666</MSGNBR><MSGTEXT>Report definition not found</MSGTEXT></PrintResult>";
            }*/
            catch (System.Drawing.Printing.InvalidPrinterException ex)
            {
                printResult = GetMessage(sErrorPrinterNotFound, session.LanguageId, cnxMain, "PrintResult").GetXml();
            }

            cnxMain.Close();
            cnxGP.Close();

            return printResult;
        }
    } 
}
