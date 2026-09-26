import Dexie from 'dexie';

class CallLoggerDB extends Dexie {
  customerNames;

  constructor() {
    super('CallLoggerDB');
    this.version(1).stores({
      customerNames: '++id, name, count, lastUsed'
    });
    this.customerNames = this.table('customerNames');
  }
}

const db = new CallLoggerDB();

// Function to add or update a customer name
export const addCustomerName = async (name) => {
  if (!name || typeof name !== 'string' || name.trim() === '') return;

  const trimmedName = name.trim().toLowerCase();
  const existing = await db.customerNames.where('name').equals(trimmedName).first();

  if (existing) {
    await db.customerNames.update(existing.id, {
      count: existing.count + 1,
      lastUsed: new Date()
    });
  } else {
    await db.customerNames.add({
      name: trimmedName,
      count: 1,
      lastUsed: new Date()
    });
  }
};

export const searchCustomerNames = async (query, limit = 10) => {
  const trimmedQuery = query?.trim().toLowerCase() || '';

  if (trimmedQuery === '') {
    const topResults = await db.customerNames
      .orderBy('count')
      .reverse()
      .limit(limit)
      .toArray();
    return topResults.map(item => item.name);
  }

  const results = await db.customerNames
    .where('name')
    .startsWith(trimmedQuery)
    .sortBy('count')
    .then(names => names.reverse().slice(0, limit));

  return results.map(item => item.name);
};

export const getAllCustomerNames = async () => {
  const names = await db.customerNames.orderBy('count').reverse().toArray();
  return names.map(item => item.name);
};

export default db;