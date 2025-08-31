"use client";
import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiDownload, FiEdit, FiTrash2, FiCheckSquare, FiSquare } from 'react-icons/fi';
import Papa from 'papaparse';
import InteractiveLogo from '@/components/InteractiveLogo';
import SplashScreen from '@/components/SplashScreen';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import SkeletonCard from '@/components/SkeletonCard';

type ActionItem = {
  id: number;
  task: string;
  deadline: string;
  assignedTo: string;
  completed: boolean;
};

// Group action items by assignee
const groupActionItems = (items: ActionItem[]) => {
  return items.reduce((acc, item) => {
    const key = item.assignedTo || 'Unassigned';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ActionItem[]>);
};


export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedTask, setEditedTask] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const processedItems = useMemo(() => {
    let sorted = [...actionItems];

    // Filter
    if (filterAssignee !== 'all') {
      sorted = sorted.filter(item => item.assignedTo === filterAssignee);
    }

    // Sort
    if (sortOrder === 'deadline') {
      sorted = sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortOrder === 'assignee') {
      sorted = sorted.sort((a, b) => a.assignedTo.localeCompare(b.assignedTo));
    }
    return sorted;
  }, [actionItems, filterAssignee, sortOrder]);

  const groupedItems = useMemo(() => groupActionItems(processedItems), [processedItems]);

  const uniqueAssignees = useMemo(() => {
    return ['all', ...Array.from(new Set(actionItems.map(item => item.assignedTo)))];
  }, [actionItems]);


  const handleExtract = async () => {
    setIsLoading(true);
    setActionItems([]);
    toast.loading('Extracting action items...');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      toast.dismiss();
      if (!response.ok) {
        throw new Error('Failed to extract action items.');
      }

      const data = await response.json();
      const itemsWithState = data.actionItems.map((item: Omit<ActionItem, 'id' | 'completed'>, index: number) => ({
        ...item,
        id: Date.now() + index,
        completed: false,
      }));
      setActionItems(itemsWithState);
      toast.success('Action items extracted successfully!');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('There was an error extracting the action items.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (actionItems.length === 0) return;
    const textToCopy = actionItems.map(item => 
      `Task: ${item.task}\nAssigned To: ${item.assignedTo}\nDeadline: ${item.deadline}\nStatus: ${item.completed ? 'Completed' : 'Pending'}`
    ).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copied to clipboard!');
  };

  const handleExportToCsv = () => {
    if (actionItems.length === 0) return;
    const csv = Papa.unparse(actionItems.map(({ id, ...rest }) => rest));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'action-items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV!');
  };

  const handleDeleteItem = (id: number) => {
    setActionItems(prevItems => prevItems.filter(item => item.id !== id));
    toast.success('Item deleted.');
  };

  const handleUpdateItem = (id: number, updatedTask: string) => {
    setActionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, task: updatedTask } : item
      )
    );
  };

  const handleEdit = (e?: React.FocusEvent<HTMLTextAreaElement>) => {
    if (editingItemId !== null) {
      handleUpdateItem(editingItemId, editedTask);
      setEditingItemId(null);
    } else if (e) {
      const id = Number(e.currentTarget.dataset.id);
      const item = actionItems.find(item => item.id === id);
      if (item) {
        setEditingItemId(id);
        setEditedTask(item.task);
      }
    }
  };

  const handleToggleComplete = (id: number) => {
    setActionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const ActionItemCard = ({ item }: { item: ActionItem }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative bg-card backdrop-blur-xl rounded-xl shadow-lg border border-border p-6 group card-hover
                  ${item.completed ? 'opacity-75 bg-muted/50' : ''}`}
    >
      {/* Status Indicator */}
      <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${item.completed ? 'bg-green-400' : 'bg-primary'} 
                      ${!item.completed ? 'animate-bounce-subtle' : ''}`}></div>
      
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <motion.button 
          onClick={() => handleToggleComplete(item.id)} 
          className={`p-2 rounded-lg transition-colors ${item.completed ? 'text-green-600 bg-green-50' : 'text-primary bg-primary/10'} hover:scale-110`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {item.completed ? <FiCheckSquare size={16} /> : <FiSquare size={16} />}
        </motion.button>
        <motion.button 
          onClick={() => { setEditingItemId(item.id); setEditedTask(item.task); }} 
          className="p-2 rounded-lg text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiEdit size={16} />
        </motion.button>
        <motion.button 
          onClick={() => handleDeleteItem(item.id)} 
          className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiTrash2 size={16} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="mt-8 mb-6">
        {editingItemId === item.id ? (
          <textarea
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            className="w-full bg-card border-2 border-primary/20 text-base-content rounded-xl p-4 
                     focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none
                     min-h-[100px] resize-none"
            autoFocus
            onBlur={handleEdit}
            data-id={item.id}
          />
        ) : (
          <h3 
            className={`font-bold text-lg text-base-content cursor-pointer transition-colors
                       ${item.completed ? 'line-through text-base-content/50' : 'hover:text-primary'}`}
            onClick={() => { setEditingItemId(item.id); setEditedTask(item.task); }}
          >
            {item.task}
          </h3>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xs">
              {item.assignedTo.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-base-content/50 uppercase tracking-wide">Assigned to</span>
            <p className="font-semibold text-base-content">{item.assignedTo}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-accent font-bold text-xs">📅</span>
          </div>
          <div>
            <span className="text-xs font-medium text-base-content/50 uppercase tracking-wide">Deadline</span>
            <p className="font-semibold text-base-content">{item.deadline}</p>
          </div>
        </div>
      </div>

      {/* Completion Overlay */}
      {item.completed && (
        <div className="absolute inset-0 bg-green-50/20 rounded-xl flex items-center justify-center">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
            ✅ Completed
          </div>
        </div>
      )}
    </motion.div>
  );

  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-primary">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <header className="flex justify-between items-center mb-16">
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <InteractiveLogo />
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MeetAnalyzer
                </h1>
                <p className="text-lg text-base-content/70 mt-2">AI-Powered Meeting Intelligence</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ThemeSwitcher />
            </motion.div>
          </header>

          {/* Input Section */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border p-8 card-hover">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-base-content mb-2">Meeting Transcript</h2>
                <p className="text-base-content/60">Paste your meeting transcript below and let AI extract actionable items</p>
              </div>
              
              <div className="relative">
                <textarea
                  className="w-full h-64 p-6 border-2 border-border rounded-xl bg-card text-base-content 
                           focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none
                           placeholder:text-base-content/40 resize-none transition-all duration-300"
                  placeholder="📝 Paste your meeting transcript here...

Example:
'During today's meeting, John agreed to finish the quarterly report by Friday. Sarah will coordinate with the design team for the new product mockups by next Tuesday. The development team needs to deploy the new features to production by end of week.'"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-sm text-base-content/40">
                  {transcript.length} characters
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <motion.button
                  onClick={handleExtract}
                  disabled={isLoading || !transcript}
                  className="btn-primary px-12 py-4 text-lg font-semibold rounded-xl shadow-xl 
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                           flex items-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{isLoading ? "🔍 Analyzing..." : "✨ Extract Action Items"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-red-600 text-center font-medium">⚠️ {error}</p>
          </motion.div>
        )}

        {isLoading && (
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border p-8">
              <h2 className="text-3xl font-bold text-base-content mb-8 text-center">
                🤖 AI is analyzing your meeting...
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          </motion.div>
        )}

        {!isLoading && actionItems.length > 0 && (
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Action Bar */}
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border p-6 mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-base-content mb-2">📋 Action Items Extracted</h2>
                  <p className="text-base-content/60">{actionItems.length} items found • {actionItems.filter(item => item.completed).length} completed</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <motion.button
                    onClick={handleCopyToClipboard}
                    className="btn-secondary flex items-center space-x-2 px-6 py-3 rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiCopy className="text-lg" />
                    <span>Copy All</span>
                  </motion.button>
                  <motion.button
                    onClick={handleExportToCsv}
                    className="btn-primary flex items-center space-x-2 px-6 py-3 rounded-xl font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiDownload className="text-lg" />
                    <span>Export CSV</span>
                  </motion.button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-border">
                <div className="flex items-center space-x-3">
                  <label htmlFor="filter" className="text-sm font-semibold text-base-content">👥 Filter:</label>
                  <select 
                    id="filter" 
                    value={filterAssignee} 
                    onChange={(e) => setFilterAssignee(e.target.value)} 
                    className="bg-card border border-border text-base-content rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {uniqueAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>
                        {assignee === 'all' ? 'All Assignees' : assignee}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <label htmlFor="sort" className="text-sm font-semibold text-base-content">🔄 Sort:</label>
                  <select 
                    id="sort" 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)} 
                    className="bg-card border border-border text-base-content rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="default">Default Order</option>
                    <option value="deadline">By Deadline</option>
                    <option value="assignee">By Assignee</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Items Grid */}
            <div className="space-y-10">
  <AnimatePresence>
    {Object.entries(groupedItems).map(([assignee, items]) => (
      <motion.div 
        key={assignee} 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-card/60 backdrop-blur-xl rounded-2xl shadow-lg border border-border p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">
              {assignee.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-primary">{assignee}</h3>
            <p className="text-base-content/60">{items.length} {items.length === 1 ? 'task' : 'tasks'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map(item => (
              <ActionItemCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
