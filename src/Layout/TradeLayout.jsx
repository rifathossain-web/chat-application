import { Spin, Tabs, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Afr, Armt, EI, Eng, Rf } from '../pages/OfficeManagement/Trades';

const { TabPane } = Tabs;

// Map backend trade names to lowercase keys
const tradeKeyMap = {
  "AFR": "afr",
  "ENG": "eng",
  "E&I": "ei",
  "R/F": "rf",
  "ARMT": "armt"
};

const TradeLayout = () => {
  const { user, users, fetchUsers, usersLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [localLoading, setLocalLoading] = useState(true);

  // If user.trade is a single value like "AFR", normalize it
  const userTradeRaw = user?.trade || ''; // For example: "AFR"
  const userTrade = userTradeRaw
    ? (tradeKeyMap[userTradeRaw] || userTradeRaw.toLowerCase())
    : '';

  // Extract currentTab from URL
  const currentTab = location.pathname.split('/').pop();

  const allTrades = [
    { key: 'afr', label: 'AFR' },
    { key: 'eng', label: 'ENG' },
    { key: 'ei', label: 'E&I' },
    { key: 'rf', label: 'R/F' },
    { key: 'armt', label: 'ARMT' },
  ];

  // Filter tabs based on user role
  const filteredTabs = user?.role === 'admin'
    ? allTrades
    : allTrades.filter(tab => tab.key === userTrade);

  const validTabKeys = filteredTabs.map(t => t.key);
  const defaultTab = userTrade || (filteredTabs.length > 0 ? filteredTabs[0].key : 'afr');
  const activeTab = validTabKeys.includes(currentTab) ? currentTab : defaultTab;

  // Pre-filtering function for single trade values
  const filterUsersByTrade = (allUsers, tradeKey) => {
    return allUsers.filter((u) => {
      const normalizedTrade = u.trade
        ? (tradeKeyMap[u.trade] || u.trade.toLowerCase())
        : '';
      return normalizedTrade === tradeKey;
    });
  };

  // State for each trade's users
  const [afrUsers, setAfrUsers] = useState([]);
  const [engUsers, setEngUsers] = useState([]);
  const [eiUsers, setEiUsers] = useState([]);
  const [rfUsers, setRfUsers] = useState([]);
  const [armtUsers, setArmtUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // If admin and users not fetched, fetch them
      if (user?.role === 'admin' && users === null) {
        await fetchUsers();
      }

      if (user && Array.isArray(users)) {
        // Filter users for each trade
        const afr = filterUsersByTrade(users, 'afr');
        const eng = filterUsersByTrade(users, 'eng');
        const ei = filterUsersByTrade(users, 'ei');
        const rf = filterUsersByTrade(users, 'rf');
        const armt = filterUsersByTrade(users, 'armt');

        setAfrUsers(afr);
        setEngUsers(eng);
        setEiUsers(ei);
        setRfUsers(rf);
        setArmtUsers(armt);

        // If the user's own trade has no users
        const userDefaultTradeUsers = filterUsersByTrade(users, userTrade);
        if (userTrade && userDefaultTradeUsers.length === 0) {
          message.warning('No users available for the selected trade.');
        }
      }

      setLocalLoading(false);
    };

    loadData();
  }, [user, users, userTrade, fetchUsers]);

  if (localLoading || usersLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const tradeComponents = {
    afr: <Afr users={afrUsers} />,
    eng: <Eng users={engUsers} />,
    ei: <EI users={eiUsers} />,
    rf: <Rf users={rfUsers} />,
    armt: <Armt users={armtUsers} />,
  };

  return (
    <div className="flex flex-col md:flex-row p-6">
      {/* Left Side Tabs (only if userTrade defined or admin) */}
      {(user?.role === 'admin' || userTrade) && (
        <div className="md:w-1/4 w-full mb-4 md:mb-0">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => navigate(`/trade/${key}`)}
            type="line"
            size="large"
            className="flex flex-col space-y-2"
          >
            {filteredTabs.map((tab) => (
              <TabPane
                tab={
                  <span className="font-medium text-lg text-blue-600 hover:text-blue-800 transition-all">
                    {tab.label}
                  </span>
                }
                key={tab.key}
              >
                {tradeComponents[tab.key]}
              </TabPane>
            ))}
          </Tabs>
        </div>
      )}

      {/* Main Content Area */}
      <div className="md:w-3/4 w-full">
        {/* Additional content can go here */}
      </div>
    </div>
  );
};

export default TradeLayout;
