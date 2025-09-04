const OpenAIApi  = require('openai');
require('dotenv').config();

const openai = new OpenAIApi({
  apiKey: process.env.OPEN_API_KEY
});

async function openaiPromting(promptObj){
    //console.log(process.env.OPEN_API_KEY)
     return await openai.responses.create(promptObj);
}

module.exports = {openaiPromting}