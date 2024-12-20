// // Login.jsx
// import React, { useState } from "react";
// import {
//   ApartmentOutlined,
//   CalendarOutlined,
//   HomeOutlined,
//   LockOutlined,
//   MailOutlined,
//   NumberOutlined,
//   PhoneOutlined,
//   PlusOutlined,
//   SolutionOutlined,
//   UserOutlined,
// } from "@ant-design/icons"; // Ant Design Icons
// import {
//   Button,
//   Col,
//   DatePicker,
//   Form,
//   Input,
//   message,
//   Radio,
//   Row,
//   Select,
//   Spin,
// } from "antd"; // Ant Design Components
// import moment from "moment"; // For date formatting
// import { useNavigate } from "react-router-dom";
// import img from "../assets/mi17.jpg"; // Background image
// import { useAuth } from "../context/AuthContext"; // Authentication context

// const { Option } = Select;

// // Define constants for initial dropdown options
// const INITIAL_RANKS = [
//   "AC-1",
//   "AC-2",
//   "LAC (Leading Aircraftman/Aircraftwoman)",
//   "CPL (Corporal)",
//   "SGT (Sergeant)",
//   "WO (Warrant Officer 1)",
//   "SWO (Senior Warrant Officer)",
//   "MWO (Master Warrant Officer)",
//   "Pilot Officer",
//   "Flying Officer",
//   "Flight Lieutenant",
//   "Squadron Leader",
//   "Wing Commander",
//   "Group Captain",
// ];

// const INITIAL_BLOOD_GROUPS = [
//   "A+",
//   "A-",
//   "B+",
//   "B-",
//   "AB+",
//   "AB-",
//   "O+",
//   "O-",
// ];

// const INITIAL_APPOINTMENTS = [
//   "JCOIC",
//   "NCOIC",
//   "WOIC Afr Trade",
//   "WOIC Eng Trade",
//   "WOIC Elect Trade",
//   "WOIC Inst Trade",
//   "WOIC Radio Trade",
//   "WOIC Armt Trade",
//   "NCOIC Afr Trade",
//   "NCOIC Eng Trade",
//   "NCOIC Elect Trade",
//   "NCOIC Inst Trade",
//   "NCOIC Radio Trade",
//   "NCOIC Armt Trade",
//   "Tech of Afr Trade",
//   "Tech of Eng Trade",
//   "Tech of Elect Trade",
//   "Tech of E&I Trade",
//   "Tech of Inst Trade",
//   "Tech of Radio Trade",
//   "Tech of Armt Trade",
// ];

// const INITIAL_TRADES = ["AFR", "ENG", "E&I", "R/F", "ARMT"];

// const INITIAL_ADDRESS_STATUSES = ["Livingout", "Quarter", "Room"];

// const INITIAL_STATUSES = ["Airman", "Officer"];

// const Login = () => {
//   const { login, register } = useAuth(); // Import login and register methods from AuthContext
//   const [isRegistering, setIsRegistering] = useState(false); // Toggle between register and login modes
//   const [loading, setLoading] = useState(false); // Track loading state
//   const navigate = useNavigate();
//   const [form] = Form.useForm(); // Ant Design Form instance

//   // State variables for dynamic dropdown options
//   const [ranks, setRanks] = useState(INITIAL_RANKS);
//   const [bloodGroups, setBloodGroups] = useState(INITIAL_BLOOD_GROUPS);
//   const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
//   const [trades, setTrades] = useState(INITIAL_TRADES);
//   const [addressStatuses, setAddressStatuses] = useState(INITIAL_ADDRESS_STATUSES);
//   const [statuses, setStatuses] = useState(INITIAL_STATUSES); // New Status field

//   // Use Ant Design's useWatch to monitor form field values
//   const maritalStatus = Form.useWatch("maritalStatus", form);
//   const presentAddressStatus = Form.useWatch(
//     ["presentAddress", "addressStatus"],
//     form
//   );

//   // Handler to add new options to a dropdown
//   const handleAddOption = (value, setOptions, currentOptions, optionLabel) => {
//     const trimmedValue = value.trim();
//     if (trimmedValue && !currentOptions.includes(trimmedValue)) {
//       setOptions((prev) => [...prev, trimmedValue]);
//       form.setFieldsValue({ [optionLabel]: trimmedValue });
//       message.success(`Added "${trimmedValue}" to ${optionLabel}`);
//     } else if (currentOptions.includes(trimmedValue)) {
//       message.error(`"${trimmedValue}" already exists in ${optionLabel}.`);
//     } else {
//       message.error("Option cannot be empty.");
//     }
//   };

//   // Handlers for adding options via "+" button
//   const handleAddRank = () => {
//     const inputValue = form.getFieldValue("newRank");
//     handleAddOption(inputValue, setRanks, ranks, "rank");
//     form.setFieldsValue({ newRank: "" });
//   };

//   const handleAddTrade = () => {
//     const inputValue = form.getFieldValue("newTrade");
//     handleAddOption(inputValue, setTrades, trades, "trade");
//     form.setFieldsValue({ newTrade: "" });
//   };

