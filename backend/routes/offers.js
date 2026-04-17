'use strict';

const router = require('express').Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');
const { deleteImageFiles } = require('../utils/imageProcessor');

// ─────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/offers
 * Public – returns only active offers
 * Query params: type, category, city, priceMin, priceMax, areaMin, areaMax,
 *               rooms, sort, page, limit, featured
 */
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };

    // Filters
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
    if (req.query.district) filter.district = new RegExp(req.query.district, 'i');
    if (req.query.featured === 'true') filter.featured = true;

    if (req.query.priceMin || req.query.priceMax) {
      filter.price = {};
      if (req.query.priceMin) filter.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) filter.price.$lte = Number(req.query.priceMax);
    }

    if (req.query.areaMin || req.query.areaMax) {
      filter.area = {};
      if (req.query.areaMin) filter.area.$gte = Number(req.query.areaMin);
      if (req.query.areaMax) filter.area.$lte = Number(req.query.areaMax);
    }

    if (req.query.rooms) {
      const r = Number(req.query.rooms);
      if (r >= 4) {
        filter.rooms = { $gte: 4 };
      } else {
        filter.rooms = r;
      }
    }

    // Search in title/address/desc
    if (req.query.q) {
      const regex = new RegExp(req.query.q, 'i');
      filter.$or = [
        { title: regex },
        { address: regex },
        { desc: regex },
        { city: regex },
        { district: regex },
      ];
    }

    // Sorting
    let sort = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price-asc':  sort = { price: 1 }; break;
      case 'price-desc': sort = { price: -1 }; break;
      case 'area-desc':  sort = { area: -1 }; break;
      case 'area-asc':   sort = { area: 1 }; break;
      case 'newest':     sort = { createdAt: -1 }; break;
      case 'oldest':     sort = { createdAt: 1 }; break;
      case 'featured':   sort = { featured: -1, createdAt: -1 }; break;
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Offer.countDocuments(filter),
    ]);

    // Add id field for compatibility
    const result = offers.map(o => ({ ...o, id: o._id }));

    // If client expects simple array (backward compatibility), return array
    // If pagination headers are requested, send with meta
    if (req.query.meta === 'true') {
      return res.json({
        data: result,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    }

    res.json(result);
  } catch (err) {
    console.error('GET /api/offers error:', err);
    res.status(500).json({ error: 'Błąd pobierania ofert.' });
  }
});

/**
 * GET /api/offers/stats
 * Public – returns offer statistics
 */
router.get('/stats', async (_req, res) => {
  try {
    const [total, active, sprzedaz, wynajem, categories] = await Promise.all([
      Offer.countDocuments(),
      Offer.countDocuments({ active: true }),
      Offer.countDocuments({ active: true, type: 'sprzedaz' }),
      Offer.countDocuments({ active: true, type: 'wynajem' }),
      Offer.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      total,
      active,
      inactive: total - active,
      sprzedaz,
      wynajem,
      categories: categories.reduce((acc, c) => {
        acc[c._id] = c.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error('GET /api/offers/stats error:', err);
    res.status(500).json({ error: 'Błąd pobierania statystyk.' });
  }
});

// ─────────────────────────────────────────────────────────
// ADMIN ROUTES (require auth) — placed before /:id to avoid conflicts
// ─────────────────────────────────────────────────────────

/**
 * GET /api/offers/all
 * Admin – returns ALL offers (active + inactive)
 */
router.get('/all', auth, async (req, res) => {
  try {
    const sort = { createdAt: -1 };
    const offers = await Offer.find().sort(sort).lean();
    const result = offers.map(o => ({ ...o, id: o._id }));
    res.json(result);
  } catch (err) {
    console.error('GET /api/offers/all error:', err);
    res.status(500).json({ error: 'Błąd pobierania ofert.' });
  }
});

// ─────────────────────────────────────────────────────────
// PUBLIC — single offer (after /all and /stats to avoid conflict)
// ─────────────────────────────────────────────────────────

/**
 * GET /api/offers/:id
 * Public – single offer by ID or slug
 */
router.get('/:id', async (req, res) => {
  try {
    let offer;

    // Try by MongoDB ID first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      offer = await Offer.findById(req.params.id).lean();
    }

    // Try by slug
    if (!offer) {
      offer = await Offer.findOne({ slug: req.params.id }).lean();
    }

    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    // Increment views
    await Offer.updateOne({ _id: offer._id }, { $inc: { views: 1 } });

    offer.id = offer._id;
    res.json(offer);
  } catch (err) {
    console.error('GET /api/offers/:id error:', err);
    res.status(500).json({ error: 'Błąd pobierania oferty.' });
  }
});

// ─────────────────────────────────────────────────────────
// ADMIN — CRUD operations
// ─────────────────────────────────────────────────────────

/**
 * POST /api/offers
 * Admin – create new offer
 * Body: JSON with offer fields
 */
router.post('/', auth, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('POST /api/offers error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Błąd tworzenia oferty.' });
  }
});

