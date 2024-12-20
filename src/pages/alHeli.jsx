import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Tabs,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/mi-17.png";
import axiosInstance from "../axios";
const { Option } = Select;
const { TabPane } = Tabs;

// Helper function to convert various time formats into total minutes
const convertTimeToMinutes = (timeString) => {
  let [hours, minutes] = timeString.split(":").map(Number);

  if (isNaN(hours)) hours = 0; // Handle invalid input
  if (!minutes && timeString.includes(":")) minutes = 0; // Default minutes
  if (!minutes && !timeString.includes(":")) minutes = hours % 100; // Handle input without colon
  if (!timeString.includes(":")) hours = Math.floor(hours / 100); // Handle input without colon

  return hours * 60 + (minutes || 0); // Total minutes
};

// Convert total minutes back to HH:MM for display
const convertMinutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`; // Display as HH:MM
};

// Ensure time is stored in "0000:00" format for internal calculations
const formatTimeForStorage = (timeString) => {
  let [hours, minutes] = timeString.split(":").map(Number);

  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;

  return `${String(hours).padStart(4, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`; // Return "0000:00"
};

const AlHeli = () => {
  const navigate = useNavigate();
  const [helicopters, setHelicopters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingHeli, setEditingHeli] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  const [submitting, setSubmitting] = useState(false); // Submitting loader state
  const [activeTab, setActiveTab] = useState("MI-17"); // Default tab

  useEffect(() => {
    fetchHelicopters();
  }, []);

  // Fetch helicopters from the backend
  const fetchHelicopters = async () => {
    setLoading(true); // Start the loader
    try {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/api/helicopters`
      );
      setHelicopters(data);
    } catch (error) {
      message.error("Error fetching helicopters: " + error.message);
    } finally {
      setLoading(false); // Stop the loader
    }
  };

  // Show the modal for adding or editing helicopter
  const showModal = (heli = null) => {
    setEditingHeli(heli);
    if (heli) {
      form.setFieldsValue({
        ...heli,
        date: moment(heli.date), // Handle moment date conversion
        nextGrdRun: heli.nextGrdRun ? moment(heli.nextGrdRun) : null, // For Next Ground Run Date
      }); // Pre-fill the form for editing
    } else {
      form.resetFields(); // Reset the form for new addition
    }
    setIsModalOpen(true);
  };

  // Validate time input in the "0000:00", "00:00", "00", "0" formats
  const validateTimeFormat = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }

    const timeRegex = /^(\d{1,4}:\d{2}|\d{1,4})$/;
    if (timeRegex.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(
        "Invalid time format. Please use 0000:00, 000:00, 00:00, 00, or 0 format."
      );
    }
  };

  // Handle modal submission (Add or Edit)
  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true); // Start submitting loader
        const formValues = {
          ...values,
          date: values.date.format("YYYY-MM-DD"), // Convert date to string
          nextGrdRun: values.nextGrdRun
            ? values.nextGrdRun.format("YYYY-MM-DD")
            : null,
          actionNotes: values.actionNotes || "",
          entryNotes: values.entryNotes || "",
          notes: values.notes || "",
          // Convert helicopter and engine hours to "0000:00" format for backend storage
          heliPresentHrs: formatTimeForStorage(values.heliPresentHrs),
          engPresentHrsL: formatTimeForStorage(values.engPresentHrsL),
          engPresentHrsR: formatTimeForStorage(values.engPresentHrsR),
          totalEngPresentHrsL: formatTimeForStorage(values.totalEngPresentHrsL),
          totalEngPresentHrsR: formatTimeForStorage(values.totalEngPresentHrsR),
          mgbPresentHrs: formatTimeForStorage(values.mgbPresentHrs),
          totalMgbHours: formatTimeForStorage(values.totalMgbHours),
          inspectionLeft: formatTimeForStorage(values.inspectionLeft),
          inspectionCycle: values.inspectionCycle,
        };

        try {
          if (editingHeli) {
            // Update existing helicopter
            await axiosInstance.put(
              `${import.meta.env.VITE_API_URL}/api/helicopters/${
                editingHeli._id
              }`,
              formValues
            );
            setHelicopters((prevHelicopters) =>
              prevHelicopters.map((heli) =>
                heli._id === editingHeli._id ? { ...heli, ...formValues } : heli
              )
            );
            message.success("Helicopter updated successfully");
          } else {
            // Add new helicopter
            const { data } = await axiosInstance.post(
              `${import.meta.env.VITE_API_URL}/api/helicopters`,
              formValues
            );
            setHelicopters([
              ...helicopters,
              {
                ...data,
                image:
                  "https://via.placeholder.com/300x200?text=" + data.heliSerNo,
              },
            ]);
            message.success("Helicopter added successfully");
          }
        } catch (error) {
          message.error("Error saving helicopter: " + error.message);
        } finally {
          setIsModalOpen(false);
          setSubmitting(false); // Stop submitting loader
          form.resetFields();
        }
      })
      .catch((error) => {
        message.error(
          "Form validation failed. Please correct the errors and try again."
        );
      });
  };

  // Handle modal cancellation
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Handle deleting helicopter
  const handleDelete = async (heliId) => {
    setLoading(true); // Start the loader
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_API_URL}/api/helicopters/${heliId}`
      );
      setHelicopters(helicopters.filter((heli) => heli._id !== heliId));
      message.success("Helicopter deleted successfully");
    } catch (error) {
      message.error("Error deleting helicopter: " + error.message);
    } finally {
      setLoading(false); // Stop the loader
    }
  };

  // Filter helicopters by type based on the active tab
  const filteredHelicopters = helicopters.filter(
    (heli) => heli.type === activeTab
  );

  return (
    <div className=" p-5">
      <h2 className="text-2xl font-bold mb-4 text-center">All Helicopters</h2>

      {/* Add New Helicopter Button */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: "20px" }}
      >
        Add Helicopter
      </Button>

      {/* Tab Options for Helicopter Types */}
      <Tabs defaultActiveKey="MI-17" onChange={setActiveTab}>
        <TabPane tab="MI-17" key="MI-17">
          {loading ? (
            <Spin tip="Loading helicopters..." />
          ) : filteredHelicopters.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredHelicopters.map((heli) => (
                <Col key={heli._id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    cover={<img alt={img} src={img} />}
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`/helidetails/${heli._id}`, { state: heli })
                        }
                      />,
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => showModal(heli)}
                      />,
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(heli._id)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={heli.name}
                      description={`Serial: ${heli.heliSerNo}`}
                    />
                    <p>
                      Present Hours:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.heliPresentHrs)
                      )}
                    </p>
                    <p>
                      Eng Hrs Left:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.engPresentHrsL)
                      )}
                    </p>
                    <p>
                      Eng Hrs Right:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.engPresentHrsR)
                      )}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No Helicopters Added" />
          )}
        </TabPane>

        <TabPane tab="MI-171" key="MI-171">
          {loading ? (
            <Spin tip="Loading helicopters..." />
          ) : filteredHelicopters.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredHelicopters.map((heli) => (
                <Col key={heli._id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    cover={<img alt={heli.name} src={heli.image} />}
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`/helidetails/${heli._id}`, { state: heli })
                        }
                      />,
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => showModal(heli)}
                      />,
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(heli._id)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={heli.name}
                      description={`Serial: ${heli.heliSerNo}`}
                    />
                    <p>
                      Present Hours:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.heliPresentHrs)
                      )}
                    </p>
                    <p>
                      Eng Hrs Left:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.engPresentHrsL)
                      )}
                    </p>
                    <p>
                      Eng Hrs Right:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.engPresentHrsR)
                      )}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No Helicopters Added" />
          )}
        </TabPane>

        <TabPane tab="MI-171sh" key="MI-171sh">
          {loading ? (
            <Spin tip="Loading helicopters..." />
          ) : filteredHelicopters.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredHelicopters.map((heli) => (
                <Col key={heli._id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    cover={<img alt={heli.name} src={heli.image} />}
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`/helidetails/${heli._id}`, { state: heli })
                        }
                      />,
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => showModal(heli)}
                      />,
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(heli._id)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={heli.name}
                      description={`Serial: ${heli.heliSerNo}`}
                    />
                    <p>
                      Present Hours:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.heliPresentHrs)
                      )}
                    </p>
                    <p>
                      Eng Hrs Left:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.engPresentHrsL)
                      )}
                    </p>
                    <p>
                      Eng Hrs Right:{" "}
                      {convertMinutesToTime(
                        convertTimeToMinutes(heli.engPresentHrsR)
                      )}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No Helicopters Added" />
          )}
        </TabPane>
      </Tabs>

      {/* Add/Edit Helicopter Modal */}
      <Modal
        title={editingHeli ? "Edit Helicopter" : "Add New Helicopter"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingHeli ? "Update" : "Add"}
        cancelText="Cancel"
        confirmLoading={submitting} // Show loading spinner during form submission
      >
        <Form form={form} layout="vertical">
          {/* Date of Added */}
          <Form.Item
            name="date"
            label="Date of Added"
            rules={[{ required: true, message: "Please select the date" }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          {/* Next Ground Run Date */}
          <Form.Item
            name="nextGrdRun"
            label="Next Ground Run Date"
            rules={[
              {
                required: true,
                message: "Please select the next ground run date",
              },
            ]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          {/* Heli Serial Number */}
          <Form.Item
            name="heliSerNo"
            label="Helicopter Serial Number"
            rules={[
              { required: true, message: "Please enter the serial number" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Helicopter Type */}
          <Form.Item
            name="type"
            label="Helicopter Type"
            rules={[
              { required: true, message: "Please select the helicopter type" },
            ]}
          >
            <Select placeholder="Select helicopter type">
              <Option value="MI-17">MI-17</Option>
              <Option value="MI-171">MI-171</Option>
              <Option value="MI-171sh">MI-171sh</Option>
            </Select>
          </Form.Item>

          {/* Helicopter Present Hours */}
          <Form.Item
            name="heliPresentHrs"
            label="Helicopter Present Hours"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Engine Present Hours Left */}
          <Form.Item
            name="engPresentHrsL"
            label="Engine Present Hours (Left)"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Engine Present Hours Right */}
          <Form.Item
            name="engPresentHrsR"
            label="Engine Present Hours (Right)"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Total Engine Present Hours Left */}
          <Form.Item
            name="totalEngPresentHrsL"
            label="Total Engine Hours (Left)"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Total Engine Present Hours Right */}
          <Form.Item
            name="totalEngPresentHrsR"
            label="Total Engine Hours (Right)"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* MGB Present Hours */}
          <Form.Item
            name="mgbPresentHrs"
            label="MGB Present Hours"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Total MGB Hours */}
          <Form.Item
            name="totalMgbHours"
            label="Total MGB Hours"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Total Landings */}
          <Form.Item
            name="totalLdg"
            label="Total Landings"
            rules={[
              { required: true, message: "Please enter the total landings" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* APU Hours */}
          <Form.Item
            name="apuHrs"
            label="APU Hours"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* APU ST */}
          <Form.Item
            name="apuSt"
            label="APU ST"
            rules={[{ required: true, message: "Please enter the APU ST" }]}
          >
            <Input />
          </Form.Item>

          {/* APU A/B */}
          <Form.Item
            name="apuAB"
            label="APU A/B"
            rules={[{ required: true, message: "Please enter the APU A/B" }]}
          >
            <Input />
          </Form.Item>

          {/* Gen Mode */}
          <Form.Item
            name="genMode"
            label="Gen Mode"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>

          {/* Inspection Cycle */}
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
              <Option value="25±5">25±5</Option>
              <Option value="50±10">50±10</Option>
              <Option value="100±5">100±5</Option>
              <Option value="200±5">200±5</Option>
              <Option value="300±5">300±5</Option>
            </Select>
          </Form.Item>

          {/* Inspection Left */}
          <Form.Item
            name="inspectionLeft"
            label="Inspection Left"
            rules={[{ required: true, validator: validateTimeFormat }]}
          >
            <Input placeholder="0000:00" />
          </Form.Item>
          {/* Action Notes */}
          <Form.Item name="actionNotes" label="Action Notes">
            <Input.TextArea
              rows={3}
              placeholder="Enter action notes (optional)"
            />
          </Form.Item>

          {/* Entry Notes */}
          <Form.Item name="entryNotes" label="Entry Notes">
            <Input.TextArea
              rows={3}
              placeholder="Enter entry notes (optional)"
            />
          </Form.Item>

          {/* General Notes */}
          <Form.Item name="notes" label="General Notes">
            <Input.TextArea
              rows={3}
              placeholder="Enter general notes (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlHeli;