//   const handleAddBloodGroup = () => {
//     const inputValue = form.getFieldValue("newBloodGroup");
//     handleAddOption(inputValue, setBloodGroups, bloodGroups, "bloodGroup");
//     form.setFieldsValue({ newBloodGroup: "" });
//   };

//   const handleAddAppointment = () => {
//     const inputValue = form.getFieldValue("newAppointment");
//     handleAddOption(inputValue, setAppointments, appointments, "appointment");
//     form.setFieldsValue({ newAppointment: "" });
//   };

//   const handleAddAddressStatus = () => {
//     const inputValue = form.getFieldValue("newAddressStatus");
//     handleAddOption(
//       inputValue,
//       setAddressStatuses,
//       addressStatuses,
//       "presentAddress.addressStatus"
//     );
//     form.setFieldsValue({ newAddressStatus: "" });
//   };

//   const handleAddStatus = () => {
//     const inputValue = form.getFieldValue("newStatus");
//     handleAddOption(inputValue, setStatuses, statuses, "status");
//     form.setFieldsValue({ newStatus: "" });
//   };

//   const handleSubmit = async (values) => {
//     setLoading(true); // Start loading
//     try {
//       if (isRegistering) {
//         // Destructure all necessary fields from form values
//         const {
//           BdNUmber,
//           rank, // Rank field
//           password,
//           confirmPassword,
//           fullName,
//           email,
//           phone,
//           trade,
//           permanentAddress: { house, city, district, division } = {},
//           maritalStatus,
//           wifeName,
//           wifeAddress,
//           presentAddress: {
//             addressStatus: presentAddressStatus,
//             roomNumber,
//             livingoutHouse,
//             livingoutCity,
//             quarterNumber,
//             marriedRoomNumber,
//           } = {},
//           dateOfPosting,
//           entryNumber,
//           dateOfBirth,
//           bloodGroup,
//           dateOfEnrollment,
//           appointment,
//           status, // New Status field
//         } = values;

//         // Validate that password and confirmPassword match
//         if (password !== confirmPassword) {
//           message.error("Passwords do not match.");
//           setLoading(false);
//           return;
//         }

//         // Prepare Permanent Address object
//         const permanentAddress = { house, city, district, division };

//         // Prepare Present Address object based on Marital Status and Address Status
//         let presentAddress = {};

//         if (maritalStatus === "Single") {
//           presentAddress = {
//             roomNumber: roomNumber,
//           };
//         } else if (maritalStatus === "Married") {
//           presentAddress.addressStatus = presentAddressStatus;

//           // Add specific address fields based on Address Status
//           if (presentAddressStatus === "Livingout") {
//             presentAddress.livingoutHouse = livingoutHouse;
//             presentAddress.livingoutCity = livingoutCity;
//           } else if (presentAddressStatus === "Quarter") {
//             presentAddress.quarterNumber = quarterNumber;
//             // Removed quarterCity as per requirement
//           } else if (presentAddressStatus === "Room") {
//             presentAddress.marriedRoomNumber = marriedRoomNumber;
//             // Removed marriedRoomCity as per requirement
//           }
//         }

//         // Prepare wife details if Married
//         const wifeDetails =
//           maritalStatus === "Married"
//             ? { wifeName, wifeAddress }
//             : {}; // Changed to empty object if not married

//         // Format dates to ISO strings
//         const formattedDates = {
//           dateOfPosting: dateOfPosting
//             ? dateOfPosting.format("YYYY-MM-DD")
//             : undefined, // Changed to undefined
//           dateOfBirth: dateOfBirth
//             ? dateOfBirth.format("YYYY-MM-DD")
//             : undefined,
//           dateOfEnrollment: dateOfEnrollment
//             ? dateOfEnrollment.format("YYYY-MM-DD")
//             : undefined,
//         };

//         // Final data object to send to backend
//         const registrationData = {
//           BdNUmber,
//           rank, // Include Rank in registration data
//           password,
//           confirmPassword,
//           fullName,
//           email,
//           phone,
//           trade,
//           permanentAddress,
//           presentAddress,
//           maritalStatus,
//           status, // Include Status
//           ...wifeDetails, // Conditionally includes wifeName and wifeAddress
//           ...formattedDates, // Only includes dates if they are defined
//           entryNumber,
//           bloodGroup,
//           appointment,
//         };
//         console.log("Registration Data:", registrationData);
//         await register(registrationData);
//         console.log("Registration Data:", registrationData);
//         message.success("Registration successful! You can now log in.");
//         setIsRegistering(false); // Switch back to login mode after successful registration
//         form.resetFields(); // Reset form fields

//         // Reset dynamic dropdown options after registration
//         setRanks(INITIAL_RANKS);
//         setTrades(INITIAL_TRADES);
//         setBloodGroups(INITIAL_BLOOD_GROUPS);
//         setAppointments(INITIAL_APPOINTMENTS);
//         setAddressStatuses(INITIAL_ADDRESS_STATUSES);
//         setStatuses(INITIAL_STATUSES);
//       } else {
//         // If in login mode, call login
//         const { BdNUmber, password } = values;
//         const user = await login({ BdNUmber, password });

