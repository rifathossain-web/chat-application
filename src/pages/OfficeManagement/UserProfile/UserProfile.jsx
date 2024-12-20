// frontend/src/components/UserProfile.jsx

import React, { useEffect, useState } from "react";
import {
  ApartmentOutlined,
  CalendarOutlined,
  HomeOutlined,
  MailOutlined,
  NumberOutlined,
  PhoneOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons"; // Ant Design Icons
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Select,
  Spin,
} from "antd"; // Ant Design Components
import axios from "axios"; // For API requests
import moment from "moment"; // For date formatting
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Authentication context

const { Option } = Select;
const { TextArea } = Input;

// Initial Dropdown Options (Fallback in case localStorage doesn't have them)
const INITIAL_RANKS = [
  "AC-1",
  "AC-2",
  "LAC (Leading Aircraftman/Aircraftwoman)",
  "CPL (Corporal)",
  "SGT (Sergeant)",
  "WO (Warrant Officer 1)",
  "SWO (Senior Warrant Officer)",
  "MWO (Master Warrant Officer)",
  "Pilot Officer",
  "Flying Officer",
  "Flight Lieutenant",
  "Squadron Leader",
  "Wing Commander",
  "Group Captain",
];

const INITIAL_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const INITIAL_APPOINTMENTS = [
  "JCOIC",
  "NCOIC",
  "WOIC Afr Trade",
  "WOIC Eng Trade",
  "WOIC Elect Trade",
  "WOIC Inst Trade",
  "WOIC Radio Trade",
  "WOIC Armt Trade",
  "NCOIC Afr Trade",
  "NCOIC Eng Trade",
  "NCOIC Elect Trade",
  "NCOIC Inst Trade",
  "NCOIC Radio Trade",
  "NCOIC Armt Trade",
  "Tech of Afr Trade",
  "Tech of Eng Trade",
  "Tech of Elect Trade",
  "Tech of E&I Trade",
  "Tech of Inst Trade",
  "Tech of Radio Trade",
  "Tech of Armt Trade",
];

const INITIAL_TRADES = ["AFR", "ENG", "E&I", "R/F", "ARMT"];

const INITIAL_ADDRESS_STATUSES = ["Livingout", "Quarter", "Room"];

const INITIAL_STATUSES = ["Airman", "Officer"];

