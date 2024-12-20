// src/components/DailyOffice.jsx

import {
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Divider,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Table,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useAuth } from "../../context/AuthContext";

// Extend Day.js with necessary plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Define default timezone
const DEFAULT_TIMEZONE = "Asia/Dhaka";

const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

// Define disposals that require a date range
const DISPOSALS_REQUIRING_DATE_RANGE = new Set([
  "Leave",
  "CAT'C",
  "TD",
  "ED",
  "Ex PPGF",
  "Guard Duty",
  "NP Task Force",
  "Halisahor TF",
  "Base Task Force",
  "Airport Duty",
  "QCI",
  "Gale",
  // Add other disposals that require date ranges
]);

// Updated INITIAL_TRADES as per your request
const INITIAL_TRADES = [
  "AFR",
  "ENG",
  "E&I",
  "R/F",
  "ARMT",
  "INST",
  "ELECT",
  "RADAR",
  "WIRELESS",
];

const DailyOffice = () => {
  const { users, fetchUsers, usersLoading, user } = useAuth();

  // State to hold table data
  const [dataSource, setDataSource] = useState([]);

  // State to manage disposal options
  const [disposalOptions, setDisposalOptions] = useState([
    {
      groupName: "Shifts",
      subOptions: [
        "Early Morning Shift",
        "Morning Shift",
        "A/N Shift",
        "Night Flying",
      ],
    },
    "Leave",
    {
      groupName: "AWOL/Detention/FU/BOI",
      subOptions: ["AWOL", "Detention", "FU", "BOI"],
    },
    "Module/Course",
    {
      groupName: "CMH/BNS/BSH/Qrnt/CAT'C",
      subOptions: ["CMH", "BNS", "BSH", "Qrnt", "CAT'C"],
    },
    "Sick Report/Covid",
    "TD",
    {
      groupName: "ED/Ex PPGF/Escort off",
      subOptions: ["ED", "Ex PPGF", "Escort off"],
    },
    {
      groupName: "Mess/Canteen",
      subOptions: ["Mess", "Canteen"],
    },
    {
      groupName: "Duty Options",
      subOptions: [
        "Duty Off",
        "Guard Duty",
        "NP Task Force",
        "Base Task Force",
        "2nd Seater",
        "Halisahor TF",
        "QCI",
        "Gale",
        "K/O",
        "Airport Duty",
        "O/O",
        "A/O",
        "G/C",
        "DEO DUTY",
      ],
    },
    {
      groupName: "Task Assignments",
      subOptions: ["CCTV", "GST", "U/C", "U/A", "UA"],
    },
  ]);

  // State to manage adding new disposal options
  const [newDisposal, setNewDisposal] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State to track disabled users with their existing disposals
  const [disabledUsers, setDisabledUsers] = useState(new Map());

  // State to manage selected date for validation
  const [selectedDate, setSelectedDate] = useState(null); // Initialize as null

  // State to manage submission status
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State to manage edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editDisposal, setEditDisposal] = useState("");
  const [editDateRange, setEditDateRange] = useState([]);

  // State to manage selected trade for filtering
  const [selectedTrade, setSelectedTrade] = useState("All Trades");

  // States for Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Fetch users on component mount
  useEffect(() => {
    if (!usersLoading && (!users || users.length === 0)) {
      fetchUsers();
    }
  }, [usersLoading, users, fetchUsers]);

  // Utility function to get unique values for filter options
  const getUniqueValues = (data, key) => {
    const unique = new Set();
    data.forEach((item) => {
      if (item[key]) unique.add(item[key]);
    });
    return Array.from(unique).map((value) => ({ text: value, value }));
  };

  // Function to get search props for a column
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex === "name" ? "Name" : "BD/NO"}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(
          () => searchInput.current && searchInput.current.select(),
          100
        );
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0] || "");
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // Initialize dataSource based on users, user, and selectedTrade
  useEffect(() => {
    const initializeData = async () => {
      if (!selectedDate) {
        // Do not fetch if no date is selected
        return;
      }

      if (!users || users.length === 0) {
        // Ensure users are loaded before initializing data
        message.error("Users are not loaded yet.");
        return;
      }

      let filteredUsers = [];

      if (selectedTrade === "All Trades") {
        filteredUsers = users;
      } else {
        filteredUsers = users.filter(
          (u) => u.trade.toLowerCase() === selectedTrade.toLowerCase()
        );
      }

      // If the user is not an admin and has a specific trade, ensure they are included
      if (
        user?.role !== "admin" &&
        user?.trade &&
        !filteredUsers.some((fu) => fu._id === user._id)
      ) {
        filteredUsers.push(user);
      }

      // Check if filteredUsers is empty
      if (filteredUsers.length === 0) {
        message.warning("No users found for the selected trade.");
      }

      // Log filtered users for debugging
      console.log("Filtered Users:", filteredUsers);

      // Map to formatted data
      const formattedData = filteredUsers.map((u, index) => ({
        key: String(u._id), // Ensure key is a string
        sl: index + 1,
        bdNo: u.BdNUmber, // As per your confirmation, keeping 'BdNUmber'
        rank: u.rank,
        name: u.fullName,
        trade: u.trade,
        disposal: "", // Initialize as empty
        dateRange: [], // Initialize as empty
        existingDisposal: null, // To store existing disposal details
      }));

      setDataSource(formattedData);
      await determineDisabledUsers(formattedData, selectedDate);
    };

    initializeData();
  }, [users, user, selectedTrade, selectedDate]);

  // Function to determine which users should be disabled based on disposals
  const determineDisabledUsers = async (data, dateToCheck) => {
    const formattedDate = dayjs(dateToCheck, "DD-MM-YYYY", true)
      .tz(DEFAULT_TIMEZONE)
      .format("DD-MM-YYYY"); // Ensure 'DD-MM-YYYY' format in Asia/Dhaka timezone

    const userIds = data.map((item) => String(item.key)); // Ensure keys are strings

    // Check if userIds array is not empty
    if (userIds.length === 0) {
      console.warn("No user IDs found to fetch disposals.");
      return;
    }

    console.log("Fetching disposals for users:", userIds.join(","));
    console.log("Date Range:", formattedDate, "to", formattedDate);

    try {
      const response = await axios.get(
        "https://airstate-server.vercel.app/api/user-disposals", // Ensure this URL is correct and accessible
        {
          params: {
            users: userIds.join(","),
            startDate: formattedDate, // Only the selected date
            endDate: formattedDate, // Only the selected date
          },
        }
      );

      const { disposals } = response.data; // Array of disposals

      console.log("Disposals fetched from API:", disposals);

      const newDisabled = new Map();
      disposals.forEach((disposal) => {
        const userId = String(disposal.user._id); // Extract user ID as string
        newDisabled.set(userId, {
          disposal: disposal.disposal,
          startDate: disposal.startDate, // 'DD-MM-YYYY' string
          endDate: disposal.endDate, // 'DD-MM-YYYY' string
          disposalId: disposal.id, // Store disposal ID for editing
        });
      });

      setDisabledUsers(newDisabled);

      // Log disabledUsers for debugging
      console.log("Disabled Users Map:", newDisabled);

      // Update dataSource to include existingDisposal details
      const updatedDataSource = data.map((item) => {
        if (newDisabled.has(item.key)) {
          const disposal = newDisabled.get(item.key);
          return {
            ...item,
            disposal: disposal.disposal,
            dateRange: [disposal.startDate, disposal.endDate],
            existingDisposal: disposal,
          };
        }
        return item;
      });

      setDataSource(updatedDataSource);

      // Log updated dataSource for debugging
      console.log(
        "Updated DataSource with Existing Disposals:",
        updatedDataSource
      );
    } catch (err) {
      console.error("Error fetching disposals:", err);
      message.error("Failed to determine disabled users.");
    }
  };

  // Handler for date selection
  const handleDateChange = (date, dateString) => {
    if (date) {
      const formattedDate = dayjs(date).format("DD-MM-YYYY");
      setSelectedDate(formattedDate); // Store as 'DD-MM-YYYY' string in Asia/Dhaka timezone
      setIsSubmitted(false); // Reset submission status when a new date is selected
    } else {
      setSelectedDate(null);
      // Reset the data if date is cleared
      setDataSource([]);
      setDisabledUsers(new Map());
    }
  };

  // Handler for disposal change
  const handleDisposalChange = (value, key) => {
    const requiresDateRange = DISPOSALS_REQUIRING_DATE_RANGE.has(value);
    const updatedData = dataSource.map((item) => {
      if (item.key === key) {
        const newItem = { ...item, disposal: value };

        if (!requiresDateRange) {
          // Set startDate to the selected date as 'DD-MM-YYYY' string in Asia/Dhaka timezone
          newItem.dateRange = selectedDate ? [selectedDate] : [];
        } else {
          if (
            newItem.dateRange.length === 0 &&
            selectedDate &&
            !disabledUsers.has(key)
          ) {
            newItem.dateRange = [selectedDate, selectedDate];
          }
        }

        return newItem;
      }
      return item;
    });
    setDataSource(updatedData);
  };

  // Handler for date range selection
  const handleDateRangeChange = (dates, dateStrings, key) => {
    const updatedData = dataSource.map((item) => {
      if (item.key === key) {
        if (dateStrings.length === 1) {
          // Single date selected
          return { ...item, dateRange: [dateStrings[0]] };
        }
        return { ...item, dateRange: dateStrings };
      }
      return item;
    });
    setDataSource(updatedData);
  };

  // Handler to add a new disposal option
  const addNewDisposal = () => {
    const trimmedDisposal = newDisposal.trim();
    if (!trimmedDisposal) {
      message.error("Disposal option cannot be empty.");
      return;
    }

    const exists = disposalOptions.some((option) => {
      if (typeof option === "object" && option.subOptions) {
        return option.subOptions.some(
          (sub) => sub.toLowerCase() === trimmedDisposal.toLowerCase()
        );
      }
      return option.toLowerCase() === trimmedDisposal.toLowerCase();
    });

    if (exists) {
      message.error("This disposal option already exists.");
      return;
    }

    // Add as a new standalone option
    setDisposalOptions([...disposalOptions, trimmedDisposal]);
    message.success("Disposal option added successfully.");
    setNewDisposal("");
    setIsAddModalOpen(false);
  };

  // Handler to submit all disposal changes (bulk)
  const handleSubmitAll = async () => {
    // Validate all fields before submission
    for (const record of dataSource) {
      if (!record.disposal) {
        message.error(`Disposal option is required for ${record.name}.`);
        return;
      }

      if (
        DISPOSALS_REQUIRING_DATE_RANGE.has(record.disposal) &&
        record.dateRange.length !== 2
      ) {
        message.error(
          `Date range is required for disposal option "${record.disposal}" for ${record.name}.`
        );
        return;
      }

      if (record.existingDisposal) {
        message.error(
          `Disposal already exists for ${record.name} on the selected date.`
        );
        return;
      }
    }

    // Prepare data for submission
    const submissionData = dataSource.map((record) => ({
      user: record.key,
      disposal: record.disposal,
      startDate: record.dateRange[0], // 'DD-MM-YYYY' string
      endDate:
        record.dateRange.length === 2
          ? record.dateRange[1]
          : record.dateRange[0], // 'DD-MM-YYYY' string
    }));

    // Log submissionData for debugging
    console.log("Submission Data:", submissionData);

    try {
      const response = await axios.post(
        "https://airstate-server.vercel.app/api/user-disposals/bulk-create",
        submissionData
      );
      message.success(response.data.message);
      // Refetch users and disposals to get updated data
      await fetchUsers();
      // Reset the form
      setSelectedDate(null);
      setDisabledUsers(new Map());
      setDataSource([]);
      setIsSubmitted(true); // Set submission status to true
    } catch (err) {
      console.error("Bulk Create Disposals Error:", err);
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data.error)) {
          err.response.data.error.forEach((msg) => message.error(msg));
        } else {
          message.error(
            err.response.data.error || "Failed to create disposals."
          );
        }
      } else {
        message.error("Failed to create disposals.");
      }
    }
  };

  // Handler to submit individual disposal
  const handleSubmitIndividual = async (record) => {
    // Validate the fields
    if (!record.disposal) {
      message.error(`Disposal option is required for ${record.name}.`);
      return;
    }

    if (
      DISPOSALS_REQUIRING_DATE_RANGE.has(record.disposal) &&
      record.dateRange.length !== 2
    ) {
      message.error(
        `Date range is required for disposal option "${record.disposal}" for ${record.name}.`
      );
      return;
    }

    // Prepare data for submission
    const submissionData = {
      user: record.key,
      disposal: record.disposal,
      startDate: record.dateRange[0], // 'DD-MM-YYYY' string
      endDate:
        record.dateRange.length === 2
          ? record.dateRange[1]
          : record.dateRange[0], // 'DD-MM-YYYY' string
    };

    // Log submissionData for debugging
    console.log("Individual Submission Data:", submissionData);

    try {
      const response = await axios.post(
        "https://airstate-server.vercel.app/api/user-disposals",
        submissionData
      );
      message.success(response.data.message);
      // Update the dataSource to reflect the new disposal
      const updatedDataSource = dataSource.map((item) => {
        if (item.key === record.key) {
          return {
            ...item,
            disposal: submissionData.disposal,
            dateRange:
              record.dateRange.length === 2
                ? [submissionData.startDate, submissionData.endDate]
                : [submissionData.startDate],
            existingDisposal: {
              disposal: submissionData.disposal,
              startDate: submissionData.startDate, // 'DD-MM-YYYY' string
              endDate: submissionData.endDate, // 'DD-MM-YYYY' string
              disposalId: response.data.disposal.id,
            },
          };
        }
        return item;
      });
      setDataSource(updatedDataSource);
      // Refresh disabledUsers map
      const newDisabled = new Map(disabledUsers);
      newDisabled.set(record.key, {
        disposal: submissionData.disposal,
        startDate: submissionData.startDate, // 'DD-MM-YYYY' string
        endDate: submissionData.endDate, // 'DD-MM-YYYY' string
        disposalId: response.data.disposal.id,
      });
      setDisabledUsers(newDisabled);
    } catch (err) {
      console.error("Create Disposal Error:", err);
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data.error)) {
          err.response.data.error.forEach((msg) => message.error(msg));
        } else {
          message.error(
            err.response.data.error || "Failed to create disposal."
          );
        }
      } else {
        message.error("Failed to create disposal.");
      }
    }
  };

  // Handler to open edit modal
  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditDisposal(record.disposal);
    setEditDateRange(record.dateRange);
    setIsEditModalOpen(true);
  };

  // Handler to submit disposal updates
  const handleUpdateDisposal = async () => {
    if (!editingRecord) return;

    // Validate the fields
    if (!editDisposal) {
      message.error(`Disposal option is required for ${editingRecord.name}.`);
      return;
    }

    if (
      DISPOSALS_REQUIRING_DATE_RANGE.has(editDisposal) &&
      editDateRange.length !== 2
    ) {
      message.error(
        `Date range is required for disposal option "${editDisposal}" for ${editingRecord.name}.`
      );
      return;
    }

    // Prepare data for submission
    const updatedData = {
      disposal: editDisposal,
      startDate: editDateRange[0], // 'DD-MM-YYYY' string
      endDate: editDateRange.length === 2 ? editDateRange[1] : editDateRange[0], // 'DD-MM-YYYY' string
    };

    // Log updatedData for debugging
    console.log("Update Disposal Data:", updatedData);

    try {
      const response = await axios.put(
        `https://airstate-server.vercel.app/api/user-disposals/${editingRecord.existingDisposal.disposalId}`,
        updatedData
      );
      message.success(response.data.message);
      // Update the dataSource to reflect the updated disposal
      const updatedDataSource = dataSource.map((item) => {
        if (item.key === editingRecord.key) {
          return {
            ...item,
            disposal: response.data.disposal.disposal,
            dateRange: response.data.disposal.endDate
              ? [
                  response.data.disposal.startDate,
                  response.data.disposal.endDate,
                ]
              : [response.data.disposal.startDate],
            existingDisposal: {
              disposal: response.data.disposal.disposal,
              startDate: response.data.disposal.startDate, // 'DD-MM-YYYY' string
              endDate: response.data.disposal.endDate, // 'DD-MM-YYYY' string
              disposalId: response.data.disposal.id,
            },
          };
        }
        return item;
      });
      setDataSource(updatedDataSource);
      // Refresh disabledUsers map
      const newDisabled = new Map(disabledUsers);
      newDisabled.set(editingRecord.key, {
        disposal: response.data.disposal.disposal,
        startDate: response.data.disposal.startDate, // 'DD-MM-YYYY' string
        endDate: response.data.disposal.endDate, // 'DD-MM-YYYY' string
        disposalId: response.data.disposal.id,
      });
      setDisabledUsers(newDisabled);
      // Close the edit modal
      setIsEditModalOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error("Update Disposal Error:", err);
      if (err.response && err.response.data) {
        if (Array.isArray(err.response.data.error)) {
          err.response.data.error.forEach((msg) => message.error(msg));
        } else {
          message.error(
            err.response.data.error || "Failed to update disposal."
          );
        }
      } else {
        message.error("Failed to update disposal.");
      }
    }
  };

  // Define table columns with search on 'name' and 'bdNo' columns
  const columns = [
    { title: "SL", dataIndex: "sl", key: "sl", width: 50 },

    // BD/NO Column with Search
    {
      title: "BD/NO",
      dataIndex: "bdNo",
      key: "bdNo",
      width: 100,
      ...getColumnSearchProps("bdNo"), // Adding search functionality
      sorter: (a, b) => a.bdNo.localeCompare(b.bdNo), // Optional: Add sorting
    },

    {
      title: "RANK",
      dataIndex: "rank",
      key: "rank",
      width: 100,
      // Adding filter for RANK
      filters: getUniqueValues(dataSource, "rank"),
      onFilter: (value, record) => record.rank === value,
      sorter: (a, b) => a.rank.localeCompare(b.rank), // Optional: Add sorting
    },

    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      width: 200,
      ...getColumnSearchProps("name"), // Adding search functionality
      sorter: (a, b) => a.name.localeCompare(b.name), // Optional: Add sorting
    },

    {
      title: "TRADE",
      dataIndex: "trade",
      key: "trade",
      width: 150,
      // Adding filter for TRADE
      filters: getUniqueValues(dataSource, "trade"),
      onFilter: (value, record) => record.trade === value,
      sorter: (a, b) => a.trade.localeCompare(b.trade), // Optional: Add sorting
    },

    {
      title: "DISPOSAL",
      dataIndex: "disposal",
      key: "disposal",
      width: 200,
      // Adding filter for DISPOSAL
      filters: disposalOptions
        .flatMap((option) =>
          typeof option === "object" ? option.subOptions : [option]
        )
        .map((disposal) => ({ text: disposal, value: disposal })),
      onFilter: (value, record) => record.disposal === value,
      sorter: (a, b) => (a.disposal || "").localeCompare(b.disposal || ""),
      render: (text, record) => (
        <Select
          showSearch
          placeholder="Select disposal"
          value={text || undefined}
          onChange={(value) => handleDisposalChange(value, record.key)}
          style={{ width: "100%" }}
          filterOption={(input, option) =>
            option.children
              ? option.children.toLowerCase().includes(input.toLowerCase())
              : false
          }
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                }}
              >
                <Input
                  placeholder="Add new disposal"
                  value={newDisposal}
                  onChange={(e) => setNewDisposal(e.target.value)}
                  onPressEnter={addNewDisposal}
                  disabled={isAddModalOpen}
                />
                <Button
                  type="link"
                  onClick={addNewDisposal}
                  icon={<PlusOutlined />}
                  disabled={isAddModalOpen}
                >
                  Add Disposal
                </Button>
              </div>
            </div>
          )}
          disabled={disabledUsers.has(record.key)}
        >
          {disposalOptions.map((option, index) => {
            if (typeof option === "object" && option.subOptions) {
              return (
                <OptGroup key={index} label={option.groupName}>
                  {option.subOptions.map((subOption, subIndex) => (
                    <Option key={`${index}-${subIndex}`} value={subOption}>
                      {subOption}
                    </Option>
                  ))}
                </OptGroup>
              );
            }
            return (
              <Option key={option} value={option}>
                {option}
              </Option>
            );
          })}
        </Select>
      ),
    },

    {
      title: "Date Range",
      key: "dateRange",
      width: 250,
      // Adding filter for Date Range (optional)
      // You can implement a custom filter if needed
      render: (text, record) => {
        const requiresDateRange = DISPOSALS_REQUIRING_DATE_RANGE.has(
          record.disposal
        );
        return requiresDateRange ? (
          <RangePicker
            value={
              record.dateRange.length === 2
                ? [
                    dayjs(record.dateRange[0], "DD-MM-YYYY"),
                    dayjs(record.dateRange[1], "DD-MM-YYYY"),
                  ]
                : []
            }
            onChange={(dates, dateStrings) =>
              handleDateRangeChange(dates, dateStrings, record.key)
            }
            format="DD-MM-YYYY"
            disabled={disabledUsers.has(record.key)}
          />
        ) : (
          <DatePicker
            format="DD-MM-YYYY"
            value={
              record.dateRange.length === 1
                ? dayjs(record.dateRange[0], "DD-MM-YYYY")
                : null
            }
            onChange={(date, dateString) => {
              if (dateString) {
                handleDateRangeChange(null, [dateString], record.key);
              }
            }}
            disabled={disabledUsers.has(record.key)}
          />
        );
      },
    },

    {
      title: "Existing Disposal",
      key: "existingDisposal",
      width: 250,
      // Adding filter for Existing Disposal (optional)
      filters: [
        { text: "Yes", value: true },
        { text: "No", value: false },
      ],
      onFilter: (value, record) => {
        if (value === true) return !!record.existingDisposal;
        if (value === false) return !record.existingDisposal;
        return false;
      },
      render: (text, record) => {
        if (record.existingDisposal) {
          const disposal = record.existingDisposal;
          return (
            <div>
              <Text type="warning">{disposal.disposal}</Text>
              {disposal.startDate && disposal.endDate && (
                <>
                  <br />
                  <Text type="secondary">
                    {disposal.startDate}{" "}
                    {disposal.startDate === disposal.endDate
                      ? ""
                      : `to ${disposal.endDate}`}
                  </Text>
                </>
              )}
            </div>
          );
        }
        return null;
      },
    },

    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (text, record) => {
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            {!record.existingDisposal && record.disposal && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleSubmitIndividual(record)}
                icon={<SaveOutlined />}
              >
                Submit
              </Button>
            )}
            {record.existingDisposal && (
              <Button
                type="default"
                size="small"
                onClick={() => handleEdit(record)}
                icon={<EditOutlined />}
              >
                Edit
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // If users are loading, display a loader
  if (usersLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Trade Filter Dropdown */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Select
          value={selectedTrade}
          onChange={(value) => {
            setSelectedTrade(value);
            setSelectedDate(null); // Reset date selection when trade changes
            setIsSubmitted(false); // Reset submission status
            setDataSource([]);
            setDisabledUsers(new Map());
            setSearchText("");
            setSearchedColumn("");
          }}
          style={{ width: 200 }}
        >
          <Option value="All Trades">All Trades</Option>
          {INITIAL_TRADES.map((trade) => (
            <Option key={trade} value={trade}>
              {trade}
            </Option>
          ))}
        </Select>

        {/* DatePicker for selecting a specific date */}
        <DatePicker
          onChange={handleDateChange}
          format="DD-MM-YYYY"
          style={{ width: 200 }}
          placeholder="Select date"
          value={selectedDate ? dayjs(selectedDate, "DD-MM-YYYY") : null}
          allowClear
        />
      </div>

      {selectedDate ? (
        dataSource.length > 0 ? (
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            bordered
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: 50 }}>
            <Text>No users available for the selected date.</Text>
          </div>
        )
      ) : (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Text>Select a date to make disposals.</Text>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSubmitAll}
          disabled={dataSource.length === 0}
        >
          Save All
        </Button>
      </div>

      {/* Add Disposal Modal */}
      <Modal
        title="Add New Disposal Option"
        visible={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={addNewDisposal}
        okText="Add"
      >
        <Input
          placeholder="Enter new disposal option"
          value={newDisposal}
          onChange={(e) => setNewDisposal(e.target.value)}
          onPressEnter={addNewDisposal}
        />
      </Modal>

      {/* Edit Disposal Modal */}
      <Modal
        title={`Edit Disposal for ${editingRecord?.name}`}
        visible={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdateDisposal}
        okText="Update"
      >
        <Select
          showSearch
          placeholder="Select disposal"
          value={editDisposal || undefined}
          onChange={(value) => setEditDisposal(value)}
          style={{ width: "100%", marginBottom: 16 }}
          filterOption={(input, option) =>
            option.children
              ? option.children.toLowerCase().includes(input.toLowerCase())
              : false
          }
        >
          {disposalOptions.map((option, index) => {
            if (typeof option === "object" && option.subOptions) {
              return (
                <OptGroup key={index} label={option.groupName}>
                  {option.subOptions.map((subOption, subIndex) => (
                    <Option key={`${index}-${subIndex}`} value={subOption}>
                      {subOption}
                    </Option>
                  ))}
                </OptGroup>
              );
            }
            return (
              <Option key={option} value={option}>
                {option}
              </Option>
            );
          })}
        </Select>

        {DISPOSALS_REQUIRING_DATE_RANGE.has(editDisposal) ? (
          <RangePicker
            value={
              editDateRange.length === 2
                ? [
                    dayjs(editDateRange[0], "DD-MM-YYYY"),
                    dayjs(editDateRange[1], "DD-MM-YYYY"),
                  ]
                : []
            }
            onChange={(dates, dateStrings) => setEditDateRange(dateStrings)}
            format="DD-MM-YYYY"
            style={{ width: "100%" }}
          />
        ) : (
          <DatePicker
            format="DD-MM-YYYY"
            value={
              editDateRange.length === 1
                ? dayjs(editDateRange[0], "DD-MM-YYYY")
                : null
            }
            onChange={(date, dateString) => {
              if (dateString) {
                setEditDateRange([dateString]);
              }
            }}
            style={{ width: "100%" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default DailyOffice;
