import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { getActivityNameById } from "@/lib/utils";
import { BookingFormData } from "@shared/schema";

interface BookingConfirmationProps {
  open: boolean;
  onClose: () => void;
  bookingData?: BookingFormData;
}

export default function BookingConfirmation({ open, onClose, bookingData }: BookingConfirmationProps) {
  if (!bookingData) return null;

  const activityName = getActivityNameById(parseInt(bookingData.activity));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="bg-green-100 text-green-800 mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <CheckCircle className="h-10 w-10" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-moroccan-brown mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-gray-600 mb-6">
              Your booking details have been sent to our team via WhatsApp. You'll receive a confirmation message shortly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-sandy/20 p-4 rounded-lg text-left mb-6">
            <h4 className="font-bold text-moroccan-brown mb-2">Booking Details:</h4>
            <p className="text-gray-700"><span className="font-medium">Name:</span> {bookingData.name}</p>
            <p className="text-gray-700"><span className="font-medium">Activity:</span> {activityName}</p>
            <p className="text-gray-700"><span className="font-medium">Date:</span> {bookingData.date}</p>
            <p className="text-gray-700"><span className="font-medium">Group Size:</span> {bookingData.people} people</p>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-moroccan-brown hover:bg-moroccan-gold text-white font-bold py-2 px-6 rounded-full transition"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
