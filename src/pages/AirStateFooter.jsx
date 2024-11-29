import { message } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

const AirStateFooter = ({ logs }) => {
  const bangladeshDate = dayjs().tz("Asia/Dhaka").format("DD MMM YY");

  const [helicopterCounts, setHelicopterCounts] = useState({
    total: 0,
    svc: 0,
    us: 0,
    ri: 0,
  });

  useEffect(() => {
    if (logs && logs.length > 0) {
      message.success("Logs fetched successfully");

      const total = logs.length;
      const svc = logs.filter((heli) => heli.status === "SVC").length;
      const us = logs.filter((heli) => heli.status === "U/S").length;
      const ri = us; // Assuming R&I corresponds to U/S count

      setHelicopterCounts({ total, svc, us, ri });
    } else {
      setHelicopterCounts({ total: 0, svc: 0, us: 0, ri: 0 });
      message.info("No logs found for this date");
    }
  }, [logs]);

  const formatCount = (count) =>
    count > 0 ? String(count).padStart(2, "0") : "NILL";

  return (
    <div className={`px-6 text-sm`}>
      {/* Helicopter Counts */}
      <div className="flex flex-wrap justify-start gap-7 font-bold text-sm mb-2">
        <p>TOTAL HELI: {formatCount(helicopterCounts.total)}</p>
        <p>SVC: {formatCount(helicopterCounts.svc)}</p>
        <p>U/S: {formatCount(helicopterCounts.us)}</p>
        <p>R&I: {formatCount(helicopterCounts.ri)}</p>
      </div>

      {/* Logs */}
      {logs.map((log, index) => (
        <div key={index} className="">
          {/* Render Entry Notes */}
          {log.entryNotes && log.entryNotes.trim() && (
            <div>
              <p className="inline-block font-bold border-b-2 border-black pb-2 ">
                ENTRY: HEL-{log.heliSerNo || ""}:
              </p>
              {log.entryNotes.split(/\n/).map((entry, i) => (
                <p key={i} className="ml-8 lg:ml-12  text-sm">
                  {i + 1}. {entry}
                </p>
              ))}
            </div>
          )}

          {/* Render Action Notes */}
          {log.actionNotes && log.actionNotes.trim() && (
            <div>
              <p className="inline-block font-bold border-b-2 border-black pb-2">
                ACTION: HEL-{log.heliSerNo || ""}:
              </p>
              {log.actionNotes.split(/\n/).map((entry, i) => (
                <p key={i} className="ml-8 lg:ml-12  text-sm">
                  {i + 1}. {entry}
                </p>
              ))}
            </div>
          )}

          {/* Render General Notes */}
          {log.notes && log.notes.trim() && (
            <div>
              <p className="inline-block font-bold border-b-2 border-black pb-1">
                NOTE: HEL-{log.heliSerNo || ""}:
              </p>
              {log.notes.split(/\n/).map((entry, i) => (
                <p key={i} className="ml-8 lg:ml-12  text-sm">
                  {i + 1}. {entry}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Certification */}
      <p className="inline-block font-bold border-b-2 border-black pb-2 ">
        CERTIFICATE:
      </p>
      <span className="pl-2 font-semibold">
        CERTIFIED THAT ALL THE HELICOPTERS AND GROUND EQUIPMENTS OF MI-17 F/L
        ARE LASHED AND PICKETED PROPERLY INSIDE THE HANGERS
      </span>
      <div>
        {logs.acMis ? (
          <p className="font-bold ml-28 mb-4">ACMIS IS UPDATED</p>
        ) : (
          <p className="font-bold ml-28 mb-4">ACMIS IS NOT UPDATED</p>
        )}
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-7 mt-6">
        <div>
          <p
            style={{
              marginBottom: "2.5rem",
              display: "inline-block",
              fontWeight: "600", 
              paddingBottom:'5px',
              borderBottom: "2px solid black",
            }}
          >
            Prepared by:
          </p>
          <p>{logs[0]?.preRoleAndName || ""}</p>
          <p>{logs[0]?.preparedDate || ""}</p>
        </div>
        <div>
          <p
            style={{
              marginBottom: "2.5rem",
              display: "inline-block",
              fontWeight: "600",
              borderBottom: "2px solid black",
              paddingBottom:'5px',
            }}
          >
            Supervised by:
          </p>
          <p>{logs[0]?.supRoleAndName || ""}</p>
          <p style={{
              paddingBottom:'5px',
            }}>{logs[0]?.preparedDate || ""}</p>
        </div>
      </div>
    </div>
  );
};

export default AirStateFooter;
