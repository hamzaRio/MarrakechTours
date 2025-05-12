import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Hot Air Balloon images from attached_assets
const balloonImages = [
  "/attached_assets/Hot Air Balloon Ride1.jpg",
  "/attached_assets/Hot Air Balloon Ride2.jpg",
  "/attached_assets/Hot Air Balloon Ride3.jpg",
  "/attached_assets/montgofliere_a_marrakech.jpg",
  "/attached_assets/montgolfiere-marrakech.jpg"
];

interface BalloonGalleryProps {
  open: boolean;
  onClose: () => void;
}

export default function BalloonGallery({ open, onClose }: BalloonGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === balloonImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? balloonImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none">
        <DialogTitle className="sr-only">
          <VisuallyHidden>Hot Air Balloon Gallery</VisuallyHidden>
        </DialogTitle>
        
        <div className="relative w-full h-full">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-50 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative w-full h-full">
            <img 
              src={balloonImages[currentImageIndex]} 
              alt={`Hot Air Balloon ride image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain max-h-[80vh]"
            />
            
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm">
                {currentImageIndex + 1} / {balloonImages.length}
              </p>
            </div>

            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Thumbnail gallery component to show on the activity page
export function BalloonThumbnailGallery() {
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Show only the first 4 images as thumbnails (or all if fewer than 4)
  const thumbnails = balloonImages.slice(0, 4);

  return (
    <>
      <div className="mt-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Hot Air Balloon Gallery</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {thumbnails.map((image, index) => (
            <div 
              key={index} 
              onClick={() => setGalleryOpen(true)}
              className="cursor-pointer hover:shadow-lg transition-shadow relative aspect-square"
            >
              <img 
                src={image} 
                alt={`Hot Air Balloon thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              {index === 3 && balloonImages.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                  <p className="text-white font-medium">+{balloonImages.length - 4} more</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          onClick={() => setGalleryOpen(true)}
          variant="outline" 
          className="mt-3 text-terracotta border-terracotta hover:bg-terracotta/10"
        >
          View All Images
        </Button>
      </div>
      
      <BalloonGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </>
  );
}