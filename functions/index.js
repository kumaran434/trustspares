
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { GoogleGenAI } from "@google/genai";

initializeApp();

// Set global options for Gen 2 functions
setGlobalOptions({ maxInstances: 10 });

// 1. Send Push Notification Function
export const sendPushNotification = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { fcmToken, title, body } = request.data;

  if (!fcmToken) {
    return { success: false, error: "No FCM Token provided" };
  }

  const message = {
    token: fcmToken,
    notification: {
      title: title || "New Notification",
      body: body || "",
    },
    android: {
      priority: "high",
      notification: {
        sound: "default",
      }
    },
    webpush: {
      headers: {
        Urgency: "high"
      },
      fcmOptions: {
        link: "/" 
      }
    }
  };

  try {
    const response = await getMessaging().send(message);
    console.log("Successfully sent message:", response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message, code: error.code };
  }
});

// 2. Generate Studio Image (Gemini AI) - Secure Backend Call
export const generateStudioImage = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { image, mimeType } = request.data;
    
    // Ensure you set this env var in Firebase Functions: 
    // firebase functions:secrets:set GEMINI_API_KEY
    // or use firebase functions:config:set
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY; 

    if (!apiKey) {
        console.error("API Key Missing in Server Environment");
        throw new HttpsError('failed-precondition', 'Server API Key not configured.');
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType || 'image/jpeg', data: image } },
                    { text: "Product Image Editing: 1. Remove the entire background and replace with pure white (#FFFFFF). 2. Remove cast shadows. 3. Enhance lighting. Return the edited image." }
                ]
            }
        });

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts;
        let generatedBase64 = null;

        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    generatedBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (generatedBase64) {
            return { success: true, image: `data:image/png;base64,${generatedBase64}` };
        } else {
            return { success: false, error: "AI returned no image." };
        }

    } catch (error) {
        console.error("AI Gen Error:", error);
        // Map common errors
        if (error.status === 429) {
             throw new HttpsError('resource-exhausted', 'AI Quota Exceeded');
        }
        throw new HttpsError('internal', error.message || "Failed to generate image");
    }
});
