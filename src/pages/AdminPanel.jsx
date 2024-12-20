// src/components/AdminPanel.js

import {
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
  Typography,
} from "antd";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import Highlighter from "react-highlight-words"; // For highlighting search terms

const { Option } = Select;
const { Text } = Typography;

const AdminPanel = () => {
  const {
    users,
    usersLoading,
    fetchUsers,
    editUser,
    deleteUser,
    user: currentUser, // To check if the current user is admin
  } = useAuth();

  const [editingUser, setEditingUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [filters, setFilters] = useState({
    role: [],
    isVerified: [],
    trade: [],
    maritalStatus: [],
  });

  // States for Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      if (!usersLoading && (!users || users.length === 0)) {
        fetchUsers();
      }

      if (users && users.length > 0) {
        // Set up filters based on users data
        const uniqueRoles = [...new Set(users.map((user) => user.role))];
        const uniqueTrades = [...new Set(users.map((user) => user.trade))];
        const uniqueMaritalStatus = [
          ...new Set(users.map((user) => user.maritalStatus)),
        ];
        const uniqueVerified = [...new Set(users.map((user) => user.isVerified))];

        setFilters({
          role: uniqueRoles.map((role) => ({ text: role, value: role })),
          isVerified: uniqueVerified.map((status) => ({
            text: status ? "Yes" : "No",
            value: status,
          })),
          trade: uniqueTrades.map((trade) => ({ text: trade, value: trade })),
          maritalStatus: uniqueMaritalStatus.map((status) => ({
            text: status,
            value: status,
          })),
        });
      }
    } else {
      message.error("You do not have permission to access the Admin Panel.");
    }
  }, [users, currentUser, fetchUsers, usersLoading]);

  // Handle editing user info
  const handleEditUser = async () => {
    if (
      !editingUser ||
      !editingUser.role ||
      editingUser.isVerified === undefined
    ) {
      message.error("Please fill in all required fields.");
      return;
    }

    setModalLoading(true);

    try {
      await editUser(editingUser._id, {
        role: editingUser.role,
        isVerified: editingUser.isVerified,
        fullName: editingUser.fullName,
        rank: editingUser.rank,
        
      });

      message.success("User updated successfully.");
      setEditingUser(null);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      // Error handling is already managed in AuthContext
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * Utility function to safely access nested object properties.
   * @param {object} obj - The object to traverse.
   * @param {string} path - The path string (e.g., 'permanentAddress.city').
   * @returns {any} - The value at the specified path or undefined.
   */
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  /**
   * Utility function to add search functionality to table columns.
   * @param {string} dataIndex - The dataIndex of the column.
   */
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
          placeholder={`Search ${dataIndex}`}
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
      <SearchOutlined
        style={{ color: filtered ? "#1890ff" : undefined }}
      />
    ),
    onFilter: (value, record) => {
      const recordValue = getNestedValue(record, dataIndex);
      return recordValue
        ? recordValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current && searchInput.current.select(), 100);
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

  /**
   * Handles the search action.
   * @param {Array} selectedKeys - The selected keys for the filter.
   * @param {Function} confirm - Function to confirm the filter.
   * @param {string} dataIndex - The dataIndex of the column.
   */
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0] || "");
    setSearchedColumn(dataIndex);
  };

  /**
   * Handles the reset action.
   * @param {Function} clearFilters - Function to clear the filters.
   */
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // Table columns
  const columns = [
    {
      title: "BdNumber",
      dataIndex: "BdNUmber",
      key: "BdNUmber",
      sorter: (a, b) => a.BdNUmber.localeCompare(b.BdNUmber),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("BdNUmber"),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("fullName"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("email"),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: filters.role,
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      filters: filters.isVerified,
      onFilter: (value, record) => record.isVerified === value,
      render: (text) => (text === true ? "Yes" : "No"),
      sorter: (a, b) => a.isVerified - b.isVerified,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Trade",
      dataIndex: "trade",
      key: "trade",
      filters: filters.trade,
      onFilter: (value, record) => record.trade === value,
      sorter: (a, b) => a.trade.localeCompare(b.trade),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      sorter: (a, b) => a.rank.localeCompare(b.rank),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("rank"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("status"),
    },
    {
      title: "City",
      dataIndex: ["permanentAddress", "city"],
      key: "city",
      sorter: (a, b) =>
        a.permanentAddress.city.localeCompare(b.permanentAddress.city),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("permanentAddress.city"),
    },
    {
      title: "Division",
      dataIndex: ["permanentAddress", "division"],
      key: "division",
      sorter: (a, b) =>
        a.permanentAddress.division.localeCompare(b.permanentAddress.division),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("permanentAddress.division"),
    },
    {
      title: "Marital Status",
      dataIndex: "maritalStatus",
      key: "maritalStatus",
      filters: filters.maritalStatus,
      onFilter: (value, record) => record.maritalStatus === value,
      sorter: (a, b) => a.maritalStatus.localeCompare(b.maritalStatus),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Blood Group",
      dataIndex: "bloodGroup",
      key: "bloodGroup",
      sorter: (a, b) => a.bloodGroup.localeCompare(b.bloodGroup),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("bloodGroup"),
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Date of Enrollment",
      dataIndex: "dateOfEnrollment",
      key: "dateOfEnrollment",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.dateOfEnrollment) - new Date(b.dateOfEnrollment),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Appointment",
      dataIndex: "appointment",
      key: "appointment",
      sorter: (a, b) => a.appointment.localeCompare(b.appointment),
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("appointment"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditingUser(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record._id, record.fullName)}
            danger
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  /**
   * Handles the deletion of a user with confirmation.
   * @param {string} userId - The ID of the user to delete.
   * @param {string} userName - The name of the user to delete (for confirmation message).
   */
  const handleDeleteUser = (userId, userName) => {
    Modal.confirm({
      title: `Are you sure you want to delete ${userName}?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteUser(userId);
          message.success("User deleted successfully.");
          fetchUsers(); // Refresh the users list
        } catch (error) {
          // Error handling is already managed in AuthContext
        }
      },
    });
  };

  // If users are loading, display a loader
  if (!currentUser || currentUser.role !== "admin") {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <>
      <Table
        dataSource={users}
        columns={columns}
        loading={usersLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          title={`Edit User: ${editingUser.fullName}`}
          visible={!!editingUser}
          onCancel={() => setEditingUser(null)}
          onOk={handleEditUser}
          confirmLoading={modalLoading}
          okText="Save"
        >
          <Form layout="vertical">
            {/* Role Field */}
            <Form.Item label="Role" required>
              <Select
                value={editingUser.role}
                onChange={(value) =>
                  setEditingUser({ ...editingUser, role: value })
                }
              >
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>

            {/* Full Name Field */}
            <Form.Item
              label="Full Name"
              required
              rules={[
                {
                  required: true,
                  message: "Please enter your full name",
                },
              ]}
            >
              <Input
                onChange={(e) =>
                  setEditingUser({ ...editingUser, fullName: e.target.value })
                }
                value={editingUser.fullName}
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
              />
            </Form.Item>
            <Form.Item
              label="Full Name"
              required
              rules={[
                {
                  required: true,
                  message: "Please enter your full name",
                },
              ]}
            >
              <Input
                onChange={(e) =>
                  setEditingUser({ ...editingUser, fullName: e.target.value })
                }
                value={editingUser.fullName}
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
              />
            </Form.Item>

            {/* Rank Field */}
            <Form.Item
              label="Rank"
              required
              rules={[
                {
                  required: true,
                  message: "Please enter your rank",
                },
              ]}
            >
              <Input
                onChange={(e) =>
                  setEditingUser({ ...editingUser, rank: e.target.value })
                }
                value={editingUser.rank}
                prefix={<IdcardOutlined />}
                placeholder="Enter your rank"
              />
            </Form.Item>

            {/* Verified Field */}
            <Form.Item label="Verified" required>
              <Select
                value={editingUser.isVerified ? "Yes" : "No"}
                onChange={(value) =>
                  setEditingUser({
                    ...editingUser,
                    isVerified: value === "Yes",
                  })
                }
              >
                <Option value="Yes">Yes</Option>
                <Option value="No">No</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default AdminPanel;
