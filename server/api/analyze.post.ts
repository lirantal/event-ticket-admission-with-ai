import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const config = useRuntimeConfig();
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { image } = body;

    let tshirtText = await extractTextFromImage(image);
    console.log({ tshirtText });

    let admission = await evaluateAdmission(tshirtText);
    console.log({ admission });

    if (admission === "Yes") {
      return {
        success: true,
        coupon: uuidv4(),
      };
    } else {
      return {
        success: false,
        message: "Image analysis failed. Please try another image.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred during image analysis.",
    };
  }
});

async function extractTextFromImage(image) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Only reply with the text showing on this person's T-shirt",
          },
          {
            type: "image_url",
            image_url: {
              url: image,
            },
          },
        ],
      },
    ],
    temperature: 0,
  });

  const result = response.choices[0].message.content;
  return result;
}

async function evaluateAdmission(txt) {
  const conversationContextPrompt = `You are the concierge of a luxury tech event and you need to identify whether
    people wear a t-shirt with specific text on it to gain access to the event.
  RULES:
  - You will receive a text from the user that has been extracted from a t-shirt.
  - The text should be "Remix".
  - Reply with "Yes" or "No" to indicate whether the user can enter the event.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    //   model: "gpt-4",
    messages: [
      { role: "system", content: conversationContextPrompt },
      { role: "user", content: txt },
    ],
    temperature: 0,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [" Human:", " AI:"],
  });

  const responseText = response.choices[0].message.content;
  return responseText;
}