//         // Ensure the user object is valid before accessing properties
//         if (!user) {
//           message.error("User not found or invalid login.");
//           setLoading(false);
//           return;
//         }

//         // Check if user is verified or has admin role
//         if (user.isVerified === false) {
//           message.error(
//             "Your account is not verified. Please wait for admin approval."
//           );
//           setLoading(false);
//           return;
//         }

//         message.success("Login successful!");

//         // Redirect based on user role
//         if (user.role === "admin") {
//           navigate("/admin"); // Redirect to Admin Panel if the user is an admin
//         } else {
//           navigate("/heli"); // Redirect to regular dashboard for users
//         }
//       }
//     } catch (error) {
//       // Enhanced error handling with specific messages
//       if (error.response) {
//         // Handle known errors from the server (e.g., invalid credentials, account verification)
//         const errorMsg =
//           error.response.data?.message ||
//           "An error occurred. Please try again.";
//         message.error(errorMsg); // Show the server's error message
//       } else if (error.request) {
//         // In case of network issues (no response from the server)
//         message.error(
//           "Network error. Please check your internet connection and try again."
//         );
//       } else {
//         // For any other unexpected errors
//         message.error(
//           `Unexpected error: ${error.message || "Please try again later."}`
//         );
//       }
//     } finally {
//       setLoading(false); // End loading
//     }
//   };

//   return (
//     <div>
//     <div className="flex min-h-screen">
//       {/* Conditionally render the left side background image only when not registering */}
//       {!isRegistering && (
//         <div
//           className="w-1/2 bg-cover bg-center hidden sm:block"
//           style={{
//             backgroundImage: `url(${img})`, // Correct way to set the background image
//           }}
//         ></div>
//       )}

//       {/* Adjust the form container's width based on isRegistering */}
//       <div
//         className={`flex justify-center items-center w-full ${
//           !isRegistering ? "sm:w-1/2" : "w-full"
//         } bg-white p-8 sm:p-12 shadow-2xl rounded-xl`}
//       >
//         <div className="w-full">
//           <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
//             {isRegistering ? "Register" : "Login"}
//           </h2>

//           <Form
//             form={form}
//             onFinish={handleSubmit}
//             layout="vertical"
//             scrollToFirstError
//           >
//             {/* BdNUmber and Password Inputs */}
//             <Row gutter={[16, 16]}>
//               <Col xs={24} sm={12}>
//                 <Form.Item
//                   name="BdNUmber"
//                   label="BdNUmber"
//                   rules={[
//                     { required: true, message: "Please enter your BdNUmber" },
//                     {
//                       pattern: /^[A-Za-z0-9]{6,}$/,
//                       message:
//                         "BdNUmber must be at least 6 characters and alphanumeric.",
//                     },
//                   ]}
//                 >
//                   <Input
//                     prefix={<UserOutlined />}
//                     placeholder="Enter your BdNUmber"
//                   />
//                 </Form.Item>
//               </Col>

//               {/* Rank Field (Register Only) */}
//               {isRegistering && (
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="rank"
//                     label="Rank"
//                     required
//                     tooltip="Select or add your rank"
//                   >
//                     <Select
//                       showSearch
//                       placeholder="Select your rank"
//                       optionFilterProp="children"
//                       filterOption={(input, option) =>
//                         option.children
//                           .toLowerCase()
//                           .includes(input.toLowerCase())
//                       }
//                       allowClear
//                       onChange={() => {
//                         // Reset newRank input when a rank is selected
//                         form.setFieldsValue({ newRank: "" });
//                       }}
//                       dropdownRender={(menu) => (
//                         <div>
//                           {menu}
//                           <div
//                             style={{
//                               display: "flex",
//                               flexWrap: "nowrap",
//                               padding: 8,
//                             }}
//                           >
//                             <Input
//                               style={{ flex: "auto", marginRight: 8 }}
//                               placeholder="Add new rank"
//                               value={form.getFieldValue("newRank")}
//                               onChange={(e) =>
//                                 form.setFieldsValue({ newRank: e.target.value })
//                               }
//                               onPressEnter={handleAddRank}
//                             />
//                             <Button
//                               type="link"
//                               onClick={handleAddRank}
//                               icon={<PlusOutlined />}
//                             >
//                               Add
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                     >
//                       {ranks.map((rankOption) => (
//                         <Option key={rankOption} value={rankOption}>
//                           {rankOption}
//                         </Option>
//                       ))}
//                     </Select>
//                   </Form.Item>
//                   {/* Hidden field for new Rank input */}
//                   <Form.Item name="newRank" style={{ display: "none" }}>
//                     <Input />
//                   </Form.Item>
//                 </Col>
//               )}

//               <Col xs={24} sm={12}>
//                 <Form.Item
//                   name="password"
//                   label="Password"
//                   rules={[
//                     { required: true, message: "Please enter your password" },
//                     {
//                       min: 6,
//                       message: "Password must be at least 6 characters long.",
//                     },
//                   ]}
//                   hasFeedback
//                 >
//                   <Input.Password
//                     prefix={<LockOutlined />}
//                     placeholder="Enter your password"
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>

