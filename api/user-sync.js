import { db } from '@vercel/postgres';

export default async function handler(request, response) {
  // Ensure tables exist (database migration on the fly)
  try {
    const client = await db.connect();
    
    // Create users_profile table
    await client.sql`
      CREATE TABLE IF NOT EXISTS users_profile (
        email VARCHAR(255) PRIMARY KEY,
        age INTEGER,
        weight NUMERIC,
        height NUMERIC,
        gender VARCHAR(50),
        activity_level VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create users_settings table
    await client.sql`
      CREATE TABLE IF NOT EXISTS users_settings (
        email VARCHAR(255) PRIMARY KEY,
        theme_color VARCHAR(50),
        goals JSONB,
        notification_settings JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (error) {
    console.error('Database setup error (user tables):', error);
  }

  // Handle GET request: Fetch profile & settings
  if (request.method === 'GET') {
    const { email } = request.query;
    if (!email) {
      return response.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
      const profileResult = await db.query('SELECT * FROM users_profile WHERE email = $1', [email]);
      const settingsResult = await db.query('SELECT * FROM users_settings WHERE email = $1', [email]);

      return response.status(200).json({
        profile: profileResult.rows[0] || null,
        settings: settingsResult.rows[0] || null
      });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  // Handle POST request: Sync/Upsert profile & settings
  if (request.method === 'POST') {
    const { email, profile, settings } = request.body;
    if (!email) {
      return response.status(400).json({ error: 'Email is required' });
    }

    try {
      // 1. Upsert Profile if provided
      if (profile) {
        const { age, weight, height, gender, activityLevel } = profile;
        await db.query(
          `INSERT INTO users_profile (email, age, weight, height, gender, activity_level) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (email) 
           DO UPDATE SET 
             age = EXCLUDED.age, 
             weight = EXCLUDED.weight, 
             height = EXCLUDED.height, 
             gender = EXCLUDED.gender, 
             activity_level = EXCLUDED.activity_level, 
             updated_at = CURRENT_TIMESTAMP`,
          [email, age || null, weight || null, height || null, gender || null, activityLevel || null]
        );
      }

      // 2. Upsert Settings if provided
      if (settings) {
        const { themeColor, goals, notificationSettings } = settings;
        await db.query(
          `INSERT INTO users_settings (email, theme_color, goals, notification_settings) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (email) 
           DO UPDATE SET 
             theme_color = EXCLUDED.theme_color, 
             goals = EXCLUDED.goals, 
             notification_settings = EXCLUDED.notification_settings, 
             updated_at = CURRENT_TIMESTAMP`,
          [email, themeColor || null, JSON.stringify(goals || {}), JSON.stringify(notificationSettings || {})]
        );
      }

      return response.status(200).json({ success: true });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
