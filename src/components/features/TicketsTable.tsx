"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { TicketInt } from "../../../types/ticki";
import { eventInt } from "../../../types/events";
import { createClient } from "@/utils/supabase/client";
import { Separator } from "../ui/separator";

const supabase = createClient();

interface TicketsTableProps {
  tickets?: TicketInt[];
  event: eventInt;
  user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
}

export default function TicketsTable({
  tickets = [],
  event,
  user,
}: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTickets, setFilteredTickets] = useState(tickets);

  // Update filteredTickets when tickets or searchTerm changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredTickets(
        tickets.filter((ticket) => {
          // Check if any of the relevant fields contain the search term
          const { name, email, phone } = ticket.formdata;
          return (
            (name && name.toLowerCase().includes(lowerSearch)) ||
            (email && email.toLowerCase().includes(lowerSearch)) ||
            (phone && phone.toLowerCase().includes(lowerSearch))
          );
        })
      );
    }
  }, [searchTerm, tickets]);

  // Handle clearing search on blur (if input is empty)
  const handleBlur = () => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
    }
  };

  const handleDelete = async (ticketid: string) => {
    if (window.confirm("Are you sure?")) {
      const { error } = await supabase
        .from("ticki")
        .delete()
        .eq("id", ticketid);

      toast("Registration Data Deleted.");
      window.location.reload();

      if (error) {
        toast.error("Failed to delete registration.");
      }
    }
  };

  const markAttended = async (ticketid: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("ticki")
      .update({ status: true })
      .eq("id", ticketid);

    if (error) {
      toast.error("Failed to mark as attended.");
    } else {
      toast.success("Marked as attended.");
      window.location.reload();
    }
  };

  const markUnattended = async (ticketid: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("ticki")
      .update({ status: false })
      .eq("id", ticketid);

    if (error) {
      toast.error("Failed to mark as unattended.");
    } else {
      toast.success("Marked as unattended.");
      window.location.reload();
    }
  };

  return (
    <>
      {/* Search input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or contact"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onBlur={handleBlur}
          autoComplete="off"
        />
      </div>

      {/* Tickets table or message */}
      {filteredTickets?.length ? (
        <table className="min-w-full text-sm border border-gray-200 rounded-md overflow-hidden">
          <thead className="bg-gray-100 bg-opacity-60 text-black text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <Sheet key={index}>
                <SheetTrigger asChild>
                  <tr className="border-t even:bg-gray-50 even:bg-opacity-10 hover:text-black/80 hover:bg-gray-100 transition cursor-pointer">
                    <td className="px-4 py-2">
                      {ticket.formdata.name || ticket.formdata.col1}
                    </td>
                    <td className="px-4 py-2">
                      {ticket.formdata.email || ticket.formdata.col2}
                    </td>
                    <td className="px-4 py-2">
                      {ticket.formdata.phone || ticket.formdata.col3}
                    </td>
                    <td className="px-4 py-2">
                      {ticket.status ? (
                        <p className="text-green-500">Attended</p>
                      ) : (
                        <p className="text-red-500">Not Attended</p>
                      )}
                    </td>
                  </tr>
                </SheetTrigger>
                <SheetContent className="overflow-y-scroll  p-6">
                  <SheetHeader className="p-0">
                    <SheetTitle>Ticket Details</SheetTitle>
                    <SheetDescription>
                      Detailed information for {ticket.formdata.name}&apos;s
                      registration
                    </SheetDescription>
                  </SheetHeader>
                  <Separator />
                  <div className="mt-2 flex flex-col gap-3">
                    {Object.entries(ticket.formdata).map(([key, value]) => (
                      <div key={key}>
                        <p>
                          <span className="font-semibold capitalize">
                            {event?.formdata?.find((f) => f.name === key)
                              ?.name || key}
                            :
                          </span>
                        </p>
                        <p className="text-gray-400">{String(value)}</p>
                      </div>
                    ))}
                    <div>
                      <h3 className="font-semibold">Status:</h3>
                      <p
                        className={
                          ticket.status ? "text-green-500" : "text-red-500"
                        }
                      >
                        {ticket.status ? "Attended" : "Not Attended"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-3 w-full">
                    {ticket.status ? (
                      <Button
                        onClick={() => markUnattended(ticket.id)}
                        disabled={!user}
                        className="w-full"
                        variant={"secondary"}
                      >
                        Mark as not Attended
                      </Button>
                    ) : (
                      <Button
                        onClick={() => markAttended(ticket.id)}
                        disabled={!user}
                        className="w-full"
                        variant={"secondary"}
                      >
                        Mark as Attended
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(ticket.id)}
                      disabled={!user}
                      className="w-full"
                      variant={"destructive"}
                    >
                      Delete Registration
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground text-sm">
          {"No registrations found."}
        </p>
      )}
    </>
  );
}
