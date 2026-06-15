import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Camera, Upload, Wand2, Download, RefreshCw, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MagicStudio = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("white marble table, soft sunlight, blurred modern kitchen background");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateStudioEffect = async () => {
    if (!image) return;
    setLoading(true);
    setResultImage(null);

    try {
      // Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Prepare image data
      // Remove 'data:image/jpeg;base64,' prefix
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const model = "gemini-2.5-flash-image"; // Using the image generation/editing model
      
      // Prompt for the model
      const fullPrompt = `Generate a professional product photography version of this image. 
      Keep the main product exactly as is, but place it in a new environment: ${prompt}.
      Ensure the lighting matches the new environment. High quality, photorealistic, 4k.`;

      const generatePromise = ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { 
                inlineData: { 
                    data: base64Data, 
                    mimeType: mimeType 
                } 
            },
            { text: fullPrompt },
          ],
        },
      });

      // 45 second timeout for the AI call
      const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("AI processing timed out. Please try again.")), 45000);
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      // Extract the generated image
      // The response structure for image generation might vary, but typically it's in the candidates
      // For gemini-2.5-flash-image acting as an editor/generator, it might return text or image.
      // If it returns an image, it's usually in the parts.
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                setResultImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                break;
            }
        }
      }
      
      if (!resultImage && parts) {
         // Fallback: sometimes it might return a link or text if it failed to generate an image directly
         // But for this model, we expect inlineData.
         // If no image found, maybe check for text error
         const textPart = parts.find(p => p.text);
         if (textPart) {
             console.log("Model returned text instead of image:", textPart.text);
             // It might be refusing to edit.
             alert("AI could not generate the image. It might have refused the request. Try a different prompt.");
         }
      }

    } catch (error) {
      console.error("Studio generation failed:", error);
      alert("Failed to generate studio effect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wand2 className="text-indigo-600" size={24} />
            Magic Studio
            </h1>
            <p className="text-xs text-gray-500 font-medium">AI-Powered Product Photography</p>
        </div>
      </div>

      <div className="p-6 max-w-xl mx-auto space-y-6">
        
        {/* Image Upload Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            {!image ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-10 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <Camera size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Upload Product Photo</h3>
                        <p className="text-xs text-gray-400 mt-1">Tap to take photo or choose from gallery</p>
                    </div>
                </div>
            ) : (
                <div className="relative group">
                    <img src={image} alt="Original" className="w-full h-64 object-contain rounded-xl bg-gray-50" />
                    <button 
                        onClick={() => { setImage(null); setResultImage(null); }}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-red-500 hover:bg-red-50"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
            />
        </div>

        {/* Controls */}
        {image && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 block">
                        Studio Setting (Prompt)
                    </label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                        placeholder="Describe the background (e.g., on a wooden table, in a white studio...)"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        "White studio, soft lighting",
                        "Wooden table, cozy vibe",
                        "Marble countertop, luxury",
                        "Neon lights, cyber style",
                        "Nature background, sunlight"
                    ].map((p) => (
                        <button 
                            key={p}
                            onClick={() => setPrompt(p)}
                            className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={generateStudioEffect}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Generating Magic...
                        </>
                    ) : (
                        <>
                            <Wand2 size={20} />
                            Generate Studio Effect
                        </>
                    )}
                </button>
            </div>
        )}

        {/* Result */}
        {resultImage && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon size={18} className="text-indigo-600" />
                    Generated Result
                </h3>
                <img src={resultImage} alt="Generated" className="w-full rounded-xl shadow-sm" />
                
                <a 
                    href={resultImage} 
                    download={`magic-studio-${Date.now()}.png`}
                    className="block w-full py-3 bg-slate-900 text-white text-center rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                    Download Image
                </a>
            </div>
        )}

      </div>
    </div>
  );
};

export default MagicStudio;
