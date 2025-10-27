export type TicketInt = {
  id: string;
  created_at: string;
  userid: string;
  eventid: string;
  status: boolean;
  formdata: Record;
  Events: eventInt; // assuming `eventInt` is already defined elsewhere
};