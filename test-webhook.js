// Test script to verify Alchemy webhook is working
// Run this after deploying to test the integration

const WEBHOOK_URL = 'https://vzupzqmkhlepgncyfpbv.supabase.co/functions/v1/alchemy-webhook';

// Sample Alchemy webhook payload (simplified for testing)
const testPayload = {
  webhookId: "wh_test123",
  id: "whevt_test456",
  createdAt: new Date().toISOString(),
  type: "ADDRESS_ACTIVITY",
  event: {
    network: "ETH_MAINNET",
    activity: [
      {
        fromAddress: "0x28C6c06298d514Db089934071355E5743bf21d60", // Binance wallet
        toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Known whale
        blockNum: "0x12A5C20", // Example block
        hash: "0xtest123456789abcdef", // Unique test hash
        value: 500, // 500 ETH in decimal (not wei for testing)
        asset: "ETH",
        category: "external",
        rawContract: {
          rawValue: "0x1b1ae4d6e2ef500000", // 500 ETH in wei (hex)
          decimals: 18
        }
      }
    ]
  }
};

async function testWebhook() {
  console.log('🧪 Testing Alchemy Webhook...\n');
  console.log('Webhook URL:', WEBHOOK_URL);
  console.log('\n📤 Sending test transfer:');
  console.log('From: 0x28C6...21d60 (Binance)');
  console.log('To: 0x742d...0bEb (Whale)');
  console.log('Amount: 500 ETH (~$1.5M)\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Webhook processed the test transfer');
      console.log('\nResponse:', JSON.stringify(data, null, 2));
      console.log('\n🎉 Integration is working!');
      console.log('\nNext steps:');
      console.log('1. Check Supabase database for the test transfer');
      console.log('2. Run this SQL query:');
      console.log('   SELECT * FROM wallet_transfers ORDER BY created_at DESC LIMIT 1;');
      console.log('3. Configure your real Alchemy webhook in the dashboard');
    } else {
      console.error('❌ ERROR: Webhook returned an error');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      console.log('\n🔍 Debugging tips:');
      console.log('1. Check function logs: supabase functions logs alchemy-webhook');
      console.log('2. Verify database tables exist');
      console.log('3. Check Supabase service role permissions');
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to reach webhook');
    console.error(error.message);
    console.log('\n🔍 Debugging tips:');
    console.log('1. Check if function is deployed: supabase functions list');
    console.log('2. Verify the webhook URL is correct');
    console.log('3. Check your internet connection');
  }
}

// Run the test
testWebhook();