//             {/* Confirm Password (Register Only) */}
//             {isRegistering && (
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="confirmPassword"
//                     label="Confirm Password"
//                     dependencies={["password"]}
//                     hasFeedback
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please confirm your password",
//                       },
//                       ({ getFieldValue }) => ({
//                         validator(_, value) {
//                           if (!value || getFieldValue("password") === value) {
//                             return Promise.resolve();
//                           }
//                           return Promise.reject(
//                             new Error("The two passwords do not match!")
//                           );
//                         },
//                       }),
//                     ]}
//                   >
//                     <Input.Password
//                       prefix={<LockOutlined />}
//                       placeholder="Confirm your password"
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>
//             )}

//             {/* Full Name and Email (Register Only) */}
//             {isRegistering && (
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="fullName"
//                     label="Full Name"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please enter your full name",
//                       },
//                       {
//                         pattern: /^[A-Za-z\s]+$/,
//                         message:
//                           "Full Name can only include letters and spaces.",
//                       },
//                     ]}
//                   >
//                     <Input
//                       prefix={<UserOutlined />}
//                       placeholder="Enter your full name"
//                     />
//                   </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="email"
//                     label="Email"
//                     rules={[
//                       { required: true, message: "Please enter your email" },
//                       { type: "email", message: "Please enter a valid email" },
//                     ]}
//                   >
//                     <Input
//                       prefix={<MailOutlined />}
//                       placeholder="Enter your email"
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>
//             )}

//             {/* Phone Number and Trade (Register Only) */}
//             {isRegistering && (
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="phone"
//                     label="Phone Number"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please enter your phone number",
//                       },
//                       {
//                         pattern: /^\+?[1-9]\d{1,14}$/,
//                         message: "Please enter a valid phone number",
//                       },
//                     ]}
//                   >
//                     <Input
//                       prefix={<PhoneOutlined />}
//                       placeholder="Enter your phone number"
//                     />
//                   </Form.Item>
//                 </Col>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="trade"
//                     label="Trade"
//                     required
//                     tooltip="Select or add your trade"
//                   >
//                     <Select
//                       showSearch
//                       placeholder="Select your trade"
//                       optionFilterProp="children"
//                       filterOption={(input, option) =>
//                         option.children
//                           .toLowerCase()
//                           .includes(input.toLowerCase())
//                       }
//                       allowClear
//                       onChange={() => {
//                         // Reset newTrade input when a trade is selected
//                         form.setFieldsValue({ newTrade: "" });
//                       }}
//                       dropdownRender={(menu) => (
//                         <div>
//                           {menu}
//                           <div
//                             style={{
//                               display: "flex",
//                               flexWrap: "nowrap",
//                               padding: 8,
//                             }}
//                           >
//                             <Input
//                               style={{ flex: "auto", marginRight: 8 }}
//                               placeholder="Add new trade"
//                               value={form.getFieldValue("newTrade")}
//                               onChange={(e) =>
//                                 form.setFieldsValue({ newTrade: e.target.value })
//                               }
//                               onPressEnter={handleAddTrade}
//                             />
//                             <Button
//                               type="link"
//                               onClick={handleAddTrade}
//                               icon={<PlusOutlined />}
//                             >
//                               Add
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                     >
//                       {trades.map((tradeOption) => (
//                         <Option key={tradeOption} value={tradeOption}>
//                           {tradeOption}
//                         </Option>
//                       ))}
//                     </Select>
//                   </Form.Item>
//                   {/* Hidden field for new Trade input */}
//                   <Form.Item name="newTrade" style={{ display: "none" }}>
//                     <Input />
//                   </Form.Item>
//                 </Col>
//               </Row>
//             )}

//             {/* Permanent Address (Register Only) */}
//             {isRegistering && (
//               <>
//                 <h3 className="text-xl font-semibold mb-4">
//                   Permanent Address
//                 </h3>
//                 <Row gutter={[16, 16]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name={["permanentAddress", "house"]}
//                       label="House"
//                       rules={[
//                         { required: true, message: "Please enter your house" },
//                       ]}
//                     >
//                       <Input
//                         prefix={<HomeOutlined />}
//                         placeholder="House"
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name={["permanentAddress", "city"]}
//                       label="City"
//                       rules={[
//                         { required: true, message: "Please enter your city" },
//                       ]}
//                     >
//                       <Input
//                         prefix={<ApartmentOutlined />}
//                         placeholder="City"
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//                 <Row gutter={[16, 16]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name={["permanentAddress", "district"]}
//                       label="District"
//                       rules={[
//                         { required: true, message: "Please enter your district" },
//                       ]}
//                     >
//                       <Input
//                         prefix={<SolutionOutlined />}
//                         placeholder="District"
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name={["permanentAddress", "division"]}
//                       label="Division"
//                       rules={[
//                         { required: true, message: "Please enter your division" },
//                       ]}
//                     >
//                       <Input
//                         prefix={<ApartmentOutlined />}
//                         placeholder="Division"
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               </>
//             )}

