import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

// GET /api/events - جلب جميع الأحداث
router.get('/', async (req, res) => {
  try {
    const { category, published, upcoming, limit } = req.query;
    
    let query = {};
    
    // فلترة حسب الفئة
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // فلترة حسب حالة النشر
    if (published === 'true') {
      query.isPublished = true;
    } else if (published === 'false') {
      query.isPublished = false;
    }
    
    // فلترة الأحداث القادمة فقط
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }
    
    let eventsQuery = Event.find(query).sort({ date: 1 });
    
    // تحديد عدد النتائج
    if (limit) {
      eventsQuery = eventsQuery.limit(parseInt(limit));
    }
    
    const events = await eventsQuery;
    
    console.log(`📅 Events fetched: ${events.length} events found`);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// GET /api/events/published - جلب الأحداث المنشورة فقط (للموقع الرئيسي)
router.get('/published', async (req, res) => {
  try {
    const events = await Event.getPublishedEvents();
    
    console.log(`🌐 Published events fetched: ${events.length} events`);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching published events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching published events',
      error: error.message
    });
  }
});

// GET /api/events/upcoming - جلب الأحداث القادمة
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.getUpcomingEvents();
    
    console.log(`⏰ Upcoming events fetched: ${events.length} events`);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events',
      error: error.message
    });
  }
});

// GET /api/events/:id - جلب حدث محدد
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log(`🔍 Event fetched: ${event.title}`);
    
    res.json({
      success: true,
      data: event
    });
    
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// POST /api/events - إنشاء حدث جديد
router.post('/', async (req, res) => {
  try {
    const eventData = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!eventData.title || !eventData.category || !eventData.date) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and date are required'
      });
    }
    
    // إنشاء الحدث
    const event = new Event(eventData);
    await event.save();
    
    console.log(`✅ Event created: ${event.title} (ID: ${event.eventId})`);
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating event:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Event with this ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});

// PUT /api/events/:id - تحديث حدث
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log(`📝 Event updated: ${event.title}`);
    
    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});

// DELETE /api/events/:id - حذف حدث
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log(`🗑️ Event deleted: ${event.title}`);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

// POST /api/events/:id/register - تسجيل في حدث
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // التحقق من إمكانية التسجيل
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed for this event'
      });
    }
    
    const { name, email, phone, company } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // تسجيل المشارك
    await event.registerParticipant({
      name,
      email,
      phone,
      company
    });
    
    console.log(`👤 New registration: ${name} for ${event.title}`);
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        eventTitle: event.title,
        participantName: name,
        registrationDate: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Error registering participant:', error);
    
    if (error.message === 'Event is full') {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }
    
    if (error.message === 'Already registered') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
});

// GET /api/events/:id/registrations - جلب قائمة المسجلين
router.get('/:id/registrations', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    console.log(`📋 Registrations fetched for: ${event.title}`);
    
    res.json({
      success: true,
      data: {
        eventTitle: event.title,
        registrations: event.registrations,
        totalRegistrations: event.registrations.length,
        availableSpaces: event.places.total - event.places.registered
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations',
      error: error.message
    });
  }
});

// POST /api/events/:id/feedback - إضافة تقييم
router.post('/:id/feedback', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const { participantName, rating, comment } = req.body;
    
    if (!participantName || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Participant name and rating are required'
      });
    }
    
    await event.addFeedback({
      participantName,
      rating,
      comment
    });
    
    console.log(`⭐ Feedback added for: ${event.title} (Rating: ${rating})`);
    
    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: {
        averageRating: event.averageRating,
        totalFeedbacks: event.feedback.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding feedback',
      error: error.message
    });
  }
});

// GET /api/events/stats/summary - إحصائيات عامة
router.get('/stats/summary', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ isPublished: true });
    const upcomingEvents = await Event.countDocuments({ 
      date: { $gte: new Date() },
      status: 'upcoming'
    });
    
    const totalRegistrations = await Event.aggregate([
      { $unwind: '$registrations' },
      { $match: { 'registrations.status': 'confirmed' } },
      { $count: 'total' }
    ]);
    
    console.log('📊 Event stats fetched');
    
    res.json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        upcomingEvents,
        totalRegistrations: totalRegistrations[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

export default router;
