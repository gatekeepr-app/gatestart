"use client";

import React, { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./button";
import { QRCodeCanvas } from "qrcode.react";

type QRCodeDialogProps = {
  eventSlug: string;
  triggerLabel?: string;
};

export function QRCodeDialog({
  eventSlug,
  triggerLabel = "Generate QR",
}: QRCodeDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const url = `https://gatekeepr.live/events/${eventSlug}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${eventSlug}-qr.png`;
    link.click();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>{triggerLabel}</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed text-black left-1/2 top-1/2 w-fit bg-white p-6 rounded-xl shadow-xl transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Dialog.Title className="text-lg font-bold mb-4">
            QR Code for Event
          </Dialog.Title>

          <div ref={qrRef} className="relative inline-block bg-white p-2">
            <QRCodeCanvas
              value={url}
              size={256}
              includeMargin={true}
              // imageSettings={{
              //   src: "/gatekeepr.png", // must be in public folder
              //   height: 30, // smaller size helps avoid interference
              //   width: 30,
              //   excavate: true, // clears QR pixels under the logo
              // }}
            />
          </div>

          <div className="mt-4 flex  justify-between">
            <Button className="text-white" variant="outline" onClick={handleDownload}>
              Download QR
            </Button>
            <Dialog.Close asChild>
              <Button variant="ghost">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
