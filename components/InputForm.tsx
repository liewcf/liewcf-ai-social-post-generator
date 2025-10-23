import React from 'react';
import { SocialPlatform, ImageStyle, ToneStyle } from '../types';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';

interface InputFormProps {
  userInput: string;
  setUserInput: (value: string) => void;
  platform: SocialPlatform;
  setPlatform: (value: SocialPlatform) => void;
  imageStyle: ImageStyle;
  setImageStyle: (value: ImageStyle) => void;
  toneStyle: ToneStyle;
  setToneStyle: (value: ToneStyle) => void;
  referenceImage: string | null;
  setReferenceImage: (value: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  userInput,
  setUserInput,
  platform,
  setPlatform,
  imageStyle,
  setImageStyle,
  toneStyle,
  setToneStyle,
  referenceImage,
  setReferenceImage,
  onSubmit,
  isLoading,
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="userInput" className="block text-sm font-medium text-gray-300 mb-2">
          Your Content
        </label>
        <textarea
          id="userInput"
          rows={6}
          className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white p-3 placeholder-gray-400"
          placeholder="Enter a topic, product description, or any idea for your social media post..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            Reference Image (Optional)
        </label>
        {referenceImage ? (
            <div className="relative group w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                <img src={referenceImage} alt="Reference" className="rounded-md w-full object-cover" />
                <button
                    type="button"
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Remove reference image"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        ) : (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <div className="flex text-sm text-gray-400">
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-purple-500"
                    >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                </div>
            </div>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-2">
            Social Platform
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
            className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white p-3"
          >
            {Object.values(SocialPlatform).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="imageStyle" className="block text-sm font-medium text-gray-300 mb-2">
            Image Style
          </label>
          <select
            id="imageStyle"
            value={imageStyle}
            onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
            className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white p-3"
          >
            {Object.values(ImageStyle).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="toneStyle" className="block text-sm font-medium text-gray-300 mb-2">
            Tone of Voice
          </label>
          <select
            id="toneStyle"
            value={toneStyle}
            onChange={(e) => setToneStyle(e.target.value as ToneStyle)}
            className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white p-3"
          >
            {Object.values(ToneStyle).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : '✨ Generate Post'}
        </button>
      </div>
    </form>
  );
};

export default InputForm;