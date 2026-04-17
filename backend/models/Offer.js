'use strict';

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    // ─── Podstawowe (wymagane) ─────────────────────────
    type: {
      type: String,
      enum: ['sprzedaz', 'wynajem'],
      required: [true, 'Typ transakcji jest wymagany'],
    },
    category: {
      type: String,
      enum: ['mieszkanie', 'dom', 'dzialka', 'lokal', 'biuro', 'garaz', 'magazyn', 'inne'],
      required: [true, 'Kategoria jest wymagana'],
    },
    title: {
      type: String,
      required: [true, 'Tytuł jest wymagany'],
      trim: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: [true, 'Cena jest wymagana'],
      min: 0,
    },
    area: {
      type: Number,
      required: [true, 'Powierzchnia jest wymagana'],
      min: 0,
    },
    address: {
      type: String,
      required: [true, 'Adres jest wymagany'],
      trim: true,
      maxlength: 500,
    },

    // ─── Rozszerzone (opcjonalne) ──────────────────────
    currency: { type: String, default: 'PLN', trim: true },
    pricePerM2: { type: Number, default: 0 },
    rooms: { type: Number, default: 0, min: 0 },
    floor: { type: Number, default: 0 },
    totalFloors: { type: Number, default: 0 },
    yearBuilt: { type: Number, default: null },
    
    // Szczegóły mieszkania / domu
    buildingType: { type: String, default: '', trim: true }, // blok, kamienica, apartamentowiec, dom wolnostojący
    buildingMaterial: { type: String, default: '', trim: true }, // cegła, wielka płyta, beton
    heatingType: { type: String, default: '', trim: true }, // miejskie, gazowe, elektryczne, kominkowe
    condition: { type: String, default: '', trim: true }, // do zamieszkania, do remontu, deweloperski, po remoncie
    parking: { type: String, default: '', trim: true }, // garaż, miejsce podziemne, naziemne, brak
    balcony: { type: Boolean, default: false },
    terrace: { type: Boolean, default: false },
    garden: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    basement: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    
    // Szczegóły działki
    plotArea: { type: Number, default: 0 }, // powierzchnia działki m²
    plotType: { type: String, default: '', trim: true }, // budowlana, rolna, rekreacyjna, leśna, inwestycyjna
    utilities: { type: String, default: '', trim: true }, // prąd, woda, gaz, kanalizacja
    fencing: { type: Boolean, default: false },
    
    // Lokalizacja szczegółowa
    city: { type: String, default: '', trim: true },
    district: { type: String, default: '', trim: true },
    street: { type: String, default: '', trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    
    // Opis i media
    desc: { type: String, default: '', trim: true, maxlength: 5000 },
    shortDesc: { type: String, default: '', trim: true, maxlength: 300 },
    
    // Zdjęcia – tablica obiektów
    images: [{
      original: { type: String, default: '' },
      webp: { type: String, default: '' },
      avif: { type: String, default: '' },
      thumb: { type: String, default: '' },
      thumbWebp: { type: String, default: '' },
      thumbAvif: { type: String, default: '' },
      alt: { type: String, default: '' },
      order: { type: Number, default: 0 },
    }],

    // Stare pole img dla kompatybilności
    img: { type: String, default: '' },
    
    // Dodatkowe cechy
    features: [{ type: String, trim: true }], // np. ['klimatyzacja', 'alarm', 'monitoring']
    
    // Koszty dodatkowe
    rent: { type: Number, default: 0 }, // czynsz administracyjny
    deposit: { type: Number, default: 0 }, // kaucja
    
    // SEO & meta
    slug: { type: String, default: '', trim: true },
    metaTitle: { type: String, default: '', trim: true },
    metaDescription: { type: String, default: '', trim: true },
    
    // Status
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false }, // wyróżniona oferta
    
    // Kontakt
    agentName: { type: String, default: '', trim: true },
    agentPhone: { type: String, default: '', trim: true },
    agentEmail: { type: String, default: '', trim: true },
    
    // Numer oferty / reference
    refNumber: { type: String, default: '', trim: true },
    
    // Źródło oferty
    source: { type: String, default: '', trim: true }, // np. 'otodom', 'olx', 'własne'
    sourceUrl: { type: String, default: '', trim: true },
    
    // Wideo
    videoUrl: { type: String, default: '', trim: true }, // YouTube, Vimeo
    virtualTourUrl: { type: String, default: '', trim: true }, // spacer wirtualny 3D
    
    // Daty
    availableFrom: { type: Date, default: null },
    
    // Statystyki
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-calculate price per m²
offerSchema.pre('save', function (next) {
  if (this.price && this.area && this.area > 0) {
    this.pricePerM2 = Math.round(this.price / this.area);
  }
  // Auto-generate slug
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[ąà]/g, 'a').replace(/[ćç]/g, 'c')
      .replace(/[ęè]/g, 'e').replace(/[łl]/g, 'l')
      .replace(/[ńñ]/g, 'n').replace(/[óò]/g, 'o')
      .replace(/[śš]/g, 's').replace(/[źżž]/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 120);
    this.slug += '-' + Date.now().toString(36);
  }
  // Set main img from first image if available
  if (this.images && this.images.length > 0 && !this.img) {
    const first = this.images[0];
    this.img = first.webp || first.avif || first.original || '';
  }
  next();
});

// Indexes
offerSchema.index({ active: 1, type: 1, category: 1 });
offerSchema.index({ price: 1 });
offerSchema.index({ area: 1 });
offerSchema.index({ city: 1, district: 1 });
offerSchema.index({ slug: 1 }, { unique: true, sparse: true });
offerSchema.index({ createdAt: -1 });
offerSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);
