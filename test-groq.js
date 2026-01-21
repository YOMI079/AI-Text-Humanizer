/**
 * ============================================================================
 * AI PROVIDERS TEST SCRIPT
 * ============================================================================
 * 
 * Run this file to test your API keys:
 *   node test-groq.js
 * 
 * ============================================================================
 */

const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const HF_MODEL = 'openai/gpt-oss-20b';
const HF_API_URL = 'https://router.huggingface.co/novita/v3/openai/chat/completions';

async function testGroqAPI() {
  console.log('\n' + '═'.repeat(50));
  console.log('🔄 Testing GROQ API...');
  console.log('═'.repeat(50));
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ GROQ_API_KEY is not set in .env.local');
    console.log('🔗 Get your free API key at: https://console.groq.com/keys');
    return false;
  }

  console.log('✅ API Key found');
  console.log(`📦 Model: ${GROQ_MODEL}`);

  try {
    const client = new Groq({ apiKey });
    const startTime = Date.now();
    
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: 'Say "Groq is working!" and nothing else.' }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const endTime = Date.now();
    const response = completion.choices[0]?.message?.content;

    console.log(`\n✅ SUCCESS! Response: ${response}`);
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'N/A'}`);
    return true;

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    if (error.status === 401) {
      console.error('🔑 Invalid API key');
    }
    return false;
  }
}

async function testHuggingFaceAPI() {
  console.log('\n' + '═'.repeat(50));
  console.log('🔄 Testing HUGGING FACE API...');
  console.log('═'.repeat(50));
  
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    console.error('❌ HUGGINGFACE_API_KEY is not set in .env.local');
    console.log('🔗 Get your free API key at: https://huggingface.co/settings/tokens');
    return false;
  }

  console.log('✅ API Key found');
  console.log(`📦 Model: ${HF_MODEL}`);

  try {
    const startTime = Date.now();
    
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [{ role: 'user', content: 'Say "Hugging Face is working!" and nothing else.' }],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const text = data.choices?.[0]?.message?.content;

    console.log(`\n✅ SUCCESS! Response: ${text}`);
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`📊 Tokens used: ${data.usage?.total_tokens || 'N/A'}`);
    return true;

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    if (error.message.includes('401')) {
      console.error('🔑 Invalid API key');
    } else if (error.message.includes('503')) {
      console.error('⏳ Model is loading. Try again in a few seconds.');
    }
    return false;
  }
}

async function main() {
  console.log('\n🚀 AI TEXT HUMANIZER - API Test\n');
  
  const groqResult = await testGroqAPI();
  const hfResult = await testHuggingFaceAPI();
  
  console.log('\n' + '═'.repeat(50));
  console.log('📋 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Groq (llama-3.3-70b):     ${groqResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`Hugging Face (llama-3.1): ${hfResult ? '✅ Working' : '❌ Failed'}`);
  console.log('═'.repeat(50));
  
  if (groqResult || hfResult) {
    console.log('\n🎉 At least one provider is working! You can use the AI Text Humanizer.\n');
  } else {
    console.log('\n⚠️  No providers working. Please check your API keys.\n');
    process.exit(1);
  }
}

main();
