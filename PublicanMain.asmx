<%@ WebService Language="C#" Class="XO7.Publican.PublicanMainWS" %>
<%@ Assembly Src="PublicanWS.cs" %>
// ***************************************************************************************
// XO7
// Publican
// ***************************************************************************************
// <sName:> PublicanMain.asmx
// <sDesc:> Publican Web Service connector to Publican database
// <sversion:> 1.2
// ***************************************************************************************
// Notes:
// 
// ***************************************************************************************
// History
// 2012.12.17 RDO REVIEW WS Names
// 2013.01.25 CDR Added length constants
//                Added insertInputParameter and insertOutputParameter
// 2013.03.04 CDR Created Session class
// 2013.03.12 CDR Removed SqlException catch from getConnection
// 2013.03.26 CDR Modified header
//                Added new functions for uniform procedure calling.
//                Removed insertInputParameter and insertOutputParameter
//                  (mainly replaced by NewInPrm and NewOutPrm)
// 2013.04.04 CDR Changed base classe to PublicanWS (contains common functions)
// 2013.08.23 CDR Version 1.2
// 2013.12.27 CDR Ajout de PB_ADJ_GetConfig
// ***************************************************************************************

//#define DEBUG

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services;

namespace XO7.Publican
{
    public class PublicanMainWS : PublicanWS
    {
#if DEBUG
        [WebMethod]
        public string GetSessionCache()
        {
            string completeText = "";

            Dictionary<Guid, Session> sessions = GetPBSessionsList();

            foreach (Session s in sessions.Values)
            {
                completeText += string.Join(" - ", new string[] { s.SessionId.ToString(), s.UserId, s.CieId, s.SiteId, s.LanguageId.ToString(), s.DBName }) + "\n";
            }

            return completeText;
        }
#endif

        /*
        -------------- History PB_ValidateUserPassword  ------------------------
        2013.01.08 CDR CREATE
        2013.01.25 CDR Modified to user insertInputParameter

                PB_ValidateUserPassword validates user id, password and status for login
        */

        [WebMethod]

