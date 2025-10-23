import React, { useState } from 'react';
import { marked } from 'marked';
import CopyIcon from './icons/CopyIcon';
import DownloadIcon from './icons/DownloadIcon';
import CloseIcon from './icons/CloseIcon';
import RefreshIcon from './icons/RefreshIcon';

interface ResultDisplayProps {
  posts: string[];
  imageUrls: string[];
  onRegenerate: (feedback: string) => void;
  isRegenerating: boolean;
  onRegeneratePosts: (feedback: string) => void;
  isRegeneratingPosts: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ posts, imageUrls, onRegenerate, isRegenerating, onRegeneratePosts, isRegeneratingPosts }) => {
  const [copyButtonTexts, setCopyButtonTexts] = useState<Record<number, string>>(
    posts.reduce((acc, _, index) => ({ ...acc, [index]: 'Copy Text' }), {})
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageFeedback, setImageFeedback] = useState('');
  const [postFeedback, setPostFeedback] = useState('');


  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopyButtonTexts(prev => ({ ...prev, [index]: 'Copied!' }));
    setTimeout(() => {
      setCopyButtonTexts(prev => ({ ...prev, [index]: 'Copy Text' }));
    }, 2000);
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-post-image-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const createMarkup = (markdownText: string) => {
    return { __html: marked(markdownText, { breaks: true, gfm: true }) };
  };

  const handleRegenerateImagesClick = () => {
    onRegenerate(imageFeedback);
    setImageFeedback('');
  }

  const handleRegeneratePostsClick = () => {
    onRegeneratePosts(postFeedback);
    setPostFeedback('');
  }


  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-center text-purple-300">Your Post is Ready!</h2>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-300 self-start sm:self-center">Choose an Image (Click to enlarge)</h3>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                 <input
                    type="text"
                    value={imageFeedback}
                    onChange={(e) => setImageFeedback(e.target.value)}
                    placeholder="e.g., 'Make them more vibrant'"
                    className="w-full sm:w-auto flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white p-2 placeholder-gray-400"
                    disabled={isRegenerating}
                />
                <button
                    onClick={handleRegenerateImagesClick}
                    disabled={isRegenerating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshIcon className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Images'}
                </button>
              </div>
            </div>
            <div className="relative">
                {isRegenerating && (
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
                        <div className="flex flex-col items-center gap-2">
                        <RefreshIcon className="w-8 h-8 animate-spin text-purple-400"/>
                        <p className="text-purple-300">Generating new visuals...</p>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                    <div 
                    key={index} 
                    className="relative group aspect-square cursor-pointer"
                    onClick={() => setSelectedImageUrl(url)}
                    >
                    <img 
                        src={url} 
                        alt={`Generated image option ${index + 1}`} 
                        className="rounded-md w-full h-full object-cover shadow-lg transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-md flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">View Full Size</span>
                    </div>
                    <button
                        onClick={(e) => {
                        e.stopPropagation(); // Prevent modal from opening
                        handleDownload(url, index)
                        }}
                        className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all opacity-0 group-hover:opacity-100"
                        aria-label={`Download Image ${index + 1}`}
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                    </div>
                ))}
                </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-300 self-start sm:self-center">Generated Posts</h3>
               <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                 <input
                    type="text"
                    value={postFeedback}
                    onChange={(e) => setPostFeedback(e.target.value)}
                    placeholder="e.g., 'Make the tone more professional'"
                    className="w-full sm:w-auto flex-grow bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white p-2 placeholder-gray-400"
                    disabled={isRegeneratingPosts}
                />
                <button
                    onClick={handleRegeneratePostsClick}
                    disabled={isRegeneratingPosts}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors"
                >
                    <RefreshIcon className={`w-4 h-4 ${isRegeneratingPosts ? 'animate-spin' : ''}`} />
                    {isRegeneratingPosts ? 'Regenerating...' : 'Regenerate Posts'}
                </button>
              </div>
            </div>
            <div className="relative space-y-6">
               {isRegeneratingPosts && (
                <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
                    <div className="flex flex-col items-center gap-2">
                    <RefreshIcon className="w-8 h-8 animate-spin text-purple-400"/>
                    <p className="text-purple-300">Crafting new post ideas...</p>
                    </div>
                </div>
              )}
              {posts.map((post, index) => (
                <div key={index} className="bg-gray-900/70 p-4 rounded-lg relative border border-gray-700/50">
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Option {index + 1}
                    </div>
                    <button
                        onClick={() => handleCopy(post, index)}
                        className="absolute top-2 right-2 bg-gray-700 text-gray-300 p-2 rounded-md hover:bg-gray-600 transition-colors text-xs flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
                        >
                        <CopyIcon className="w-4 h-4" />
                        {copyButtonTexts[index]}
                    </button>
                    <div 
                        className="prose prose-invert prose-sm max-w-none pt-8 text-gray-300" 
                        dangerouslySetInnerHTML={createMarkup(post)} 
                    />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImageUrl} 
              alt="Enlarged social media post image" 
              className="rounded-lg shadow-2xl object-contain max-w-full max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedImageUrl(null)}
              className="absolute -top-3 -right-3 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition-transform hover:scale-110"
              aria-label="Close image viewer"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultDisplay;