#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const readline = require('readline');
const bcrypt = require('bcrypt');

const { init: initDb } = require('../db/init');
const { getDb } = require('../db/db');

function usage() {
  console.error('Usage: node scripts/create-admin.js <username> <name> [--admin]');
  process.exit(1);
}

function promptPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.stdin;
    const wasRaw = stdin.isTTY ? stdin.isRaw : false;

    process.stdout.write(prompt);

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let pwd = '';
    const onData = (chunk) => {
      const str = chunk.toString('utf8');
      for (const ch of str) {
        const code = ch.charCodeAt(0);
        if (ch === '\n' || ch === '\r' || code === 4) {
          stdin.removeListener('data', onData);
          if (stdin.isTTY) stdin.setRawMode(wasRaw);
          process.stdout.write('\n');
          rl.close();
          resolve(pwd);
          return;
        } else if (code === 3) { // Ctrl-C
          process.stdout.write('\n');
          process.exit(130);
        } else if (code === 8 || code === 127) {
          if (pwd.length > 0) {
            pwd = pwd.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          pwd += ch;
          process.stdout.write('*');
        }
      }
    };
    stdin.on('data', onData);
    stdin.resume();
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) usage();

  const username = args[0];
  const name = args[1];
  const isAdmin = args.includes('--admin');
  const role = isAdmin ? 'admin' : 'trainee';

  const password = await promptPassword('Password: ');
  if (!password || password.length < 4) {
    console.error('Password must be at least 4 characters.');
    process.exit(1);
  }
  const confirm = await promptPassword('Confirm password: ');
  if (password !== confirm) {
    console.error('Passwords do not match.');
    process.exit(1);
  }

  initDb();
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    console.error(`User "${username}" already exists.`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const info = db.prepare(`INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)`)
    .run(username, hash, name, role);

  console.log(`Created ${role} user "${username}" (id=${info.lastInsertRowid}).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
