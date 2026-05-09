const STORAGE_KEY = 'spark_offers';

const getOffers = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveOffers = (offers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
};

export const offersApi = {
  list: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const offers = getOffers();
    // Sort by created_date descending (newest first)
    return offers.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  },

  create: async (offerData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const offers = getOffers();
    const newOffer = {
      ...offerData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      created_date: new Date().toISOString(),
    };
    saveOffers([...offers, newOffer]);
    return newOffer;
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const offers = getOffers();
    saveOffers(offers.filter(offer => offer.id !== id));
    return { success: true };
  }
};
