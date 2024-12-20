import { Button, DatePicker, message, Table, Tabs, Input, Space } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React, { useState, useRef } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

// Extend Day.js with necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Define default timezone
const DEFAULT_TIMEZONE = 'Asia/Dhaka';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const SdState = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const dutyCategories = [
    'Guard Duty',
    'NP Task Force',
    'Base Task Force',
    '2nd Seater',
    'Halisahor TF',
    'Gale',
  ];

  const fetchSecurityDuties = async () => {
    if (dateRange.length < 2) {
      message.error('Please select a valid date range.');
      return;
    }

    const [startDate, endDate] = dateRange;

    const formattedStartDate = dayjs
      .tz(startDate, DEFAULT_TIMEZONE)
      .format('DD-MM-YYYY');
    const formattedEndDate = dayjs
      .tz(endDate, DEFAULT_TIMEZONE)
      .format('DD-MM-YYYY');

    setLoading(true);
    try {
      const response = await axios.get(
        'https://airstate-server.vercel.app/api/user-disposals/security-duties',
        {
          params: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          },
        }
      );
      setData(response.data.disposals);
      console.log(response.data.disposals)
    } catch (error) {
      console.error('Error fetching security duties:', error);
      message.error('Failed to fetch security duties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
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
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0] || '');
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const renderTable = (category) => {
    const filteredData = data.filter((duty) => duty.disposal === category);

    const uniqueRanks = [...new Set(data.map((item) => item.rank))];
    const uniqueTrades = [...new Set(data.map((item) => item.trade))];
    const uniqueDisposals = [...new Set(data.map((item) => item.disposal))];

    const columns = [
      {
        title: 'BD Number',
        dataIndex: 'BdNUmber',
        key: 'BdNUmber',
        sorter: (a, b) => a.BdNUmber.localeCompare(b.BdNUmber),
      },
      {
        title: 'Rank',
        dataIndex: 'rank',
        key: 'rank',
        filters: uniqueRanks.map(rank => ({ text: rank, value: rank })),
        onFilter: (value, record) => record.rank === value,
        sorter: (a, b) => a.rank.localeCompare(b.rank),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        ...getColumnSearchProps('name'),
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: 'Trade',
        dataIndex: 'trade',
        key: 'trade',
        filters: uniqueTrades.map(trade => ({ text: trade, value: trade })),
        onFilter: (value, record) => record.trade === value,
        sorter: (a, b) => a.trade.localeCompare(b.trade),
      },
      {
        title: 'Disposal',
        dataIndex: 'disposal',
        key: 'disposal',
        filters: uniqueDisposals.map(disposal => ({ text: disposal, value: disposal })),
        onFilter: (value, record) => record.disposal === value,
        sorter: (a, b) => a.disposal.localeCompare(b.disposal),
      },
      {
        title: 'Date',
        key: 'date',
        sorter: (a, b) => dayjs(a.startDate, 'DD-MM-YYYY').unix() - dayjs(b.startDate, 'DD-MM-YYYY').unix(),
        render: (_, record) => {
          if (record.startDate === record.endDate) {
            return <span>{record.startDate}</span>;
          }
          return (
            <span>
              {record.startDate} - {record.endDate}
            </span>
          );
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        style={{ marginTop: '20px' }}
      />
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Security Duties</h2>
      <RangePicker
        onChange={(dates) => setDateRange(dates)}
        style={{ marginBottom: '20px', marginRight: '10px' }}
        format="DD-MM-YYYY"
      />
      <Button type="primary" onClick={fetchSecurityDuties} loading={loading}>
        Fetch Duties
      </Button>
      <Tabs style={{ marginTop: '20px' }}>
        {dutyCategories.map((category) => (
          <TabPane tab={category} key={category}>
            {renderTable(category)}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default SdState;
