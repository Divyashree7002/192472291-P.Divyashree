import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { DesignCustomizationState, DesignStyle } from '../../types';
import { STYLE_PRESETS } from '../../utils/roomArchetypes';

interface AIDesignerAssistantProps {
  customization: DesignCustomizationState;
  onChangeCustomization: (updated: Partial<DesignCustomizationState>) => void;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionExecuted?: string;
}

export const AIDesignerAssistant: React.FC<AIDesignerAssistantProps> = ({
  customization,
  onChangeCustomization,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am SmartSpace Designer. How would you like to refine your room design?',
    },
  ]);

  const quickPrompts = [
    'Make my room more luxurious.',
    'Make this design cheaper.',
    'I want a Scandinavian style.',
    'Switch to warm terracotta wall colors.',
    'Optimize layout for more space.',
  ];

  const handleExecutePrompt = (text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');

    const lower = text.toLowerCase();
    let replyText = 'I have updated your room design accordingly!';
    let actionTag = 'Design updated';

    if (lower.includes('luxurious') || lower.includes('luxury')) {
      const preset = STYLE_PRESETS.luxury;
      onChangeCustomization({
        style: 'luxury',
        colors: {
          ...customization.colors,
          wall: preset.palette.wall,
          floor: preset.palette.floor,
          furniture: preset.palette.furniture,
          accent: preset.palette.accent,
        },
      });
      replyText = 'Switched to Luxury design style with rich mahogany finishes, marble tones, and sophisticated lighting.';
      actionTag = 'Applied Luxury Style';
    } else if (lower.includes('cheaper') || lower.includes('budget')) {
      // Reduce budget and select minimalist pieces
      onChangeCustomization({
        budget: Math.round(customization.budget * 0.75),
      });
      replyText = `Optimized budget to ₹${Math.round(customization.budget * 0.75).toLocaleString('en-IN')} by selecting cost-effective Scandinavian ash furniture.`;
      actionTag = 'Budget Reduced';
    } else if (lower.includes('scandinavian')) {
      const preset = STYLE_PRESETS.scandinavian;
      onChangeCustomization({
        style: 'scandinavian',
        colors: {
          ...customization.colors,
          wall: preset.palette.wall,
          floor: preset.palette.floor,
          furniture: preset.palette.furniture,
          accent: preset.palette.accent,
        },
      });
      replyText = 'Applied Scandinavian aesthetic with warm white walls, light oak flooring, and natural linen textures.';
      actionTag = 'Applied Scandinavian Style';
    } else if (lower.includes('terracotta') || lower.includes('warm')) {
      onChangeCustomization({
        colors: {
          ...customization.colors,
          wall: '#DDA896',
          accent: '#E07A5F',
        },
      });
      replyText = 'Updated wall color to warm Terracotta tone (#DDA896).';
      actionTag = 'Updated Wall Color';
    } else if (lower.includes('optimize') || lower.includes('space') || lower.includes('layout')) {
      replyText = 'Rearranged furniture pieces to maximize natural walkway clearance and door swing clearance.';
      actionTag = 'Layout Optimized';
    }

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        actionExecuted: actionTag,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-softBorder shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 bg-[#FAF7F2] border-b border-softBorder flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-bold shadow-terracotta">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-charcoal-900">SmartSpace Designer</h3>
              <p className="text-[10px] text-charcoal-500">AI Assistant for Live Design Control</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF9]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-terracotta-500 text-white shadow-terracotta'
                    : 'bg-white border border-softBorder text-charcoal-800 shadow-warm-xs'
                }`}
              >
                {m.text}
                {m.actionExecuted && (
                  <span className="block mt-1 text-[10px] font-mono font-bold text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded border border-sage-200">
                    ✓ {m.actionExecuted}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-softBorder flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleExecutePrompt(qp)}
              className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] border border-softBorder text-charcoal-700 hover:border-terracotta-300 shrink-0 font-medium transition-all"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) handleExecutePrompt(prompt.trim());
          }}
          className="p-3 bg-white border-t border-softBorder flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask SmartSpace Designer..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-softBorder focus:outline-none focus:border-terracotta-400"
          />
          <Button type="submit" variant="primary" size="sm" className="shadow-terracotta">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
