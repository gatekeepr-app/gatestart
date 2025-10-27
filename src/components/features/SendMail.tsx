"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { eventInt } from "../../../types/events";
import { TicketInt } from "../../../types/ticki";
import { FormInt, FormSubInt } from "../../../types/forms";

type Props = {
  event: eventInt | FormInt;
  tickets: TicketInt[] | FormSubInt[];
};

function SendMailForm({ event, tickets }: Props) {
  const [mailBody, setMailBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipientType, setRecipientType] = useState<"registered" | "attended">(
    "registered"
  );

  const handleSendMail = async () => {
    if (!mailBody.trim()) {
      toast("Mail body cannot be empty.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to send this email to the selected group of attendees?"
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const filteredTickets =
        recipientType === "registered"
          ? tickets
          : tickets.filter((ticket) => ticket.status === true); // Assuming `attended` is a boolean in TicketInt

      await axios.post("/api/send-mail", {
        mailBody,
        event,
        tickets: filteredTickets,
      });

      toast("Mail sent successfully!");
      setMailBody("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error:", error);
      }
      toast("Failed to send mail.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Send Mail</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Mail to Attendees</DialogTitle>
          <DialogDescription>
            This mail will be sent to the selected group of users for this
            event.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label>Recipient Group</Label>
            <Select
              value={recipientType}
              onValueChange={(value) =>
                setRecipientType(value as "registered" | "attended")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">
                  Everyone who registered
                </SelectItem>
                <SelectItem value="attended">Everyone who attended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"></div>
          <Label>Mail Body</Label>
          <Textarea
            rows={6}
            placeholder="Type the message you'd like to send all attendees..."
            value={mailBody}
            onChange={(e) => setMailBody(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSendMail} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Mail"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SendMailForm;
