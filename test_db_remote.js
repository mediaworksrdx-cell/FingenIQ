
const path = require('path');
const fs = require('fs');

console.log('Testing better-sqlite3 loading in /home/sathishbadri2015/fingeniq:');
try {
    const Database = require('better-sqlite3');
    const dbPath = path.resolve('/home/sathishbadri2015/fingeniq/src/lib/db.sqlite');
    const db = new Database(dbPath);
    console.log('DB opened successfully at:', dbPath);
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log('Users count:', row);
} catch (e) {
    console.error('Error loading DB:', e);
}
