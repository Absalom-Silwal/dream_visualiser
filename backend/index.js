require('dotenv').config();
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const express = require('express');
const OpenAIApi  = require('openai');
const {openaiPromting} = require('./helpers/openAiHelper')
const {query} = require("./helpers/hugginFaceApi")


const app = express();;
app.use(express.json());
app.use(cors())

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const openai = new OpenAIApi({
  apiKey: process.env.OPEN_API_KEY
});

app.get('/generate-questions',async(req,res)=>{
    const visaType = '500';
    const role = 'IT';
    const location = 'Sydney';
    let previousAnswers = [];
    const prompt =`You are a mentor AI helping visa holders in Sydney share their journey.
    Ask one friendly, reflective question tailored to their visa type, role, location, and previous answers.`;
    
    //user promt coming from backend
    const userMessage = `
    Visa Type: ${visaType}
    Role: ${role}
    Location: ${location}
    Previous Answers: ${previousAnswers.map((answer)=>{
        return answer
        }).join(' ')}
    `;

  try {
    // const response = openaiPromting({
    //   model: "gpt-4",
    //   input: [
    //     { role: "system", content: prompt },
    //     { role: "user", content: userMessage }
    //   ]
    // })
    // const response = await openai.responses.create({
    //   model: "gpt-4",
    //   input: [
    //     { role: "system", content: prompt },
    //     { role: "user", content: userMessage }
    //   ]
    // });
    //console.log(response)
    const question = response.output_text;
    console.log('response',question)
    res.json({question})
  } catch (error) {
    console.error("Question generation error:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

app.post('/generate-story-card', async (req, res) => {
  try {
    //console.log(req);
    const {role,who,goal,health,additionalText} = req.body;
    //const userStory = `Goal:${I want to become a UX designer and work for a startup in Sydney.}`;
    const userGoal = `I want to become a ${role} and my personal goal is to ${goal}.
    I want to prioritise my health by ${health}.${additionalText}`
    const prompt = `
    You are a mentor AI helping migrants visualize their future based on their personal goals.

    Given a user goal and a list of relevant life categories, generate a personalized dream path across those categories.

    For each category:
    - Use the predefined milestone themes listed below
    - Generate exactly four milestones tailored to the user's goal
    - For each milestone:
      - Describe the milestone in first-person (vision)
      - Generate a vivid image prompt for AI visual generation
      - Provide one practical guidance step

    Milestone themes per category:

    Health:
    1. Reclaiming Energy
    2. Building Habits
    3. Feeling Strong
    4. Thriving Long-Term

    Wealth:
    1. Stabilizing Finances
    2. Growing Income
    3. Investing Wisely
    4. Achieving Freedom

    Love:
    1. Healing Past Wounds
    2. Opening Up
    3. Finding Connection
    4. Building Partnership

    Career:
    1. Clarifying Direction
    2. Gaining Skills
    3. Landing Opportunities
    4. Leading with Purpose

    Fitness:
    1. Starting Movement
    2. Building Consistency
    3. Seeing Results
    4. Feeling Empowered

    Family:
    1. Reconnecting
    2. Creating Rituals
    3. Navigating Conflict
    4. Deepening Bonds

    Spiritual:
    1. Seeking Meaning
    2. Exploring Practices
    3. Finding Peace
    4. Living Aligned

    Personal Development:
    1. Self-Awareness
    2. Emotional Growth
    3. Expanding Perspective
    4. Becoming Whole

    Home:
    1. Finding Safety
    2. Creating Comfort
    3. Expressing Identity
    4. Building Sanctuary

    Return the result as a JSON object with two keys:

    - "milestones": an array of 4 objects, each with:
      - "milestone": short title
      - "vision": first-person description of success
      - "imagePrompt": vivid, symbolic prompt for image generation

    - "guidances": an array of 4 strings, each one matching the milestone by index

    Tone: Warm, aspirational, emotionally resonant. Do not include any extra commentary or explanation.


    `;

   const response = await openai.responses.create({
      model: "gpt-4",
      input: [
        { role: "system", content: prompt },
        { role: "user", content: userGoal }
      ]
    });
    console.log('response',response);
  //const filePath = path.join(__dirname, 'resources', 'stories.json'); //reading the file from stories.json
  //const rawData = fs.readFileSync(filePath);
  let jsonData = JSON.parse(response.output_text);
  //const response = readJsonFile('helpers/fileReaderHelper.js');
  //console.log('jsonData',jsonData);
  let milestones = jsonData['milestones'];

  const enrichedMilestones = await Promise.all(
      milestones.map(async (milestone) => {
        const imagePrompt = milestone['imagePrompt'];
        const images = await query(imagePrompt); // async call
        return {
          ...milestone,
          images
        };
      })
    );
  jsonData['milestones'] = enrichedMilestones;
  res.json({response:jsonData});
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate story card" });
  }
});

app.listen(3001, () => console.log('✅ Server running on http://localhost:3001'));
