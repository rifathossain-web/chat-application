// OicState.jsx

import {
  Button,
  Card,
  Col,
  DatePicker,
  message,
  Row,
  Spin,
  Statistic,
  Table,
  Typography,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import jsPDF from "jspdf";
import AutoTable from "jspdf-autotable"; // Import AutoTable
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext"; // Adjust the path as needed

// Extend dayjs with necessary plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

// Define the default timezone
const DEFAULT_TIMEZONE = "Asia/Dhaka";

// Define the categories (including "Effective Strength")
const CATEGORIES = [
  "Total Str",
  "Det/Tdy",
  "Effective Strength", // Moved here
  "Leave",
  "Module/Course",
  "AWOL/Detention/FU/BOI",
  "CMH/BNS/BSH/Qrnt/CAT'C",
  "Sick Report/Covid",
  "ED/Ex PPGF/Escort off",
  "CCTV/GST/U/C,U/A,UI",
  "Guard Duty /Task Force/ QCI/Gale",
  "Duty Off",
  "Mess/Canteen",
  "PT on Unit /Drill Cat",
  "Early Morning Shift",
  "Morning Shift",
  "A/N Shift",
  "Night Flying",
  "K/O",
  "Total ON PARADE",
  "Out PARADE",
  "No Disposal",
];

// Define disposal options with grouping
const disposalOptions = [
  "Leave",
  {
    groupName: "AWOL/Detention/FU/BOI",
    subOptions: ["AWOL", "Detention", "FU", "BOI"],
  },
  {
    groupName: "CMH/BNS/BSH/Qrnt/CAT'C",
    subOptions: ["CMH", "BNS", "BSH", "Qrnt", "CAT'C"],
  },
  "Sick Report/Covid",
  "TD",
  "Module/Course",
  {
    groupName: "ED/Ex PPGF/Escort off",
    subOptions: ["ED", "Ex PPGF", "Escort off"],
  },
  {
    groupName: "CCTV/GST/U/C,U/A,UI",
    subOptions: ["CCTV", "GST", "U/C", "U/A", "UI"],
  },
  {
    groupName: "Guard Duty /Task Force/ QCI/Gale",
    subOptions: [
      "Guard Duty",
      "QCI",
      "NP Task Force",
      "Base Task Force",
      "2nd Seater",
      "Halisahor TF",
      "Gale",
      "Airport Duty",
      "DEO DUTY",
      "O/O",
      "A/O",
      "G/C"
    ],
  },
  "Duty Off",
  {
    groupName: "Mess/Canteen",
    subOptions: ["Mess", "Canteen"],
  },
  "PT on Unit /Drill Cat",
  "Early Morning Shift",
  "Morning Shift",
  "A/N Shift",
  "Night Flying",
  "K/O",
];

// Define present shifts
const PRESENT_SHIFTS = new Set([
  "Early Morning Shift",
  "Morning Shift",
  "A/N Shift",
  "Night Flying",
]);

const SHIFT_CATEGORIES = new Set([
  "Early Morning Shift",
  "Morning Shift",
  "A/N Shift",
  "Night Flying",
]);

// Predefined rank order
const predefinedRankOrder = ["AC", "LAC", "CPL", "SGT", "WO", "SWO", "MWO"];

// Function to build a disposal map for easy lookup
function buildDisposalMap(disposalOptions) {
  const disposalMap = {};

  disposalOptions.forEach((option) => {
    if (typeof option === "string") {
      disposalMap[option] = option === "TD" ? "Det/Tdy" : option;
    } else if (option.groupName && Array.isArray(option.subOptions)) {
      option.subOptions.forEach((sub) => {
        disposalMap[sub] = option.groupName;
      });
    }
  });

  return disposalMap;
}

const disposalMap = buildDisposalMap(disposalOptions);

// Function to map full rank to table rank
function mapRankToTableRank(fullRank) {
  if (!fullRank) return "AC"; // Default to "AC" if rank is undefined or null

  const rank = fullRank.toLowerCase();

  // Handle variations for "AC"
  if (rank.startsWith("ac-") || rank.startsWith("ac ")) return "AC";

  // Handle "LAC" with variations
  if (rank.startsWith("lac") || rank.includes("leading aircraftman")) return "LAC";

  // Handle "CPL" with variations
  if (rank.startsWith("cpl") || rank.includes("corporal")) return "CPL";

  // Handle "SGT" with variations
  if (rank.startsWith("sgt") || rank.includes("sergeant")) return "SGT";

  // Handle "WO" without "SWO"
  if (rank.startsWith("wo") && !rank.includes("swo")) return "WO";

  // Handle "SWO"
  if (rank.includes("swo") || rank.includes("senior warrant officer")) return "SWO";

  // Handle "MWO"
  if (rank.startsWith("mwo") || rank.includes("master warrant officer")) return "MWO";

  // Handle officer ranks directly
  if (rank.includes("pilot officer")) return "Pilot Officer";
  if (rank.includes("flying officer")) return "Flying Officer";
  if (rank.includes("flight lieutenant")) return "Flight Lieutenant";
  if (rank.includes("squadron leader")) return "Squadron Leader";
  if (rank.includes("wing commander")) return "Wing Commander";
  if (rank.includes("group captain")) return "Group Captain";

  // Default to "AC" if no match found
  return "AC";
}

const OicState = () => {
  const { users, usersLoading, fetchUsers } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [disposals, setDisposals] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [counts, setCounts] = useState({});
  const [effectiveStrength, setEffectiveStrength] = useState(0);

  // Extract unique ranks from users and sort them based on predefined order
  useEffect(() => {
    if (users && users.length > 0) {
      const uniqueRanks = Array.from(
        new Set(users.map((user) => mapRankToTableRank(user.rank || "AC")))
      );

      // Sort ranks based on predefined order
      uniqueRanks.sort((a, b) => {
        const indexA = predefinedRankOrder.indexOf(a);
        const indexB = predefinedRankOrder.indexOf(b);

        if (indexA === -1 && indexB === -1) {
          // Both ranks are not in predefined order; sort alphabetically
          return a.localeCompare(b);
        }
        if (indexA === -1) return 1; // a comes after
        if (indexB === -1) return -1; // b comes after
        return indexA - indexB;
      });

      setRanks(uniqueRanks);
    }
  }, [users]);

  // Initialize counts when ranks change
  useEffect(() => {
    if (ranks.length > 0) {
      const initCounts = {};
      CATEGORIES.forEach((cat) => {
        initCounts[cat] = {};
        ranks.forEach((rank) => {
          initCounts[cat][rank] = 0;
        });
      });
      setCounts(initCounts);
    }
  }, [ranks]);

  // Fetch users when component mounts
  useEffect(() => {
    if (!usersLoading && (!users || users.length === 0)) {
      fetchUsers();
    }
  }, [usersLoading, users, fetchUsers]);

  // Fetch disposals based on selected date
  useEffect(() => {
    const fetchDisposals = async () => {
      if (!selectedDate) return;
      if (!users || users.length === 0) {
        if (!usersLoading) message.error("No users loaded.");
        return;
      }

      const formattedDate = dayjs(selectedDate, "DD-MM-YYYY", true)
        .tz(DEFAULT_TIMEZONE)
        .format("DD-MM-YYYY");

      try {
        const res = await fetch(
          `https://airstate-server.vercel.app/api/user-disposals/on-date?date=${formattedDate}`
        );
        const data = await res.json();
        setDisposals(data.disposals || []);
      } catch (err) {
        console.error("Error fetching disposals:", err);
        message.error("Failed to fetch disposals.");
      }
    };
    fetchDisposals();
  }, [selectedDate, users, usersLoading]);

  // Compute counts based on disposals and users
  useEffect(() => {
    if (!users || users.length === 0) return;
    if (!disposals) return;
    if (ranks.length === 0) return;

    const initCounts = {};
    CATEGORIES.forEach((cat) => {
      initCounts[cat] = {};
      ranks.forEach((rank) => {
        initCounts[cat][rank] = 0;
      });
    });

    const disposalUserIds = new Set();

    disposals.forEach((d) => {
      const finalCategory = disposalMap[d.disposal] || "No Disposal";
      const userId = String(d.user._id);
      disposalUserIds.add(userId);

      const u = users.find((u) => String(u._id) === userId);
      const fullRank = u && u.rank ? u.rank : "AC";
      const tableRank = mapRankToTableRank(fullRank);

      if (initCounts[finalCategory]) {
        initCounts[finalCategory][tableRank] += 1;
      } else {
        initCounts["No Disposal"][tableRank] += 1;
      }
    });

    // Users without disposals are considered as "No Disposal"
    users.forEach((u) => {
      const userId = String(u._id);
      if (!disposalUserIds.has(userId)) {
        const tableRank = mapRankToTableRank(u.rank || "AC");
        initCounts["No Disposal"][tableRank] += 1;
      }
    });

    const totalStrength = users.length;

    // Calculate "Total Str"
    ranks.forEach((rank) => {
      initCounts["Total Str"][rank] = 0;
    });
    users.forEach((u) => {
      const tableRank = mapRankToTableRank(u.rank || "AC");
      if (initCounts["Total Str"][tableRank] !== undefined) {
        initCounts["Total Str"][tableRank] += 1;
      }
    });

    // Calculate Effective Strength per rank
    ranks.forEach((rank) => {
      const totalStr = initCounts["Total Str"][rank] || 0;
      const detTdy = initCounts["Det/Tdy"][rank] || 0;
      initCounts["Effective Strength"][rank] = totalStr - detTdy;
    });

    // Calculate "Total ON PARADE" and "Out PARADE"
    const onParadeSums = {};
    const outParadeSums = {};
    ranks.forEach((rank) => {
      onParadeSums[rank] = initCounts["No Disposal"][rank] || 0;
      outParadeSums[rank] = 0;
    });

    CATEGORIES.forEach((cat) => {
      if (
        cat === "No Disposal" ||
        cat === "Total Str" ||
        cat === "Det/Tdy" ||
        cat === "Effective Strength"
      ) {
        return;
      }

      if (SHIFT_CATEGORIES.has(cat)) {
        ranks.forEach((rank) => {
          onParadeSums[rank] += initCounts[cat][rank] || 0;
        });
      } else {
        ranks.forEach((rank) => {
          outParadeSums[rank] += initCounts[cat][rank] || 0;
        });
      }
    });

    ranks.forEach((rank) => {
      initCounts["Total ON PARADE"][rank] = onParadeSums[rank];
      initCounts["Out PARADE"][rank] = outParadeSums[rank];
    });

    console.log("Counts:", initCounts);

    setCounts(initCounts);

    // Calculate and set Effective Strength (sum across ranks)
    const effStr = ranks.reduce(
      (acc, rank) => acc + (initCounts["Effective Strength"][rank] || 0),
      0
    );
    setEffectiveStrength(effStr);
  }, [users, disposals, ranks]);

  // Handle date change
  const handleDateChange = (date, dateString) => {
    if (dateString) {
      setSelectedDate(dateString);
      setDisposals([]);
      setCounts(() => {
        const initCounts = {};
        CATEGORIES.forEach((cat) => {
          initCounts[cat] = {};
          ranks.forEach((rank) => {
            initCounts[cat][rank] = 0;
          });
        });
        return initCounts;
      });
      setEffectiveStrength(0);
    } else {
      setSelectedDate(null);
      setDisposals([]);
      setCounts(() => {
        const initCounts = {};
        CATEGORIES.forEach((cat) => {
          initCounts[cat] = {};
          ranks.forEach((rank) => {
            initCounts[cat][rank] = 0;
          });
        });
        return initCounts;
      });
      setEffectiveStrength(0);
    }
  };

  // Print Function
  const handlePrint = () => {
    const doc = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' units, 'a4' size

    let yOffset = 10; // Initial Y position

    // Add Main Title
    doc.setFontSize(16);
    doc.text("OIC State", 105, yOffset, { align: "center" });
    yOffset += 7;

    // Add Subtitle
    doc.setFontSize(14);
    doc.text("MI-17 Flight line", 105, yOffset, { align: "center" });
    yOffset += 7;

    // Add Date
    doc.setFontSize(12);
    const formattedDate = selectedDate
      ? `Date: ${dayjs(selectedDate, "DD-MM-YYYY").format("DD-MM-YYYY")}`
      : "Date: --/--/----";
    doc.text(formattedDate, 105, yOffset, { align: "center" });
    yOffset += 10;

    // Add Statistics
    const stats = [
      { title: "Total Strength", value: totalStrength },
      { title: "Present Strength", value: presentStrength },
      { title: "Disposal Strength", value: disposalStrength },
      { title: "Effective Strength", value: effectiveStrength },
    ];

    stats.forEach((stat) => {
      doc.setFontSize(12);
      doc.text(`${stat.title}: ${stat.value}`, 20, yOffset);
      yOffset += 7;
    });

    yOffset += 5; // Add some space before the table

    // Prepare Table Data
    const tableColumn = ["Category", ...ranks, "Total"];
    const tableRows = tableData.map((row) => [
      row.category,
      ...ranks.map((rank) => row[rank]),
      row.Total,
    ]);

    // Add Table using AutoTable
    AutoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yOffset,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // Customize header color
      columnStyles: ranks.reduce((acc, rank, index) => {
        acc[index + 1] = { cellWidth: 15 }; // Adjust width as needed
        return acc;
      }, {}),
      // Add page numbers
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    // Save the PDF
    doc.save(`OIC_State_Report_${formattedDate.replace(/\//g, "-")}.pdf`);
  };

  // Loading state
  if (usersLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const totalStrength = users ? users.length : 0;

  let disposalStrength = 0;
  let presentStrength = 0;
  let effStr = effectiveStrength; // Use separate state

  if (counts && Object.keys(counts).length > 0) {
    const sumCategory = (cat) =>
      ranks.reduce((acc, r) => acc + (counts[cat][r] || 0), 0);

    const presentCategories = Array.from(PRESENT_SHIFTS);
    presentStrength = presentCategories.reduce(
      (acc, cat) => acc + sumCategory(cat),
      0
    );

    disposalStrength = totalStrength - presentStrength;

    // effStr is already calculated and stored in separate state
  }

  console.log("Present Strength:", presentStrength);
  console.log("Disposal Strength:", disposalStrength);
  console.log("Effective Strength:", effStr);

  // Prepare data for Ant Design Table
  const tableData = CATEGORIES.map((category) => {
    const categoryCounts = counts[category] || {};
    const total = ranks.reduce((acc, r) => acc + (categoryCounts[r] || 0), 0);
    return {
      key: category,
      category,
      ...ranks.reduce((acc, r) => {
        acc[r] = categoryCounts[r] || 0;
        return acc;
      }, {}),
      Total: total,
    };
  });

  // Define columns dynamically based on ranks
  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      fixed: "left",
      width: 180,
      className: "text-xs",
      render: (text) => <strong>{text}</strong>,
    },
    ...ranks.map((rank) => ({
      title: rank,
      dataIndex: rank,
      key: rank,
      align: "center",
      width: 80,
      className: "text-xs",
    })),
    {
      title: "Total",
      dataIndex: "Total",
      key: "Total",
      align: "center",
      width: 80,
      className: "text-xs",
      render: (text) => <strong>{text}</strong>,
    },
  ];

  return (
    <div className="p-5">
      {/* Print-Friendly Styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              -webkit-print-color-adjust: exact;
            }
            .print-title {
              font-size: 16px !important;
            }
            .print-subtitle {
              font-size: 14px !important;
            }
            .print-date {
              font-size: 12px !important;
            }
            .ant-typography {
              margin: 0;
            }
            .ant-card {
              margin-bottom: 8px;
            }
            .ant-table-thead > tr > th {
              font-size: 12px;
              padding: 8px;
            }
            .ant-table-tbody > tr > td {
              font-size: 12px;
              padding: 8px;
            }
          }
        `}
      </style>

      {/* Title Section */}
      <Row className="mb-4 text-center">
        <Col span={24}>
          <Title level={3} className="print-title">
            OIC State
          </Title>
          <Title level={5} className="print-subtitle">
            MI-17 Flight line
          </Title>
          <Title level={5} className="print-date">
            {selectedDate
              ? `Date: ${dayjs(selectedDate, "DD-MM-YYYY").format(
                  "DD-MM-YYYY"
                )}`
              : "Date: --/--/----"}
          </Title>
        </Col>
      </Row>

      {/* Date Picker and Print Button */}
      <Row className="mb-6 justify-between">
        <Col>
          <DatePicker
            format="DD-MM-YYYY"
            onChange={handleDateChange}
            placeholder="Select date"
            className="w-52"
            allowClear
            value={selectedDate ? dayjs(selectedDate, "DD-MM-YYYY") : null}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Print Report
          </Button>
        </Col>
      </Row>

      {/* Statistics */}
      {selectedDate ? (
        Object.keys(counts).length > 0 ? (
          <>
            <Row className="mb-6" gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm">
                  <Statistic
                    title="Total Strength"
                    value={totalStrength}
                    className="text-xs"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm">
                  <Statistic
                    title="Present Strength"
                    value={presentStrength}
                    className="text-xs"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm">
                  <Statistic
                    title="Disposal Strength"
                    value={disposalStrength}
                    className="text-xs"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className="shadow-sm">
                  <Statistic
                    title="Effective Strength"
                    value={effStr}
                    className="text-xs"
                  />
                </Card>
              </Col>
            </Row>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                scroll={{ x: 1000 }}
                size="small"
                className="ant-table text-xs"
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        )
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-sm">Select a date to view disposals.</p>
        </div>
      )}
    </div>
  );
};

export default OicState;