        public string PB_ValidateUserPassword(string inUser, string inPassword, int inLanguage)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_ValidateUserPasswordSp", "Login", "Result",
                NewInPrm("@inUserid", SqlDbType.NVarChar, sLenUserType, inUser),
                NewInPrm("@inPassword", SqlDbType.NVarChar, sLenPasswordType, inPassword),
                NewInPrm("@inLanguage", SqlDbType.Int, 0, inLanguage)
            ).GetXml();
        }

        /*
        -------------- History PB_ValidateAccessToMenu  ------------------------
        2013.01.08 CDR CREATE
        2013.01.25 CDR Modified to user insertInputParameter
        2013.03.11 CDR Added inMenuType parameter

        PB_ValidateAccessToMenu validates that user has access to the menu menu.
        inMenuType: 1 = Main menu for HandHeld, 2 = Administration menu
        */

        [WebMethod]

        public string PB_ValidateAccessToMenu(string inUser, int inMenuType)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_ValidateAccessToMenuSp", "MenuAccess", "Result",
                NewInPrm("@inUserid", SqlDbType.NVarChar, sLenUserType, inUser),
                NewInPrm("@inMenuType", SqlDbType.SmallInt, 0, inMenuType)
            ).GetXml();
        }

        /*
        -------------- History PB_GetMenuEntries  ------------------------
        2013.01.09 CDR CREATE
        2013.01.10 CDR Removed logic to put it in SQL
        2013.01.25 CDR Modified to user insertInputParameter

                PB_GetMenuEntries gets entries from the current menu.
        */

        [WebMethod]

        public string PB_GetMenuEntries(string insession)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetMenuEntriesSp", "MenuEntries", "MenuEntry",
                NewInPrm("@inSessionid", SqlDbType.UniqueIdentifier, 0, ReadGuid(insession))
            ).GetXml();
        }

        /*
        -------------- History PB_GetAllMenuEntries  ------------------------
        2013.03.11 CDR CREATE (copied from PB_GetMenuEntries)

                PB_GetAllMenuEntries gets all accessible menu entries.
        */

        [WebMethod]

        public string PB_GetAllMenuEntries(string inSessionId)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetAllMenuEntriesSp", "MenuEntries", "MenuEntry",
                NewInPrm("@inSessionId", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSessionId))
            ).GetXml();
        }

        /*
        -------------- History PB_GetCieWhse  ------------------------
        2013.01.11 CDR CREATE
        2013.01.25 CDR Modified to user insertInputParameter

                PB_GetCieWhse gets list of possible Cie / Whse
        */

        [WebMethod]

        public string PB_GetCieWhse(string inSessionId)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetCieWhseSp", "CieWhseList", "CieWhse",
                NewInPrm("@inSessionId", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSessionId))
            ).GetXml();
        }

        /*
        -------------- History PB_InitSession ------------------------
        2012.12.20 CDR CREATE
        2013.01.14 CDR ADDED ASP Session caching for DBNAME
        2013.01.25 CDR Modified to user insertInputParameter
        2013.02.28 CDR Added inDelOthers and inLANG parameters
        2013.03.04 CDR Changed Session caching to cache Session class

                PB_InitSession creates a new session and returns the session id
        */

        [WebMethod]

        public string PB_InitSession(string inUser, bool inDelOthers, int inLANG)
        {
            SqlParameter prmOutSession = NewOutPrm("@OutSession", SqlDbType.UniqueIdentifier, 0);
            DataSet ds = ExecuteProcedure
            (
                CreateMainConnection(), "PB_InitWorkSessionSp",
                NewInPrm("@inUser", SqlDbType.NVarChar, sLenUserType, inUser ?? ""),
                NewInPrm("@inDelOthers", SqlDbType.Bit, 0, inDelOthers),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG),
                prmOutSession
            );

            Dictionary<Guid, Session> sessionsBD = GetPBSessionsList();

            // Si on avait demandé de supprimer les autres sessions,
            // on s'assure des les supprimer dans les Web Services.
            if (inDelOthers)
            {
                Session[] list = new Session[sessionsBD.Count];
                sessionsBD.Values.CopyTo(list, 0);

                foreach (Session s in list)
                    if (s.UserId.ToUpper() == inUser.ToUpper())
                        sessionsBD.Remove(s.SessionId);
            }

            if (prmOutSession.Value != null && prmOutSession.Value is Guid)
            {
                Session newSession = new Session((Guid)prmOutSession.Value);
                newSession.Read(ds.Tables[0].Rows[0]);
                sessionsBD[(Guid)prmOutSession.Value] = newSession;
            }

            if (ds.Tables[0].Columns.Contains("DBNAME"))
                ds.Tables[0].Columns.Remove("DBNAME");

            return ds.GetXml();
        }

        /*
        -------------- History PB_RemoveSession ------------------------
        2013.01.10 CDR CREATE
        2013.01.14 CDR ADDED ASP Session caching for DBNAME
        2013.01.25 CDR Modified to user insertInputParameter
        2013.03.04 CDR Changed Session caching to cache Session class

                PB_RemoveSession removes the given session
        */

        [WebMethod]

        public string PB_RemoveSession(string inSessionId)
        {
            Guid guid = ReadGuid(inSessionId);
            DataSet ds = ExecuteProcedure
            (
                CreateMainConnection(), "PB_RemoveSessionSp", "Remove", "Result",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, guid)
            );

            Dictionary<Guid, Session> sessionsBD = GetPBSessionsList();
            sessionsBD.Remove(guid);

            return ds.GetXml();
        }

        /*
        -------------- History PB_GetSessionInfo ------------------------
        2013.01.08 CDR ADDED HEADER
        2013.01.25 CDR Modified to user insertInputParameter
        2013.04.04 CDR Removed DBNAME for resultset

                PB_GetSessionInfo returns the given session info
        */

        [WebMethod]

        public string PB_GetSessionInfo(string insession)
        {
            DataSet ds = GetSessionInfo(ReadGuid(insession));
            DataColumnCollection columns = ds.Tables[0].Columns;
            if (columns.Contains("DBNAME"))
                columns.Remove("DBNAME");
            return ds.GetXml();
        }

        /*
        -------------- History PB_UpdateSession ------------------------
        2013.01.10 CDR CREATE
        2013.01.14 CDR ADDED ASP Session caching for DBNAME
        2013.01.25 CDR Modified to user insertInputParameter
        2013.03.04 CDR Changed Session caching to cache Session class

                PB_UpdateSession updates the session and returns the given session info
        */

        [WebMethod]

        public string PB_UpdateSession(string inSessionId, string inCieId,
                                       string inWhseId, string inMenuId,
                                       bool inSetDefault, int inLANG)
        {
            Guid guid = ReadGuid(inSessionId);
            DataSet ds = ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateSessionSp", "Session", "Result",
                NewInPrm("@inSessionId", SqlDbType.UniqueIdentifier, 0, guid),
                NewInPrm("@inCieId", SqlDbType.NVarChar, sLenCieType, inCieId),
                NewInPrm("@inWhseId", SqlDbType.NVarChar, sLenWhseType, inWhseId),
                NewInPrm("@inMenuId", SqlDbType.NVarChar, sLenMenuType, inMenuId),
                NewInPrm("@inSetDefault", SqlDbType.Bit, 0, inSetDefault),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            );

            Dictionary<Guid, Session> sessionsBD = GetPBSessionsList();

            if (!sessionsBD.ContainsKey(guid))
                sessionsBD[guid] = new Session(guid);
            sessionsBD[guid].Read(ds.Tables[0].Rows[0]);

            if (ds.Tables[0].Columns.Contains("DBNAME"))
                ds.Tables[0].Columns.Remove("DBNAME");

            return ds.GetXml();
        }

        /*
        -------------- History PB_GetNextItemMethod ------------------------
        2013.04.22 CDR CREATE
        */

        [WebMethod]

        public string PB_GetNextItemMethod(string inSession)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetNextItemMethodSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession))
            ).GetXml();
        }

        /*
        -------------- History PB_GetView ------------------------
        2013.03.06 CDR CREATE
        */

        [WebMethod]

        public string PB_GetView(string inSession, string inView, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetViewSp", "View", "Row",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inView", SqlDbType.VarChar, 64, inView ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_GetUserRoles ------------------------
        2013.03.27 CDR CREATE
        */

        [WebMethod]

        public string PB_GetUserRoles(string inSession, string inUserId)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetUserRolesSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inUserId", SqlDbType.NChar, sLenUserType, inUserId ?? "")
            ).GetXml();
        }

        /*
        -------------- History PB_GetUserSites ------------------------
        2013.03.29 CDR CREATE
        */

        [WebMethod]

        public string PB_GetUserSites(string inSession, string inUserId)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetUserSitesSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inUserId", SqlDbType.NChar, sLenUserType, inUserId ?? "")
            ).GetXml();
        }

        /*
        -------------- History PB_GetMenuAccess ------------------------
        2013.03.07 CDR CREATE
        2013.03.08 CDR Renamed from PB_GetRoleMenuAccess
                       Changed to fit with stored proc
        */

        [WebMethod]

        public string PB_GetMenuAccess(string inSession, string inEntityId, int inEntityType)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetMenuAccessSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inEntityId", SqlDbType.NChar, sLenRoleType, inEntityId ?? ""),
                NewInPrm("@inEntityType", SqlDbType.SmallInt, 0, inEntityType)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateRole ------------------------
        2013.03.07 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateRole(string inSession, string inOldRoleId, string inNewRoleId, string inDescription)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateRoleSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inOldRoleId", SqlDbType.NChar, sLenRoleType, inOldRoleId ?? ""),
                NewInPrm("@inNewRoleId", SqlDbType.NChar, sLenRoleType, inNewRoleId ?? ""),
                NewInPrm("@inDescription", SqlDbType.NChar, 30, inDescription ?? "")
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateUser ------------------------
        2013.03.12 CDR CREATE (copied from PB_UpdateRole)
        */

        [WebMethod]

        public string PB_UpdateUser(string inSession, string inOldUserId, string inNewUserId, string inFirstName, string inLastName, string inDispName, string inPassword, int inLanguageId, int inStatus)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateUserSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inOldUserId", SqlDbType.NChar, sLenUserType, inOldUserId ?? ""),
                NewInPrm("@inNewUserId", SqlDbType.NChar, sLenUserType, inNewUserId ?? ""),
                NewInPrm("@inFirstName", SqlDbType.NChar, 30, inFirstName ?? ""),
                NewInPrm("@inLastName", SqlDbType.NChar, 30, inLastName ?? ""),
                NewInPrm("@inDispName", SqlDbType.NChar, 60, inDispName ?? ""),
                NewInPrm("@inPassword", SqlDbType.NChar, 30, inPassword ?? ""),
                NewInPrm("@inLanguageId", SqlDbType.Int, 0, inLanguageId),
                NewInPrm("@inStatus", SqlDbType.SmallInt, 0, inStatus)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateAccess ------------------------
        2013.03.08 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateAccess(string inSession, string inEntityId, string inItemId, int inEntityType, int inItemType, bool inSet, string inAccessMode)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateAccessSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inEntityId", SqlDbType.NChar, sLenRoleType, inEntityId ?? ""),
                NewInPrm("@inItemId", SqlDbType.NChar, sLenMenuType, inItemId ?? ""),
                NewInPrm("@inEntityType", SqlDbType.SmallInt, 0, inEntityType),
                NewInPrm("@inItemType", SqlDbType.SmallInt, 0, inItemType),
                NewInPrm("@inSet", SqlDbType.Bit, 0, inSet),
                NewInPrm("@inAccessMode", SqlDbType.NChar, 10, inAccessMode ?? "")
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateUserRole ------------------------
        2013.03.29 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateUserRole(string inSession, string inUserId, string inRoleId, bool inSet, bool inIsDefault)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateUserRoleSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inUserId", SqlDbType.NChar, sLenUserType, inUserId ?? ""),
                NewInPrm("@inRoleId", SqlDbType.NChar, sLenRoleType, inRoleId ?? ""),
                NewInPrm("@inSet", SqlDbType.Bit, 0, inSet),
                NewInPrm("@inIsDefault", SqlDbType.Bit, 0, inIsDefault)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateUserCie ------------------------
        2013.04.16 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateUserCie(string inSession, string inUserId, string inCieId, bool inSet, bool inIsDefault)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateUserCieSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inUserId", SqlDbType.NChar, sLenUserType, inUserId ?? ""),
                NewInPrm("@inCieId", SqlDbType.NChar, sLenCieType, inCieId ?? ""),
                NewInPrm("@inSet", SqlDbType.Bit, 0, inSet),
                NewInPrm("@inIsDefault", SqlDbType.Bit, 0, inIsDefault)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateUserSite ------------------------
        2013.04.16 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateUserSite(string inSession, string inUserId, string inCieId, string inSiteId, bool inSet, bool inIsDefault)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateUserSiteSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inUserId", SqlDbType.NChar, sLenUserType, inUserId ?? ""),
                NewInPrm("@inCieId", SqlDbType.NChar, sLenCieType, inCieId ?? ""),
                NewInPrm("@inSiteId", SqlDbType.NChar, sLenLOCNType, inSiteId ?? ""),
                NewInPrm("@inSet", SqlDbType.Bit, 0, inSet),
                NewInPrm("@inIsDefault", SqlDbType.Bit, 0, inIsDefault)
            ).GetXml();
        }

        /*
        -------------- History PB_GetCompanyGPInfo ------------------------
        2013.07.16 CDR CREATE
        */

        [WebMethod]

        public string PB_GetCompanyGPInfo(string inSession, string inCIEID, string inDBNAME, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetCompanyGPInfoSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inCIEID", SqlDbType.Char, sLenCieType, inCIEID ?? ""),
                NewInPrm("@inDBNAME", SqlDbType.NChar, sLenDbType, inDBNAME ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_GetCompanySites ------------------------
        2013.07.16 CDR CREATE
        */

        [WebMethod]

        public string PB_GetCompanySites(string inSession, string inCIEID, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetCompanySitesSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inCIEID", SqlDbType.Char, sLenCieType, inCIEID ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_GetCompanyGPSites ------------------------
        2013.07.18 CDR CREATE
        */

        [WebMethod]

        public string PB_GetCompanyGPSites(string inSession, string inCIEID, string inDBNAME, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_GetCompanyGPSitesSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inCIEID", SqlDbType.Char, sLenCieType, inCIEID ?? ""),
                NewInPrm("@inDBNAME", SqlDbType.NChar, sLenDbType, inDBNAME ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateCompany ------------------------
        2013.07.16 CDR CREATE
        2013.07.24 CDR Put sLenBinType for bin fields
        2013.08.23 CDR Ajout du paramètre inLABELSIN
        */

        [WebMethod]

        public string PB_UpdateCompany(string inSession,
            string inCIEID, string inCIENAME, string inDBNAME, string inNEXTITEMMETHOD, bool inSINGLELOT, bool inISACTIVE,
            bool inUpdateERP, /* If true, following informations are necessary */
            string inWTTXPFX, string inWTBAPFX, string inBINTRF, string inBINSHIP, string inBINRECV, bool inLABELSIN,
            int inPICKNEXTSEQ, int inPACKNEXTSEQ, int inMOVENEXTSEQ, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateCompanySp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inCIEID", SqlDbType.Char, sLenCieType, inCIEID ?? ""),
                NewInPrm("@inCIENAME", SqlDbType.NChar, 50, inCIENAME ?? ""),
                NewInPrm("@inDBNAME", SqlDbType.NChar, sLenDbType, inDBNAME ?? ""),
                NewInPrm("@inNEXTITEMMETHOD", SqlDbType.Char, 10, inNEXTITEMMETHOD ?? ""),
                NewInPrm("@inSINGLELOT", SqlDbType.Bit, 0, inSINGLELOT),
                NewInPrm("@inISACTIVE", SqlDbType.Bit, 0, inISACTIVE),
                NewInPrm("@inUpdateERP", SqlDbType.Bit, 0, inUpdateERP),
                NewInPrm("@inWTTXPFX", SqlDbType.Char, 7, inWTTXPFX ?? ""),
                NewInPrm("@inWTBAPFX", SqlDbType.Char, 13, inWTBAPFX ?? ""),
                NewInPrm("@inBINTRF", SqlDbType.Char, sLenBinType, inBINTRF ?? ""),
                NewInPrm("@inBINSHIP", SqlDbType.Char, sLenBinType, inBINSHIP ?? ""),
                NewInPrm("@inBINRECV", SqlDbType.Char, sLenBinType, inBINRECV ?? ""),
                NewInPrm("@inLABELSIN", SqlDbType.Bit, 0, inLABELSIN),
                NewInPrm("@inPICKNEXTSEQ", SqlDbType.Int, 0, inPICKNEXTSEQ),
                NewInPrm("@inPACKNEXTSEQ", SqlDbType.Int, 0, inPACKNEXTSEQ),
                NewInPrm("@inMOVENEXTSEQ", SqlDbType.Int, 0, inMOVENEXTSEQ),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateSite ------------------------
        2013.07.19 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateSite(string inSession, int inAction,
            string inCIEID, string inSITEID, string inSITENAME, string inNEXTITEMMETHOD, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateSiteSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inAction", SqlDbType.SmallInt, 0, inAction),
                NewInPrm("@inCIEID", SqlDbType.Char, sLenCieType, inCIEID ?? ""),
                NewInPrm("@inSITEID", SqlDbType.Char, sLenLOCNType, inSITEID ?? ""),
                NewInPrm("@inSITENAME", SqlDbType.NChar,30, inSITENAME ?? ""),
                NewInPrm("@inNEXTITEMMETHOD", SqlDbType.Char, 10, inNEXTITEMMETHOD ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_UpdateSystem ------------------------
        2013.07.24 CDR CREATE
        */

        [WebMethod]

        public string PB_UpdateSystem(string inSession,
            string inMAINMENUHH, string inMENUADMIN, int inPACKINGMETHOD,
            string inBINTRF, string inBINSHIP, string inBINRECV,
            bool inALLOWDELSESSION, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_UpdateSystemSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inMAINMENUHH", SqlDbType.Char, sLenMenuType, inMAINMENUHH ?? ""),
                NewInPrm("@inMENUADMIN", SqlDbType.Char, sLenMenuType, inMENUADMIN ?? ""),
                NewInPrm("@inPACKINGMETHOD", SqlDbType.Int, 0, inPACKINGMETHOD),
                NewInPrm("@inBINTRF", SqlDbType.Char, sLenBinType, inBINTRF ?? ""),
                NewInPrm("@inBINSHIP", SqlDbType.Char, sLenBinType, inBINSHIP ?? ""),
                NewInPrm("@inBINRECV", SqlDbType.Char, sLenBinType, inBINRECV ?? ""),
                NewInPrm("@inALLOWDELSESSION", SqlDbType.Bit, 0, inALLOWDELSESSION),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_ValidateUser ------------------------
        2013.12.27 CDR CREATE
        */

        [WebMethod]

        public string PB_ValidateUser(string inSession, string inUserId, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_ValidateUserSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inUserId", SqlDbType.NChar, sLenUserType, inUserId ?? ""),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }

        /*
        -------------- History PB_ADJ_GetConfig ------------------------
        2013.12.27 CDR CREATE
        */

        [WebMethod]

        public string PB_ADJ_GetConfig(string inSession, int inLANG)
        {
            return ExecuteProcedure
            (
                CreateMainConnection(), "PB_ADJ_GetConfigSp",
                NewInPrm("@inSession", SqlDbType.UniqueIdentifier, 0, ReadGuid(inSession)),
                NewInPrm("@inLANG", SqlDbType.Int, 0, inLANG)
            ).GetXml();
        }
    }
}
