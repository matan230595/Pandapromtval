import { apiFetch } from '../utils/api';
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Prompt } from '../types';
import { GitMerge, Play, Save, Loader2, CheckCircle2, AlertCircle, Webhook } from 'lucide-react';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Webhook (Trigger)', isInput: true }, type: 'input' },
];

const initialEdges: Edge[] = [];

interface Props {
  prompts: Prompt[];
}

export const VisualWorkflow: React.FC<Props> = ({ prompts }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  
  const [isRunning, setIsRunning] = useState(false);
  const [initialInput, setInitialInput] = useState('');
  const [logs, setLogs] = useState<{nodeId: string, output: string, status: 'pending'|'running'|'success'|'error', label?: string}[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addPromptNode = () => {
    const prompt = prompts.find(p => p.id === selectedPromptId);
    if (!prompt) return;

    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { label: prompt.title, promptId: prompt.id, content: prompt.content },
    };
    setNodes((nds) => nds.concat(newNode));
  };
  
  const getTopologicalSort = () => {
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    nodes.forEach(n => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });
    
    edges.forEach(e => {
      adj.get(e.source)?.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });
    
    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });
    
    const sorted: string[] = [];
    while(queue.length > 0) {
      const u = queue.shift()!;
      sorted.push(u);
      adj.get(u)?.forEach(v => {
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        if (inDegree.get(v) === 0) queue.push(v);
      });
    }
    
    return sorted;
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runWorkflow = async () => {
    if (!initialInput.trim()) {
      setErrorMessage("נא להזין קלט התחלתי להפעלת תהליך העבודה");
      setShowLogs(true);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    setErrorMessage(null);
    
    setIsRunning(true);
    setShowLogs(true);
    const sortedNodeIds = getTopologicalSort();
    
    let currentInput = initialInput;
    const newLogs: any[] = [];
    
    for (const nodeId of sortedNodeIds) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;
      
      if (node.data.isInput) {
        newLogs.push({ nodeId, output: currentInput, status: 'success', label: 'קלט התחלתי' });
        setLogs([...newLogs]);
        continue;
      }
      
      newLogs.push({ nodeId, output: 'Running...', status: 'running', label: node.data.label });
      setLogs([...newLogs]);
      
      try {
        const fullPromptText = `${node.data.content}\n\n[קלט/מידע קודם]:\n${currentInput}`;
        
        const key = localStorage.getItem("promptvault_gemini_key") || "";
        const res = await apiFetch("/api/gemini/chat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(key ? { "x-gemini-api-key": key } : {})
          },
          body: JSON.stringify({ 
            messages: [{ role: "user", content: fullPromptText }]
          })
        });
        
        const data = await res.json();
        if (data.text) {
          currentInput = data.text;
          newLogs[newLogs.length - 1] = { nodeId, output: data.text, status: 'success', label: node.data.label };
        } else {
          throw new Error("No output");
        }
      } catch (err) {
        newLogs[newLogs.length - 1] = { nodeId, output: 'Error executing node', status: 'error', label: node.data.label };
        setLogs([...newLogs]);
        break; // stop workflow on error
      }
      setLogs([...newLogs]);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="p-4 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <GitMerge className="w-6 h-6 text-indigo-500" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none">תהליכי עבודה (Workflows)</h2>
            <p className="text-xs text-slate-500 mt-1">הרצת שרשרת פרומפטים מבוססת AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
            <select 
              className="bg-transparent border-none text-sm outline-none px-2 font-medium text-slate-700 dark:text-slate-300 w-48"
              value={selectedPromptId}
              onChange={e => setSelectedPromptId(e.target.value)}
            >
              <option value="" disabled>בחר פרומפט להוספה...</option>
              {prompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button 
              onClick={addPromptNode}
              disabled={!selectedPromptId}
              className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              הוסף צומת
            </button>

            <button 
              onClick={() => {
                const newNode: Node = {
                  id: (nodes.length + 1).toString(),
                  position: { x: 250, y: nodes.length * 100 + 50 },
                  data: { label: 'Webhook Trigger', isInput: true },
                  type: 'input'
                };
                setNodes((nds) => nds.concat(newNode));
              }}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Webhook className="w-3.5 h-3.5" /> הוסף טריגר
            </button>

          </div>
          <button 
            onClick={() => setShowLogs(!showLogs)} 
            className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3"
          >
            {showLogs ? 'הסתר פאנל הרצה' : 'הצג פאנל הרצה'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 w-full relative" dir="ltr">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="bg-slate-50 dark:bg-[#0a0a0a]"
          >
            <Controls className="bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 fill-slate-700 dark:fill-slate-300" />
            <MiniMap 
              className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden" 
              maskColor="rgba(0, 0, 0, 0.1)"
              nodeColor="#6366f1"
            />
            <Background color="#94a3b8" gap={16} size={1} />
          </ReactFlow>
        </div>

        {showLogs && (
          <div className="w-80 md:w-96 bg-white dark:bg-[#111] border-r border-slate-200 dark:border-white/10 flex flex-col h-full shrink-0 z-20 shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">הרצת התהליך</h3>
              <textarea 
                value={initialInput}
                onChange={e => setInitialInput(e.target.value)}
                placeholder="הכנס את הקלט הראשוני כאן (למשל: נושא למאמר)..."
                className="w-full h-24 p-3 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button 
                onClick={runWorkflow}
                disabled={isRunning}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'מריץ...' : 'הרץ תהליך'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0a0a0a]">
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                    {log.status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {log.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      שלב {i + 1}: {log.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono" dir="auto">
                    {log.output}
                  </div>
                </div>
              ))}
              {logs.length === 0 && !isRunning && (
                <div className="text-center text-slate-400 text-sm mt-10">
                  לחץ על "הרץ תהליך" כדי לראות את התוצאות כאן.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
