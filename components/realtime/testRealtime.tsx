"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToTable, unsubscribeChannel } from "@/lib/client/realtime";

type CrudType = "CREATE" | "READ" | "UPDATE" | "DELETE" | "OTHER";

type LogEntry = {
  id: string;
  no: number;
  time: string;
  eventType: string;   // raw เช่น INSERT / UPDATE / DELETE
  crudType: CrudType;  // แปลงเป็น CREATE / UPDATE / DELETE
  name: string;
  rowId: string;
};

function mapEventTypeToCrud(eventType: string): CrudType {
  const et = eventType?.toUpperCase?.() ?? "";
  if (et === "INSERT") return "CREATE";
  if (et === "UPDATE") return "UPDATE";
  if (et === "DELETE") return "DELETE";
  return "OTHER";
}

type RealtimeLoggerProps = {
  table: string;
  title: string;
  codeLabel: string;        // เช่น "tasks" หรือ "events"
  nameColumnLabel: string;  // header ของคอลัมน์ชื่อ เช่น "Task", "Event"
  emptyMessage: string;
};

function RealtimeLoggerBase({
  table,
  title,
  codeLabel,
  nameColumnLabel,
  emptyMessage,
}: RealtimeLoggerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const channel = subscribeToTable(table, payload => {
      const eventType =
        payload?.eventType || payload?.event || payload?.type || "UNKNOWN";

      const name =
        payload?.new?.title ??
        payload?.new?.name ??
        payload?.old?.title ??
        payload?.old?.name ??
        "-";

      const rowId =
        payload?.new?.id ??
        payload?.old?.id ??
        "-";

      counterRef.current += 1;

      const entry: LogEntry = {
        id: crypto.randomUUID(),
        no: counterRef.current,
        time: new Date().toLocaleString(),
        eventType,
        crudType: mapEventTypeToCrud(eventType),
        name,
        rowId,
      };

      setLogs(prev => [entry, ...prev]);
    });

    return () => unsubscribeChannel(channel);
  }, [table]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "#f3f4f6",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
          padding: "1.5rem 1.75rem",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 14,
                color: "#6b7280",
              }}
            >
              แสดง log แบบ Realtime เมื่อมีการเปลี่ยนแปลงในตาราง{" "}
              <code>{codeLabel}</code>
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#ecfdf5",
              color: "#166534",
              border: "1px solid #bbf7d0",
            }}
          >
            {logs.length} event(s)
          </span>
        </header>

        {logs.length === 0 ? (
          <p style={{ fontSize: 14, color: "#6b7280" }}>{emptyMessage}</p>
        ) : (
          <div
            style={{
              marginTop: "0.5rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#374151",
                      width: 60,
                    }}
                  >
                    No
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#374151",
                      width: 180,
                    }}
                  >
                    Type of Event (CRUD)
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    {nameColumnLabel}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#374151",
                      width: 190,
                    }}
                  >
                    Event (Time)
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#374151",
                      width: 260,
                    }}
                  >
                    Row ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #e5e7eb",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {log.no}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          background:
                            log.crudType === "CREATE"
                              ? "#ecfdf5"
                              : log.crudType === "UPDATE"
                              ? "#eff6ff"
                              : log.crudType === "DELETE"
                              ? "#fef2f2"
                              : "#f3f4f6",
                          color:
                            log.crudType === "CREATE"
                              ? "#166534"
                              : log.crudType === "UPDATE"
                              ? "#1d4ed8"
                              : log.crudType === "DELETE"
                              ? "#b91c1c"
                              : "#374151",
                        }}
                      >
                        {log.crudType}
                      </span>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          marginTop: 2,
                        }}
                      >
                        raw: {log.eventType}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {log.name}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log.time}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #e5e7eb",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
                        fontSize: 12,
                      }}
                    >
                      {log.rowId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

/* --------- Wrappers สำหรับใช้จริง --------- */

export function RealtimeLoggerTasks() {
  return (
    <RealtimeLoggerBase
      table="tasks"
      title="Realtime Task Events"
      codeLabel="tasks"
      nameColumnLabel="Task"
      emptyMessage="ยังไม่มี event ลองเพิ่ม / แก้ไข / ลบ task ดูนะ 🙂"
    />
  );
}

export function RealtimeLoggerEvents() {
  return (
    <RealtimeLoggerBase
      table="events"
      title="Realtime Events"
      codeLabel="events"
      nameColumnLabel="Event"
      emptyMessage="ยังไม่มี event ลองเพิ่ม / แก้ไข / ลบ event ดูนะ 🙂"
    />
  );
}
