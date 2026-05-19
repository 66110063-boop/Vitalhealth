import { db } from '@vercel/postgres';

export default async function handler(request, response) {
  // Ensure table exists (database migration on the fly)
  try {
    const client = await db.connect();
    
    // Create health_logs table with UNIQUE constraint on (email, log_date)
    await client.sql`
      CREATE TABLE IF NOT EXISTS health_logs (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        steps INTEGER DEFAULT 0,
        calories_burned INTEGER DEFAULT 0,
        calories_intake INTEGER DEFAULT 0,
        sleep_hours NUMERIC DEFAULT 0,
        log_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, log_date)
      );
    `;
  } catch (error) {
    console.error('Database setup error (logs table):', error);
  }

  // Handle GET request: Fetch all logs for a user
  if (request.method === 'GET') {
    const { email } = request.query;
    if (!email) {
      return response.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
      const { rows } = await db.query(
        'SELECT steps, calories_burned as "caloriesBurned", calories_intake as "caloriesIntake", sleep_hours as "sleepHours", to_char(log_date, \'YYYY-MM-DD\') as "logDate" FROM health_logs WHERE email = $1 ORDER BY log_date DESC',
        [email]
      );
      return response.status(200).json(rows);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  // Handle POST request: Sync/Upsert daily log summary
  if (request.method === 'POST') {
    const { email, steps, caloriesBurned, caloriesIntake, sleepHours, logDate } = request.body;
    if (!email || !logDate) {
      return response.status(400).json({ error: 'Email and logDate are required' });
    }

    try {
      const result = await db.query(
        `INSERT INTO health_logs (email, steps, calories_burned, calories_intake, sleep_hours, log_date) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (email, log_date) 
         DO UPDATE SET 
           steps = EXCLUDED.steps, 
           calories_burned = EXCLUDED.calories_burned, 
           calories_intake = EXCLUDED.calories_intake, 
           sleep_hours = EXCLUDED.sleep_hours, 
           created_at = CURRENT_TIMESTAMP 
         RETURNING *`,
        [
          email, 
          steps || 0, 
          caloriesBurned || 0, 
          caloriesIntake || 0, 
          sleepHours || 0, 
          logDate
        ]
      );
      return response.status(201).json(result.rows[0]);
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  // Handle DELETE request: Reset all logs for a user
  if (request.method === 'DELETE') {
    const { email } = request.query;
    if (!email) {
      return response.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
      await db.query('DELETE FROM health_logs WHERE email = $1', [email]);
      return response.status(200).json({ success: true, message: 'All logs cleared' });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