const UserProfile = () => {
  const { user, logout, token } = useAuth(); // Import user data and methods from AuthContext
  const [form] = Form.useForm(); // Ant Design Form instance
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // State variables for dynamic dropdown options
  const [ranks, setRanks] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [trades, setTrades] = useState([]);
  const [addressStatuses, setAddressStatuses] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Function to initialize dropdown options from localStorage or use initial values
  const initializeDropdownOptions = () => {
    const storedRanks = JSON.parse(localStorage.getItem("ranks")) || INITIAL_RANKS;
    const storedBloodGroups = JSON.parse(localStorage.getItem("bloodGroups")) || INITIAL_BLOOD_GROUPS;
    const storedAppointments = JSON.parse(localStorage.getItem("appointments")) || INITIAL_APPOINTMENTS;
    const storedTrades = JSON.parse(localStorage.getItem("trades")) || INITIAL_TRADES;
    const storedAddressStatuses = JSON.parse(localStorage.getItem("addressStatuses")) || INITIAL_ADDRESS_STATUSES;
    const storedStatuses = JSON.parse(localStorage.getItem("statuses")) || INITIAL_STATUSES;

    setRanks(storedRanks);
    setBloodGroups(storedBloodGroups);
    setAppointments(storedAppointments);
    setTrades(storedTrades);
    setAddressStatuses(storedAddressStatuses);
    setStatuses(storedStatuses);
  };

  // Fetch dropdown options from localStorage on component mount
  useEffect(() => {
    initializeDropdownOptions();
  }, []);

  // Initialize form fields with user data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        BdNUmber: user.BdNUmber || "",
        rank: user.rank || "",
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        trade: user.trade || "",
        status: user.status || "",
        maritalStatus: user.maritalStatus || "Single",
        wifeName: user.wifeDetails?.wifeName || "",
        wifeAddress: user.wifeDetails?.wifeAddress || "",
        permanentAddress: {
          house: user.permanentAddress?.house || "",
          city: user.permanentAddress?.city || "",
          district: user.permanentAddress?.district || "",
          division: user.permanentAddress?.division || "",
        },
        presentAddress: {
          addressStatus: user.presentAddress?.addressStatus || "",
          roomNumber: user.presentAddress?.roomNumber || "",
          livingoutHouse: user.presentAddress?.livingoutHouse || "",
          livingoutCity: user.presentAddress?.livingoutCity || "",
          quarterNumber: user.presentAddress?.quarterNumber || "",
          marriedRoomNumber: user.presentAddress?.marriedRoomNumber || "",
        },
        dateOfPosting: user.dateOfPosting
          ? moment(user.dateOfPosting, "YYYY-MM-DD")
          : null,
        entryNumber: user.entryNumber || "",
        dateOfBirth: user.dateOfBirth
          ? moment(user.dateOfBirth, "YYYY-MM-DD")
          : null,
        bloodGroup: user.bloodGroup || "",
        dateOfEnrollment: user.dateOfEnrollment
          ? moment(user.dateOfEnrollment, "YYYY-MM-DD")
          : null,
        appointment: user.appointment || "",
        hasChildren: user.children && user.children.length > 0 ? true : false, // Initialize hasChildren
        children: user.children || [], // Initialize children as an array
      });
    }
  }, [user, form]);

  // Watchers for dynamic fields
  const maritalStatus = Form.useWatch("maritalStatus", form);
  const hasChildren = Form.useWatch("hasChildren", form); // Watcher for children toggle
  const presentAddressStatus = Form.useWatch(
    ["presentAddress", "addressStatus"],
    form
  );

  // Handler to add new options to a dropdown locally
  const handleAddOption = (field) => {
    const inputName = `new${capitalize(field)}`;
    const value = form.getFieldValue(inputName);
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      message.error("Option cannot be empty.");
      return;
    }

    // Check if the option already exists
    const currentOptions = getCurrentOptions(field);
    if (currentOptions.includes(trimmedValue)) {
      message.error(`"${trimmedValue}" already exists in ${field}.`);
      return;
    }

    // Add the new option to local state and localStorage
    const updatedOptions = [...currentOptions, trimmedValue];
    setOptions(field, updatedOptions);
    saveToLocalStorage(field, updatedOptions);

    // Set the newly added option as the selected value
    form.setFieldsValue({ [field]: trimmedValue });

    // Clear the input field
    form.setFieldsValue({ [`new${capitalize(field)}`]: "" });

    message.success(`Added "${trimmedValue}" to ${field}.`);
  };

  // Utility to get current options based on field
  const getCurrentOptions = (field) => {
    switch (field) {
      case "rank":
        return ranks;
      case "bloodGroup":
        return bloodGroups;
      case "appointment":
        return appointments;
      case "trade":
        return trades;
      case "addressStatus":
        return addressStatuses;
      case "status":
        return statuses;
      default:
        return [];
    }
  };

  // Utility to set options based on field
  const setOptions = (field, newOptions) => {
    switch (field) {
      case "rank":
        setRanks(newOptions);
        break;
      case "bloodGroup":
        setBloodGroups(newOptions);
        break;
      case "appointment":
        setAppointments(newOptions);
        break;
      case "trade":
        setTrades(newOptions);
        break;
      case "addressStatus":
        setAddressStatuses(newOptions);
        break;
      case "status":
        setStatuses(newOptions);
        break;
      default:
        break;
    }
  };

  // Utility to save updated options to localStorage
  const saveToLocalStorage = (field, options) => {
    switch (field) {
      case "rank":
        localStorage.setItem("ranks", JSON.stringify(options));
        break;
      case "bloodGroup":
        localStorage.setItem("bloodGroups", JSON.stringify(options));
        break;
      case "appointment":
        localStorage.setItem("appointments", JSON.stringify(options));
        break;
      case "trade":
        localStorage.setItem("trades", JSON.stringify(options));
        break;
      case "addressStatus":
        localStorage.setItem("addressStatuses", JSON.stringify(options));
        break;
      case "status":
        localStorage.setItem("statuses", JSON.stringify(options));
        break;
      default:
        break;
    }
  };

  // Utility to capitalize first letter
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Handler for form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Prepare data to send
      const payload = {
        ...values,
        dateOfPosting: values.dateOfPosting
          ? values.dateOfPosting.format("YYYY-MM-DD")
          : null,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
        dateOfEnrollment: values.dateOfEnrollment
          ? values.dateOfEnrollment.format("YYYY-MM-DD")
          : null,
      };

      // Structure nested objects and process children
      const structuredPayload = {
        BdNUmber: user.BdNUmber, // Assuming BdNUmber is immutable
        rank: payload.rank,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        trade: payload.trade,
        status: payload.status,
        maritalStatus: payload.maritalStatus,
        dateOfPosting: payload.dateOfPosting,
        entryNumber: payload.entryNumber,
        dateOfBirth: payload.dateOfBirth,
        bloodGroup: payload.bloodGroup,
        dateOfEnrollment: payload.dateOfEnrollment,
        appointment: payload.appointment,
        permanentAddress: payload.permanentAddress,
        presentAddress: payload.presentAddress,
        wifeDetails:
          payload.maritalStatus === "Married"
            ? {
                wifeName: payload.wifeName,
                wifeAddress: payload.wifeAddress,
              }
            : {},
        children: payload.hasChildren ? (payload.children || []) : [], // Use the children array
      };

      // Check if any changes were made
      const isChanged = checkIfChanged(structuredPayload, user);

      if (!isChanged) {
        message.info("No changes detected. Your profile is up to date.");
        setLoading(false);
        return;
      }

      // Send update request to backend
      const response = await axios.put(
        "https://airstate-server.vercel.app/api/profile",
        structuredPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user context with the updated user data
      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update Error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        // Handle validation errors from backend
        if (error.response.data.errors) {
          error.response.data.errors.forEach((err) => message.error(err));
        } else {
          message.error(error.response.data.message);
        }
      } else if (error.request) {
        // Handle network errors
        message.error(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        // Handle other errors
        message.error(
          `Unexpected error: ${error.message || "Please try again later."}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to check if any changes were made
  const checkIfChanged = (payload, userData) => {
    // Compare each field
    for (let key in payload) {
      if (typeof payload[key] === "object" && payload[key] !== null) {
        for (let subKey in payload[key]) {
          if (
            Array.isArray(payload[key][subKey]) &&
            Array.isArray(userData[key]?.[subKey])
          ) {
            if (payload[key][subKey].length !== userData[key][subKey].length) {
              return true;
            }
            for (let i = 0; i < payload[key][subKey].length; i++) {
              if (payload[key][subKey][i] !== userData[key][subKey][i]) {
                return true;
              }
            }
          } else if (payload[key][subKey] !== userData[key]?.[subKey]) {
            return true;
          }
        }
      } else {
        if (payload[key] !== userData[key]) {
          return true;
        }
      }
    }
    return false;
  };

  // Handler for logout
  const handleLogout = () => {
    logout();
    message.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md my-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Profile</h2>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BdNUmber */}
          <Form.Item
            name="BdNUmber"
            label="BdNUmber"
            rules={[
              { required: true, message: "Please enter your BdNUmber" },
              {
                pattern: /^[A-Za-z0-9]{6,}$/,
                message:
                  "BdNUmber must be at least 6 characters and alphanumeric.",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your BdNUmber"
              disabled // Assuming BdNUmber is immutable
            />
          </Form.Item>

          {/* Rank */}
          <Form.Item
            name="rank"
            label="Rank"
            required
            tooltip="Select or add your rank"
          >
            <Select
              showSearch
              placeholder="Select your rank"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                    }}
                  >
                    <Input
                      style={{ flex: "auto", marginRight: 8 }}
                      placeholder="Add new rank"
                      value={form.getFieldValue("newRank")}
                      onChange={(e) =>
                        form.setFieldsValue({ newRank: e.target.value })
                      }
                      onPressEnter={() => handleAddOption("rank")}
                    />
                    <Button
                      type="link"
                      onClick={() => handleAddOption("rank")}
                      icon={<PlusOutlined />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            >
              {ranks.map((rankOption) => (
                <Option key={rankOption} value={rankOption}>
                  {rankOption}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Hidden field for new Rank input */}
          <Form.Item name="newRank" style={{ display: "none" }}>
            <Input />
          </Form.Item>

          {/* Full Name */}
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              {
                required: true,
                message: "Please enter your full name",
              },
              {
                pattern: /^[A-Za-z\s]+$/,
                message:
                  "Full Name can only include letters and spaces.",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                required: true,
                message: "Please enter your phone number",
              },
              {
                pattern: /^\+?[1-9]\d{1,14}$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter your phone number"
            />
          </Form.Item>

          {/* Trade */}
          <Form.Item
            name="trade"
            label="Trade"
            required
            tooltip="Select or add your trade"
          >
            <Select
              showSearch
              placeholder="Select your trade"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                    }}
                  >
                    <Input
                      style={{ flex: "auto", marginRight: 8 }}
                      placeholder="Add new trade"
                      value={form.getFieldValue("newTrade")}
                      onChange={(e) =>
                        form.setFieldsValue({ newTrade: e.target.value })
                      }
                      onPressEnter={() => handleAddOption("trade")}
                    />
                    <Button
                      type="link"
                      onClick={() => handleAddOption("trade")}
                      icon={<PlusOutlined />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            >
              {trades.map((tradeOption) => (
                <Option key={tradeOption} value={tradeOption}>
                  {tradeOption}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Hidden field for new Trade input */}
          <Form.Item name="newTrade" style={{ display: "none" }}>
            <Input />
          </Form.Item>

          {/* Status */}
          <Form.Item
            name="status"
            label="Status"
            required
            tooltip="Select or add your status"
          >
            <Select
              showSearch
              placeholder="Select your status"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                    }}
                  >
                    <Input
                      style={{ flex: "auto", marginRight: 8 }}
                      placeholder="Add new status"
                      value={form.getFieldValue("newStatus")}
                      onChange={(e) =>
                        form.setFieldsValue({ newStatus: e.target.value })
                      }
                      onPressEnter={() => handleAddOption("status")}
                    />
                    <Button
                      type="link"
                      onClick={() => handleAddOption("status")}
                      icon={<PlusOutlined />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            >
              {statuses.map((statusOption) => (
                <Option key={statusOption} value={statusOption}>
                  {statusOption}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Hidden field for new Status input */}
          <Form.Item name="newStatus" style={{ display: "none" }}>
            <Input />
          </Form.Item>

          {/* Appointment */}
          <Form.Item
            name="appointment"
            label="Appointment"
            required
            tooltip="Select or add your appointment"
          >
            <Select
              showSearch
              placeholder="Select your appointment"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                    }}
                  >
                    <Input
                      style={{ flex: "auto", marginRight: 8 }}
                      placeholder="Add new appointment"
                      value={form.getFieldValue("newAppointment")}
                      onChange={(e) =>
                        form.setFieldsValue({ newAppointment: e.target.value })
                      }
                      onPressEnter={() => handleAddOption("appointment")}
                    />
                    <Button
                      type="link"
                      onClick={() => handleAddOption("appointment")}
                      icon={<PlusOutlined />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            >
              {appointments.map((appointmentOption) => (
                <Option key={appointmentOption} value={appointmentOption}>
                  {appointmentOption}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Hidden field for new Appointment input */}
          <Form.Item name="newAppointment" style={{ display: "none" }}>
            <Input />
          </Form.Item>
        </div>

        {/* Marital Status */}
        <Form.Item
          name="maritalStatus"
          label="Marital Status"
          rules={[
            { required: true, message: "Please select your marital status" },
          ]}
        >
          <Radio.Group>
            <Radio value="Single">Single</Radio>
            <Radio value="Married">Married</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Wife Details and Children Toggle (Married Only) */}
        {maritalStatus === "Married" && (
          <>
            <h3 className="text-xl font-semibold mb-4">Wife Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="wifeName"
                label="Wife Name"
                rules={[
                  { required: true, message: "Please enter your wife's name" },
                  { pattern: /^[A-Za-z\s]+$/, message: "Wife's Name can only include letters and spaces" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Wife's Name" />
              </Form.Item>

              <Form.Item
                name="wifeAddress"
                label="Wife Address"
                rules={[
                  { required: true, message: "Please enter your wife's address" },
                ]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Wife's Address" />
              </Form.Item>
            </div>

            {/* Children Toggle */}
            <Form.Item
              name="hasChildren"
              label="Do you have children?"
              rules={[
                { required: true, message: "Please indicate if you have children" },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
          </>
        )}

        {/* Children Names (Married Only and hasChildren is true) */}
        {maritalStatus === "Married" && hasChildren && (
          <>
            <h3 className="text-xl font-semibold mb-4">Children's Names</h3>
            <Form.List
              name="children"
              rules={[
                {
                  validator: async (_, children) => {
                    if (children && children.length > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("At least one child is required."));
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      label={index === 0 ? "Child's Name" : ''}
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Please enter child's name or delete this field.",
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder="Enter child's name" style={{ width: '90%' }} />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          style={{ margin: '0 8px' }}
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: '100%' }}
                      icon={<PlusOutlined />}
                    >
                      Add Child
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        )}

        {/* Permanent Address */}
        <h3 className="text-xl font-semibold mb-4">Permanent Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name={['permanentAddress', 'house']}
            label="House"
            rules={[
              { required: true, message: "Please enter your house" },
            ]}
          >
            <Input prefix={<HomeOutlined />} placeholder="House" />
          </Form.Item>

          <Form.Item
            name={['permanentAddress', 'city']}
            label="City"
            rules={[
              { required: true, message: "Please enter your city" },
            ]}
          >
            <Input prefix={<ApartmentOutlined />} placeholder="City" />
          </Form.Item>

          <Form.Item
            name={['permanentAddress', 'district']}
            label="District"
            rules={[
              { required: true, message: "Please enter your district" },
            ]}
          >
            <Input prefix={<SolutionOutlined />} placeholder="District" />
          </Form.Item>

          <Form.Item
            name={['permanentAddress', 'division']}
            label="Division"
            rules={[
              { required: true, message: "Please enter your division" },
            ]}
          >
            <Input prefix={<ApartmentOutlined />} placeholder="Division" />
          </Form.Item>
        </div>

        {/* Present Address */}
        <h3 className="text-xl font-semibold mb-4">Present Address</h3>
        <Form.Item
          name={['presentAddress', 'addressStatus']}
          label="Address Status"
          rules={[
            { required: true, message: "Please select your address status" },
          ]}
        >
          <Select
            showSearch
            placeholder="Select Address Status"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            allowClear
            dropdownRender={(menu) => (
              <div>
                {menu}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    padding: 8,
                  }}
                >
                  <Input
                    style={{ flex: "auto", marginRight: 8 }}
                    placeholder="Add new address status"
                    value={form.getFieldValue("newAddressStatus")}
                    onChange={(e) =>
                      form.setFieldsValue({ newAddressStatus: e.target.value })
                    }
                    onPressEnter={() => handleAddOption("addressStatus")}
                  />
                  <Button
                    type="link"
                    onClick={() => handleAddOption("addressStatus")}
                    icon={<PlusOutlined />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          >
            {addressStatuses.map((statusOption) => (
              <Option key={statusOption} value={statusOption}>
                {statusOption}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* Hidden field for new Address Status input */}
        <Form.Item name="newAddressStatus" style={{ display: "none" }}>
          <Input />
        </Form.Item>

        {/* Conditional Present Address Fields Based on Address Status */}
        <Form.Item
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.presentAddress?.addressStatus !== currentValues.presentAddress?.addressStatus
          }
        >
          {({ getFieldValue }) => {
            const addressStatus = getFieldValue(['presentAddress', 'addressStatus']);
            switch (addressStatus) {
              case 'Livingout':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name={['presentAddress', 'livingoutHouse']}
                      label="Livingout House"
                      rules={[
                        { required: true, message: "Please enter your livingout house" },
                      ]}
                    >
                      <Input prefix={<HomeOutlined />} placeholder="Livingout House" />
                    </Form.Item>

                    <Form.Item
                      name={['presentAddress', 'livingoutCity']}
                      label="Livingout City"
                      rules={[
                        { required: true, message: "Please enter your livingout city" },
                      ]}
                    >
                      <Input prefix={<ApartmentOutlined />} placeholder="Livingout City" />
                    </Form.Item>
                  </div>
                );
              case 'Quarter':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name={['presentAddress', 'quarterNumber']}
                      label="Quarter Number"
                      rules={[
                        { required: true, message: "Please enter your quarter number" },
                       
                      ]}
                    >
                      <Input prefix={<NumberOutlined />} placeholder="Quarter Number" />
                    </Form.Item>
                  </div>
                );
              case 'Room':
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name={['presentAddress', 'roomNumber']}
                      label="Room Number"
                      rules={[
                        { required: true, message: "Please enter your room number" },
                      ]}
                    >
                      <Input prefix={<NumberOutlined />} placeholder="Room Number" />
                    </Form.Item>
                  </div>
                );
              default:
                return null;
            }
          }}
        </Form.Item>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Posting */}
          <Form.Item
            name="dateOfPosting"
            label="Date of Posting"
            rules={[
              { required: true, message: "Please select the date of posting" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Select date of posting"
              prefix={<CalendarOutlined />}
            />
          </Form.Item>

          {/* Entry Number */}
          <Form.Item
            name="entryNumber"
            label="Entry Number"
            rules={[
              { required: true, message: "Please enter your entry number" },
              // Changed to allow strings, but ensure they contain only digits
              
            ]}
          >
            <Input prefix={<NumberOutlined />} placeholder="Entry Number" />
          </Form.Item>

          {/* Date of Birth */}
          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[
              { required: true, message: "Please select your date of birth" },
              () => ({
                validator(_, value) {
                  if (value && value.isAfter(moment().subtract(18, "years"))) {
                    return Promise.reject(
                      new Error("You must be at least 18 years old.")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Select date of birth"
              prefix={<CalendarOutlined />}
            />
          </Form.Item>

          {/* Blood Group */}
          <Form.Item
            name="bloodGroup"
            label="Blood Group"
            required
            tooltip="Select or add your blood group"
          >
            <Select
              showSearch
              placeholder="Select your blood group"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              allowClear
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      padding: 8,
                    }}
                  >
                    <Input
                      style={{ flex: "auto", marginRight: 8 }}
                      placeholder="Add new blood group"
                      value={form.getFieldValue("newBloodGroup")}
                      onChange={(e) =>
                        form.setFieldsValue({ newBloodGroup: e.target.value })
                      }
                      onPressEnter={() => handleAddOption("bloodGroup")}
                    />
                    <Button
                      type="link"
                      onClick={() => handleAddOption("bloodGroup")}
                      icon={<PlusOutlined />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            >
              {bloodGroups.map((group) => (
                <Option key={group} value={group}>
                  {group}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Hidden field for new Blood Group input */}
          <Form.Item name="newBloodGroup" style={{ display: "none" }}>
            <Input />
          </Form.Item>

          {/* Date of Enrollment */}
          <Form.Item
            name="dateOfEnrollment"
            label="Date of Enrollment"
            rules={[
              { required: true, message: "Please select the date of enrollment" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="Select date of enrollment"
              prefix={<CalendarOutlined />}
            />
          </Form.Item>
        </div>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={loading}
            className="transition-all duration-300 ease-in-out hover:shadow-xl"
            size="large"
          >
            {loading ? <Spin size="small" /> : "Update Profile"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

// Utility to capitalize first letter
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default UserProfile;
