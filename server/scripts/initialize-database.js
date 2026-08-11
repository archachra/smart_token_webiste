import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pool from '../config/database.js'

const migrationPath = fileURLToPath(new URL('../db/migrations/001_initial_schema.sql', import.meta.url))

try {
  const schema = await readFile(migrationPath, 'utf8')
  await pool.query(schema)
  console.log('SmartToken database schema initialized.')
} finally {
  await pool.end()
}
