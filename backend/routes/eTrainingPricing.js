import express from 'express';
import ETrainingPricingSettings from '../models/ETrainingPricingSettings.js';
import requireExpert from '../middleware/requireExpert.js';

const router = express.Router();

const ALLOWED_CURRENCIES = ['TND', 'EUR', 'USD', 'MAD', 'DZD'];

function normalizeExchangeRates(input) {
  const out = {};
  const source = input && typeof input === 'object' ? input : {};
  for (const code of ALLOWED_CURRENCIES) {
    const raw = source[code];
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      out[code] = n;
    }
  }
  if (!out.TND) out.TND = 1;
  return out;
}

router.get('/', async (req, res) => {
  try {
    let settings = await ETrainingPricingSettings.getActiveSettings();

    if (!settings) {
      settings = await ETrainingPricingSettings.createDefaultSettings();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('❌ Error fetching e-training pricing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des prix E-Training',
      error: error.message,
    });
  }
});

router.put('/', requireExpert, async (req, res) => {
  try {
    const {
      totalPrice,
      currency,
      defaultDisplayCurrency,
      exchangeRates,
      service1Price,
      service2Price,
      service3Price,
      service1Duration,
      service2Duration,
      service3Duration,
      updatedBy = 'admin',
    } = req.body || {};

    let settings = await ETrainingPricingSettings.getActiveSettings();

    if (settings) {
      if (totalPrice !== undefined) settings.totalPrice = Number(totalPrice);
      if (currency !== undefined) settings.currency = 'TND';
      if (defaultDisplayCurrency !== undefined) {
        const value = String(defaultDisplayCurrency);
        if (ALLOWED_CURRENCIES.includes(value)) settings.defaultDisplayCurrency = value;
      }
      if (exchangeRates !== undefined) {
        settings.exchangeRates = normalizeExchangeRates(exchangeRates);
      }
      if (service1Price !== undefined) settings.service1Price = Number(service1Price);
      if (service2Price !== undefined) settings.service2Price = Number(service2Price);
      if (service3Price !== undefined) settings.service3Price = Number(service3Price);
      if (service1Duration !== undefined) settings.service1Duration = String(service1Duration);
      if (service2Duration !== undefined) settings.service2Duration = String(service2Duration);
      if (service3Duration !== undefined) settings.service3Duration = String(service3Duration);
      settings.updatedBy = updatedBy;
      settings.updatedAt = new Date();
      await settings.save();
    } else {
      settings = new ETrainingPricingSettings({
        totalPrice: Number.isFinite(Number(totalPrice)) ? Number(totalPrice) : 1290,
        currency: 'TND',
        defaultDisplayCurrency:
          defaultDisplayCurrency !== undefined && ALLOWED_CURRENCIES.includes(String(defaultDisplayCurrency))
            ? String(defaultDisplayCurrency)
            : 'TND',
        exchangeRates: exchangeRates !== undefined ? normalizeExchangeRates(exchangeRates) : undefined,
        service1Price: Number.isFinite(Number(service1Price)) ? Number(service1Price) : 290,
        service2Price: Number.isFinite(Number(service2Price)) ? Number(service2Price) : 590,
        service3Price: Number.isFinite(Number(service3Price)) ? Number(service3Price) : 490,
        service1Duration: service1Duration !== undefined ? String(service1Duration) : '7–14 jours',
        service2Duration: service2Duration !== undefined ? String(service2Duration) : '2–4 semaines',
        service3Duration: service3Duration !== undefined ? String(service3Duration) : '2–6 semaines',
        isActive: true,
        updatedBy,
      });
      await settings.save();
    }

    res.json({
      success: true,
      message: 'Prix E-Training enregistrés',
      data: settings,
    });
  } catch (error) {
    console.error('❌ Error saving e-training pricing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde des prix E-Training',
      error: error.message,
    });
  }
});

export default router;
