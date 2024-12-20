import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Input, message, Modal } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import styles from "./AirStateTable.module.css";

const AirStateTable = ({ logs, onEdit, onDelete, showActions = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const handleEdit = (record) => {
    setEditingRecord({ ...record });
    setIsEditing(true);
  };

  const saveChanges = async () => {
    try {
      await onEdit(editingRecord);
      setIsEditing(false);
      message.success("Log updated successfully");
    } catch {
      message.error("Failed to update log");
    }
  };

  return (
    <div className={`${styles.container} p-4 overflow-x-auto`}>
      <table className={`${styles.table} min-w-full`}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.headerCell} rowSpan="2">
              HELI SER NO
            </th>
            <th className={styles.headerCell} rowSpan="2">
              STATUS
            </th>
            <th className={styles.headerCell} rowSpan="2">
              DAILY FLG HRS & SORTIES
            </th>
            <th className={styles.headerCell} rowSpan="2">
              HELI PRESENT HRS
            </th>
            <th className={styles.headerCell} rowSpan="2">
              NEXT IDLE G/R (7+3 DAYS) DUE ON
            </th>
            <th className={`${styles.headerCell} pb-5`} colSpan="2">
              ENG HRS
            </th>
            <th className={styles.headerCell} colSpan="2">
              MGB HRS
            </th>
            <th className={styles.headerCell} colSpan="2">
              LANDING
            </th>
            <th className={styles.headerCell} colSpan="4">
              APU STATUS
            </th>
            <th className={styles.headerCell} colSpan="2">
              PERIODIC INSP
            </th>
            <th className={styles.headerCell} rowSpan="2">
              LOCATION
            </th>
            {showActions && (
              <th className={styles.headerCell} rowSpan="2">
                ACTIONS
              </th>
            )}
          </tr>
          <tr className={styles.headerRow}>
            <th className={styles.subHeaderCell}>PRESENT HRS</th>
            <th className={styles.subHeaderCell}>HRS LEFT FOR O/H</th>
            <th className={styles.subHeaderCell}>PRESENT HRS</th>
            <th className={styles.subHeaderCell}>HRS LEFT FOR O/H</th>
            <th className={styles.subHeaderCell}>DAILY LDG</th>
            <th className={styles.subHeaderCell}>TTL LDG</th>
            <th className={styles.subHeaderCell}>HRS</th>
            <th className={styles.subHeaderCell}>ST</th>
            <th className={styles.subHeaderCell}>A/B</th>
            <th className={styles.subHeaderCell}>GEN MODE</th>
            <th className={styles.subHeaderCell}>25 HRS INSP/HRS LEFT</th>
            <th className={styles.subHeaderCell}>NEXT INSP & O/H HRS LEFT</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((record) => (
            <React.Fragment key={record._id}>
              <tr className={styles.dataRow}>
                <td className={styles.cell} rowSpan="2">
                  {record.heliSerNo}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.status}
                </td>
                <td className={styles.cell} rowSpan="2">
                  <div>{record.dailyFlyingHours || "-"}</div>
                  <div>{record.sorties || "-"}</div>
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.heliPresentHrs}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {dayjs(record.nextGrdRun).format("DD.MM.YY")}
                </td>
                <td className={styles.cell}>L: {record.engPresentHrsL}</td>
                <td className={styles.cell}>{record.leftEngHrsLeftForOH}</td>
                <td className={styles.cell} rowSpan="2">
                  {record.mgbPresentHrs}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.MgbHrsLeftForOH}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.dailyLdg}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.totalLdg}
                  {console.log(record.totalLdg)}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.apuHrs}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.apuSt}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.apuAB}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.genMode}
                </td>
                {/* First TD - Condition for inspectionCycle being 25±5 */}
                <td className={styles.cell} rowSpan="2">
                  {record.inspectionCycle === "25±5" ? (
                    <>
                      <div>{record.inspectionCycle}</div>
                      <div className="font-bold">{record.inspectionLeft}</div>
                    </>
                  ) : (
                    <>
                      <div>25±5</div>
                      <div>-</div>
                    </>
                  )}
                </td>

                {/* Second TD - If inspectionCycle is not 25±5, display data here */}
                <td className={styles.cell} rowSpan="2">
                  {record.inspectionCycle !== "25±5" ? (
                    <>
                      <div>{record.inspectionCycle}</div>
                      <div className="font-bold">{record.inspectionLeft}</div>
                    </>
                  ) : (
                    <> {/* Blank for 25±5 cycles */} </>
                  )}
                </td>
                <td className={styles.cell} rowSpan="2">
                  {record.location}
                </td>
                {showActions && (
                  <td className={styles.cell} rowSpan="2">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEdit(record)}
                        className={styles.editButton}
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => onDelete(record._id)}
                        className={styles.deleteButton}
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
              <tr className={styles.dataRow}>
                <td className={styles.cell}>R: {record.engPresentHrsR}</td>
                <td className={styles.cell}>{record.rightEngHrsLeftForOH}</td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {editingRecord && (
        <Modal
          title={`Edit Log Entry: Helicopter ${editingRecord.heliSerNo}`}
          visible={isEditing}
          onOk={saveChanges}
          onCancel={() => setIsEditing(false)}
        >
          {/* Helicopter Serial No (Read-Only) */}
          <label className="block mb-1">Helicopter Serial No:</label>
          <Input
            value={editingRecord.heliSerNo}
            onChange={(e) =>
              setEditingRecord({ ...editingRecord, heliSerNo: e.target.value })
            }
            className="mb-3"
            disabled
          />

          {/* Status */}
          <label className="block mb-1">Status:</label>
          <Input
            value={editingRecord.status}
            onChange={(e) =>
              setEditingRecord({ ...editingRecord, status: e.target.value })
            }
            className="mb-3"
          />

          {/* Daily Flying Hours */}
          <label className="block mb-1">Daily Flying Hours:</label>
          <Input
            value={editingRecord.dailyFlyingHours}
            onChange={(e) =>
              setEditingRecord({
                ...editingRecord,
                dailyFlyingHours: e.target.value,
              })
            }
            className="mb-3"
          />

          {/* Sorties */}
          <label className="block mb-1">Sorties:</label>
          <Input
            value={editingRecord.sorties}
            onChange={(e) =>
              setEditingRecord({ ...editingRecord, sorties: e.target.value })
            }
            className="mb-3"
          />

          {/* Heli Present Hrs */}
          <label className="block mb-1">Heli Present Hrs:</label>
          <Input
            value={editingRecord.heliPresentHrs}
            onChange={(e) =>
              setEditingRecord({
                ...editingRecord,
                heliPresentHrs: e.target.value,
              })
            }
            className="mb-3"
          />

          {/* Action Notes */}
          <label className="block mb-1">Action Notes:</label>
          <Input.TextArea
            value={editingRecord.actionNotes}
            onChange={(e) =>
              setEditingRecord({
                ...editingRecord,
                actionNotes: e.target.value,
              })
            }
            rows={4}
            className="mb-3"
          />

          {/* Entry Notes */}
          <label className="block mb-1">Entry Notes:</label>
          <Input.TextArea
            value={editingRecord.entryNotes}
            onChange={(e) =>
              setEditingRecord({ ...editingRecord, entryNotes: e.target.value })
            }
            rows={4}
            className="mb-3"
          />
          {/*  Notes */}
          <label className="block mb-1">Notes:</label>
          <Input.TextArea
            value={editingRecord.notes}
            onChange={(e) =>
              setEditingRecord({ ...editingRecord, notes: e.target.value })
            }
            rows={4}
            className="mb-3"
          />
        </Modal>
      )}
    </div>
  );
};

export default AirStateTable;