//             {/* Marital Status (Register Only) */}
//             {isRegistering && (
//               <Row gutter={[16, 16]}>
//                 <Col xs={24} sm={12}>
//                   <Form.Item
//                     name="maritalStatus"
//                     label="Marital Status"
//                     rules={[
//                       {
//                         required: true,
//                         message: "Please select your marital status",
//                       },
//                     ]}
//                   >
//                     <Radio.Group>
//                       <Radio value="Single">Single</Radio>
//                       <Radio value="Married">Married</Radio>
//                     </Radio.Group>
//                   </Form.Item>
//                 </Col>
//               </Row>
//             )}

//             {/* Wife Details (Married Only) */}
//             {isRegistering && maritalStatus === "Married" && (
//               <>
//                 <h3 className="text-xl font-semibold mb-4">Wife Details</h3>
//                 <Row gutter={[16, 16]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="wifeName"
//                       label="Wife's Name"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please enter your wife's name",
//                         },
//                         {
//                           pattern: /^[A-Za-z\s]+$/,
//                           message:
//                             "Wife's Name can only include letters and spaces.",
//                         },
//                       ]}
//                     >
//                       <Input
//                         prefix={<UserOutlined />}
//                         placeholder="Enter your wife's name"
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="wifeAddress"
//                       label="Wife's Address"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please enter your wife's address",
//                         },
//                       ]}
//                     >
//                       <Input
//                         prefix={<HomeOutlined />}
//                         placeholder="Enter your wife's address"
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               </>
//             )}

