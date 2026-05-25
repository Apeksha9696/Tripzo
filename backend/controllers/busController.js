const Bus = require('../models/Bus');

/**
 * Retrieve All Buses in Fleet
 */
const getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json(buses);
  } catch (err) {
    next(err);
  }
};

/**
 * Search buses using from, to, and date query parameters
 */
const searchBuses = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const query = {};

    if (from) query.from = new RegExp(`^${from.trim()}$`, 'i'); // Case-insensitive matching
    if (to) query.to = new RegExp(`^${to.trim()}$`, 'i');
    if (date) query.date = date.trim(); // Format matching (YYYY-MM-DD)

    const buses = await Bus.find(query);
    res.json(buses);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Specific Bus Details by ID
 */
const getBusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id);

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found with the specified ID' });
    }

    res.json(bus);
  } catch (err) {
    // If invalid MongoDB ObjectId format
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Bus ID format' });
    }
    next(err);
  }
};

/**
 * Create a new bus (Admin-only restriction)
 */
const createBus = async (req, res, next) => {
  try {
    const { 
      operatorName, 
      busName, 
      busType, 
      category,
      from, 
      to, 
      date, 
      departureTime, 
      arrivalTime, 
      duration, 
      price, 
      totalSeats,
      facilities,
      pickupPoints,
      dropPoints,
      driver
    } = req.body;

    if (!operatorName || !busType || !from || !to || !date || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({ error: 'Please enter all required fields for bus registration' });
    }

    // Set automatic duration calculation placeholder if empty
    let computedDuration = duration || '';
    if (!computedDuration && departureTime && arrivalTime) {
      computedDuration = `${departureTime} - ${arrivalTime}`;
    }

    const bus = new Bus({
      operatorName,
      busName: busName || '',
      busType,
      category: category || '',
      from,
      to,
      date,
      departureTime,
      arrivalTime,
      duration: computedDuration,
      price: Number(price),
      totalSeats: Number(totalSeats) || 40,
      facilities: facilities || ['Wifi', 'Water Bottle', 'Charging Point'], // Default fallback facilities
      pickupPoints: pickupPoints || [],
      dropPoints: dropPoints || [],
      driver: driver || { name: 'TBD', contact: '', license: '' },
      bookedSeats: []
    });

    await bus.save();
    console.log(`[BUS CREATE] Bus created successfully: ID ${bus._id} route ${from} -> ${to}`);

    res.status(201).json(bus);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing bus details (Admin-only restriction)
 */
const updateBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the bus
    let bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Update fields dynamically from request body
    const allowedUpdates = [
      'operatorName', 'busName', 'busType', 'category', 'from', 'to', 'date', 
      'departureTime', 'arrivalTime', 'duration', 'price', 'totalSeats', 
      'facilities', 'pickupPoints', 'dropPoints', 'driver', 'status', 'bookedSeats'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        bus[field] = req.body[field];
      }
    });

    await bus.save();
    console.log(`[BUS UPDATE] Bus details updated successfully: ID ${id}`);

    res.json(bus);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Bus ID format' });
    }
    next(err);
  }
};

/**
 * Delete a bus from active inventory (Admin-only restriction)
 */
const deleteBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const bus = await Bus.findByIdAndDelete(id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    console.log(`[BUS DELETE] Bus deleted successfully from inventory: ID ${id}`);
    res.json({ success: true, message: 'Bus deleted successfully from active inventory' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Bus ID format' });
    }
    next(err);
  }
};

module.exports = {
  getAllBuses,
  searchBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
};
