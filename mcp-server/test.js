#!/usr/bin/env node
/**
 * Simple test script for Santa AI MCP Server
 * Tests that the server can start and access data files
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🎅 Santa AI MCP Server Test\n');

// Test 1: Check environment variables
console.log('1️⃣ Checking Azure OpenAI configuration...');
const hasEndpoint = !!process.env.AZURE_OPENAI_ENDPOINT;
const hasKey = !!process.env.AZURE_OPENAI_KEY;
console.log(`   Endpoint: ${hasEndpoint ? '✅' : '❌'}`);
console.log(`   API Key: ${hasKey ? '✅' : '❌'}`);

// Test 2: Check data files
console.log('\n2️⃣ Checking data files...');
const PLAYERS_PATH = join(__dirname, '..', 'server', 'models', 'players.json');
const ASSIGNMENTS_PATH = join(__dirname, '..', 'server', 'models', 'assignments.json');
const MESSAGES_PATH = join(__dirname, '..', 'server', 'models', 'messages.json');

async function checkFile(path, name) {
  try {
    const data = await fs.readFile(path, 'utf-8');
    const json = JSON.parse(data);
    console.log(`   ${name}: ✅ (${Object.keys(json).length} keys)`);
    return true;
  } catch (error) {
    console.log(`   ${name}: ❌ (${error.message})`);
    return false;
  }
}

await checkFile(PLAYERS_PATH, 'players.json');
await checkFile(ASSIGNMENTS_PATH, 'assignments.json');
await checkFile(MESSAGES_PATH, 'messages.json');

// Test 3: Check MCP SDK
console.log('\n3️⃣ Checking MCP SDK...');
try {
  await import('@modelcontextprotocol/sdk/server/index.js');
  console.log('   MCP SDK: ✅');
} catch (error) {
  console.log('   MCP SDK: ❌ (run: npm install)');
}

console.log('\n✨ Test complete! If all checks passed, the MCP server is ready to use.');
console.log('\n📖 Next steps:');
console.log('   1. Add server to Claude Desktop or VS Code');
console.log('   2. Restart the AI assistant');
console.log('   3. Try: "Use Santa AI to list all players"');