//             {/* Present Address (Register Only) */}
//             {isRegistering && (
//               <>
//                 <h3 className="text-xl font-semibold mb-4">Present Address</h3>
//                 <Row gutter={[16, 16]}>
//                   {/* Address Status or Room Number based on Marital Status */}
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       shouldUpdate={(prevValues, currentValues) =>
//                         prevValues.maritalStatus !== currentValues.maritalStatus ||
//                         prevValues.presentAddress?.addressStatus !==
//                           currentValues.presentAddress?.addressStatus
//                       }
//                     >
//                       {() => {
//                         if (maritalStatus === "Single") {
//                           return (
//                             <Form.Item
//                               name={["presentAddress", "roomNumber"]}
//                               label="Room Number"
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: "Please enter your room number",
//                                 },

//                               ]}
//                             >
//                               <Input
//                                 prefix={<NumberOutlined />}
//                                 placeholder="Enter your room number"
//                                 type="text"
//                               />
//                             </Form.Item>
//                           );
//                         } else if (maritalStatus === "Married") {
//                           return (
//                             <Form.Item
//                               name={["presentAddress", "addressStatus"]}
//                               label="Address Status"
//                               required
//                               tooltip="Select or add your address status"
//                             >
//                               <Select
//                                 showSearch
//                                 placeholder="Select address status"
//                                 optionFilterProp="children"
//                                 filterOption={(input, option) =>
//                                   option.children
//                                     .toLowerCase()
//                                     .includes(input.toLowerCase())
//                                 }
//                                 allowClear
//                                 onChange={() => {
//                                   // Reset newAddressStatus input when an option is selected
//                                   form.setFieldsValue({ newAddressStatus: "" });
//                                 }}
//                                 dropdownRender={(menu) => (
//                                   <div>
//                                     {menu}
//                                     <div
//                                       style={{
//                                         display: "flex",
//                                         flexWrap: "nowrap",
//                                         padding: 8,
//                                       }}
//                                     >
//                                       <Input
//                                         style={{ flex: "auto", marginRight: 8 }}
//                                         placeholder="Add new address status"
//                                         value={form.getFieldValue("newAddressStatus")}
//                                         onChange={(e) =>
//                                           form.setFieldsValue({
//                                             newAddressStatus: e.target.value,
//                                           })
//                                         }
//                                         onPressEnter={handleAddAddressStatus}
//                                       />
//                                       <Button
//                                         type="link"
//                                         onClick={handleAddAddressStatus}
//                                         icon={<PlusOutlined />}
//                                       >
//                                         Add
//                                       </Button>
//                                     </div>
//                                   </div>
//                                 )}
//                               >
//                                 {addressStatuses.map((statusOption) => (
//                                   <Option key={statusOption} value={statusOption}>
//                                     {statusOption}
//                                   </Option>
//                                 ))}
//                               </Select>
//                             </Form.Item>
//                           );
//                         }

//                         return null;
//                       }}
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 {/* Conditional Address Fields Based on Address Status */}
//                 {isRegistering && (
//                   <>
//                     {/* Address for Married Users Based on Address Status */}
//                     {maritalStatus === "Married" &&
//                       presentAddressStatus === "Livingout" && (
//                         <Row gutter={[16, 16]}>
//                           <Col xs={24} sm={12}>
//                             <Form.Item
//                               name={["presentAddress", "livingoutHouse"]}
//                               label="Livingout House"
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: "Please enter your livingout house",
//                                 },
//                               ]}
//                             >
//                               <Input
//                                 prefix={<HomeOutlined />}
//                                 placeholder="Livingout House"
//                               />
//                             </Form.Item>
//                           </Col>
//                           <Col xs={24} sm={12}>
//                             <Form.Item
//                               name={["presentAddress", "livingoutCity"]}
//                               label="Livingout City"
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: "Please enter your livingout city",
//                                 },
//                               ]}
//                             >
//                               <Input
//                                 prefix={<ApartmentOutlined />}
//                                 placeholder="Livingout City"
//                               />
//                             </Form.Item>
//                           </Col>
//                         </Row>
//                       )}

//                     {maritalStatus === "Married" &&
//                       presentAddressStatus === "Quarter" && (
//                         <Row gutter={[16, 16]}>
//                           <Col xs={24} sm={12}>
//                             <Form.Item
//                               name={["presentAddress", "quarterNumber"]}
//                               label="Quarter Number"
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: "Please enter your quarter number",
//                                 },
//                                 {
//                                   pattern: /^[0-9]+$/,
//                                   message: "Quarter Number must be a positive number",
//                                 },
//                               ]}
//                             >
//                               <Input
//                                 prefix={<NumberOutlined />}
//                                 placeholder="Enter your quarter number"
//                                 type="text"
//                               />
//                             </Form.Item>
//                           </Col>
//                           {/* Removed quarterCity as per requirement */}
//                         </Row>
//                       )}

//                     {maritalStatus === "Married" &&
//                       presentAddressStatus === "Room" && (
//                         <Row gutter={[16, 16]}>
//                           <Col xs={24} sm={12}>
//                             <Form.Item
//                               name={["presentAddress", "marriedRoomNumber"]}
//                               label="Room Number"
//                               rules={[
//                                 {
//                                   required: true,
//                                   message: "Please enter your room number",
//                                 },
//                               ]}
//                             >
//                               <Input
//                                 prefix={<NumberOutlined />}
//                                 placeholder="Enter your room number"
//                                 type="text"
//                               />
//                             </Form.Item>
//                           </Col>
//                           {/* Removed marriedRoomCity as per requirement */}
//                         </Row>
//                       )}
//                   </>
//                 )}
//               </>
//             )}
//               {/* Status Field (Register Only) */}
//               {isRegistering && (
//                 <>
//                   <Form.Item
//                     name="status"
//                     label="Status"
//                     required
//                     tooltip="Select or add your status"
//                   >
//                     <Select
//                       showSearch
//                       placeholder="Select your status"
//                       optionFilterProp="children"
//                       filterOption={(input, option) =>
//                         option.children
//                           .toLowerCase()
//                           .includes(input.toLowerCase())
//                       }
//                       allowClear
//                       onChange={() => {
//                         // Reset newStatus input when a status is selected
//                         form.setFieldsValue({ newStatus: "" });
//                       }}
//                       dropdownRender={(menu) => (
//                         <div>
//                           {menu}
//                           <div
//                             style={{
//                               display: "flex",
//                               flexWrap: "nowrap",
//                               padding: 8,
//                             }}
//                           >
//                             <Input
//                               style={{ flex: "auto", marginRight: 8 }}
//                               placeholder="Add new status"
//                               value={form.getFieldValue("newStatus")}
//                               onChange={(e) =>
//                                 form.setFieldsValue({ newStatus: e.target.value })
//                               }
//                               onPressEnter={handleAddStatus}
//                             />
//                             <Button
//                               type="link"
//                               onClick={handleAddStatus}
//                               icon={<PlusOutlined />}
//                             >
//                               Add
//                             </Button>
//                           </div>
//                         </div>
//                       )}
//                     >
//                       {statuses.map((statusOption) => (
//                         <Option key={statusOption} value={statusOption}>
//                           {statusOption}
//                         </Option>
//                       ))}
//                     </Select>
//                   </Form.Item>
//                   {/* Hidden field for new Status input */}
//                   <Form.Item name="newStatus" style={{ display: "none" }}>
//                     <Input />
//                   </Form.Item>
//                 </>
//               )}

//               {/* Date of Posting and Entry Number (Register Only) */}
//               {isRegistering && (
//                 <Row gutter={[16, 16]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="dateOfPosting"
//                       label="Date of Posting"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please select the date of posting",
//                         },
//                       ]}
//                     >
//                       <DatePicker
//                         style={{ width: "100%" }}
//                         format="YYYY-MM-DD"
//                         placeholder="Select date of posting"
//                         prefix={<CalendarOutlined />}
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="entryNumber"
//                       label="Entry Number"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please enter your entry number",
//                         },
//                         {
//                           pattern: /^[0-9]+$/,
//                           message: "Entry Number must be a positive number",
//                         },
//                       ]}
//                     >
//                       <Input
//                         prefix={<NumberOutlined />}
//                         placeholder="Enter your entry number"
//                         type="text"
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               )}

