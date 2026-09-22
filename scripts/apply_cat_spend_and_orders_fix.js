const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

const sheetRows = [
  // CLT-001
  { client_id: 'CLT-001', category_name: 'Bathroom Amenities', total_spend_inr_auto: 268000, total_units_auto: 1300, total_co2e_kg_auto: 578.00, co2e_avoided_kg_auto: 2082.00, pct_of_client_total_spend_auto: 85.6 },
  { client_id: 'CLT-001', category_name: 'Disposables', total_spend_inr_auto: 7500, total_units_auto: 5000, total_co2e_kg_auto: 40.00, co2e_avoided_kg_auto: 13.00, pct_of_client_total_spend_auto: 2.4 },
  { client_id: 'CLT-001', category_name: 'Packaging', total_spend_inr_auto: 4400, total_units_auto: 2000, total_co2e_kg_auto: 200.00, co2e_avoided_kg_auto: 65.00, pct_of_client_total_spend_auto: 1.4 },
  { client_id: 'CLT-001', category_name: 'Amenity Accessories', total_spend_inr_auto: 33250, total_units_auto: 350, total_co2e_kg_auto: 0.00, co2e_avoided_kg_auto: 0.00, pct_of_client_total_spend_auto: 10.6 },
  
  // CLT-002
  { client_id: 'CLT-002', category_name: 'Bathroom Amenities', total_spend_inr_auto: 186000, total_units_auto: 1000, total_co2e_kg_auto: 150.00, co2e_avoided_kg_auto: 1350.00, pct_of_client_total_spend_auto: 57.9 },
  { client_id: 'CLT-002', category_name: 'Spa & Wellness', total_spend_inr_auto: 135000, total_units_auto: 300, total_co2e_kg_auto: 0.00, co2e_avoided_kg_auto: 0.00, pct_of_client_total_spend_auto: 42.1 },
  
  // CLT-003
  { client_id: 'CLT-003', category_name: 'Disposables', total_spend_inr_auto: 6750, total_units_auto: 1500, total_co2e_kg_auto: 90.00, co2e_avoided_kg_auto: 29.25, pct_of_client_total_spend_auto: 6.4 },
  { client_id: 'CLT-003', category_name: 'Packaging', total_spend_inr_auto: 4500, total_units_auto: 2500, total_co2e_kg_auto: 200.00, co2e_avoided_kg_auto: 65.00, pct_of_client_total_spend_auto: 4.2 },
  { client_id: 'CLT-003', category_name: 'Spa & Wellness', total_spend_inr_auto: 95000, total_units_auto: 250, total_co2e_kg_auto: 0.00, co2e_avoided_kg_auto: 0.00, pct_of_client_total_spend_auto: 89.4 }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log("--- 1. BACKUP TABLES ---");
    const backupDir = "C:\\Users\\home\\.gemini\\antigravity-ide\\brain\\4d5185c6-da43-4c64-ab54-0045775a90ac\\scratch";
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const catSpendBackup = await client.query("SELECT * FROM category_spend_by_client");
    const orderRegBackup = await client.query("SELECT * FROM order_register");

    const backupData = {
      timestamp: new Date().toISOString(),
      category_spend_by_client: catSpendBackup.rows,
      order_register: orderRegBackup.rows
    };

    const backupPath = path.join(backupDir, "db_backup.json");
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`Backup written to ${backupPath}`);
    console.log(`Backed up ${catSpendBackup.rows.length} category rows and ${orderRegBackup.rows.length} order rows.`);

    console.log("\n--- 2. DRY RUN ---");
    const existingCatSpend = catSpendBackup.rows;
    
    // Identify deletions
    const clientIdsInSheet = ['CLT-001', 'CLT-002', 'CLT-003'];
    const rowsToDelete = existingCatSpend.filter(row => {
      if (!clientIdsInSheet.includes(row.client_id)) return false;
      const keep = sheetRows.some(s => s.client_id === row.client_id && s.category_name === row.category_name);
      return !keep;
    });

    console.log("Rows to DELETE from category_spend_by_client:");
    console.table(rowsToDelete.map(r => ({ id: r.id, client_id: r.client_id, category_name: r.category_name })));

    console.log("\nRows to UPSERT into category_spend_by_client:");
    console.table(sheetRows);

    console.log("\nOrder Status updates in order_register:");
    console.log("ORD-001 (Order #1): order_status -> 'Delivered'");
    console.log("ORD-004 (Order #5): order_status -> 'Processing'");

    console.log("\n--- 3. EXECUTING TRANSACTION ---");
    await client.query("BEGIN");

    // Deletions per client_id
    for (const client_id of clientIdsInSheet) {
      const sheetCatNamesForClient = sheetRows
        .filter(s => s.client_id === client_id)
        .map(s => s.category_name);

      const deleteQuery = `
        DELETE FROM category_spend_by_client 
        WHERE client_id = $1 AND NOT (category_name = ANY($2::text[]))
      `;
      const delRes = await client.query(deleteQuery, [client_id, sheetCatNamesForClient]);
      console.log(`Deleted ${delRes.rowCount} old rows for ${client_id}`);
    }

    // Upserts
    for (const row of sheetRows) {
      const upsertQuery = `
        INSERT INTO category_spend_by_client 
          (client_id, category_name, total_spend_inr_auto, total_units_auto, total_co2e_kg_auto, co2e_avoided_kg_auto, pct_of_client_total_spend_auto)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (client_id, category_name) 
        DO UPDATE SET 
          total_spend_inr_auto = EXCLUDED.total_spend_inr_auto,
          total_units_auto = EXCLUDED.total_units_auto,
          total_co2e_kg_auto = EXCLUDED.total_co2e_kg_auto,
          co2e_avoided_kg_auto = EXCLUDED.co2e_avoided_kg_auto,
          pct_of_client_total_spend_auto = EXCLUDED.pct_of_client_total_spend_auto
      `;
      // Note: If no unique constraint on (client_id, category_name), we check if row exists or update/insert
      const existing = await client.query(
        "SELECT id FROM category_spend_by_client WHERE client_id = $1 AND category_name = $2",
        [row.client_id, row.category_name]
      );

      if (existing.rows.length > 0) {
        await client.query(`
          UPDATE category_spend_by_client
          SET total_spend_inr_auto = $3,
              total_units_auto = $4,
              total_co2e_kg_auto = $5,
              co2e_avoided_kg_auto = $6,
              pct_of_client_total_spend_auto = $7
          WHERE client_id = $1 AND category_name = $2
        `, [row.client_id, row.category_name, row.total_spend_inr_auto, row.total_units_auto, row.total_co2e_kg_auto, row.co2e_avoided_kg_auto, row.pct_of_client_total_spend_auto]);
        console.log(`Updated row for ${row.client_id} - ${row.category_name}`);
      } else {
        await client.query(`
          INSERT INTO category_spend_by_client 
            (client_id, category_name, total_spend_inr_auto, total_units_auto, total_co2e_kg_auto, co2e_avoided_kg_auto, pct_of_client_total_spend_auto)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [row.client_id, row.category_name, row.total_spend_inr_auto, row.total_units_auto, row.total_co2e_kg_auto, row.co2e_avoided_kg_auto, row.pct_of_client_total_spend_auto]);
        console.log(`Inserted new row for ${row.client_id} - ${row.category_name}`);
      }
    }

    // Update order_register for ORD-001 and ORD-004
    await client.query("UPDATE order_register SET order_status = 'Delivered' WHERE order_id = 'ORD-001'");
    await client.query("UPDATE order_register SET order_status = 'Processing' WHERE order_id = 'ORD-004'");

    await client.query("COMMIT");
    console.log("Transaction committed successfully!");

    console.log("\n--- 4. VERIFY DATABASE CONTENTS ---");
    const verifyCatSpend = await client.query("SELECT * FROM category_spend_by_client ORDER BY client_id, category_name");
    console.log("Updated category_spend_by_client rows:");
    console.table(verifyCatSpend.rows);

    const verifyOrders = await client.query("SELECT DISTINCT order_id, client_id, order_date, order_status FROM order_register ORDER BY order_id");
    console.log("Updated order_register summary:");
    console.table(verifyOrders.rows);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Transaction failed, rolled back:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
