import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { languages, getLanguageName } from '@/lib/languages';
import { ArrowRightLeft, Copy, Languages, RotateCcw, X, Globe, Zap, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: async (data: { text: string; from: string; to: string }) => {
      const response = await apiRequest('POST', '/api/translate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setTranslatedText(data.translatedText);
      if (data.sourceLanguage !== 'auto') {
        setDetectedLanguage(data.sourceLanguage);
      }
    },
    onError: () => {
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    }
  });

  const detectLanguageMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/detect-language', { text });
      return response.json();
    },
    onSuccess: (data) => {
      setDetectedLanguage(data.language);
    }
  });

  // Auto-translate with debounce
  useEffect(() => {
    if (sourceText.trim() === '') {
      setTranslatedText('');
      return;
    }

    const timeoutId = setTimeout(() => {
      translateMutation.mutate({
        text: sourceText,
        from: sourceLanguage,
        to: targetLanguage
      });

      if (sourceLanguage === 'auto') {
        detectLanguageMutation.mutate(sourceText);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLanguage, targetLanguage]);

  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto') return;
    
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopyTranslation = async () => {
    if (!translatedText) return;
    
    try {
      await navigator.clipboard.writeText(translatedText);
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLanguage('');
  };

  const characterCount = sourceText.length;
  const maxCharacters = 5000;

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Languages className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Universal Translator</h1>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Translate Any Language Instantly
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Break down language barriers with our powerful translation tool supporting over 100 languages worldwide.
          </p>
        </div>

        {/* Translation Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          {/* Language Selection Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Source Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Languages Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSwapLanguages}
                  disabled={sourceLanguage === 'auto'}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* Target Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Translation Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Source Text Area */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Source Text</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSourceText('')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Enter text to translate..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="h-40 resize-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={maxCharacters}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {detectedLanguage ? `Detected: ${getLanguageName(detectedLanguage)}` : ''}
                  </span>
                  <span>{characterCount} / {maxCharacters} characters</span>
                </div>
              </div>
            </div>

            {/* Target Text Area */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Translation</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTranslation}
                      disabled={!translatedText}
                      className="text-primary hover:text-primary/80"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTranslatedText('')}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Textarea
                    readOnly
                    placeholder="Translation will appear here..."
                    value={translatedText}
                    className="h-40 resize-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  
                  {/* Loading Overlay */}
                  {translateMutation.isPending && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-700 bg-opacity-75 dark:bg-opacity-75 rounded-lg flex items-center justify-center">
                      <div className="flex items-center space-x-2 text-primary">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span className="text-sm font-medium">Translating...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>Translated to {getLanguageName(targetLanguage)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => translateMutation.mutate({ text: sourceText, from: sourceLanguage, to: targetLanguage })}
                disabled={!sourceText.trim() || translateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Languages className="h-4 w-4 mr-2" />
                Translate
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">100+ Languages</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Support for over 100 languages from around the world</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instant Translation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get real-time translations as you type</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Your translations are processed securely and privately</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © 2024 Universal Translator. Powered by advanced translation technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