/**
 * PATCH /api/offers/:id
 * Admin – update offer
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    // Recalculate pricePerM2 if price or area changed
    if (req.body.price && req.body.area && req.body.area > 0) {
      req.body.pricePerM2 = Math.round(req.body.price / req.body.area);
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    res.json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('PATCH /api/offers/:id error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Błąd aktualizacji oferty.' });
  }
});

/**
 * PUT /api/offers/:id
 * Admin – full update offer (alias for PATCH)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.body.price && req.body.area && req.body.area > 0) {
      req.body.pricePerM2 = Math.round(req.body.price / req.body.area);
    }

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    res.json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('PUT /api/offers/:id error:', err);
    res.status(500).json({ error: 'Błąd aktualizacji oferty.' });
  }
});

/**
 * PATCH /api/offers/:id/toggle
 * Admin – toggle active status
 */
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    offer.active = !offer.active;
    await offer.save();

    res.json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('PATCH /api/offers/:id/toggle error:', err);
    res.status(500).json({ error: 'Błąd zmiany statusu oferty.' });
  }
});

/**
 * PATCH /api/offers/:id/featured
 * Admin – toggle featured status
 */
router.patch('/:id/featured', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    offer.featured = !offer.featured;
    await offer.save();

    res.json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('PATCH /api/offers/:id/featured error:', err);
    res.status(500).json({ error: 'Błąd zmiany statusu wyróżnienia.' });
  }
});

/**
 * DELETE /api/offers/:id
 * Admin – delete offer
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    // Delete associated images from disk
    if (offer.images && offer.images.length > 0) {
      for (const img of offer.images) {
        await deleteImageFiles(img);
      }
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Oferta została usunięta.' });
  } catch (err) {
    console.error('DELETE /api/offers/:id error:', err);
    res.status(500).json({ error: 'Błąd usuwania oferty.' });
  }
});

/**
 * POST /api/offers/:id/images
 * Admin – add images to existing offer
 * Body: { images: [...imageObjects] }
 */
router.post('/:id/images', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    const newImages = req.body.images || [];
    if (!Array.isArray(newImages) || newImages.length === 0) {
      return res.status(400).json({ error: 'Brak zdjęć do dodania.' });
    }

    offer.images.push(...newImages);

    // Update main img
    if (offer.images.length > 0) {
      const first = offer.images[0];
      offer.img = first.webp || first.avif || first.original || offer.img;
    }

    await offer.save();
    res.json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('POST /api/offers/:id/images error:', err);
    res.status(500).json({ error: 'Błąd dodawania zdjęć.' });
  }
});

/**
 * DELETE /api/offers/:id/images/:imageIndex
 * Admin – remove specific image from offer
 */
router.delete('/:id/images/:imageIndex', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ error: 'Oferta nie została znaleziona.' });
    }

    const idx = parseInt(req.params.imageIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= offer.images.length) {
      return res.status(400).json({ error: 'Nieprawidłowy indeks zdjęcia.' });
    }

    // Delete files
    await deleteImageFiles(offer.images[idx]);

    offer.images.splice(idx, 1);

    // Update main img
    if (offer.images.length > 0) {
      const first = offer.images[0];
      offer.img = first.webp || first.avif || first.original || '';
    } else {
      offer.img = '';
    }

    await offer.save();
    res.json({ ...offer.toJSON(), id: offer._id });
  } catch (err) {
    console.error('DELETE /api/offers/:id/images/:idx error:', err);
    res.status(500).json({ error: 'Błąd usuwania zdjęcia.' });
  }
});

module.exports = router;
