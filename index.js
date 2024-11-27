const express = require('express');
const app = express();
app.use(express.json());

let rooms = [];
let bookings = [];

// Create Room - POST /rooms
app.post('/rooms', (req, res) => {
  const { roomId, seats, amenities, pricePerHour } = req.body;

  if (!roomId || !seats || !amenities || !pricePerHour) {
    return res.status(400).json({ message: 'All room details are required.' });
  }

  const room = { roomId, seats, amenities, pricePerHour };
  rooms.push(room);

  res.status(201).json({ message: 'Room created successfully', room });
});

// Book Room - POST /bookings
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  if (!customerName || !date || !startTime || !endTime || !roomId) {
    return res.status(400).json({ message: 'All booking details are required.' });
  }

  const room = rooms.find(room => room.roomId === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  const isRoomBooked = bookings.some(booking =>
    booking.roomId === roomId &&
    booking.date === date &&
    (booking.startTime < endTime && booking.endTime > startTime)
  );

  if (isRoomBooked) {
    return res.status(400).json({ message: 'Room is already booked for this time slot.' });
  }

  const bookingId = `BKG-${Math.floor(Math.random() * 10000)}`; // Generate a random booking ID
  const bookingDate = new Date().toISOString().split('T')[0]; // Current date

  const booking = {
    bookingId,
    customerName,
    roomId,
    date,
    startTime,
    endTime,
    bookingDate,
    status: 'Confirmed'
  };

  bookings.push(booking);

  res.status(201).json({ message: 'Room booked successfully', booking });
});

// List Rooms with Booking Data - GET /rooms
app.get('/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => {
    const roomBookings = bookings.filter(booking => booking.roomId === room.roomId);
    return { ...room, bookings: roomBookings };
  });

  res.status(200).json(roomsWithBookings);
});

// List Customers with Booking Data - GET /customers
app.get('/customers', (req, res) => {
  try {
    const customersWithBookings = bookings.map(booking => {
      const room = rooms.find(r => r.roomId === booking.roomId);

      return {
        customerName: booking.customerName,
        roomName: room ? room.roomId : 'Room Not Found',
        date: booking.date,
        startTime: booking.startTime
      };
    });

    res.status(200).json(customersWithBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// List Customer Booking History with Booking Details - GET /customer-bookings
app.get('/customer-bookings', (req, res) => {
  try {
    const customerBookingHistory = bookings.map(booking => {
      const room = rooms.find(r => r.roomId === booking.roomId);

      return {
        customerName: booking.customerName,
        roomName: room ? room.roomId : 'Room Not Found',
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.bookingId,
        bookingDate: booking.bookingDate,
        status: booking.status
      };
    });

    res.status(200).json(customerBookingHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
