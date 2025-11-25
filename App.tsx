import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, UploadIcon, SparklesIcon, LeafIcon } from './components/Icons';
import { identifyImage } from './services/gemini';
import { IdentificationResult, ImageState } from './types';
import { ResultCard } from './components/ResultCard';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageState({ file, previewUrl, base64 });
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Data: string) => {
    setLoading(true);
    try {
      const analysisResult = await identifyImage(base64Data);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || '识别过程中发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setImageState({ file: null, previewUrl: null, base64: null });
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LeafIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NatureLens</h1>
        </div>
        <p className="text-gray-600">
          AI 驱动的植物百科全书。<br/>
          <span className="text-xs text-gray-400">(甚至能识别一些奇怪的生物...)</span>
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col items-center gap-6">
        
        {/* Error Message */}
        {error && (
          <div className="w-full p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm animate-pulse">
            <p className="font-bold">出错啦</p>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-sm underline mt-2 hover:text-red-900"
            >
              关闭
            </button>
          </div>
        )}

        {/* Initial Upload State */}
        {!imageState.previewUrl && !loading && (
          <div className="w-full flex flex-col gap-4">
             <div 
              onClick={triggerFileInput}
              className="group relative w-full aspect-[4/3] bg-white rounded-3xl border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer flex flex-col items-center justify-center shadow-sm hover:shadow-md"
            >
              <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <CameraIcon className="w-10 h-10" />
              </div>
              <p className="text-lg font-semibold text-gray-700">点击拍照或上传图片</p>
              <p className="text-sm text-gray-400 mt-2">支持 JPG, PNG 格式</p>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="w-full aspect-[4/3] bg-white/80 backdrop-blur rounded-3xl flex flex-col items-center justify-center shadow-lg border border-white">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 border-t-primary rounded-full animate-spin"></div>
              <LeafIcon className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700 animate-pulse">正在识别中...</p>
            <p className="text-sm text-gray-500 mt-2">AI 正在分析植物特征</p>
          </div>
        )}

        {/* Result State */}
        {imageState.previewUrl && !loading && (
          <div className="w-full animate-fade-in space-y-6">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-3xl shadow-lg group">
              <img 
                src={imageState.previewUrl} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleReset}
                  className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-white"
                >
                  更换图片
                </button>
              </div>
            </div>

            {result && (
              <ResultCard result={result} onReset={handleReset} />
            )}
          </div>
        )}
      </main>
      
      <footer className="mt-12 text-center text-gray-400 text-xs">
        <p>© 2024 NatureLens. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
