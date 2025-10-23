import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SocialPlatform, ImageStyle, ToneStyle } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateImages = async (
  userInput: string,
  style: ImageStyle,
  referenceImage: string | null,
  feedback: string | null
): Promise<string[]> => {
  try {
    const feedbackInstruction = feedback ? `Incorporate the following feedback: "${feedback}".` : '';

    if (referenceImage) {
        // --- Logic for reference image generation ---
        const imageModel = 'gemini-2.5-flash-image';
        
        const mimeType = referenceImage.match(/data:(.*?);/)?.[1];
        const base64Data = referenceImage.split(',')[1];
        if (!mimeType || !base64Data) {
            throw new Error("Invalid reference image format.");
        }

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType,
            },
        };

        const textPart = {
            text: `Generate an image based on the reference, but in a ${style} style. Incorporate the following theme: "${userInput}". ${feedbackInstruction} Important: Do not include any text or words in the generated image.`
        };

        const generateSingleImage = async () => {
             const response = await ai.models.generateContent({
                model: imageModel,
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
            throw new Error("Image data not found in response part.");
        };
        
        // Generate 3 images in parallel
        const imagePromises = [generateSingleImage(), generateSingleImage(), generateSingleImage()];
        const imageUrls = await Promise.all(imagePromises);
        return imageUrls;

    } else {
        // --- Existing logic for text-to-image generation ---
        const textModel = 'gemini-2.5-flash';
        const imagePromptResponse = await ai.models.generateContent({
            model: textModel,
            contents: `Based on the following user input, create a concise, descriptive, and visually compelling prompt for an AI image generator. The image should be in a ${style} style and suitable for a social media post. ${feedbackInstruction} Important: Do not include any text or words in the image. The user input is: "${userInput}"`,
        });

        const imagePrompt = imagePromptResponse.text;
        if (!imagePrompt) {
            throw new Error("Failed to generate an image prompt.");
        }

        const imageModel = 'imagen-4.0-generate-001';
        const imageResponse = await ai.models.generateImages({
            model: imageModel,
            prompt: imagePrompt,
            config: {
            numberOfImages: 3,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
            },
        });

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length < 3) {
            throw new Error("Failed to generate 3 image options.");
        }
        
        const imageUrls = imageResponse.generatedImages.map(img => {
            if (!img.image.imageBytes) {
                throw new Error("An image was generated without data.");
            }
            return `data:image/jpeg;base64,${img.image.imageBytes}`;
        });

        return imageUrls;
    }
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("Failed to generate images. Please try again.");
  }
};

export const generatePosts = async (
  userInput: string,
  platform: SocialPlatform,
  tone: ToneStyle,
  feedback: string | null
): Promise<string[]> => {
  try {
    const textModel = 'gemini-2.5-flash';
    const feedbackInstruction = feedback ? `Please incorporate this feedback into the new posts: "${feedback}".` : '';
    
    const textResponse = await ai.models.generateContent({
      model: textModel,
      contents: `Based on the following content, write 3 compelling and distinct social media posts for ${platform} in a ${tone} tone. The content is: "${userInput}". ${feedbackInstruction} Tailor the length and format appropriately for ${platform}. Include relevant hashtags. Use markdown for formatting like bolding or lists where appropriate. Return the response as a JSON array of 3 strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: 'A social media post.'
          }
        }
      }
    });
    
    const posts = JSON.parse(textResponse.text);

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      throw new Error("Failed to generate post text variations.");
    }
    return posts;

  } catch (error) {
    console.error("Error generating posts:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the generated post variations. The format was unexpected.");
    }
    throw new Error("Failed to generate posts. Please try again.");
  }
};


export const generateSocialPost = async (
  userInput: string,
  platform: SocialPlatform,
  style: ImageStyle,
  tone: ToneStyle,
  referenceImage: string | null
): Promise<{ posts: string[]; imageUrls: string[] }> => {
  try {
    const textGenerationPromise = generatePosts(userInput, platform, tone, null);
    const imageGenerationPromise = generateImages(userInput, style, referenceImage, null);

    const [posts, imageUrls] = await Promise.all([
      textGenerationPromise,
      imageGenerationPromise,
    ]);
    
    return { posts, imageUrls };
  } catch (error) {
    console.error("Error in generateSocialPost:", error);
    throw new Error("Failed to generate social post. Please try again later.");
  }
};