import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { eventInt } from "../../../types/events";
import { toast } from "sonner";
import axios from "axios";
import RichTextEditor from "@/components/richtext-editor";

function Editform(event: eventInt) {
  const [isEditing, setIsEditing] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: event?.name || "",
    date: event?.date_range.from?.substring(0, 10) || "",
    place: event?.place || "",
    details: event?.details || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setEventForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    // Call update API here
    try {
      await axios.put(`/api/manage/event/${event?.id}`, eventForm);
      toast("Event updated!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast("Failed to update event.");
    }
  };

  useEffect(() => {
    if (event) {
      setEventForm({
        name: event.name || "",
        date: event.date_range.from?.substring(0, 10) || "",
        place: event.place || "",
        details: event.details || "",
      });
    }
  }, [event]);

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            Edit Event
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label>Event Title</Label>
              <Input
                value={eventForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="flex gap-3">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input
                  value={eventForm.place.title}
                  onChange={(e) => handleInputChange("place", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <RichTextEditor
                editable={true}
                content={eventForm.details}
                onChange={(value) => handleInputChange("details", value)}
              />
              {/* <Textarea
                rows={5}
                value={eventForm.details}
                onChange={(e) => handleInputChange("details", e.target.value)}
                disabled={!isEditing}
              /> */}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>
              {isEditing ? "Update Event" : "Edit Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Editform;
