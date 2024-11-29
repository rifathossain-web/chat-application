import { DownloadOutlined } from "@ant-design/icons";
import { ConfigProvider, DatePicker, message, Tooltip } from "antd";
import enGB from "antd/locale/en_GB";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/en";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import AirStateFooter from "./AirStateFooter";
import AirStateTable from "./AirStateTable";

dayjs.locale("en");

const Airstate = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfContentRef = useRef(); // Reference to the content to capture

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      fetchHelicopterLogsByDate(formattedDate);
    }
  };

  const fetchHelicopterLogsByDate = async (apidate) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/helicopterLogs/logs`, {
        params: { date: apidate },
      });
      if (response.data.length > 0) {
        setLogs(response.data);
        message.success("Logs fetched successfully");
      } else {
        setLogs([]);
        message.info("No logs found for this date");
      }
    } catch (error) {
      setLogs([]);
      if (error.response) {
        message.error(`Server responded with error: ${error.response.status}`);
      } else if (error.request) {
        message.error("No response received from the server");
      } else {
        message.error("Error setting up request");
      }
    }
  };

  const handleEdit = async (updatedRecord) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/helicopterLogs/log/${updatedRecord._id}`, updatedRecord);
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log._id === updatedRecord._id ? updatedRecord : log
        )
      );
      message.success("Log updated successfully");
    } catch (error) {
      message.error("Failed to update log");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/helicopterLogs/log/${id}`);
      setLogs((prevLogs) => prevLogs.filter((log) => log._id !== id));
      message.success("Log deleted successfully");
    } catch (error) {
      message.error("Failed to delete log");
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true); // Set flag to hide actions
    
    // Allow rendering time before capture
    setTimeout(async () => {
      const input = pdfContentRef.current;
      const dateFormatted = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : "unknown_date";
  
      const canvas = await html2canvas(input, {
        scale: 2, // Adjusted scale for quality vs. size balance
        useCORS: true, // To handle any cross-origin issues for images
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.75); // Use JPEG format with quality factor for compression
  
      const pdf = new jsPDF("landscape", "mm", "a4");
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      pdf.save(`Daily_Air_State_${dateFormatted}.pdf`);
      
      setIsGeneratingPDF(false); // Reset flag after PDF generation
    }, 300); // Delay capture by 300ms
  };
  

  return (
    <div>
      <div className=" flex justify-center">
        <ConfigProvider locale={enGB}>
          <DatePicker
            onChange={handleDateChange}
            format="YYYY-MM-DD"
            placeholder="Select Date"
            className="w-60 border border-gray-300 rounded-lg shadow-sm p-2 text-center"
            bordered={false}
          />
        </ConfigProvider>
      </div>

      <div className="flex justify-end mr-6 ">
        <Tooltip title="Download PDF">
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-blue-400 rounded-lg text-white p-2">
            <DownloadOutlined className="animate-bounce" />
            Download PDF
          </button>
        </Tooltip>
      </div>

      {/* Content to Capture for PDF */}
      <div ref={pdfContentRef} id="pdf-content" style={{  width: "100%" }}>
        <div className="text-center">
          <h1 className="text-xl font-bold border-b-2 border-black inline-block pb-2">
            DAILY AIR STATE OF MI-17/MI-171SH HELI
          </h1> 
          <p className="text-lg font-semibold">(Mi-17 FLT LINE)</p>
        </div>

        <div className="flex justify-between items-center px-6">
          <p className="text-xl font-semibold ">
            Office Time:{" "}
            <span className="font-semibold">
             _______hrs
            </span>
          </p>
          <p className="text-xl font-semibold">
            Date:{" "}
            {selectedDate ? dayjs(selectedDate).format("DD MMM YY") : "Select a Date"}
          </p>
        </div>

        {/* Table and Footer Components */}
        <AirStateTable logs={logs} onEdit={handleEdit} onDelete={handleDelete} showActions={!isGeneratingPDF} />
        <AirStateFooter logs={logs} />
      </div>
    </div>
  );
};

export default Airstate;
