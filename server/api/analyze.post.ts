import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  });

  try {
    const body = await readBody(event);
    const { image } = body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this image and determine if it's appropriate for a coupon. Return only 'PASS' or 'FAIL'." 
            },
            {
              type: "image_url",
              image_url: {
                "url": image
              }, 
            }
          ],
        },
      ],
      max_tokens: 1,
      temperature: 0,
    });

    const result = response.choices[0].message.content;
    
    if (result === 'PASS') {
      return {
        success: true,
        coupon: uuidv4()
      };
    } else {
      return {
        success: false,
        message: 'Image analysis failed. Please try another image.'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during image analysis.'
    };
  }
});