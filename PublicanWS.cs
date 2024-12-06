// ***************************************************************************************
// XO7
// Publican
// ***************************************************************************************
// <sName:> Session.cs
// <sDesc:> XO7.Publican.Session class
// <sversion:> 1.0 
// ***************************************************************************************
// Notes:
// Session class for Web Services
// ***************************************************************************************
// History
// 2013.03.04 CDR Creation
// 2013.03.26 CDR Modified header
// 2013.12.20 CDR Correction Session.SiteId = champ SITEID et non CIEID
// ***************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Web.Services;
using System.Xml;

namespace XO7.Publican
{
    public class Session
    {
        public Guid SessionId = new Guid();
        public string DBName = "";
        public string UserId = "";
        public string CieId = "";
        public string SiteId = "";
        public int LanguageId = 0;

        public Session(Guid guid)
        {
            SessionId = guid;
        }

        public void Read(DataRow dr)
        {
            DBName = ((string)dr["DBNAME"]).Trim();
            UserId = ((string)dr["USERID"]).Trim();
            CieId = ((string)dr["CIEID"]).Trim();
            SiteId = ((string)dr["SITEID"]).Trim();
            LanguageId = (int)dr["LANGUAGEID"];
        }
    }


// ***************************************************************************************
// XO7
// Publican
// ***************************************************************************************
// <sName:> XO7.Publican.PublicanWS.cs
// <sDesc:> XO7.Publican.PublicanWS class
// <sversion:> 1.0 
// ***************************************************************************************
// Notes:
// Base class for Publican Web Services
// ***************************************************************************************
// History
// 2013.04.04 CDR Creation
// 2013.04.11 CDR Added GetMessage
// 2013.08.15 CDR Ajout de sLenSINType
// ***************************************************************************************

    public class PublicanWS : WebService
    {
        public const int sLenUserType = 15;
        public const int sLenPasswordType = 30;
        public const int sLenCieType = 15;
        public const int sLenWhseType = 11;
        public const int sLenMenuType = 20;
        public const int sLenFunctionType = 20;
        public const int sLenRoleType = 20;
        public const int sLenPrinterType = 15;
        public const int sLenDbType = 15;

        public const int sLenSINType = 50;
        public const int sLenItemType = 31;
        public const int sLenLotType = 31;
        public const int sLenSerialType = 31;
        public const int sLenBinType = 15;
        public const int sLenLOCNType = 11;
        public const int sLenUOMType = 9;
        public const int sLenSOPDocType = 21;
        public const int sLenBoxNbrType = 15;
        public const int sLenPickMethodType = 10;
        public const int sLenStockCountType = 15;
        public const int sLenZoneType = 5;
        public const int sLenPrintGroupType = 20;

        public const string sDefaultDataSetName = "NewDataSet";
        public const string sDefaultRecordSetName = "Table";

        public const string sConfigFileMain = "\\ConnectionMain.config";
        public const string sConfigFileGP = "\\ConnectionGP.config";

        /// <summary>
        ///     Read guid from string.
        /// </summary>
        /// <param name="s">String to read guid from</param>
        /// <returns>Parsed Guid or Empty Guid</returns>
        public static Guid ReadGuid(string s)
        {
            try
            {
                return new Guid(s);
            }
            catch (Exception)
            {
                return Guid.Empty;
            }
        }

        protected Dictionary<Guid, Session> GetPBSessionsList()
        {
            if (Application["SessionDB"] == null)
            {
                Application["SessionDB"] = new Dictionary<Guid, Session>();
            }

            return (Dictionary<Guid, Session>)Application["SessionDB"];
        }

        protected string GetCompletePath(string fileName)
        {
            return System.IO.Path.GetDirectoryName(Context.Request.PhysicalPath) + fileName;
        }

