import { db } from '@vercel/postgres';

export default async function handler(request, response) {
  // Ensure the table exists
  try {
    const client = await db.connect();
    await client.sql`
      CREATE TABLE IF NOT EXISTS food_logs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        kcal INTEGER NOT NULL,
        meal_type VARCHAR(50),
        amount INTEGER,
        unit VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (error) {
    console.error('Database setup error:', error);
  }

  // Handle GET request: Fetch all logs
  if (request.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT * FROM food_logs ORDER BY created_at DESC');
      return response.status(200).json(rows);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  // Handle POST request: Save new log
  if (request.method === 'POST') {
    const { name, kcal, meal_type, amount, unit } = request.body;
    
    if (!name || !kcal) {
      return response.status(400).json({ error: 'Name and kcal are required' });
    }

    try {
      const result = await db.query(
        'INSERT INTO food_logs (name, kcal, meal_type, amount, unit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, kcal, meal_type, amount, unit]
      );
      return response.status(201).json(result.rows[0]);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