//               {/* Date of Birth and Blood Group (Register Only) */}
//               {isRegistering && (
//                 <Row gutter={[16, 16]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="dateOfBirth"
//                       label="Date of Birth"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please select your date of birth",
//                         },
//                         () => ({
//                           validator(_, value) {
//                             if (
//                               value &&
//                               value.isAfter(moment().subtract(18, "years"))
//                             ) {
//                               return Promise.reject(
//                                 new Error("You must be at least 18 years old.")
//                               );
//                             }
//                             return Promise.resolve();
//                           },
//                         }),
//                       ]}
//                     >
//                       <DatePicker
//                         style={{ width: "100%" }}
//                         format="YYYY-MM-DD"
//                         placeholder="Select date of birth"
//                         prefix={<CalendarOutlined />}
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="bloodGroup"
//                       label="Blood Group"
//                       required
//                       tooltip="Select or add your blood group"
//                     >
//                       <Select
//                         showSearch
//                         placeholder="Select your blood group"
//                         optionFilterProp="children"
//                         filterOption={(input, option) =>
//                           option.children
//                             .toLowerCase()
//                             .includes(input.toLowerCase())
//                         }
//                         allowClear
//                         onChange={() => {
//                           // Reset newBloodGroup input when a blood group is selected
//                           form.setFieldsValue({ newBloodGroup: "" });
//                         }}
//                         dropdownRender={(menu) => (
//                           <div>
//                             {menu}
//                             <div
//                               style={{
//                                 display: "flex",
//                                 flexWrap: "nowrap",
//                                 padding: 8,
//                               }}
//                             >
//                               <Input
//                                 style={{ flex: "auto", marginRight: 8 }}
//                                 placeholder="Add new blood group"
//                                 value={form.getFieldValue("newBloodGroup")}
//                                 onChange={(e) =>
//                                   form.setFieldsValue({ newBloodGroup: e.target.value })
//                                 }
//                                 onPressEnter={handleAddBloodGroup}
//                               />
//                               <Button
//                                 type="link"
//                                 onClick={handleAddBloodGroup}
//                                 icon={<PlusOutlined />}
//                               >
//                                 Add
//                               </Button>
//                             </div>
//                           </div>
//                         )}
//                       >
//                         {bloodGroups.map((group) => (
//                           <Option key={group} value={group}>
//                             {group}
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                     {/* Hidden field for new Blood Group input */}
//                     <Form.Item name="newBloodGroup" style={{ display: "none" }}>
//                       <Input />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               )}

//               {/* Date of Enrollment and Appointment (Register Only) */}
//               {isRegistering && (
//                 <Row gutter={[16, 16]}>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="dateOfEnrollment"
//                       label="Date of Enrollment"
//                       rules={[
//                         {
//                           required: true,
//                           message: "Please select the date of enrollment",
//                         },
//                       ]}
//                     >
//                       <DatePicker
//                         style={{ width: "100%" }}
//                         format="YYYY-MM-DD"
//                         placeholder="Select date of enrollment"
//                         prefix={<CalendarOutlined />}
//                       />
//                     </Form.Item>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Form.Item
//                       name="appointment"
//                       label="Appointment"
//                       required
//                       tooltip="Select or add your appointment"
//                     >
//                       <Select
//                         showSearch
//                         placeholder="Select your appointment"
//                         optionFilterProp="children"
//                         filterOption={(input, option) =>
//                           option.children
//                             .toLowerCase()
//                             .includes(input.toLowerCase())
//                         }
//                         allowClear
//                         onChange={() => {
//                           // Reset newAppointment input when an appointment is selected
//                           form.setFieldsValue({ newAppointment: "" });
//                         }}
//                         dropdownRender={(menu) => (
//                           <div>
//                             {menu}
//                             <div
//                               style={{
//                                 display: "flex",
//                                 flexWrap: "nowrap",
//                                 padding: 8,
//                               }}
//                             >
//                               <Input
//                                 style={{ flex: "auto", marginRight: 8 }}
//                                 placeholder="Add new appointment"
//                                 value={form.getFieldValue("newAppointment")}
//                                 onChange={(e) =>
//                                   form.setFieldsValue({ newAppointment: e.target.value })
//                                 }
//                                 onPressEnter={handleAddAppointment}
//                               />
//                               <Button
//                                 type="link"
//                                 onClick={handleAddAppointment}
//                                 icon={<PlusOutlined />}
//                               >
//                                 Add
//                               </Button>
//                             </div>
//                           </div>
//                         )}
//                       >
//                         {appointments.map((appointmentOption) => (
//                           <Option key={appointmentOption} value={appointmentOption}>
//                             {appointmentOption}
//                           </Option>
//                         ))}
//                       </Select>
//                     </Form.Item>
//                     {/* Hidden field for new Appointment input */}
//                     <Form.Item name="newAppointment" style={{ display: "none" }}>
//                       <Input />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               )}

//               {/* Submit Button */}
//               <Row>
//                 <Col span={24}>
//                   <Form.Item>
//                     <Button
//                       type="primary"
//                       htmlType="submit"
//                       block
//                       loading={loading} // Loading state for button
//                       disabled={loading}
//                       className="transition-all duration-300 ease-in-out hover:shadow-xl"
//                       size="large"
//                     >
//                       {loading ? (
//                         <Spin size="small" />
//                       ) : isRegistering ? (
//                         "Register"
//                       ) : (
//                         "Login"
//                       )}
//                     </Button>
//                   </Form.Item>
//                 </Col>
//               </Row>