        protected SqlConnectionStringBuilder LoadConnectionConfig(string configFileName)
        {
            SqlConnectionStringBuilder scsb = new SqlConnectionStringBuilder();

            try
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(GetCompletePath(configFileName));

                scsb.DataSource = doc.GetElementsByTagName("server")[0].InnerXml;
                
                if (doc.GetElementsByTagName("BD").Count > 0)
                    scsb.InitialCatalog = doc.GetElementsByTagName("BD")[0].InnerXml;

                if (doc.GetElementsByTagName("IntegratedSecurity").Count > 0)
                {
                    string value = doc.GetElementsByTagName("IntegratedSecurity")[0].InnerXml;
                    string[] trueValues = new string[] { "true", "1", "yes", "oui" };
                    scsb.IntegratedSecurity = Array.Exists(trueValues, e => value.ToLowerInvariant() == e.ToLowerInvariant());
                }
                else
                    scsb.IntegratedSecurity = false;

                if (!scsb.IntegratedSecurity)
                {
                    scsb.UserID = doc.GetElementsByTagName("UserID")[0].InnerXml;
                    scsb.Password = doc.GetElementsByTagName("Password")[0].InnerXml;
                }

                return scsb;
            }
            catch (Exception)
            {
                throw;
            }
        }

        protected DataSet GetSessionInfo(Guid sessionId, SqlConnection connection = null)
        {
            return ExecuteProcedure
            (
                connection ?? CreateMainConnection(), "PB_GetSessionInfoSp",
                NewInPrm("@InSession", SqlDbType.UniqueIdentifier, 0, sessionId)
            );
        }

        protected Session GetSession(Guid sessionId, SqlConnection connection = null)
        {
            Dictionary<Guid, Session> sessionsBD = GetPBSessionsList();

            if (sessionsBD.ContainsKey(sessionId))
                return sessionsBD[sessionId];
            else
            {
                DataTable sessionInfo = GetSessionInfo(sessionId, connection).Tables[0];

                if (!sessionInfo.Columns.Contains("SESSIONID") || sessionInfo.Rows.Count == 0 || !(sessionInfo.Rows[0]["SESSIONID"] is Guid))
                {
                    throw new Exception("InvalidSession");
                }
                else
                {
                    Publican.Session session = new Session(sessionId);
                    session.Read(sessionInfo.Rows[0]);
                    return session;
                }
            }
        }

        protected DataSet GetMessage(int msgNbr, int msgLang, SqlConnection connection = null,
                                     string dataSetName = sDefaultDataSetName, string recordSetName = sDefaultRecordSetName)
        {
            return ExecuteProcedure
            (
                connection ?? CreateMainConnection(), "PB_GetMessageSp", dataSetName, recordSetName,
                NewInPrm("@inMsgNbr", SqlDbType.Int, 0, msgNbr),
                NewInPrm("@inMsgLang", SqlDbType.Int, 0, msgLang)
            );
        }

        /*
        -------------- History GetGPDatabase ------------------------
        2013.01.11 CDR CREATE
        2013.01.25 CDR Modified to not set session variable here, because it could change.
        2013.04.04 CDR Renamed and moved to PublicanWS class
        2013.04.11 CDR Created polymorph and rewrited code
        */
        private string GetGPDatabase(Session session)
        {
            string database = session.DBName;

            if (database == "")
                throw new Exception("Database name not found from session.");
            else
                return database;
        }

        private string GetGPDatabase(Guid sessionId, SqlConnection connection = null)
        {
            return GetGPDatabase(GetSession(sessionId, connection));
        }

        /// <summary>
        ///     Create a connection to a GP database.
        /// </summary>
        /// <![CDATA[
        /// 
        /// History
        /// 2013.04.11 CDR Duplicated with connection mode
        /// 
        /// ]]>
        /// <param name="sessionId">Publican session ID</param>
        /// <param name="connectionMain">Publican database connection if necessary (null means auto create)</param>
        /// <returns>GP database connection</returns>
        protected SqlConnection CreateGPConnection(Guid sessionId, SqlConnection connectionMain = null)
        {
            SqlConnectionStringBuilder scsb = LoadConnectionConfig(sConfigFileGP);
            scsb.InitialCatalog = GetGPDatabase(sessionId, connectionMain);
            return new SqlConnection(scsb.ConnectionString);
        }

