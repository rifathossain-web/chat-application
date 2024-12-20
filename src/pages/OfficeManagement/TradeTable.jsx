// src/components/TradeTable.js

import { PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Divider, Input, message, Modal, Select, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Adjust the path if necessary

const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;

// Disposals that require a date range
const DISPOSALS_REQUIRING_DATE_RANGE = new Set([
  'Early Morning Shift',
  'Morning shift',
  'A/N Shift',
  'Night Flying',
  'Module/Course',
  // Add other disposals here
]);

const TradeTable = ({ tradeName }) => {
  const { users, usersLoading, editUser } = useAuth();
  const [disposalOptions, setDisposalOptions] = useState([
    {
      groupName: 'Shifts',
      subOptions: ['Early Morning Shift', 'Morning shift', 'A/N Shift', 'Night Flying']
    },
    'Leave',
    {
      groupName: 'AWOL/Detention/FU/BOI',
      subOptions: ['AWOL', 'Detention', 'FU', 'BOI']
    },
    'Module/Course',
    {
      groupName: 'CMH/BNS/BSH/Qrnt/CAT\'C',
      subOptions: ['CMH', 'BNS', 'BSH', 'Qrnt', "CAT'C"]
    },
    'Sick Report/Covid',
    'TD',
    {
      groupName: 'ED/Ex PPGF/Escort off',
      subOptions: ['ED', 'Ex PPGF', 'Escort off']
    },
    {
      groupName: 'Mess/Canteen',
      subOptions: ['Mess', 'Canteen']
    },
    {
      groupName: 'Duty Options',
      subOptions: ['Duty Off', 'Guard Duty', "Task Force", "QCI", "Gale", 'K/O']
    },
    {
      groupName: 'Task Assignments',
      subOptions: ['CCTV', 'GST', 'U/C', 'U/A', 'UA']
    }
  ]);

  const [newDisposal, setNewDisposal] = useState('');
  const [addingDisposal, setAddingDisposal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Optional: For additional functionalities

  // Filter users based on trade
  const filteredUsers = users
    .filter(user => user.trade.toLowerCase() === tradeName.toLowerCase())
    .map((user, index) => ({
      key: user._id,
      sl: index + 1,
      bdNo: user.BdNUmber,
      rank: user.rank,
      name: user.fullName,
      trade: user.trade,
      disposal: user.disposal || '',
      date: user.date ? dayjs(user.date).format('DD-MM-YY') : null,
      dateRange: user.dateRange || [],
    }));

  // Handle disposal selection
  const handleDisposalChange = (value, key) => {
    const updatedUsers = filteredUsers.map(user => {
      if (user.key === key) {
        const requiresDate = DISPOSALS_REQUIRING_DATE_RANGE.has(value);
        return {
          ...user,
          disposal: value,
          date: requiresDate ? dayjs().format('DD-MM-YY') : null,
          dateRange: requiresDate ? [dayjs().format('DD-MM-YY'), dayjs().format('DD-MM-YY')] : [],
        };
      }
      return user;
    });
    // Optionally, you can manage state here if needed
    // For simplicity, we're directly updating the context via editUser on save
  };

  // Handle date range selection
  const handleDateRangeChange = (dates, dateStrings, key) => {
    const updatedUsers = filteredUsers.map(user => {
      if (user.key === key) {
        return {
          ...user,
          date: dateStrings[0],
          dateRange: dateStrings,
        };
      }
      return user;
    });
    // Optionally, manage state here if needed
  };

  // Handle disposal submission
  const handleSubmitRow = async (record) => {
    // Validation
    if (!record.disposal) {
      message.error('Disposal option is required.');
      return;
    }
    if (DISPOSALS_REQUIRING_DATE_RANGE.has(record.disposal) && record.dateRange.length !== 2) {
      message.error('Date range is required for this disposal option.');
      return;
    }

    try {
      // Prepare data for backend
      const updatedData = {
        disposal: record.disposal,
        date: record.date ? dayjs(record.date, 'DD-MM-YY').toISOString() : null,
        dateRange: record.dateRange.length === 2
          ? [
              dayjs(record.dateRange[0], 'DD-MM-YY').toISOString(),
              dayjs(record.dateRange[1], 'DD-MM-YY').toISOString()
            ]
          : [],
      };

      // Update user via context
      await editUser(record.key, updatedData);

      message.success(`User ${record.name}'s disposal updated successfully.`);
    } catch (error) {
      // Errors are handled within the context
    }
  };

  // Add new disposal option
  const addNewDisposal = () => {
    const trimmed = newDisposal.trim();
    if (!trimmed) {
      message.error('Disposal option cannot be empty.');
      return;
    }

    // Check if disposal already exists
    const exists = disposalOptions.some(option => {
      if (typeof option === 'string') {
        return option.toLowerCase() === trimmed.toLowerCase();
      }
      return option.subOptions.some(sub => sub.toLowerCase() === trimmed.toLowerCase());
    });

    if (exists) {
      message.error('This disposal option already exists.');
      return;
    }

    // Add as a new group without subOptions
    setDisposalOptions([...disposalOptions, trimmed]);
    message.success('Disposal option added successfully.');
    setNewDisposal('');
    setAddingDisposal(false);
  };

  // Define table columns
  const columns = [
    { title: 'SL', dataIndex: 'sl', key: 'sl' },
    { title: 'BD/NO', dataIndex: 'bdNo', key: 'bdNo' },
    { title: 'RANK', dataIndex: 'rank', key: 'rank' },
    { title: 'NAME', dataIndex: 'name', key: 'name' },
    { title: 'TRADE', dataIndex: 'trade', key: 'trade' },
    {
      title: 'DISPOSAL',
      dataIndex: 'disposal',
      key: 'disposal',
      render: (text, record) => (
        <Select
          showSearch
          placeholder="Select disposal"
          value={text || undefined}
          onChange={(value) => handleDisposalChange(value, record.key)}
          style={{ width: '100%' }}
          filterOption={(input, option) => {
            if (option.children) {
              return option.children.toLowerCase().includes(input.toLowerCase());
            }
            return false;
          }}
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
                <Input
                  placeholder="Add new disposal"
                  value={newDisposal}
                  onChange={(e) => setNewDisposal(e.target.value)}
                  onPressEnter={addNewDisposal}
                  disabled={addingDisposal}
                />
                <Button
                  type="link"
                  onClick={addNewDisposal}
                  icon={<PlusOutlined />}
                  disabled={addingDisposal}
                >
                  Add Disposal
                </Button>
              </div>
            </div>
          )}
        >
          {disposalOptions.map((option, index) => {
            if (typeof option === 'object' && option.subOptions) {
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
            return <Option key={option} value={option}>{option}</Option>;
          })}
        </Select>
      ),
    },
    {
      title: 'Date Range',
      key: 'dateRange',
      render: (text, record) => {
        const requiresDateRange = DISPOSALS_REQUIRING_DATE_RANGE.has(record.disposal);
        return requiresDateRange ? (
          <RangePicker
            value={record.dateRange.length ? [dayjs(record.dateRange[0], 'DD-MM-YY'), dayjs(record.dateRange[1], 'DD-MM-YY')] : []}
            onChange={(dates, dateStrings) => handleDateRangeChange(dates, dateStrings, record.key)}
            format="DD-MM-YY"
          />
        ) : null;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleSubmitRow(record)}>
          Save
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Table for managing disposals */}
      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="key"
        loading={usersLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      {/* Modal for adding new disposal (optional) */}
      <Modal
        title="Add New Disposal Option"
        visible={addingDisposal}
        onCancel={() => setAddingDisposal(false)}
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

      {/* Optional: Display JSON data for debugging */}
      {/* <div style={{ marginTop: 32 }}>
        <h3>Current Data</h3>
        <pre style={{ background: '#f6f6f6', padding: '16px', borderRadius: '4px' }}>
          {JSON.stringify(filteredUsers, null, 2)}
        </pre>
      </div> */}
    </div>
  );
};

export default TradeTable;
