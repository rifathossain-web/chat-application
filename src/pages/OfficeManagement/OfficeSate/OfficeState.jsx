import { PrinterOutlined } from "@ant-design/icons";
import { Button, DatePicker, message, Spin } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useEffect, useRef, useState } from "react";
import Masonry from "react-masonry-css";
import picture1 from "../../../assets/picture1.jpg"; // Adjust path as needed
import { useAuth } from "../../../context/AuthContext"; // Adjust path as needed

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = "Asia/Dhaka";

const rankShortForms = {
  "PILOT OFFICER": "Pilot Officer",
  "FLYING OFFICER": "Flying Officer",
  "FLIGHT LIEUTENANT": "Flight Lieutenant",
  "SQUADRON LEADER": "Squadron Leader",
  "WING COMMANDER": "Wing Commander",
  "GROUP CAPTAIN": "Group Captain",
};

const getRankShortForm = (rank) => {
  if (!rank || rank === "N/A") return "N/A";

  const lowerRank = rank.toLowerCase();

  if (lowerRank.startsWith("ac-") || lowerRank.startsWith("ac ")) return "AC";
  if (
    lowerRank.startsWith("lac") ||
    lowerRank.includes("leading aircraftman")
  )
    return "LAC";
  if (
    lowerRank.startsWith("cpl") ||
    lowerRank.includes("corporal")
  )
    return "CPL";
  if (
    lowerRank.startsWith("sgt") ||
    lowerRank.includes("sergeant")
  )
    return "SGT";
  if (
    lowerRank.startsWith("wo") &&
    !lowerRank.includes("swo")
  )
    return "WO";
  if (
    lowerRank.includes("swo") ||
    lowerRank.includes("senior warrant officer")
  )
    return "SWO";
  if (
    lowerRank.startsWith("mwo") ||
    lowerRank.includes("master warrant officer")
  )
    return "MWO";

  const normalizedRank = rank.trim().toUpperCase();
  return rankShortForms[normalizedRank] || rank;
};

