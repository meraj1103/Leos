import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  ArrowUp, 
  Square, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  X
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useModelStore } from '../stores/useModelStore';
import { useAccountStore } from '../stores/useAccountStore';
import { speechService } from '../services/speechService';
import { LeosAttachment } from '../types';

export const PromptBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    sendMessage, 
    isStreaming, 
    stopGenerating, 
    activeAttachments, 
    addAttachment, 
    removeAttachment 
  } = useChatStore();

  const { models, activeModelId } = useModelStore();
  const { accounts, activeAccountId } = useAccountStore();

  const activeModel = models.find((m) => m.id === activeModelId) || models[0];
  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && activeAttachments.length === 0) || isStreaming) return;
    
    sendMessage(
      input.trim(),
      activeModel.id,
      activeModel.name,
      activeModel.provider,
      activeAccount?.id,
      activeAccount?.email
    );
    
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle voice dictation using the vector mic
  const toggleVoiceDictation = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      speechService.startListening({
        onStart: () => setIsListening(true),
        onResult: (transcript) => {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      });
    }
  };

  // File Upload Handlers (Documents & Photos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      
      const newAttachment: LeosAttachment = {
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        type: isImg ? 'image' : 'document',
        size: file.size,
        mimeType: file.type,
      };

      // Read content preview locally
      const reader = new FileReader();
      reader.onload = (event) => {
        newAttachment.content = event.target?.result as string;
        addAttachment(newAttachment);
      };

      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    addAttachment({
      id: `url-${Date.now()}`,
      name: urlInput.replace(/^https?:\/\//, '').slice(0, 30),
      type: 'url',
      url: urlInput.trim(),
    });
    setUrlInput('');
    setIsUrlModalOpen(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 select-none">
      {/* Active Attachments Preview Bar */}
      {activeAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {activeAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-leos-surface border border-leos-border rounded-lg text-xs text-leos-text shadow-sm"
            >
              {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
              {att.type === 'document' && <FileText className="w-3.5 h-3.5 text-amber-400" />}
              {att.type === 'url' && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="truncate max-w-[140px] font-medium">{att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 rounded hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Capsule */}
      <div className="relative flex flex-col bg-leos-surface border border-leos-border focus-within:border-leos-borderLight rounded-2xl shadow-lg transition-all">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,.pdf,.txt,.md,.json,.csv,.js,.ts,.py"
          className="hidden"
        />

        {/* Text Input Area */}
        <div className="p-3 pb-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={`Ask ${activeModel.name} (${activeAccount?.name || 'Account'})...`}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-leos-text placeholder:text-leos-muted leading-relaxed max-h-44"
          />
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left Buttons: Attachments & URL */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text transition-colors"
              title="Attach document or image"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsUrlModalOpen(!isUrlModalOpen)}
              className="p-1.5 rounded-lg hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text transition-colors"
              title="Add Web URL reference"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>

          {/* Right Buttons: Voice Dictation Mic & Send/Stop */}
          <div className="flex items-center gap-2">
            {/* Professional Vector Microphone (matches user reference, zero emoji) */}
            <button
              onClick={toggleVoiceDictation}
              className={`p-1.5 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'hover:bg-leos-surfaceHover text-leos-muted hover:text-leos-text'
              }`}
              title={isListening ? 'Stop voice dictation' : 'Voice dictation'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Send / Stop Generating Button */}
            {isStreaming ? (
              <button
                onClick={stopGenerating}
                className="p-1.5 rounded-lg bg-leos-card hover:bg-leos-surfaceHover border border-leos-border text-leos-text transition-colors shadow-sm"
                title="Stop generation"
              >
                <Square className="w-4 h-4 text-red-400 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && activeAttachments.length === 0}
                className="p-1.5 rounded-lg bg-leos-accent hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-leos-accent text-black font-semibold transition-all shadow-sm"
                title="Send prompt"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* URL Attachment Modal Popup */}
      {isUrlModalOpen && (
        <div className="mt-2 p-2.5 bg-leos-surface border border-leos-border rounded-xl shadow-lg flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
            placeholder="Paste website URL (https://...)"
            className="w-full bg-transparent text-xs text-leos-text outline-none placeholder:text-leos-muted"
          />
          <button
            onClick={handleAddUrl}
            className="px-2.5 py-1 bg-leos-card hover:bg-leos-surfaceHover border border-leos-border rounded-md text-xs text-leos-text font-medium shrink-0"
          >
            Add
          </button>
          <button
            onClick={() => setIsUrlModalOpen(false)}
            className="p-1 text-leos-muted hover:text-leos-text shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Subtext info */}
      <div className="text-center mt-2 text-[11px] text-leos-muted/80 font-mono">
        Leos operates local-first. Context synchronizes seamlessly across all accounts.
      </div>
    </div>
  );
};
