const { neon } = require("@neondatabase/serverless");

const connectionString = "postgresql://neondb_owner:npg_2Siy4NGsPWXH@ep-broad-paper-ai3vj5zo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString);

async function addEmailColumn() {
  console.log('Adding email column to registros table...');
  
  try {
    await sql("ALTER TABLE registros ADD COLUMN IF NOT EXISTS email VARCHAR(100)");
    console.log('Column "email" added successfully!');
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  process.exit(0);
}

addEmailColumn();
