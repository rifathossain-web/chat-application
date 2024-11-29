import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  TimePicker,
} from "antd";
import axios from "axios";
import dayjs from "dayjs"; // Using Day.js for date manipulation
import { useCallback, useEffect, useState } from "react";

const { Option } = Select;

/** Utility Functions **/

// Regex for time in the format `0:00`, `00:00`, `000:00`, or `0000:00`
const timeRegex = /\b\d{1,4}:\d{2}\b/;

// Convert hh:mm string to total minutes
const convertToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert total minutes back to hh:mm string
const convertToHoursMin = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/** Adjust Times Modal Component **/
const AdjustTimesModal = ({
  visible,
  onClose,
  lines,
  flyingHours,
  adjustTime,
  adjustLoading,
}) => {
  return (
    <Modal
      title="Adjust Times in Notes"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width="100%"
      style={{ top: 0 }}
      bodyStyle={{
        height: "calc(100vh - 55px)",
        padding: "24px",
        overflow: "auto",
      }}
      destroyOnClose
    >
      {adjustLoading ? (
        <Spin tip="Adjusting Times..." />
      ) : lines.length > 0 ? (
        lines.map((line, index) => {
          const match = line.match(timeRegex);
          const time = match ? match[0] : null;

          if (!time) return null;

          return (
            <div
              key={index}
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ flex: 1, marginRight: "10px" }}>
                {line.split(time).map((part, i) => (
                  <span key={i}>
                    {part}
                    {i === 0 && time && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          marginLeft: "5px",
                        }}
                      >
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => adjustTime(line, time, "increment")}
                          style={{ marginRight: "5px" }}
                          disabled={flyingHours === 0 || adjustLoading}
                          loading={adjustLoading} // Show loading on button
                        >
                          +{convertToHoursMin(flyingHours)}
                        </Button>
                        <span style={{ marginRight: "5px" }}>{time}</span>
                        <Button
                          danger
                          icon={<MinusOutlined />}
                          size="small"
                          onClick={() => adjustTime(line, time, "decrement")}
                          disabled={flyingHours === 0 || adjustLoading}
                          loading={adjustLoading} // Show loading on button
                        >
                          -{convertToHoursMin(flyingHours)}
                        </Button>
                      </span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          );
        })
      ) : (
        <p>No valid time entries found in notes.</p>
      )}
    </Modal>
  );
};