//               {/* Toggle Between Register and Login */}
//               <Row>
//                 <Col span={24}>
//                   <div className="flex justify-center items-center mt-4">
//                     <span className="mr-2 text-sm text-gray-700">
//                       {isRegistering
//                         ? "Already have an account?"
//                         : "Don't have an account?"}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setIsRegistering(!isRegistering);
//                         form.resetFields(); // Reset form fields when toggling
//                         // Reset dynamic dropdown options when switching modes
//                         setRanks(INITIAL_RANKS);
//                         setTrades(INITIAL_TRADES);
//                         setBloodGroups(INITIAL_BLOOD_GROUPS);
//                         setAppointments(INITIAL_APPOINTMENTS);
//                         setAddressStatuses(INITIAL_ADDRESS_STATUSES);
//                         setStatuses(INITIAL_STATUSES);
//                       }}
//                       className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//                     >
//                       {isRegistering ? "Login" : "Register"}
//                     </button>
//                   </div>
//                 </Col>
//               </Row>
//             </Form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// components/Login.jsx

import { LockOutlined, UserOutlined } from "@ant-design/icons"; // Ant Design Icons
import { Button, Col, Form, Input, message, Row, Select, Spin } from "antd"; // Ant Design Components
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/mi-17.png"; // Background image
import { useAuth } from "../context/AuthContext"; // Authentication context

const { Option } = Select; // Destructure Option from Select

const Login = () => {
  const { login, register } = useAuth(); // Import login and register methods from AuthContext
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between register and login modes
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Ant Design Form instance
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
  const INITIAL_TRADES = ["AFR", "ENG", "E&I", "R/F", "ARMT","INST","ELECT","RADAR","WIRELESS"];

  const handleSubmit = async (values) => {
    setLoading(true); // Start loading
    try {
      if (isRegistering) {
        // **Registration Logic**
        const { BdNUmber, password, rank, trade, fullName } = values;

        // Call the register function from AuthContext
        await register({ BdNUmber, password, rank, trade, fullName });

        message.success("Registration successful! Please log in.");
        setIsRegistering(false); // Switch back to login mode after successful registration
        form.resetFields(); // Reset form fields
      } else {
        // **Login Logic**
        const { BdNUmber, password } = values;
        const user = await login({ BdNUmber, password });

        message.success("Login successful!");

        // Redirect to Profile page after login
        navigate("/profile");
      }
    } catch (error) {
      // Enhanced error handling with specific messages
      if (error.message) {
        message.error(error.message);
      } else {
        message.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Conditionally render the left side background image only when not registering */}
      {!isRegistering && (
        <div
          className="w-1/2 bg-cover bg-center hidden sm:block"
          style={{
            backgroundImage: `url(${img})`, // Correct way to set the background image
          }}
        ></div>
      )}

      {/* Adjust the form container's width based on isRegistering */}
      <div
        className={`flex justify-center items-center w-full ${
          !isRegistering ? "sm:w-1/2" : "w-full"
        } bg-white p-8 sm:p-12 shadow-2xl rounded-xl`}
      >
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            {isRegistering ? "Register" : "Login"}
          </h2>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            scrollToFirstError
          >
            {/* BdNUmber and Password Inputs */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
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
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters long.",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Confirm Password (Register Only) */}
            {isRegistering && (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("The two passwords do not match!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Confirm your password"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
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
                </Col>
              </Row>
            )}

            {/* **New: Trade and Rank Dropdowns (Register Only)** */}
            {isRegistering && (
              <Row gutter={[16, 16]}>
                {/* Trade Dropdown */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="trade"
                    label="Trade"
                    rules={[
                      { required: true, message: "Please select your trade" },
                    ]}
                  >
                    <Select placeholder="Select your trade">
                      {INITIAL_TRADES.map((trade) => (
                        <Option key={trade} value={trade}>
                          {trade}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
               

                {/* Rank Dropdown */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="rank"
                    label="Rank"
                    rules={[
                      { required: true, message: "Please select your rank" },
                    ]}
                  >
                    <Select placeholder="Select your rank">
                      {INITIAL_RANKS.map((rank) => (
                        <Option key={rank} value={rank}>
                          {rank}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Submit Button */}
            <Row>
              <Col span={24}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading} // Loading state for button
                    disabled={loading}
                    className="transition-all duration-300 ease-in-out hover:shadow-xl"
                    size="large"
                  >
                    {loading ? (
                      <Spin size="small" />
                    ) : isRegistering ? (
                      "Register"
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            {/* Toggle Between Register and Login */}
            <Row>
              <Col span={24}>
                <div className="flex justify-center items-center mt-4">
                  <span className="mr-2 text-sm text-gray-700">
                    {isRegistering
                      ? "Already have an account?"
                      : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      form.resetFields(); // Reset form fields when toggling
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isRegistering ? "Login" : "Register"}
                  </button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
