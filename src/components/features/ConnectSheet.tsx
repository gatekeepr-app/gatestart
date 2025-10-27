import React, { useState, useEffect } from "react";
import { deleteSheet, saveSheet } from "@/data/connect/saveSheet";
import { toast } from "sonner";
import { extractSheetId, generateSheetData } from "@/data/connect/function";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TicketsTable from "@/components/features/TicketsTable";
import { eventInt } from "../../../types/events";
import { TicketInt } from "../../../types/ticki";
import { useAuthProfile } from "@/hooks/useAuthProfile";

interface PageProps {
  id: string | string[] | null;
  event: eventInt | null;
  tickets: TicketInt[] | null;
  setEvent: (event: eventInt) => void;
}

function ConnectSheet({ id, event, tickets, setEvent }: PageProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthProfile();

  useEffect(() => {
    if (event?.additional?.sheetUrl) {
      setSheetUrl(event.additional.sheetUrl);
      setStatus(true);
    } else {
      setSheetUrl("");
      setStatus(false);
    }
  }, [event]);

  const handleSheetDisconnect = async () => {
    if (!event?.eventuuid) return;

    setLoading(true);
    try {
      await deleteSheet(event.eventuuid);
      toast.success("Sheet Connection Disconnected");
      setSheetUrl("");
      setStatus(false);

      // Refresh event data from API
      const res = await fetch(`/api/events/${id}`);
      if (res.ok) {
        const updatedEvent = await res.json();
        setEvent(updatedEvent);
      }
    } catch (error) {
      toast.error("Failed to disconnect sheet.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const connectReg = async () => {
    setLoading(true);
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      toast("Invalid Google Sheets URL.");
      setLoading(false);
      return;
    }

    if (tickets && tickets.length > 0) {
      const finalData = generateSheetData(tickets);

      try {
        const res = await fetch("/api/send-to-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sheetId, data: finalData }),
        });

        await saveSheet({ sheetUrl: sheetId, eventuuid: event?.eventuuid });
        setStatus(true);

        const result = await res.json();
        toast(result.message);
      } catch (err) {
        console.error(err);
        toast("Failed to send data to Google Sheets.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Registrations</CardTitle>
            {status && sheetUrl ? (
              <div className="inline-flex items-center justify-center border rounded-md text-sm">
                <div className="flex pl-4 py-2 items-center gap-3 border-r">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p>Live</p>
                  <div className="border-r-2 border-red-500"></div>
                </div>
                <div
                  onClick={handleSheetDisconnect}
                  className="hover:bg-accent px-4 py-2 hover:text-accent-foreground cursor-pointer"
                >
                  <Trash2 className="text-red-500 w-4 h-4 m-1" />
                </div>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading}
                  >
                    Connect Sheet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Google Sheet</DialogTitle>
                    <DialogDescription>
                      Paste your public Google Sheet URL to sync.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <Input
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="Google Sheet URL"
                      disabled={loading}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="default"
                      onClick={connectReg}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader className="animate-spin w-5 h-5 mx-auto" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto h-92 overflow-y-scroll">
          {user && tickets && event && (
            <TicketsTable user={user} tickets={tickets} event={event} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ConnectSheet;
