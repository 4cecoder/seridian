"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Cpu,
  Globe,
  AlertCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ModelOption {
  id: string;
  name: string;
  size: string;
  modelId: string;
}

const MODELS: ModelOption[] = [
  {
    id: "smol-360m",
    name: "SmolLM2 360M",
    size: "770MB",
    modelId: "HuggingFaceTB/SmolLM2-360M-Instruct",
  },
  {
    id: "smol-135m",
    name: "SmolLM 135M",
    size: "270MB",
    modelId: "HuggingFaceTB/SmolLM-135M-Instruct",
  },
  {
    id: "qwen-05b",
    name: "Qwen 0.5B",
    size: "1GB",
    modelId: "Qwen/Qwen2.5-0.5B-Instruct",
  },
];

function buildPrompt(messages: { role: string; content: string }[]): string {
  let prompt = "";
  for (const msg of messages) {
    prompt += "</instruction>" + msg.role + "\n" + msg.content + "\n</instruction>";
  }
  prompt += "</instruction>\nassistant\n";
  return prompt;
}

export function LLMArena() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<string>("unknown");
  const pipelineRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  }, [input, loading]);

  const handleClear = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r border-white/[0.08] bg-[#0c1222] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Models</span>
        </div>
        <div className="space-y-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                selectedModel?.id === model.id
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                  : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]"
              )}
            >
              <div className="text-sm font-medium">{model.name}</div>
              <div className="text-xs text-slate-500">{model.size}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-12 h-12 text-slate-600 mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">
                LLM Arena
              </h2>
              <p className="text-sm text-slate-400 max-w-md">
                Select a model and start chatting with local AI.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-cyan-500/20 text-cyan-100"
                    : "bg-white/[0.05] text-slate-200"
                )}
              >
                {msg.content || (loading && msg.role === "assistant" ? "Thinking..." : "")}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/[0.08] p-4">
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="rounded-lg border border-white/[0.08] bg-white/[0.05] p-2 text-slate-400 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={selectedModel ? "Type a message..." : "Select a model first"}
              disabled={!selectedModel}
              className="flex-1 rounded-lg border border-white/[0.08] bg-[#070b14] px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!selectedModel || loading || !input.trim()}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
