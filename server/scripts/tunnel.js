const ngrok = require('ngrok');
require('dotenv').config(); // Automatically finds .env in the server folder

(async function() {
  try {
    const PORT = process.env.PORT || 5000;
    const AUTH_TOKEN = process.env.NGROK_AUTHTOKEN;
    
    console.log('--- TrustLink Developer Tunnel ---');
    console.log(`Connecting to local port ${PORT}...`);
    
    if (AUTH_TOKEN) {
      const masked = AUTH_TOKEN.substring(0, 4) + '...' + AUTH_TOKEN.substring(AUTH_TOKEN.length - 4);
      console.log(`Using Auth Token: ${masked}`);
    } else {
      console.log('Warning: No NGROK_AUTHTOKEN found in .env');
    }

    // Provide explicit configuration to bypass potential environment-agnostic failures
    const url = await ngrok.connect({
      proto: 'http', 
      addr: `127.0.0.1:${PORT}`,
      authtoken: AUTH_TOKEN,
      onLogEvent: data => console.log(`[ngrok-log] ${data}`),
      onStatusChange: status => console.log(`[ngrok-status] ${status}`)
    });

    console.log('\n🚀 PUBLIC TUNNEL ACTIVE!');
    console.log('--------------------------------------------');
    console.log(`Link to share with friends: ${url}`);
    console.log('--------------------------------------------');
    console.log('\nIMPORTANT NEXT STEPS:');
    console.log(`1. Copy this URL: ${url}`);
    console.log('2. Update the "fetch" calls in your frontend to use this URL.');
    console.log('3. Your friends can now connect from anywhere in the world!');
    console.log('\n(Press Ctrl+C to stop the tunnel)');

  } catch (err) {
    if (err.message.includes('authtoken')) {
      console.error('\n❌ ERROR: Ngrok requires an Auth Token for security.');
      console.log('Follow these steps:');
      console.log('1. Go to https://dashboard.ngrok.com/signup and create a free account.');
      console.log('2. Copy your Auth Token from the dashboard.');
      console.log('3. Run this command: node scripts/tunnel.js --authtoken YOUR_TOKEN_HERE');
    } else {
      console.error('\n❌ Tunnel Error:', err.message);
    }
    process.exit(1);
  }
})();
