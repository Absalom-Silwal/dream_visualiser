// require('dotenv').config();
// async function query(prompt) {
// 	const response = await fetch(
// 		"https://router.huggingface.co/fal-ai/fal-ai/qwen-image",
// 		{
// 			headers: {
// 				Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
// 				"Content-Type": "application/json",
// 			},
// 			method: "POST",
// 			body: JSON.stringify({     
//             sync_mode: true,
//             prompt: prompt 
//         }),
// 		}
// 	);
// 	const result = await response.blob();
// 	return result;
// }
// module.exports = {query}


const axios = require('axios');

async function query(prompt) {
  try {
    const response = await axios.post(
      'https://router.huggingface.co/fal-ai/fal-ai/qwen-image',
      {
        "sync_mode": true,
          "prompt": prompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`
        }
      }
    );

    // Assuming response contains image URL or base64

    return response['data']['images']; // adjust based on model
  } catch (err) {
    console.error('Image generation failed:', err);
    return null; // fallback image or error handling
  }
}
module.exports = {query}