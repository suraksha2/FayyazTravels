#!/usr/bin/env node

const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootroot',
  database: process.env.DB_NAME || 'fayyaz_It_sql',
  port: process.env.DB_PORT || 3306
});

console.log('🔍 Checking tbl_booking table structure...');
console.log('');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  connection.query('DESCRIBE tbl_booking', (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err.message);
      process.exit(1);
    }

    console.log('📋 tbl_booking table structure:');
    console.log('');
    console.log('| Field | Type | Null | Key | Default | Extra |');
    console.log('|-------|------|------|-----|---------|-------|');
    
    results.forEach(column => {
      const field = column.Field.padEnd(20);
      const type = column.Type.padEnd(15);
      const nullValue = column.Null.padEnd(5);
      const key = column.Key.padEnd(5);
      const defaultValue = (column.Default || 'NULL').toString().padEnd(10);
      const extra = column.Extra || '';
      
      console.log(`| ${field} | ${type} | ${nullValue} | ${key} | ${defaultValue} | ${extra} |`);
    });

    console.log('');
    console.log('🔍 Required fields (NOT NULL without default):');
    const requiredFields = results.filter(col => col.Null === 'NO' && col.Default === null && col.Extra !== 'auto_increment');
    
    if (requiredFields.length > 0) {
      requiredFields.forEach(field => {
        console.log(`   ❗ ${field.Field} (${field.Type}) - REQUIRED`);
      });
    } else {
      console.log('   ✅ No additional required fields found');
    }

    connection.end();
  });
});
