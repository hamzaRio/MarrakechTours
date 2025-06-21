import React from "react";

interface ImageGalleryGridProps {
  title?: string;
  images: string[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function ImageGalleryGrid({ 
  title, 
  images, 
  columns = 3, 
  className = "" 
}: ImageGalleryGridProps) {
  // Map column count to grid classes
  const gridColumnClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  }[columns];

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      )}
      
      <div className={`grid ${gridColumnClass} gap-4`}>
        {images.map((imageSrc, index) => (
          <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <img 
              src={`/photos/${imageSrc}`} 
              alt={`Tour image ${index + 1}`} 
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}