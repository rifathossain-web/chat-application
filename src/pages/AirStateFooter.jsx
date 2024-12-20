import { message } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Utility function to split text into sentences based on periods, question marks, exclamation points, and newlines.
 * It retains the punctuation at the end of each sentence and excludes lines that are only numbering.
 *
 * @param {string} text - The text to split.
 * @returns {string[]} - An array of sentences.
 */
const splitIntoSentences = (text) => {
  if (!text) return [];

  // This regex splits text at punctuation marks followed by a space and a capital letter or newline
  const regex = /(?<=[.?!])\s+(?=[A-Z])|\n+/g;
  
  // Split the text based on the regex
  const sentences = text.split(regex)
    .map(sentence => sentence.trim()) // Trim whitespace from each sentence
    .filter(sentence => {
      // Exclude empty sentences
      if (sentence.length === 0) return false;

      // Exclude sentences that are only numbering (e.g., "3.")
      if (/^\d+\.\s*$/.test(sentence)) return false;

      // Exclude sentences that start with numbering followed by parentheses (e.g., "1. (Text)")
      if (/^\d+\.\s*\(.*\)$/.test(sentence)) return false;

      // Optionally, exclude sentences that have numbering followed by a space but no content
      if (/^\d+\.\s*$/.test(sentence)) return false;

      // If none of the above conditions are met, include the sentence
      return true;
    });

  return sentences;
};

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

  /**
   * Renders a specific type of note (entry, action, or general).
   *
   * @param {string} title - The title of the note section.
   * @param {string} noteText - The text content of the note.
   * @param {string} heliSerNo - The helicopter serial number.
   * @returns {JSX.Element|null} - The rendered note section or null if no notes.
   */
  const renderNoteSection = (title, noteText, heliSerNo) => {
    if (!noteText || !noteText.trim()) return null;

    const sentences = splitIntoSentences(noteText);

    // Further filter out any sentences that might still be empty or invalid
    const validSentences = sentences.filter(
      (sentence) => sentence.length > 0
    );

    // If no valid sentences remain after filtering, do not render the section
    if (validSentences.length === 0) return null;

    return (
      <div className="mb-4" key={`${title}-${heliSerNo}`}>
        <p className="inline-block font-bold border-b-2 border-black pb-2">
          {title}: HEL-{heliSerNo || ""}:
        </p>
        {validSentences.map((sentence, i) => (
          <p key={`${title}-${heliSerNo}-sentence-${i}`} className="ml-8 lg:ml-12 text-sm">
            {i + 1}. {sentence}
          </p>
        ))}
      </div>
    );
  };

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
        <div key={log.id || log._id || index} className="">
          {/* Render Entry Notes */}
          {renderNoteSection("ENTRY", log.entryNotes, log.heliSerNo)}

          {/* Render Action Notes */}
          {renderNoteSection("ACTION", log.actionNotes, log.heliSerNo)}

          {/* Render General Notes */}
          {renderNoteSection("NOTE", log.notes, log.heliSerNo)}

         
        </div>

      ))}
 {/* Certification */}
          <div key={`certification-${logs[0]?._id}`} className="mb-4">
            <p className="inline-block font-bold border-b-2 border-black pb-2">
              CERTIFICATE:
            </p>
            <span className="pl-2 font-semibold">
              CERTIFIED THAT ALL THE HELICOPTERS AND GROUND EQUIPMENTS OF MI-17 F/L
              ARE LASHED AND PICKETED PROPERLY INSIDE THE HANGERS
            </span>
            <div>
              {logs?.acMis ? (
                <p className="font-bold ml-28 mb-4">ACMIS IS UPDATED</p>
              ) : (
                <p className="font-bold ml-28 mb-4">ACMIS IS NOT UPDATED</p>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-7 mt-6">
            <div>
              <p
                style={{
                  marginBottom: "2.5rem",
                  display: "inline-block",
                  fontWeight: "600",
                  paddingBottom: "5px",
                  borderBottom: "2px solid black",
                }}
              >
                Prepared by:
              </p>
              <div className="pl-4">
                {logs[0]?.preRoleAndName && (
                  <>
                    <p>
                      {logs[0]?.preRoleAndName.split(" ")[1]?.toUpperCase() || ""}
                    </p>
                    <p>
                      {logs[0]?.preRoleAndName.split(" ")[0]?.toUpperCase() || ""}
                    </p>
                  </>
                )}
              </div>
              <p>
                {logs[0]?.preparedDate ? dayjs(logs[0]?.preparedDate).format("DD MMM YY") : ""}
              </p>
            </div>
            <div>
              <p
                style={{
                  marginBottom: "2.5rem",
                  display: "inline-block",
                  fontWeight: "600",
                  borderBottom: "2px solid black",
                  paddingBottom: "5px",
                }}
              >
                Supervised by:
              </p>
              <div className="pl-4">
                {logs[0]?.supRoleAndName && (
                  <>
                    <p>
                      {logs[0]?.supRoleAndName.split(" ")[1]?.toUpperCase() || ""}
                    </p>
                    <p>
                      {logs[0]?.supRoleAndName.split(" ")[0]?.toUpperCase() || ""}
                    </p>
                  </>
                )}
              </div>
              <p>
                {logs[0]?.preparedDate ? dayjs(logs[0]?.preparedDate).format("DD MMM YY") : ""}
              </p>
            </div>
          </div>
    </div>
  );
};

export default AirStateFooter;
