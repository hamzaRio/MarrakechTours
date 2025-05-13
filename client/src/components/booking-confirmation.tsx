import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Users, DollarSign, X } from "lucide-react";
import { getActivityNameById, getActivityPriceById, formatPrice } from "@/lib/utils";
import { BookingFormData } from "@shared/schema";

interface BookingConfirmationProps {
  open: boolean;
  onClose: () => void;
  bookingData?: BookingFormData;
}

export default function BookingConfirmation({ open, onClose, bookingData }: BookingConfirmationProps) {
  if (!bookingData) return null;

  const activityId = parseInt(bookingData.activity);
  const activityName = getActivityNameById(activityId);
  const activityPrice = getActivityPriceById(activityId);
  const totalPrice = activityPrice * bookingData.people;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 rounded-md max-w-md w-full mx-4 shadow-md">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="text-center">
          <div className="bg-green-100 text-green-600 mx-auto w-14 h-14 flex items-center justify-center rounded-full mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-medium text-gray-800">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Your booking details have been sent to our team via WhatsApp. You'll receive a confirmation message shortly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-4 rounded-md text-left mb-6 border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-3">Booking Details:</h4>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-start">
                <span className="font-medium w-24">Name:</span> 
                <span className="text-gray-600">{bookingData.name}</span>
              </p>
              <p className="text-gray-700 flex items-start">
                <span className="font-medium w-24">Activity:</span> 
                <span className="text-gray-600">{activityName}</span>
              </p>
              <p className="text-gray-700 flex items-start">
                <span className="font-medium w-24 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-terracotta" />
                  Date:
                </span> 
                <span className="text-gray-600">{bookingData.date}</span>
              </p>
              <p className="text-gray-700 flex items-start">
                <span className="font-medium w-24 flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-terracotta" />
                  Group Size:
                </span> 
                <span className="text-gray-600">{bookingData.people} people</span>
              </p>
              <p className="text-gray-700 flex items-start">
                <span className="font-medium w-24 flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-terracotta" />
                  Price:
                </span> 
                <span className="text-gray-600">{formatPrice(activityPrice)}/person</span>
              </p>
              <p className="text-gray-700 flex items-start mt-2 pt-2 border-t border-gray-100">
                <span className="font-medium w-24">Total:</span> 
                <span className="text-terracotta font-bold">{formatPrice(totalPrice)}</span>
              </p>
            </div>
          </div>
          <div className="mb-4 text-left text-sm text-gray-600">
            <p>Your booking will be shared with our team: Nadia, Ahmed, and Yahia</p>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-terracotta hover:bg-terracotta/90 text-white font-medium py-2 px-6"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
