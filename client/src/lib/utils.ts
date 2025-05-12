import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price} MAD`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function constructWhatsAppUrl(
  phoneNumber: string, 
  bookingData: { 
    name: string, 
    phone: string, 
    activity: string, 
    date: string, 
    people: number 
  }
): string {
  const message = encodeURIComponent(
    `New Booking:
- Name: ${bookingData.name}
- Phone: ${bookingData.phone}
- Activity: ${bookingData.activity}
- Date: ${bookingData.date}
- Group Size: ${bookingData.people}`
  );
  
  return `https://wa.me/${phoneNumber}?text=${message}`;
}

export const whatsAppContacts = {
  ahmed: "212600623630",
  yahia: "212693323368",
  nadia: "212654497354"
};

export function getActivityIdByName(activityName: string): number {
  // This mapping should match the ID in the database
  const activityMapping: { [key: string]: number } = {
    "hot-air-balloon": 1,
    "agafay-combo": 2,
    "essaouira": 3,
    "ouzoud": 4,
    "ourika": 5
  };
  
  return activityMapping[activityName] || 0;
}

export function getActivityNameById(activityId: number): string {
  // This mapping should match the name in the database
  const activityMapping: { [key: number]: string } = {
    1: "Montgolfière (Hot Air Balloon)",
    2: "Agafay Combo",
    3: "Essaouira Day Trip",
    4: "Ouzoud Waterfalls Day Trip",
    5: "Ourika Valley Day Trip"
  };
  
  return activityMapping[activityId] || "Unknown Activity";
}
