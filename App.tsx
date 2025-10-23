import React, { useState } from 'react';
import { SocialPlatform, ImageStyle, ToneStyle } from './types';
import { generateSocialPost, generateImages, generatePosts } from './services/geminiService';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.Instagram);
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.Photorealistic);
  const [toneStyle, setToneStyle] = useState<ToneStyle>(ToneStyle.Casual);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegeneratingImages, setIsRegeneratingImages] = useState<boolean>(false);
  const [isRegeneratingPosts, setIsRegeneratingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ posts: string[]; imageUrls: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedResult = await generateSocialPost(userInput, platform, imageStyle, toneStyle, referenceImage);
      setResult(generatedResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateImages = async (feedback: string) => {
    if (!userInput) {
      setError("Original content is missing. Cannot regenerate images.");
      return;
    }
    setIsRegeneratingImages(true);
    setError(null);

    try {
      const newImageUrls = await generateImages(userInput, imageStyle, referenceImage, feedback);
      setResult(prevResult => {
        if (!prevResult) return null;
        return { ...prevResult, imageUrls: newImageUrls };
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while regenerating images.');
    } finally {
      setIsRegeneratingImages(false);
    }
  };

  const handleRegeneratePosts = async (feedback: string) => {
    if (!userInput) {
      setError("Original content is missing. Cannot regenerate posts.");
      return;
    }
    setIsRegeneratingPosts(true);
    setError(null);

    try {
      const newPosts = await generatePosts(userInput, platform, toneStyle, feedback);
      setResult(prevResult => {
        if (!prevResult) return null;
        return { ...prevResult, posts: newPosts };
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while regenerating posts.');
    } finally {
      setIsRegeneratingPosts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
       <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            AI Social Post Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Craft perfect posts with stunning visuals in seconds.
          </p>
        </header>

        <main className="bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8">
            <InputForm
                userInput={userInput}
                setUserInput={setUserInput}
                platform={platform}
                setPlatform={setPlatform}
                imageStyle={imageStyle}
                setImageStyle={setImageStyle}
                toneStyle={toneStyle}
                setToneStyle={setToneStyle}
                referenceImage={referenceImage}
                setReferenceImage={setReferenceImage}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </main>

        <section className="mt-8 w-full">
            {isLoading && <Loader />}
            {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
            {result && (
              <ResultDisplay 
                posts={result.posts} 
                imageUrls={result.imageUrls}
                onRegenerate={handleRegenerateImages}
                isRegenerating={isRegeneratingImages}
                onRegeneratePosts={handleRegeneratePosts}
                isRegeneratingPosts={isRegeneratingPosts}
              />
            )}
        </section>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
       </div>
    </div>
  );
};

export default App;