/** Main Component **/
const UpdateStateForm = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [previousData, setPreviousData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Additional Loading States
  const [submitLoading, setSubmitLoading] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);

  // State Variables for Time Adjustment
  const [notesText, setNotesText] = useState("");
  const [filteredLines, setFilteredLines] = useState([]);
  const [flyingHours, setFlyingHours] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  /** Fetch Previous Data **/
  const fetchPreviousData = async (heliSerNo) => {
    if (!heliSerNo) {
      message.error("Helicopter serial number cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/helicopters/serial/${heliSerNo}`);
      const data = response.data;
      setPreviousData(data);

      form.setFieldsValue({
        // Initialize form fields with fetched data
        totalLdg: data.totalLdg,
        apuHrs: data.apuHrs,
        apuSt: data.apuSt,
        apuAB: data.apuAB,
        actionNotes: data.actionNotes || "",
        entryNotes: data.entryNotes || "",
        notes: data.notes || "",
        sorties: data.sorties || "",
        location: data.location || "",
        inspectionCycle: data.inspectionCycle || "",
        nextInspoh: data.nextInspoh || "",
        acMis: data.acMis || "",
        preRoleAndName: data.preRoleAndName || "",
        supRoleAndName: data.supRoleAndName || "",
      });
      setNotesText(data.notes || "");

      setLoading(false);
      message.success("Data loaded successfully");
    } catch (error) {
      console.error("Error fetching previous data:", error);
      message.error("Failed to load helicopter data");
      setLoading(false);
    }
  };

  /** Extract Lines with Valid Time Strings **/
  const extractTimeLines = () => {
    const lines = notesText.split("\n").filter((line) => timeRegex.test(line));
    setFilteredLines(lines);
  };

  /** Adjust Time in Line **/
  const adjustTimeInLine = async (line, originalTime, action) => {
    if (!flyingHours) {
      message.error("Please enter Daily Flying Hours to adjust times.");
      return;
    }

    setAdjustLoading(true); // Start loading

    try {
      let totalMinutes = convertToMinutes(originalTime);

      if (action === "increment") {
        totalMinutes += flyingHours;
      } else if (action === "decrement") {
        totalMinutes -= flyingHours;
        if (totalMinutes < 0) totalMinutes = 0; // Prevent negative time
      }

      const newTime = convertToHoursMin(totalMinutes);
      const updatedLine = line.replace(originalTime, newTime);

      // Split notesText into lines, update the specific line, and join back
      const updatedNotesArray = notesText
        .split("\n")
        .map((currentLine) =>
          currentLine === line ? updatedLine : currentLine
        );
      const updatedNotes = updatedNotesArray.join("\n");

      setNotesText(updatedNotes);
      setFilteredLines((prevLines) =>
        prevLines.map((l) => (l === line ? updatedLine : l))
      );
      form.setFieldsValue({ notes: updatedNotes }); // Sync Notes field
      message.success(
        `Time ${originalTime} ${
          action === "increment" ? "increased" : "decreased"
        } to ${newTime}`
      );
    } catch (error) {
      console.error("Error adjusting time:", error);
      message.error("Failed to adjust time. Please try again.");
    } finally {
      setAdjustLoading(false); // End loading
    }
  };

  /** Handle Form Submission **/
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values); // Initial log for debugging

    if (!previousData) {
      message.error("Please enter a valid helicopter serial number");
      return;
    }

    setSubmitLoading(true); // Start submit loading

    // Check for duplicate submission
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/helicopterLogs/logs/checkDuplicate`, {
        params: {
          heliSerNo: values.heliSerNo,
          date: values.date,
        },
      });

      console.log("Duplicate Check Response Status:", response.status);
      console.log("Duplicate Check Response Data:", response.data);

      if (response.status === 200) {
        // Check if response data contains duplication info
        if (typeof response.data.duplicate !== "undefined") {
          const isDuplicate =
            response.data.duplicate === true ||
            response.data.duplicate === "true"; // Handle both boolean and string

          console.log("Is Duplicate:", isDuplicate);

          if (isDuplicate) {
            // Duplicate exists
            message.error(
              "An entry already exists for this date. Please choose a different date."
            );
            setSubmitLoading(false);
            return;
          } else {
            // No duplicate exists, proceed
            console.log("No duplicate found. Proceeding with submission.");
          }
        } else if (response.data.message === "No duplicate found") {
          // Explicitly handle the message indicating no duplicate
          console.log("No duplicate found as per message. Proceeding with submission.");
        } else {
          // Unexpected duplication info
          console.warn(
            "Unexpected response structure. 'duplicate' field missing and message not recognized."
          );
          message.error(
            "Unexpected response from duplicate check. Please try again."
          );
          setSubmitLoading(false);
          return;
        }
      } else {
        // Handle other status codes if necessary
        console.warn("Received unexpected status code from duplicate check:", response.status);
        message.error(
          "Unexpected response from duplicate check. Please try again."
        );
        setSubmitLoading(false);
        return;
      }
    } catch (error) {
      if (error.response) {
        console.log("Duplicate Check Error Response Status:", error.response.status);
        console.log("Duplicate Check Error Response Data:", error.response.data);

        if (error.response.status === 404) {
          // No duplicate exists, proceed
          console.log("No duplicate exists (404). Proceeding with submission.");
        } else {
          // Other errors
          console.error("Error checking for duplicate:", error);
          message.error("Failed to verify duplicate entry. Please try again.");
          setSubmitLoading(false);
          return;
        }
      } else {
        // Network or other errors
        console.error("Error checking for duplicate:", error);
        message.error("Failed to verify duplicate entry. Please try again.");
        setSubmitLoading(false);
        return;
      }
    }

    // Process form values
    const flyingMinutes = values.dailyFlyingHours
      ? values.dailyFlyingHours.hour() * 60 + values.dailyFlyingHours.minute()
      : 0;

    // Process Sorties field
    let { sorties, dailyLdg, ...restValues } = values;

    // Convert Sorties
    if (sorties === "0") {
      sorties = "-";
    } else if (sorties !== "G/Run") {
      // Ensure sorties is a number in string format
      sorties = Number(sorties).toString();
    }

    // Convert Daily Landing (LDG)
    if (Number(dailyLdg) === 0) {
      dailyLdg = "-";
    } else {
      dailyLdg = dailyLdg.toString(); // Ensure it's a string
    }

    // Compute updated values based on previous data
    const outputData = {
      ...restValues,
      date: values.date,
      preparedDate: values.preparedDate,
      heliSerNo: values.heliSerNo,
      status: values.status,
      dailyFlyingHours: values.dailyFlyingHours
        ? values.dailyFlyingHours.format("HH:mm")
        : "00:00",
      sorties: sorties,
      nextGrdRun:
        flyingMinutes > 0
          ? dayjs(values.date).add(6, "day").format("YYYY-MM-DD")
          : previousData.previousGrdRun,
      heliPresentHrs: convertToHoursMin(
        convertToMinutes(previousData.heliPresentHrs) + flyingMinutes
      ),
      engPresentHrsL: convertToHoursMin(
        convertToMinutes(previousData.engPresentHrsL) + flyingMinutes
      ),
      engPresentHrsR: convertToHoursMin(
        convertToMinutes(previousData.engPresentHrsR) + flyingMinutes
      ),
      mgbPresentHrs: convertToHoursMin(
        convertToMinutes(previousData.mgbPresentHrs) + flyingMinutes
      ),
      totalLdg: previousData.totalLdg + (dailyLdg === "-" ? 0 : parseInt(dailyLdg, 10)),
      apuHrs: convertToHoursMin(
        convertToMinutes(previousData.apuHrs) +
          convertToMinutes(values.apuHours.format("HH:mm"))
      ),
      apuAB: parseInt(previousData.apuAB, 10) + parseInt(values.apuAB, 10),
      apuSt: parseInt(previousData.apuSt, 10) + parseInt(values.apuSt, 10),
      genMode: convertToHoursMin(
        convertToMinutes(previousData.genMode) +
          convertToMinutes(values.genMode.format("HH:mm"))
      ),
      leftEngHrsLeftForOH: convertToHoursMin(
        convertToMinutes(previousData.totalEngPresentHrsL) -
          (convertToMinutes(previousData.engPresentHrsL) + flyingMinutes)
      ),
      rightEngHrsLeftForOH: convertToHoursMin(
        convertToMinutes(previousData.totalEngPresentHrsR) -
          (convertToMinutes(previousData.engPresentHrsR) + flyingMinutes)
      ),
      MgbHrsLeftForOH: convertToHoursMin(
        convertToMinutes(previousData.totalMgbHours) -
          (convertToMinutes(previousData.mgbPresentHrs) + flyingMinutes)
      ),
      inspectionLeft: convertToHoursMin(
        convertToMinutes(previousData.inspectionLeft) - flyingMinutes
      ),
      location: values.location,
      inspectionCycle: values.inspectionCycle.split(/±|\+|-/)[0].trim(),
      nextInspoh: values.nextInspoh,
      acMis: values.acMis,
      actionNotes: values.actionNotes,
      entryNotes: values.entryNotes,
      notes: notesText, // Use the updated notesText
      preRoleAndName: values.preRoleAndName,
      supRoleAndName: values.supRoleAndName,
    };

    try {
      setFormData(outputData);
      await submitHelicopterLog(outputData);
      await submitHelicopterPreviousData(outputData);
      message.success("Form submitted successfully!");
      form.resetFields();
      setFlyingHours(0);
      setNotesText("");
      setFilteredLines([]);
    } catch (error) {
      console.error("Error during form submission:", error);
      // Error messages are handled in submit functions
    } finally {
      setSubmitLoading(false); // End submit loading
    }
  };

  /** Submit Helicopter Log **/
  const submitHelicopterLog = async (data) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/helicopterLogs/log`, data);
      message.success("Log data saved successfully!");
      console.log("Log Server response:", response.data);
    } catch (error) {
      message.error("Failed to save log data. Please try again.");
      console.error("Error posting log data:", error);
      throw error; // Propagate error to onFinish
    }
  };

  /** Submit Helicopter Previous Data **/
  const submitHelicopterPreviousData = async (data) => {
    try {
      const inspectionCycleValue = data.inspectionCycle
        .split(/±|\+|-/)[0]
        .trim();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/helicopters/serial/${data.heliSerNo}`,
        {
          heliPresentHrs: data.heliPresentHrs,
          engPresentHrsL: data.engPresentHrsL,
          engPresentHrsR: data.engPresentHrsR,
          mgbPresentHrs: data.mgbPresentHrs,
          totalLdg: data.totalLdg,
          apuHrs: data.apuHrs,
          apuSt: data.apuSt,
          apuAB: data.apuAB,
          genMode: data.genMode,
          inspectionCycle: inspectionCycleValue,
          inspectionLeft: data.inspectionLeft,
          nextGrdRun: data.nextGrdRun,
          actionNotes: data.actionNotes,
          entryNotes: data.entryNotes,
          notes: data.notes,
        }
      );
      message.success("Helicopter data updated successfully!");
      console.log("Previous Data Server response:", response.data);
    } catch (error) {
      message.error("Failed to update helicopter data.");
      console.error("Error updating previous data:", error);
      throw error; // Propagate error to onFinish
    }
  };

  /** Handle Adjust Time **/
  const handleAdjustTime = (line, time, action) => {
    adjustTimeInLine(line, time, action);
  };

  /** Extract Time Lines and Open Modal **/
  const handleOpenAdjustModal = () => {
    extractTimeLines();
    setIsModalVisible(true);
  };

  /** Debugging: Log notesText, filteredLines, and flyingHours whenever they change **/
  useEffect(() => {
    console.log("notesText updated:", notesText);
  }, [notesText]);

  useEffect(() => {
    console.log("filteredLines updated:", filteredLines);
  }, [filteredLines]);

  useEffect(() => {
    console.log("flyingHours updated:", flyingHours);
  }, [flyingHours]);

  /** Handle Form's onValuesChange to Update flyingHours **/
  const handleFormValuesChange = useCallback((changedValues, _allValues) => {
    if (changedValues.dailyFlyingHours !== undefined) {
      const time = changedValues.dailyFlyingHours;
      if (time && dayjs.isDayjs(time)) {
        console.log("Form onValuesChange - TimePicker value:", time);
        setFlyingHours(time.hour() * 60 + time.minute());
      } else {
        setFlyingHours(0);
      }
    }
  }, []);

  return (
    <div className="w-full p-10 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Helicopter State Form
      </h2>
      {loading ? (
        <Spin tip="Loading data..." size="large" />
      ) : (
        <Form 
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleFormValuesChange} // Handle value changes globally
          initialValues={{ dailyFlyingHours: dayjs("00:00", "HH:mm") }} // Initialize TimePicker with 00:00
        >
          <Row gutter={[16, 16]}>
            {/* Heli Ser No */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Heli Ser No"
                name="heliSerNo"
                rules={[
                  {
                    required: true,
                    message: "Please enter the helicopter serial number",
                  },
                ]}
              >
                <Input
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                  onBlur={(e) => fetchPreviousData(e.target.value)}
                  placeholder="Enter helicopter serial number"
                />
              </Form.Item>
            </Col>

            {/* Date */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Date of State"
                name="date"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <Input
                  type="date"
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                />
              </Form.Item>
            </Col>

            {/* Status */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select
                  className="w-full h-12 text-lg"
                  placeholder="Select status"
                >
                  <Option value="SVC">SVC</Option>
                  <Option value="U/S">U/S</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Daily Flying Hours */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Daily Flying Hours"
                name="dailyFlyingHours"
                rules={[{ required: true, message: "Enter flying hours" }]}
              >
                <TimePicker
                  format="HH:mm"
                  minuteStep={5}
                  size="large"
                  allowClear
                  className="w-full"
                />
              </Form.Item>
            </Col>

            {/* Sorties */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Sorties"
                name="sorties"
                rules={[
                  {
                    required: true,
                    message: "Please enter sorties or 'G/Run'",
                  },
                  {
                    validator: (_, value) => {
                      if (value === "G/Run") {
                        return Promise.resolve();
                      }
                      const num = Number(value);
                      if (!isNaN(num) && num >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        "Please enter a valid number or 'G/Run'"
                      );
                    },
                  },
                ]}
                extra="Enter a number or 'G/Run' to indicate sorties. A value of 0 will be sent as '-'."
              >
                <Input
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                  placeholder="Enter number of sorties or 'G/Run'"
                />
              </Form.Item>
            </Col>

            {/* Daily Landing (LDG) */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Daily Landing (LDG)"
                name="dailyLdg"
                rules={[
                  { required: true, message: "Please enter LDG" },
                  {
                    validator: (_, value) => {
                      if (value === "-") {
                        return Promise.resolve();
                      }
                      const num = Number(value);
                      if (!isNaN(num) && num >= 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Please enter a valid number or '-'");
                    },
                  },
                ]}
                extra="Enter a number. A value of 0 will be sent as '-' to the backend."
              >
                <Input
                  type="text"
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                  placeholder="Enter LDG (0 will be sent as '-')"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Prevent users from entering invalid characters
                    if (value === "-" || /^\d*$/.test(value)) {
                      form.setFieldsValue({ dailyLdg: value });
                      setNotesText(form.getFieldValue("notes") || "");
                    }
                  }}
                />
              </Form.Item>
            </Col>

            {/* Daily APU Hours */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Daily APU Hours"
                name="apuHours"
                rules={[{ required: true, message: "Please enter APU hours" }]}
              >
                <TimePicker
                  format="HH:mm"
                  minuteStep={5}
                  size="large"
                  allowClear
                  className="w-full"
                />
              </Form.Item>
            </Col>

            {/* Daily A/B */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Daily A/B"
                name="apuAB"
                rules={[{ required: true, message: "Please enter A/B" }]}
              >
                <Input
                  type="number"
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                  placeholder="Enter A/B"
                />
              </Form.Item>
            </Col>

            {/* Daily APU ST */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Daily APU ST"
                name="apuSt"
                rules={[{ required: true, message: "Please enter APU ST" }]}
              >
                <Input
                  type="number"
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                  placeholder="Enter APU ST"
                />
              </Form.Item>
            </Col>

            {/* Daily Gen Mode */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Daily Gen Mode"
                name="genMode"
                rules={[{ required: true, message: "Please enter Gen Mode" }]}
              >
                <TimePicker
                  format="HH:mm"
                  minuteStep={5}
                  size="large"
                  allowClear
                  className="w-full"
                />
              </Form.Item>
            </Col>

            {/* Location */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input
                  type="text"
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                  placeholder="Enter location"
                />
              </Form.Item>
            </Col>

            {/* ACMIS */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="ACMIS"
                name="acMis"
                rules={[
                  { required: true, message: "Please select ACMIS status" },
                ]}
              >
                <Select
                  className="w-full h-12 text-lg"
                  placeholder="Select ACMIS status"
                >
                  <Option value="true">Updated</Option>
                  <Option value="false">Not Updated</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Inspection Cycle */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Inspection Cycle"
                name="inspectionCycle"
                rules={[
                  { required: true, message: "Please select inspection cycle" },
                ]}
              >
                <Select
                  className="w-full h-12 text-lg"
                  placeholder="Select inspection cycle"
                >
                  <Option value="25">25±5</Option>
                  <Option value="50">50±10</Option>
                  <Option value="100">100±5</Option>
                  <Option value="200">200±5</Option>
                  <Option value="300">300±5</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* NEXT INSP & O/H HRS LEFT */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="NEXT INSP & O/H HRS LEFT"
                name="nextInspoh"
                rules={[
                  {
                    required: true,
                    message: "Please select next inspection/OH hours left",
                  },
                ]}
              >
                <Select
                  className="w-full h-12 text-lg"
                  placeholder="Select next inspection/OH hours left"
                >
                  <Option value="25">25±5</Option>
                  <Option value="50">50±10</Option>
                  <Option value="100">100±5</Option>
                  <Option value="200">200±5</Option>
                  <Option value="300">300±5</Option>
                  <Option value="2000">O/H</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Date of Prepared"
                name="preparedDate"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <Input
                  type="date"
                  className="w-full h-12 p-2 text-lg border border-gray-300 rounded-md"
                />
              </Form.Item>
            </Col>
            {/* Prepared By */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Prepared By"
                name="preRoleAndName"
                rules={[
                  {
                    required: true,
                    message: "Please enter preparer's role and name",
                  },
                ]}
              >
                <AutoComplete
                  style={{ width: "100%" }}
                  options={[
                    { value: "AC" },
                    { value: "LAC" },
                    { value: "CPL" },
                    { value: "Sgt" },
                    { value: "WO" },
                    { value: "SWO" },
                  ]}
                  placeholder="Select or enter role and name"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            {/* Supervised By */}
            <Col xs={24} sm={12} lg={8}>
              <Form.Item
                label="Supervised By"
                name="supRoleAndName"
                rules={[
                  {
                    required: true,
                    message: "Please enter supervisor's role and name",
                  },
                ]}
              >
                <AutoComplete
                  style={{ width: "100%" }}
                  options={[
                    { value: "CPL" },
                    { value: "Sgt" },
                    { value: "WO" },
                    { value: "SWO" },
                    { value: "MWO" },
                  ]}
                  placeholder="Select or enter role and name"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            {/* Entry Notes */}
            <Col xs={24} lg={12}>
              <Form.Item
                label="Entry Notes"
                name="entryNotes"
                rules={[{ message: "Please enter entry notes" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter multi-line entry notes (e.g., 1. Note on XYZ, Date)"
                />
              </Form.Item>
            </Col>

            {/* Action Notes */}
            <Col xs={24} lg={12}>
              <Form.Item
                label="Action Notes"
                name="actionNotes"
                rules={[{ message: "Please enter action notes" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter multi-line action notes (e.g., 1. Action taken on XYZ, Date)"
                />
              </Form.Item>
            </Col>

            {/* Notes with Adjust Times Feature */}
            <Col xs={24} lg={12}>
              <Form.Item
                label="Notes"
                name="notes"
                rules={[{ required: true, message: "Please enter notes" }]}
              >
                <Input.TextArea
                  rows={6}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Enter multi-line notes (e.g., 1. Action taken on XYZ, Date)"
                />
                <Button
                  type="primary"
                  onClick={handleOpenAdjustModal}
                  style={{ marginTop: "10px" }}
                  disabled={!notesText}
                  loading={adjustLoading} // Show loading on Adjust Times button
                >
                  Adjust Times
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-lg"
            disabled={!previousData} // Disable submit until previous data is fetched
            loading={submitLoading} // Show loading on Submit button
          >
            Submit
          </Button>
        </Form>
      )}

      {/* Adjust Times Modal */}
      <AdjustTimesModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        lines={filteredLines}
        flyingHours={flyingHours}
        adjustTime={handleAdjustTime}
        adjustLoading={adjustLoading} // Pass adjustLoading state
      />
    </div>
  );
};

export default UpdateStateForm;