        /// <summary>
        ///     Create a connection to a GP database.
        /// </summary>
        /// <param name="session">Publican session</param>
        /// <returns>GP database connection</returns>
        protected SqlConnection CreateGPConnection(Session session)
        {
            SqlConnectionStringBuilder scsb = LoadConnectionConfig(sConfigFileGP);
            scsb.InitialCatalog = GetGPDatabase(session);
            return new SqlConnection(scsb.ConnectionString);
        }

        /// <summary>
        ///     Create a connection to Publican database.
        /// </summary>
        /// <returns>Publican database connection</returns>
        protected SqlConnection CreateMainConnection()
        {
            return new SqlConnection(LoadConnectionConfig(sConfigFileMain).ConnectionString);
        }

        /// <summary>
        ///     Execute a Sql procedure and get the resulting dataset.
        /// </summary>
        /// <param name="connection">Database connection to use (will be restored to its initial state: open or closed)</param>
        /// <param name="procedure">The Sql Stored Procedure name</param>
        /// <param name="parameters">Sql parameters to use</param>
        /// <returns>Resulting dataset</returns>
        protected static DataSet ExecuteProcedure(SqlConnection connection, string procedure, params SqlParameter[] parameters)
        {
            return ExecuteProcedure(connection, procedure, sDefaultDataSetName, sDefaultRecordSetName, parameters);
        }

        /// <summary>
        ///     Execute a Sql procedure and get the resulting dataset.
        /// </summary>
        /// <param name="cnx">Database connection to use (will be restored to its initial state: open or closed)</param>
        /// <param name="procedure">The Sql Stored Procedure name</param>
        /// <param name="dataSetName">The dataset's name (if useful)</param>
        /// <param name="recordSetName">The recordset's name (if useful)</param>
        /// <param name="parameters">Sql parameters to use</param>
        /// <returns>Resulting dataset</returns>
        protected static DataSet ExecuteProcedure(SqlConnection cnx, string procedure, string dataSetName, string recordSetName, params SqlParameter[] parameters)
        {
            DataSet ds = new DataSet(dataSetName);

            bool wasClosed = (cnx.State != ConnectionState.Open);

            if (wasClosed)
                cnx.Open();

            SqlCommand cmd = new SqlCommand(procedure, cnx);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);
            (new SqlDataAdapter(cmd)).Fill(ds, recordSetName);

            if (wasClosed)
                cnx.Close();

            return ds;
        }

        /// <summary>
        ///     Create a new input parameter.
        /// </summary>
        /// <param name="name">Sql name (ex: "@inSession")</param>
        /// <param name="type">Sql type</param>
        /// <param name="size">Size if applicable</param>
        /// <param name="value">Value to set</param>
        /// <returns>The new parameter</returns>
        protected static SqlParameter NewInPrm(string name, SqlDbType type, int size, object value)
        {
            SqlParameter prm = new SqlParameter(name, type);
            prm.Direction = ParameterDirection.Input;
            prm.Size = size;
            prm.Value = value;
            return prm;
        }

        /// <summary>
        ///     Create a new output parameter.
        /// </summary>
        /// <param name="name">Sql name (ex: "@inSession")</param>
        /// <param name="type">Sql type</param>
        /// <param name="size">Size if applicable</param>
        /// <returns>The new parameter</returns>
        protected static SqlParameter NewOutPrm(string name, SqlDbType type, int size)
        {
            SqlParameter prm = new SqlParameter(name, type);
            prm.Direction = ParameterDirection.Output;
            prm.Size = size;
            return prm;
        }
    }
}