const OfficeState = () => {
  const { user, users, usersLoading, fetchUsers } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [disposals, setDisposals] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [imgData, setImgData] = useState(""); // State to hold Base64 image data

  const printRef = useRef();

  // Load and convert the image to Base64
  useEffect(() => {
    const getBase64Image = (url, callback) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous"); // To avoid CORS issues
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        callback(dataURL);
      };
      img.src = url;
    };

    getBase64Image(picture1, (dataUrl) => {
      setImgData(dataUrl);
    });
  }, []);

  useEffect(() => {
    if (!usersLoading && (!users || users.length === 0)) {
      fetchUsers();
    }
  }, [usersLoading, users, fetchUsers]);

  useEffect(() => {
    const initializeData = async () => {
      if (!selectedDate) return;
      if (!users || users.length === 0) {
        if (!usersLoading) {
          message.error("No users loaded.");
        }
        return;
      }

      const sortedUsers = [...users].sort((a, b) => {
        const bdA = Number(a.BdNUmber) || 0;
        const bdB = Number(b.BdNUmber) || 0;
        return bdA - bdB;
      });

      const formattedData = sortedUsers.map((u, index) => ({
        key: String(u._id),
        sl: index + 1,
        bdNo: u.BdNUmber,
        rank: u.rank || "N/A",
        name: u.fullName,
        trade: u.trade,
        disposal: "",
        dateRange: [],
        existingDisposal: null,
      }));
      setDataSource(formattedData);

      await determineDisabledUsers(formattedData, selectedDate);
    };

    initializeData();
  }, [users, selectedDate, usersLoading]);

  const determineDisabledUsers = async (data, dateToCheck) => {
    const formattedDate = dayjs(dateToCheck, "DD-MM-YYYY", true)
      .tz(DEFAULT_TIMEZONE)
      .format("DD-MM-YYYY");

    const userIds = data.map((item) => String(item.key));
    if (userIds.length === 0) {
      console.warn("No user IDs found to fetch disposals.");
      return;
    }

    try {
      const response = await axios.get(
        "https://airstate-server.vercel.app/api/user-disposals/on-date",
        { params: { date: formattedDate } }
      );

      const { disposals } = response.data;
      setDisposals(disposals);

      const newDisabled = new Map();
      disposals.forEach((disposal) => {
        const userId = String(disposal.user._id);
        newDisabled.set(userId, {
          disposal: disposal.disposal,
          startDate: disposal.startDate,
          endDate: disposal.endDate,
          disposalId: disposal.id,
        });
      });

      const updatedDataSource = data.map((item) => {
        if (newDisabled.has(item.key)) {
          const disp = newDisabled.get(item.key);
          return {
            ...item,
            disposal: disp.disposal,
            dateRange: [disp.startDate, disp.endDate],
            existingDisposal: disp,
          };
        }
        return item;
      });

      setDataSource(updatedDataSource);
    } catch (err) {
      console.error("Error fetching disposals:", err);
      message.error("Failed to determine disabled users.");
    }
  };

  const handleDateChange = (date, dateString) => {
    if (dateString) {
      setSelectedDate(dateString);
    } else {
      setSelectedDate(null);
      setDataSource([]);
      setDisposals([]);
    }
  };

  const validShifts = ["Early Morning Shift", "Morning Shift", "A/N Shift"];

  const present = disposals.filter((item) =>
    validShifts.includes(item.disposal)
  );
  const disposalsStrength = disposals.filter(
    (item) => !validShifts.includes(item.disposal)
  );

  const totalStrength = dataSource.length;
  const disposalStrength = disposalsStrength.length;
  const presentStrength = present.length;

  const categories = {};
  const disposalUserIds = new Set(disposals.map((d) => String(d.user._id)));

  disposals.forEach((d) => {
    const cat = d.disposal;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({
      name: d.user.fullName,
      rank: d.user.rank || "N/A",
    });
  });

  const noDisposal = [];
  dataSource.forEach((item) => {
    if (!disposalUserIds.has(item.key)) {
      noDisposal.push({
        name: item.name,
        rank: item.rank || "N/A",
      });
    }
  });

  const rankOrder = ["MWO", "SWO", "WO", "SGT", "CPL", "LAC", "AC"];

  const getRankIndex = (rank) => {
    const shortForm = getRankShortForm(rank);
    return rankOrder.indexOf(shortForm) >= 0
      ? rankOrder.indexOf(shortForm)
      : rankOrder.length;
  };

  const categoriesToDisplay = [];

  validShifts.forEach((shift) => {
    if (categories[shift]) {
      const sortedUsers = categories[shift].sort((a, b) => {
        const rankComparison = getRankIndex(a.rank) - getRankIndex(b.rank);
        if (rankComparison !== 0) return rankComparison;
        return a.name.localeCompare(b.name);
      });
      categoriesToDisplay.push({
        name: shift,
        count: sortedUsers.length,
        users: sortedUsers,
      });
      delete categories[shift];
    }
  });

  Object.keys(categories).forEach((cat) => {
    const sortedUsers = categories[cat].sort((a, b) => {
      const rankComparison = getRankIndex(a.rank) - getRankIndex(b.rank);
      if (rankComparison !== 0) return rankComparison;
      return a.name.localeCompare(b.name);
    });
    categoriesToDisplay.push({
      name: cat,
      count: sortedUsers.length,
      users: sortedUsers,
    });
  });

  if (noDisposal.length > 0) {
    const sortedNoDisposal = noDisposal.sort((a, b) => {
      const rankComparison = getRankIndex(a.rank) - getRankIndex(b.rank);
      if (rankComparison !== 0) return rankComparison;
      return a.name.localeCompare(b.name);
    });
    categoriesToDisplay.push({
      name: "No Disposal",
      count: sortedNoDisposal.length,
      users: sortedNoDisposal,
    });
  }

 const handlePrint = () => {
  const doc = new jsPDF({
    orientation: "portrait", // A4 size
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40; // Page margin
  const columnWidth = (pageWidth - 2 * margin) / 3; // Divide page into 3 columns
  const cellPadding = 5; // Padding inside each category cell
  const headerHeight = 100; // Space reserved for the header
  let currentY = margin + headerHeight; // Initial Y position after the header

  // Header Data
  const header = {
    date: selectedDate || "Not Selected",
    title: "MI-17 FLT LINE",
    jcoic: "WO RASHED",
    office: "SGT RASHEL, LAC RIYAD",
    totalStrength: dataSource.length,
    presentStrength: present.length,
    disposalStrength: disposalsStrength.length,
  };

  const renderHeader = () => {
    // Render the date at the top
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`DATE: ${header.date}`, margin, margin);

    // Add image at the top-right corner
    if (imgData) {
      // Adjust the width and height as needed
      const imgWidth = 50; // in points
      const imgHeight = 50; // in points
      doc.addImage(
        imgData,
        "JPEG",
        pageWidth - margin - imgWidth,
        margin - 10, // Adjust Y position as needed
        imgWidth,
        imgHeight
      );
    }

    // Render the title in the center
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(header.title, pageWidth / 2, margin + 20, { align: "center" });

    // Render JCOIC and Office information below the title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`JCOIC: ${header.jcoic}`, pageWidth / 2, margin + 40, {
      align: "center",
    });
    doc.text(`OFFICE: ${header.office}`, pageWidth / 2, margin + 55, {
      align: "center",
    });

    // Render summary information below the JCOIC and Office
    // **Updated Section: Display each strength on a separate line with smaller text**
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10); // Smaller font size

    const strengthYStart = margin + 80; // Starting Y position for strengths
    const lineHeight = 15; // Space between lines

    doc.text(`Total Strg: ${header.totalStrength}`, margin, strengthYStart);
    doc.text(`Present Strg: ${header.presentStrength}`, margin, strengthYStart + lineHeight);
    doc.text(`Disposal Strg: ${header.disposalStrength}`, margin, strengthYStart + 2 * lineHeight);

    // **Add Margin Below Summary Lines**
    const additionalMargin = 20; // Space in points
    currentY = strengthYStart + 3 * lineHeight + additionalMargin;
  };

  const renderCategory = (category, colX, colY) => {
    let categoryHeight = 0;

    // Render category title and total
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${category.name} (${category.users.length})`, colX + cellPadding, colY + 15);
    categoryHeight += 20; // Add space for the title and total

    // Render items in the category
    doc.setFont("Helvetica", "normal");
    category.users.forEach((user, index) => {
      const text = `${index + 1}. ${getRankShortForm(user.rank)} ${user.name}`;
      doc.text(text, colX + cellPadding, colY + categoryHeight + 10);
      categoryHeight += 12; // Add space for each item
    });

    return categoryHeight; // Return the total height used by this category
  };

  const renderCategories = () => {
    const columnHeights = [currentY, currentY, currentY]; // Track Y position for each column

    categoriesToDisplay.forEach((category) => {
      // Find the shortest column to place the category
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const colX = margin + columnWidth * shortestColumnIndex;
      const colY = columnHeights[shortestColumnIndex];

      // Render the category and get its height
      const categoryHeight = renderCategory(category, colX, colY);

      // Update the height for the column
      columnHeights[shortestColumnIndex] += categoryHeight + 20;

      // If any column exceeds the page height, add a new page and reset column heights
      if (Math.max(...columnHeights) > pageHeight - margin) {
        doc.addPage();
        columnHeights.fill(margin + headerHeight); // Reset column heights for the new page
      }
    });
  };

  // Call rendering functions
  renderHeader();
  renderCategories();

  // Save the PDF
  doc.save(`OfficeState_${selectedDate}.pdf`);
};




  if (usersLoading) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Define masonry breakpoints
  const masonryBreakpoints = {
    default: 3, // 3 columns for large screens
    1100: 3, // 3 columns for medium screens
    700: 2, // 2 columns for small screens
    500: 1, // 1 column for extra small screens
  };

  // Sort categories to prioritize the three shifts first
  const sortedCategories = [
    ...["Early Morning Shift", "Morning Shift", "A/N Shift"]
      .map((shiftName) =>
        categoriesToDisplay.find((cat) => cat.name === shiftName)
      )
      .filter(Boolean), // Remove undefined if any shift is missing
    ...categoriesToDisplay.filter(
      (cat) =>
        !["Early Morning Shift", "Morning Shift", "A/N Shift"].includes(
          cat.name
        )
    ),
  ];

  return (
    <div
      style={{
        padding: "1rem",
      }}
    >
      {/* Inject inline styles for Masonry columns */}
      <style>
        {`
          .my-masonry-grid_column {
            padding-left: 1rem; /* gutter size */
            background-clip: padding-box;
          }
        `}
      </style>

      {/* Page Title */}
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Daily Office State
      </h2>

      {/* Date Picker and Print Button */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <DatePicker
          format="DD-MM-YYYY"
          onChange={handleDateChange}
          placeholder="Select date"
          style={{
            width: "10rem",
            border: "1px solid #d9d9d9",
            borderRadius: "0.375rem",
            padding: "0.5rem",
          }}
          allowClear
          value={selectedDate ? dayjs(selectedDate, "DD-MM-YYYY") : null}
        />
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          disabled={dataSource.length === 0 || !selectedDate}
          style={{
            backgroundColor:
              dataSource.length === 0 || !selectedDate
                ? "#d9d9d9"
                : "#1890ff",
            color: "#fff",
            padding: "0.25rem 0.75rem",
            borderRadius: "0.375rem",
            border: "none",
            cursor:
              dataSource.length === 0 || !selectedDate
                ? "not-allowed"
                : "pointer",
            transition: "background-color 0.3s",
          }}
        >
          Print
        </Button>
      </div>

      {/* Strength Information */}
      {selectedDate && (
        <div
          style={{
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
            }}
          >
            <strong>Total Strength:</strong> {totalStrength}
          </p>
          <p
            style={{
              fontSize: "0.875rem",
            }}
          >
            <strong>Present Strength:</strong> {presentStrength}
          </p>
          <p
            style={{
              fontSize: "0.875rem",
            }}
          >
            <strong>Disposal Strength:</strong> {disposalStrength}
          </p>
        </div>
      )}

      {/* Masonry Layout */}
      {selectedDate && sortedCategories.length > 0 && (
        <Masonry
          breakpointCols={masonryBreakpoints}
          style={{
            display: "flex",
            marginLeft: "-1rem", // gutter size offset
            width: "auto",
          }}
          columnClassName="my-masonry-grid_column"
        >
          {sortedCategories.map((catObj, idx) => (
            <div
              key={idx}
              style={{
                breakInside: "avoid",
                marginBottom: "1rem",
                backgroundColor: "#fff",
                borderRadius: "0.5rem",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Table Caption */}
              <div
                style={{
                  backgroundColor: "#f0f0f0",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "0.5rem",
                  fontSize: "0.875rem",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {catObj.name}: {catObj.count}
              </div>

              {/* Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f9f9f9",
                      fontSize: "0.875rem",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        textAlign: "left",
                        width: "10%",
                      }}
                    >
                      No.
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Rank
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {catObj.users.map((user, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                        }}
                      >
                        {getRankShortForm(user.rank)}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                        }}
                      >
                        {user.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </Masonry>
      )}

      {!selectedDate && (
        <div
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
          }}
        >
          <p>Select a date to view disposals.</p>
        </div>
      )}
    </div>
  );
};

export default OfficeState;
