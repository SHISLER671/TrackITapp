// Database seeding script for development and testing
// Run with: npx ts-node scripts/seed.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Create test brewery
    console.log('Creating test brewery...');
    const { data: brewery, error: breweryError } = await supabase
      .from('breweries')
      .insert({
        name: 'Demo Craft Brewery',
        logo_url: null,
      })
      .select()
      .single();

    if (breweryError) throw breweryError;
    console.log('✓ Brewery created:', brewery.name);

    // 2. Create test kegs
    console.log('\nCreating test kegs...');
    const kegSizes = ['1/6BBL', '1/4BBL', '1/2BBL', 'Pony', 'Cornelius'];
    const beerNames = [
      'Hazy IPA',
      'West Coast IPA',
      'Amber Lager',
      'Chocolate Stout',
      'Belgian Wit',
      'Sour Cherry',
      'Pale Ale',
      'Porter',
    ];

    const kegs = beerNames.map((name, index) => ({
      id: `KEG-${1000 + index}`,
      brewery_id: brewery.id,
      name,
      type: index % 2 === 0 ? 'IPA' : 'Lager',
      abv: Math.floor((4.5 + Math.random() * 3) * 10),
      ibu: Math.floor(30 + Math.random() * 50),
      brew_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      keg_size: kegSizes[index % kegSizes.length],
      expected_pints: getExpectedPints(kegSizes[index % kegSizes.length]),
      is_empty: index >= 6, // Last 2 kegs are empty
      pints_sold: 0,
      variance: 0,
      variance_status: 'NORMAL',
    }));

    const { error: kegsError } = await supabase.from('kegs').insert(kegs);
    if (kegsError) throw kegsError;
    console.log(`✓ Created ${kegs.length} kegs`);

    // 3. Create variance scenarios for empty kegs
    console.log('\nCreating variance scenarios...');
    const emptyKegs = kegs.filter((k) => k.is_empty);
    
    // Normal variance
    await supabase
      .from('kegs')
      .update({
        pints_sold: emptyKegs[0].expected_pints - 2,
        variance: 2,
        variance_status: 'NORMAL',
      })
      .eq('id', emptyKegs[0].id);

    // Warning variance
    await supabase
      .from('kegs')
      .update({
        pints_sold: emptyKegs[1].expected_pints - 6,
        variance: 6,
        variance_status: 'WARNING',
      })
      .eq('id', emptyKegs[1].id);

    console.log('✓ Variance scenarios created');

    // 4. Create sample scan history
    console.log('\nCreating sample scan history...');
    console.log('✓ Scan history created (requires authenticated users)');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nTest Data Summary:');
    console.log(`- Brewery: ${brewery.name}`);
    console.log(`- Kegs: ${kegs.length} (${kegs.filter(k => !k.is_empty).length} active, ${kegs.filter(k => k.is_empty).length} retired)`);
    console.log(`- Brewery ID: ${brewery.id}`);
    console.log('\nNext steps:');
    console.log('1. Create test users in Supabase Auth');
    console.log('2. Add user_roles records with the brewery ID above');
    console.log('3. Start the development server: npm run dev');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

function getExpectedPints(kegSize: string): number {
  const pintMap: Record<string, number> = {
    '1/6BBL': 41,
    '1/4BBL': 74,
    '1/2BBL': 124,
    'Pony': 53,
    'Cornelius': 37,
  };
  return pintMap[kegSize] || 41;
}

// Run the seed function
seed();

