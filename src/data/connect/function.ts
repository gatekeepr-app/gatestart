import { TicketInt } from "../../../types/ticki";
import { FormSubInt } from "../../../types/forms";

export const generateSheetData = (tickets: TicketInt[] | FormSubInt[]) => {
  if (!tickets || tickets.length === 0) return [];

  // Collect all unique keys from all ticket.formdata
  const formFieldKeys = new Set<string>();
  tickets.forEach((ticket) => {
    const formdata = ticket.formdata || {};
    Object.keys(formdata).forEach((key) => formFieldKeys.add(key));
  });

  const dynamicFields = Array.from(formFieldKeys); // ['name', 'email', 'class', etc.]

  // Construct header row
  const headerRow = ["ID", "Created At", ...dynamicFields, "Status"];

  // Construct data rows
  const dataRows = tickets.map((ticket) => {
    const formdata = ticket.formdata || {};
    const row = [
      ticket.id,
      ticket.created_at,
      ...dynamicFields.map((key) => formdata[key] ?? ""), // preserve order
      ticket.status ? "Confirmed" : "Pending",
    ];
    return row;
  });

  return [headerRow, ...dataRows]; // Final 2D array
};


export const extractSheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };
