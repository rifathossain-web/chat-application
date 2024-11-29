import { Button, Card, Col, Progress, Row } from 'antd';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';

const HeliDetails = () => {
  const { state: helicopter } = useLocation(); // Access the passed data
  const navigate = useNavigate(); // Hook for navigating back
  
  // Helper function to convert various time formats into total minutes
  const convertTimeToMinutes = (timeString) => {
    if (!timeString.includes(':')) {
      return Number(timeString) * 60; // Convert hours to minutes if no colon
    }
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0); // Total minutes
  };

  // Helper function to format time for display, removing unnecessary leading zeros
  const convertTimeToDisplay = (timeString) => {
    const minutes = convertTimeToMinutes(timeString);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes}`;
  };

  // Calculate percentage for each type of hours
  const calculateProgress = (present, total) => {
    if (!present || !total || present === "000:00" || total === "000:00") return 0;
    const presentMinutes = convertTimeToMinutes(present);
    const totalMinutes = convertTimeToMinutes(total);
    if (totalMinutes === 0) return 0;
    return Math.min((presentMinutes / totalMinutes) * 100, 100); // Cap at 100%
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button onClick={() => navigate(-1)} type="primary" style={{ marginBottom: '20px' }}>
        Back to List
      </Button>

      <Card title={`Helicopter Details: ${helicopter.type} (Serial: ${helicopter.heliSerNo})`} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <p><strong>Date Added:</strong> {moment(helicopter.date).format('YYYY-MM-DD')}</p>
          </Col>
          <Col span={12}>
            <p><strong>Total Landings:</strong> {helicopter.totalLdg}</p>
          </Col>

          {/* Helicopter Present Hours */}
          <Col span={12}>
            <h4>Helicopter Present Hours</h4>
            <p>{convertTimeToDisplay(helicopter.heliPresentHrs)}</p>
          </Col>

          {/* Engine Hours Left */}
          <Col span={12}>
            <h4>Engine Present Hours (Left)</h4>
            <p>{convertTimeToDisplay(helicopter.engPresentHrsL)} / {convertTimeToDisplay(helicopter.totalEngPresentHrsL)}</p>
            <Progress 
              percent={calculateProgress(helicopter.engPresentHrsL, helicopter.totalEngPresentHrsL)} 
              strokeColor="#1890ff" 
              format={percent => `${percent.toFixed(1)}%`}
            />
          </Col>

          {/* Engine Hours Right */}
          <Col span={12}>
            <h4>Engine Present Hours (Right)</h4>
            <p>{convertTimeToDisplay(helicopter.engPresentHrsR)} / {convertTimeToDisplay(helicopter.totalEngPresentHrsR)}</p>
            <Progress 
              percent={calculateProgress(helicopter.engPresentHrsR, helicopter.totalEngPresentHrsR)} 
              strokeColor="#1890ff" 
              format={percent => `${percent.toFixed(1)}%`}
            />
          </Col>

          {/* MGB Present Hours */}
          <Col span={12}>
            <h4>MGB Present Hours</h4>
            <p>{convertTimeToDisplay(helicopter.mgbPresentHrs)} / {convertTimeToDisplay(helicopter.totalMgbHours)}</p>
            <Progress 
              percent={calculateProgress(helicopter.mgbPresentHrs, helicopter.totalMgbHours)} 
              strokeColor="#ff4d4f" 
              format={percent => `${percent.toFixed(1)}%`}
            />
          </Col>

          {/* APU Section */}
          <Col span={12}>
            <h4>APU Hours</h4>
            <p>{convertTimeToDisplay(helicopter.apuHrs)}</p>
          </Col>
          <Col span={12}>
            <h4>APU ST</h4>
            <p>{helicopter.apuSt}</p>
          </Col>
          <Col span={12}>
            <h4>APU A/B</h4>
            <p>{helicopter.apuAB}</p>
          </Col>

          {/* Generator Mode */}
          <Col span={12}>
            <h4>Gen Mode</h4>
            <p>{convertTimeToDisplay(helicopter.genMode)}</p>
          </Col>

          {/* Inspection Section */}
          <Col span={12}>
            <h4>Inspection Cycle</h4>
            <p>{convertTimeToDisplay(helicopter.inspectionCycle)}</p>
          </Col>
          <Col span={12}>
            <h4>Inspection Left</h4>
            <p>{convertTimeToDisplay(helicopter.inspectionLeft)} / {convertTimeToDisplay(helicopter.inspectionCycle)}</p>
            <Progress 
              percent={calculateProgress(helicopter.inspectionLeft, helicopter.inspectionCycle)} 
              strokeColor="#52c41a" 
              format={percent => `${percent.toFixed(1)}%`}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HeliDetails;
