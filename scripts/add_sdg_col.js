const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:YpaYGLG8i6xmQoKP@db.ithvvxdcfyckculqzgkg.supabase.co:5432/postgres' });

async function run() {
  try {
    // Add column if not exists
    await pool.query(`
      ALTER TABLE public.scores_summary 
      ADD COLUMN IF NOT EXISTS sdg_alignments jsonb DEFAULT '[]'::jsonb;
    `);
    
    console.log("Column added.");

    // Update Bare Necessities
    await pool.query(`
      UPDATE public.scores_summary 
      SET sdg_alignments = '[8, 9, 12, 16]'::jsonb
      WHERE enterprise_name = 'Bare Necessities Zero Waste Solutions Pvt. Ltd.';
    `);

    // Update Kheoni
    await pool.query(`
      UPDATE public.scores_summary 
      SET sdg_alignments = '[]'::jsonb
      WHERE enterprise_name = 'Kheoni Ventures Pvt Ltd';
    `);
    
    console.log("Mock data populated.");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
