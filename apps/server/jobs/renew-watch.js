#!/usr/bin/env node

/**
 * Gmail Watch Renewal Job
 * 
 * This script runs as a cron job to renew Gmail watch subscriptions.
 * Gmail watch subscriptions expire after 7 days, so this job runs every 6 hours
 * to ensure continuous email monitoring.
 */

import { createDb } from '../src/db/index.js';
import { connection } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

console.log('🔄 Starting Gmail watch renewal job...');

async function renewGmailWatches() {
  try {
    // Get database connection
    const { db } = createDb(process.env.DATABASE_URL || process.env.HYPERDRIVE?.connectionString);
    
    if (!db) {
      console.error('❌ No database connection available');
      process.exit(1);
    }

    // Get all active Google connections
    const connections = await db
      .select()
      .from(connection)
      .where(eq(connection.providerId, 'google'));

    console.log(`📧 Found ${connections.length} Google connections to check`);

    for (const conn of connections) {
      try {
        console.log(`🔄 Processing connection: ${conn.id}`);
        
        // Check if connection has valid tokens
        if (!conn.refreshToken) {
          console.log(`⚠️ Connection ${conn.id} has no refresh token, skipping`);
          continue;
        }

        // Import the Google subscription factory
        const { GoogleSubscriptionFactory } = await import('../src/lib/factories/google-subscription.factory.js');
        
        // Create factory instance
        const factory = new GoogleSubscriptionFactory();
        
        // Renew the watch for this connection
        // This will use the existing setupGmailWatch method
        await factory.renewWatch(conn);
        
        console.log(`✅ Successfully renewed watch for connection: ${conn.id}`);
        
      } catch (error) {
        console.error(`❌ Failed to renew watch for connection ${conn.id}:`, error.message);
        // Continue with other connections even if one fails
      }
    }

    console.log('✅ Gmail watch renewal job completed');
    
  } catch (error) {
    console.error('❌ Gmail watch renewal job failed:', error);
    process.exit(1);
  }
}

// Run the job
renewGmailWatches().then(() => {
  console.log('🏁 Job finished successfully');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Job failed:', error);
  process.exit(1);
}); 