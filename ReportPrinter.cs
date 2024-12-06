using Microsoft.Reporting.WinForms;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.Text;

namespace XO7.Publican
{
    public class ReportPrinter
    {
        List<Stream> pagesStreams = new List<Stream>();
        int currentPageIndex = 0;
        LocalReport report = new LocalReport();
        string printerName = "";

        /// <summary>
        ///     Initializer
        /// </summary>
        /// <param name="reportDefinition">The rdl file</param>
        /// <param name="printerName">Windows name of the printer</param>
        public ReportPrinter(Stream reportDefinition, string printerName)
        {
            report.LoadReportDefinition(reportDefinition);
            this.printerName = printerName;
        }

        private Stream CreateStream(string name, string fileNameExtension, Encoding encoding, string mimeType, bool willSeek)
        {
            Stream stream = new MemoryStream();
            pagesStreams.Add(stream);
            return stream;
        }

        /// <summary>
        ///     Print a report from rdl file and use dsSource as data source.
        /// </summary>
        /// <param name="dsSource">Data source</param>
        public void Print(DataTable dsSource)
        {
            report.DataSources.Clear();
            report.DataSources.Add(new ReportDataSource(dsSource.TableName, dsSource));

            string deviceInfo =
            "<DeviceInfo>" +
                "<OutputFormat>BMP</OutputFormat>" +
                "<DpiX>300</DpiX>" +
                "<DpiY>300</DpiY>" +
            "</DeviceInfo>";

            Warning[] warnings;

            report.Render("Image", deviceInfo, CreateStream, out warnings);
            foreach (Stream stream in pagesStreams)
                stream.Position = 0;

            currentPageIndex = 0;

            PrintDocument prd = new PrintDocument();
            // This controller does not show progress dialog
            prd.PrintController = new StandardPrintController();
            prd.PrinterSettings.PrinterName = printerName;
            prd.PrintPage += prd_PrintPage;
            prd.Print();

            pagesStreams.Clear();
        }

        private void prd_PrintPage(object sender, PrintPageEventArgs e)
        {
            // Code from Microsoft's website.

            Bitmap pageImage = new Bitmap(pagesStreams[currentPageIndex]);

            // Debug
#if DEBUG
            pageImage.Save("C:\\Work\\CDR\\pageImage" + currentPageIndex + ".bmp");
#endif

            // Adjust rectangular area with printer margins.
            Rectangle adjustedRect = new Rectangle(
                e.PageBounds.Left - (int)e.PageSettings.HardMarginX, e.PageBounds.Top - (int)e.PageSettings.HardMarginY,
                e.PageBounds.Width, e.PageBounds.Height
            );

            // Draw a white background for the report
            e.Graphics.FillRectangle(Brushes.White, adjustedRect);

            // Draw the report content
            e.Graphics.DrawImage(pageImage, adjustedRect);

            // To avoid memory leaks
            pageImage.Dispose();

            // Prepare for the next page. Make sure we haven't hit the end.
            ++currentPageIndex;
            e.HasMorePages = (currentPageIndex < pagesStreams.Count);
        }
    }
}