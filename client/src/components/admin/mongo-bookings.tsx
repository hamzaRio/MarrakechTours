import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface MongoBooking {
  _id: string;
  fullName: string;
  phoneNumber: string;
  selectedActivity: string;
  preferredDate: string;
  numberOfPeople: number;
  notes?: string;
  createdAt: string;
}

export default function MongoBookings() {
  const [bookings, setBookings] = useState<MongoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/mongo/bookings');
        
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
          setConnectionStatus('connected');
          setError(null);
        } else {
          setConnectionStatus('failed');
          if (response.status === 503) {
            setError('MongoDB database is not connected. Please check your database configuration.');
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            setError(errorData.message || 'Failed to fetch bookings from MongoDB');
          }
        }
      } catch (err) {
        setConnectionStatus('failed');
        setError('Cannot connect to MongoDB. The database may not be available.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        <p className="text-gray-600">Connecting to MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex items-center text-amber-600 mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">MongoDB Connection Error</h3>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <p className="text-sm text-gray-600">Note: Your application continues to work with in-memory storage.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">MongoDB Bookings</h2>
          <div className="flex items-center mt-1">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-sm text-gray-600">Connected to MongoDB database</p>
          </div>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="text-sm bg-white hover:bg-gray-100"
        >
          Refresh Data
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bookings found in MongoDB database.</p>
        </div>
      ) : (
        <Table>
          <TableCaption>Total MongoDB bookings: {bookings.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>People</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell className="font-medium">{booking.fullName}</TableCell>
                <TableCell>{booking.selectedActivity}</TableCell>
                <TableCell>{formatDate(booking.preferredDate)}</TableCell>
                <TableCell>{booking.numberOfPeople}</TableCell>
                <TableCell>{booking.phoneNumber}</TableCell>
                <TableCell className="text-gray-600">{formatDate(booking.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}