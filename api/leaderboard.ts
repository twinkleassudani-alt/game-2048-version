import type { IncomingMessage, ServerResponse } from 'http';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  maxTile: number;
  date: number;
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'local-leaderboard-db.json');

// Helper to load scores from either Vercel KV or local filesystem
const loadScores = async (): Promise<LeaderboardEntry[]> => {
  // Check if Vercel KV is configured (i.e. if environment variables exist)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const data = await kv.get<LeaderboardEntry[]>('leaderboard_premium');
      return data || [];
    } catch (e) {
      console.error('Error fetching from Vercel KV:', e);
      // Fallback to local if error occurs
    }
  }

  // Fallback to local JSON database for local development
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading local JSON DB:', e);
  }
  return [];
};

// Helper to save scores to either Vercel KV or local filesystem
const saveScores = async (scores: LeaderboardEntry[]): Promise<boolean> => {
  // Keep only the top 30 scores to prevent database bloating
  const topScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set('leaderboard_premium', topScores);
      return true;
    } catch (e) {
      console.error('Error writing to Vercel KV:', e);
    }
  }

  // Fallback to local JSON database
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(topScores, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing to local JSON DB:', e);
    return false;
  }
};

// Main Serverless Request Handler
export default async function handler(req: any, res: any) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const scores = await loadScores();
      // Return top 15 scores to the client
      const top15 = scores.sort((a, b) => b.score - a.score).slice(0, 15);
      res.status(200).json(top15);
      return;
    }

    if (req.method === 'POST') {
      // Helper to parse JSON body from request stream if it hasn't been parsed
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          res.status(400).json({ error: 'Invalid JSON body' });
          return;
        }
      }

      const { name, score, maxTile } = body || {};

      // Inputs Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }
      if (typeof score !== 'number' || score < 0) {
        res.status(400).json({ error: 'Valid positive score is required' });
        return;
      }
      if (typeof maxTile !== 'number' || maxTile < 2) {
        res.status(400).json({ error: 'Valid maxTile is required' });
        return;
      }

      const sanitizedName = name.trim().substring(0, 15); // limit name to 15 characters
      const scores = await loadScores();

      const newEntry: LeaderboardEntry = {
        id: Math.random().toString(36).substring(2, 9),
        name: sanitizedName,
        score,
        maxTile,
        date: Date.now(),
      };

      scores.push(newEntry);
      const success = await saveScores(scores);

      if (success) {
        res.status(200).json({ message: 'Score submitted successfully!', entry: newEntry });
      } else {
        res.status(500).json({ error: 'Failed to write score' });
      }
      return;
    }

    res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (e: any) {
    console.error('Request Handler Exception:', e);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
}
