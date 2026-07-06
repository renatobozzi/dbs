import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, CheckSquare, BarChart2, Activity, BookOpen, Brain, 
  Play, Square, Check, Plus, Folder, FolderPlus, 
  FileText, Bot, Sparkles, Network, Trash, ChevronLeft, ChevronRight,
  RotateCcw, Dumbbell
} from 'lucide-react';

export default function App() {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Pomodoro Global (Sidebar)
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);

  // Tasks
  const [tasks, setTasks] = useState([
    { id: 1, title: "Terminar informe trimestral", status: "todo", priority: "high" },
    { id: 2, title: "Revisar correos del cliente", status: "doing", priority: "medium" },
    { id: 3, title: "Comprar pasajes a Japón", status: "done", priority: "low" }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Habits (31 days tracking)
  const [habits, setHabits] = useState([
    { id: 1, title: "Meditar 10 min", days: Array(31).fill(false).map((_, i) => i < 15 ? Math.random() > 0.3 : false) },
    { id: 2, title: "Leer 10 páginas", days: Array(31).fill(false).map((_, i) => i < 15 ? Math.random() > 0.5 : false) },
    { id: 3, title: "Gimnasio", days: Array(31).fill(false).map((_, i) => i < 15 ? Math.random() > 0.6 : false) }
  ]);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  // Finances
  const [finances, setFinances] = useState([
    { id: 1, desc: "Salario", amount: 1200000, type: "income", date: "2026-07-01" },
    { id: 2, desc: "Supermercado", amount: 150000, type: "expense", date: "2026-07-02" },
    { id: 3, desc: "Internet", amount: 25000, type: "expense", date: "2026-07-03" }
  ]);
  const [newFinDesc, setNewFinDesc] = useState('');
  const [newFinAmount, setNewFinAmount] = useState('');
  const [newFinType, setNewFinType] = useState('expense');

  // Training
  const [benchPressData, setBenchPressData] = useState([60, 65, 65, 70, 72.5, 75, 75, 80]);
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Press de Banca', sets: '3 x 10', weight: 80, date: 'Ayer' },
    { id: 2, name: 'Aperturas', sets: '3 x 12', weight: 20, date: 'Ayer' },
    { id: 3, name: 'Tríceps Polea', sets: '4 x 10', weight: 25, date: 'Ayer' }
  ]);
  const [newExName, setNewExName] = useState('Press de Banca');
  const [newExSets, setNewExSets] = useState('3 x 10');
  const [newExWeight, setNewExWeight] = useState('');

  // Studies
  const [subjects, setSubjects] = useState([
    { id: 1, title: "Cálculo II", totalTopics: 12, completedTopics: 4, timeStudied: 4.5 },
    { id: 2, title: "Física", totalTopics: 8, completedTopics: 2, timeStudied: 3.1 }
  ]);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubTotalTopics, setNewSubTotalTopics] = useState('');
  const [editingSubId, setEditingSubId] = useState(null);
  
  // Study Timer
  const [studyTimerActive, setStudyTimerActive] = useState(false);
  const [studyTimerTime, setStudyTimerTime] = useState(25 * 60);
  const [focusedSubId, setFocusedSubId] = useState(null);

  // Second Brain
  const [brainTab, setBrainTab] = useState('notes');
  const [folders, setFolders] = useState([
    { id: 1, name: "Proyectos", parentId: null },
    { id: 2, name: "YouTube", parentId: 1 }
  ]);
  const [notes, setNotes] = useState([
    { id: 1, title: "Ideas de Video", content: "Hacer un video sobre #Productividad y cómo usar herramientas como #Notion.", folderId: 2 },
    { id: 2, title: "Diario", content: "Hoy aprendí mucho sobre #Programación y #React.", folderId: null }
  ]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- GEMINI AI INTEGRATION ---
  const callGeminiAPI = async (prompt, systemInstruction = "") => {
    const apiKey = ""; // API key is injected by the environment
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.7 }
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  };

  const handleAITaskBreakdown = async () => {
    if (!newTaskTitle) return;
    setIsAnalyzing(true);
    const prompt = `Desglosa el siguiente objetivo en 3 subtareas pequeñas, claras y accionables. Devuelve SOLO un array JSON válido sin formato markdown ni comillas invertidas. Formato: [{"title": "subtarea 1", "priority": "high"}, {"title": "subtarea 2", "priority": "medium"}]. Objetivo: "${newTaskTitle}"`;
    const result = await callGeminiAPI(prompt, "Eres un experto en productividad que desglosa tareas usando metodología Kanban y GTD.");
    
    if (result) {
      try {
        const cleanedStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const subtasks = JSON.parse(cleanedStr);
        if (Array.isArray(subtasks)) {
          const newTasks = subtasks.map((st, i) => ({
            id: Date.now() + i,
            title: st.title || 'Nueva tarea',
            status: 'todo',
            priority: st.priority || 'medium'
          }));
          setTasks(prev => [...newTasks, ...prev]);
          setNewTaskTitle('');
        }
      } catch (e) {
        console.error("Error parsing AI response:", e);
      }
    }
    setIsAnalyzing(false);
  };

  const handleAINoteAction = async (action) => {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note || !note.content) return;
    setIsAnalyzing(true);
    let prompt = "";
    if (action === "improve") prompt = `Mejora la redacción, corrige ortografía y dale un tono más profesional al siguiente texto. Mantenlo conciso:\n\n${note.content}`;
    if (action === "extract") prompt = `Extrae una lista de viñetas (bullet points) con las tareas o puntos de acción clave mencionados en este texto:\n\n${note.content}`;
    if (action === "summarize") prompt = `Resume el siguiente texto en un párrafo corto y directo:\n\n${note.content}`;
    const result = await callGeminiAPI(prompt, "Eres un asistente de notas personal.");
    if (result) {
      const updatedNotes = notes.map(n => {
        if (n.id === activeNoteId) {
          if (action === "improve") return { ...n, content: result };
          if (action === "extract" || action === "summarize") return { ...n, content: `${n.content}\n\n---\n**IA (${action}):**\n${result}` };
        }
        return n;
      });
      setNotes(updatedNotes);
    }
    setIsAnalyzing(false);
  };

  // --- HANDLERS ---
  const togglePomodoro = () => setPomodoroActive(!pomodoroActive);
  const resetPomodoro = () => {
    setPomodoroActive(false);
    setPomodoroTime(25 * 60);
  };

  useEffect(() => {
    let interval;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => setPomodoroTime(t => t - 1), 1000);
    } else if (pomodoroTime === 0) {
      setPomodoroActive(false);
      setPomodoroTime(25 * 60);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime]);

  // Study Timer Effect
  useEffect(() => {
    let interval;
    if (studyTimerActive && studyTimerTime > 0) {
      interval = setInterval(() => setStudyTimerTime(t => t - 1), 1000);
    } else if (studyTimerTime === 0) {
      setStudyTimerActive(false);
      setStudyTimerTime(25 * 60);
      // Añadir automáticamente 25 mins (0.4h aprox) a la asignatura en foco
      if (focusedSubId) {
        setSubjects(prev => prev.map(s => s.id === focusedSubId ? { ...s, timeStudied: +(s.timeStudied + 25/60).toFixed(1) } : s));
      }
    }
    return () => clearInterval(interval);
  }, [studyTimerActive, studyTimerTime, focusedSubId]);

  // Study Handlers
  const toggleStudyTimer = () => setStudyTimerActive(!studyTimerActive);
  const resetStudyTimer = () => {
    setStudyTimerActive(false);
    setStudyTimerTime(25 * 60);
  };
  const addSubject = (e) => {
    e.preventDefault();
    if (!newSubTitle || !newSubTotalTopics) return;
    setSubjects([{ id: Date.now(), title: newSubTitle, totalTopics: parseInt(newSubTotalTopics), completedTopics: 0, timeStudied: 0 }, ...subjects]);
    setNewSubTitle('');
    setNewSubTotalTopics('');
  };
  const deleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    if (focusedSubId === id) setFocusedSubId(null);
  };
  const updateSubject = (id, updatedFields) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  // Habits CRUD
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitTitle) return;
    setHabits([{ id: Date.now(), title: newHabitTitle, days: Array(31).fill(false) }, ...habits]);
    setNewHabitTitle('');
  };
  const deleteHabit = (id) => setHabits(habits.filter(h => h.id !== id));
  const toggleHabitDay = (habitId, dayIndex) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const newDays = [...h.days];
        newDays[dayIndex] = !newDays[dayIndex];
        return { ...h, days: newDays };
      }
      return h;
    }));
  };

  // Tasks
  const moveTask = (id, newStatus) => setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    setTasks([{ id: Date.now(), title: newTaskTitle, status: "todo", priority: newTaskPriority }, ...tasks]);
    setNewTaskTitle('');
  };

  // Finances
  const addTransaction = (e) => {
    e.preventDefault();
    if (!newFinDesc || !newFinAmount) return;
    setFinances([{ id: Date.now(), desc: newFinDesc, amount: parseInt(newFinAmount), type: newFinType, date: new Date().toISOString().split('T')[0] }, ...finances]);
    setNewFinDesc('');
    setNewFinAmount('');
  };

  // Training
  const addExercise = (e) => {
    e.preventDefault();
    if (!newExName || !newExWeight || !newExSets) return;
    const weightVal = parseFloat(newExWeight);
    const newEx = { id: Date.now(), name: newExName, sets: newExSets, weight: weightVal, date: 'Hoy' };
    setExercises([newEx, ...exercises]);
    
    // Si contiene "Banca", actualizar gráfica
    if (newExName.toLowerCase().includes('banca')) {
      const newData = [...benchPressData, weightVal];
      if (newData.length > 8) newData.shift(); // Mantener solo las últimas 8
      setBenchPressData(newData);
    }
    
    setNewExName('');
    setNewExWeight('');
  };

  const GraphCanvas = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !container) return;
      const ctx = canvas.getContext('2d');
      let animationFrameId;

      // Handle Resize dynamically
      const resizeCanvas = () => {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width || 800;
        canvas.height = height || 600;
      };
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      // Extract nodes and links
      const nodes = [];
      const links = [];
      const tagMap = new Map();

      notes.forEach(note => {
        const noteNode = { 
          id: `note_${note.id}`, 
          label: note.title || 'Sin título', 
          type: 'note', 
          x: Math.random() * canvas.width, 
          y: Math.random() * canvas.height, 
          vx: 0, 
          vy: 0 
        };
        nodes.push(noteNode);
        
        const tags = note.content.match(/#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+/g) || [];
        tags.forEach(tag => {
          let tagNode;
          if (tagMap.has(tag)) {
            tagNode = tagMap.get(tag);
          } else {
            tagNode = { 
              id: tag, 
              label: tag, 
              type: 'tag', 
              x: Math.random() * canvas.width, 
              y: Math.random() * canvas.height, 
              vx: 0, 
              vy: 0 
            };
            tagMap.set(tag, tagNode);
            nodes.push(tagNode);
          }
          links.push({ source: noteNode, target: tagNode });
        });
      });

      const simulation = () => {
        const width = canvas.width;
        const height = canvas.height;
        
        // Forces
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          // Gentle Gravity to center
          n1.vx += (width / 2 - n1.x) * 0.001;
          n1.vy += (height / 2 - n1.y) * 0.001;

          // Repulsion
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            if (dist < 120) {
              const force = (120 - dist) / dist * 0.02;
              n1.vx -= dx * force;
              n1.vy -= dy * force;
              n2.vx += dx * force;
              n2.vy += dy * force;
            }
          }
        }

        // Attraction (Links)
        links.forEach(link => {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const force = (dist - 60) * 0.005;
          link.source.vx += dx * force;
          link.source.vy += dy * force;
          link.target.vx -= dx * force;
          link.target.vy -= dy * force;
        });

        // Clear and Draw
        ctx.clearRect(0, 0, width, height);
        
        // Draw links
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1.5;
        links.forEach(link => {
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
          // Friction
          node.vx *= 0.9;
          node.vy *= 0.9;
          node.x += node.vx;
          node.y += node.vy;
          
          // Boundaries with bounce
          if (node.x < 15) { node.x = 15; node.vx *= -0.5; }
          if (node.x > width - 15) { node.x = width - 15; node.vx *= -0.5; }
          if (node.y < 15) { node.y = 15; node.vy *= -0.5; }
          if (node.y > height - 15) { node.y = height - 15; node.vy *= -0.5; }

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.type === 'tag' ? 8 : 4, 0, Math.PI * 2);
          ctx.fillStyle = node.type === 'tag' ? '#ef4444' : '#818cf8';
          ctx.fill();

          ctx.fillStyle = node.type === 'tag' ? '#e5e5e5' : '#737373';
          ctx.font = node.type === 'tag' ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + (node.type === 'tag' ? 18 : 14));
        });

        animationFrameId = requestAnimationFrame(simulation);
      };

      simulation();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
      };
    }, [notes, brainTab]); // Rerun if notes change or tab opens

    return (
      <div ref={containerRef} className="w-full h-full relative">
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>
    );
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0a0a0a] border-r border-neutral-800/50 flex flex-col z-10 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f4f4ec] flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(244,244,236,0.15)] text-xl leading-none pt-0.5">
            r
          </div>
          <span className="font-semibold text-lg tracking-wide text-white">rimu</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: Home, label: 'Foco del Día' },
            { id: 'tasks', icon: CheckSquare, label: 'Tareas y Proyectos' },
            { id: 'habits', icon: Activity, label: 'Hábitos' },
            { id: 'finances', icon: BarChart2, label: 'Finanzas' },
            { id: 'training', icon: Play, label: 'Entrenamientos' },
            { id: 'studies', icon: BookOpen, label: 'Estudios' },
            { id: 'brain', icon: Brain, label: 'Segundo Cerebro' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-neutral-800/80 text-white font-medium shadow-sm' 
                  : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-indigo-400' : ''} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Global Pomodoro Widget */}
        <div className="p-4 mt-auto">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800/50 relative overflow-hidden group shadow-lg">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-indigo-500/10 transition-all duration-1000 ease-linear"
              style={{ height: `${(pomodoroTime / (25 * 60)) * 100}%` }}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Pomodoro</span>
                <div className="flex gap-2">
                  <button onClick={resetPomodoro} className="text-neutral-500 hover:text-neutral-300 transition-colors" title="Reiniciar">
                    <RotateCcw size={14} />
                  </button>
                  <button onClick={togglePomodoro} className="text-white hover:text-indigo-400 transition-colors">
                    {pomodoroActive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                </div>
              </div>
              <div className="text-2xl font-light tabular-nums tracking-tight">
                {formatTime(pomodoroTime)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                {pomodoroActive ? 'Enfoque profundo' : 'Listo para empezar'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative bg-[#050505]">
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return (
                <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
                  <h2 className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-2">Miércoles 25</h2>
                  <h1 className="text-3xl font-semibold text-white mb-8">Buena madrugada, el esfuerzo silencioso también cuenta.</h1>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-semibold text-neutral-400 flex items-center gap-2">
                        <CheckSquare size={16} /> Tareas para hoy
                      </h3>
                      <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800/50 overflow-hidden shadow-xl">
                        {tasks.filter(t => t.status !== 'done').length === 0 && (
                           <div className="p-6 text-center text-sm text-neutral-500">Todo completo por hoy. ¡Buen trabajo!</div>
                        )}
                        {tasks.filter(t => t.status !== 'done').map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-4 border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/20 transition-colors">
                            <button onClick={() => moveTask(task.id, 'done')} className="text-neutral-500 hover:text-indigo-400 transition-colors">
                              <Square size={18} />
                            </button>
                            <span className="flex-1 text-sm">{task.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                              task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-green-500/10 text-green-400'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                         <h3 className="text-sm font-semibold text-neutral-400 flex items-center gap-2 mb-4">
                          <Activity size={16} /> Hábitos (Hoy)
                        </h3>
                        <div className="space-y-3">
                          {habits.map(habit => (
                            <div key={habit.id} className="bg-[#0a0a0a] p-3 rounded-xl border border-neutral-800/50 flex justify-between items-center shadow-lg">
                              <span className="text-sm truncate pr-2">{habit.title}</span>
                              <button 
                                onClick={() => toggleHabitDay(habit.id, 0)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${habit.days[0] ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border border-neutral-700 hover:border-neutral-500'}`}
                              >
                                {habit.days[0] && <Check size={14} strokeWidth={3} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-neutral-900 to-[#0a0a0a] p-5 rounded-xl border border-neutral-800/50 shadow-xl">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-1">Saldo Total</h3>
                        <div className="text-2xl font-bold text-white mb-4">
                          ${finances.reduce((acc, f) => acc + (f.type === 'income' ? f.amount : -f.amount), 0).toLocaleString('es-CL')}
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-400">In: ${finances.filter(f=>f.type==='income').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
                          <span className="text-red-400">Out: ${finances.filter(f=>f.type==='expense').reduce((a,b)=>a+b.amount,0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'tasks':
              return (
                <div className="p-8 h-full flex flex-col">
                  <h2 className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-1">Kanban & Eisenhower</h2>
                  <h1 className="text-2xl font-semibold text-white mb-6">Gestión de Proyectos</h1>

                  <form onSubmit={addTask} className="mb-8 flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Nueva tarea u objetivo..." 
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-neutral-600"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <select 
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-neutral-400"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                    <button type="submit" className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
                      <Plus size={16} /> Añadir
                    </button>
                    <button 
                      type="button" 
                      onClick={handleAITaskBreakdown}
                      disabled={isAnalyzing || !newTaskTitle}
                      className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles size={16} className={isAnalyzing ? "animate-pulse" : ""} />
                      {isAnalyzing ? 'Analizando...' : 'Desglosar IA'}
                    </button>
                  </form>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                    {['todo', 'doing', 'done'].map((columnStatus) => (
                      <div key={columnStatus} className="bg-[#0a0a0a] border border-neutral-800/50 rounded-xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="px-4 py-3 border-b border-neutral-800/50 bg-neutral-900/30 flex justify-between items-center">
                          <h3 className="text-sm font-semibold capitalize">
                            {columnStatus === 'todo' ? 'Por Hacer' : columnStatus === 'doing' ? 'Haciendo' : 'Hecho'}
                          </h3>
                          <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                            {tasks.filter(t => t.status === columnStatus).length}
                          </span>
                        </div>
                        <div className="p-3 flex-1 overflow-y-auto space-y-3">
                          {tasks.filter(t => t.status === columnStatus).map(task => (
                            <div key={task.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 group hover:border-neutral-600 transition-colors shadow-sm">
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-sm text-neutral-200">{task.title}</span>
                                <button onClick={() => deleteTask(task.id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash size={14} />
                                </button>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                                  task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                  'bg-green-500/10 text-green-400'
                                }`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {columnStatus !== 'todo' && (
                                    <button onClick={() => moveTask(task.id, columnStatus === 'done' ? 'doing' : 'todo')} className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400">
                                      <ChevronLeft size={14} />
                                    </button>
                                  )}
                                  {columnStatus !== 'done' && (
                                    <button onClick={() => moveTask(task.id, columnStatus === 'todo' ? 'doing' : 'done')} className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400">
                                      <ChevronRight size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );

            case 'habits':
              const weekStats = [
                { id: 1, label: 'WK 1', start: 0, end: 6 },
                { id: 2, label: 'WK 2', start: 7, end: 13 },
                { id: 3, label: 'WK 3', start: 14, end: 20 },
                { id: 4, label: 'WK 4', start: 21, end: 27 },
                { id: 5, label: 'WK 5', start: 28, end: 30 },
              ];

              return (
                <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col overflow-y-auto">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-1">Seguimiento de Hábitos</h2>
                      <h1 className="text-2xl font-semibold text-white">Construye tu disciplina</h1>
                    </div>
                    {/* Add Habit Form */}
                    <form onSubmit={handleAddHabit} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nuevo hábito..." 
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 w-48"
                      />
                      <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 flex items-center gap-2">
                        <Plus size={16} /> Añadir
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#0a0a0a] border border-neutral-800/50 rounded-xl p-6 overflow-x-auto shadow-2xl">
                    <div className="min-w-[900px] flex flex-col space-y-4">
                      
                      {/* BARRAS SUPERIORES */}
                      <div className="flex items-end w-full">
                        <div className="w-48 pr-4 shrink-0"></div>
                        <div className="flex-1 flex justify-between shrink-0 h-24 items-end">
                          {Array.from({ length: 31 }).map((_, i) => {
                            const activeCount = habits.filter(h => h.days && h.days[i]).length;
                            const maxHabits = habits.length > 0 ? habits.length : 1;
                            const heightPercent = (activeCount / maxHabits) * 100;
                            
                            return (
                              <div key={i} className="w-4 flex flex-col items-center group">
                                <div className="w-2 bg-neutral-800/40 rounded-t-sm flex flex-col justify-end h-16 relative">
                                  <div 
                                    className="w-full bg-white rounded-t-sm transition-all duration-500 ease-out absolute bottom-0" 
                                    style={{ height: `${heightPercent}%` }}
                                  ></div>
                                </div>
                                <span className="text-[9px] font-bold text-neutral-500 mt-2 h-3 flex items-center justify-center">
                                  {activeCount > 0 ? activeCount : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="w-24 pl-4 shrink-0"></div>
                      </div>

                      {/* RESÚMENES SEMANALES */}
                      <div className="flex items-center w-full mt-2">
                         <div className="w-48 pr-4 shrink-0"></div>
                         <div className="flex-1 flex justify-between shrink-0 gap-2">
                           {weekStats.map(wk => {
                             let possible = 0;
                             let active = 0;
                             habits.forEach(h => {
                               for(let i=wk.start; i<=wk.end; i++) {
                                 possible++;
                                 if(h.days && h.days[i]) active++;
                               }
                             });
                             const percent = possible === 0 ? 0 : Math.round((active / possible) * 100);
                             const daysCount = wk.end - wk.start + 1;
                             const flexBasis = `${(daysCount / 31) * 100}%`;

                             return (
                               <div key={wk.id} className="flex flex-col" style={{ width: flexBasis }}>
                                  <div className="text-center text-[10px] font-bold text-neutral-500 tracking-widest mb-1.5">{wk.label}</div>
                                  <div className="flex justify-center gap-3 items-center text-[9px] text-neutral-400 mb-2 px-1">
                                    <span>{active}/{possible}</span>
                                    <span className="font-bold text-white">{percent}%</span>
                                  </div>
                                  <div className="w-full h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                  </div>
                               </div>
                             );
                           })}
                         </div>
                         <div className="w-24 pl-4 shrink-0"></div>
                      </div>

                      {/* NUMEROS DE LOS DÍAS */}
                      <div className="flex items-center w-full border-b border-neutral-800/50 pb-3 mb-2 pt-2">
                        <div className="w-48 pr-4 shrink-0 flex items-end justify-between">
                           <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Hábito</span>
                        </div>
                        <div className="flex-1 flex justify-between shrink-0">
                          {Array.from({ length: 31 }).map((_, i) => (
                            <div key={i} className="w-4 flex justify-center text-[10px] font-medium text-neutral-600">{i + 1}</div>
                          ))}
                        </div>
                        <div className="w-24 pl-4 shrink-0 flex justify-end">
                           <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">Rend.</span>
                        </div>
                      </div>

                      {/* FILAS DE HÁBITOS */}
                      <div className="space-y-3 pt-2 pb-4">
                        {habits.map(habit => {
                          const totalCompleted = habit.days.filter(Boolean).length;
                          const completionRate = Math.round((totalCompleted / 31) * 100);

                          return (
                            <div key={habit.id} className="flex items-center w-full group">
                              <div className="w-48 pr-4 shrink-0 flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-400 group-hover:text-white transition-colors truncate pr-2">{habit.title}</span>
                                <button onClick={() => deleteHabit(habit.id)} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                  <Trash size={14} />
                                </button>
                              </div>
                              
                              <div className="flex-1 flex justify-between shrink-0">
                                {habit.days.map((isDone, dayIndex) => (
                                  <div key={dayIndex} className="w-4 flex justify-center">
                                    <div 
                                      onClick={() => toggleHabitDay(habit.id, dayIndex)}
                                      className={`w-4 h-4 rounded-[4px] cursor-pointer transition-all duration-300 flex items-center justify-center border ${
                                        isDone 
                                          ? 'bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-110' 
                                          : 'bg-transparent border-neutral-800 hover:border-neutral-500'
                                      }`}
                                    >
                                      {isDone && <Check size={12} className="text-black" strokeWidth={4} />}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="w-24 pl-4 shrink-0 flex items-center justify-end gap-3">
                                <div className="text-[11px] text-neutral-400 w-6 text-right font-medium">{totalCompleted}</div>
                                <div className="w-10 flex gap-[2px]">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                      <div key={idx} className={`h-3 w-[3px] rounded-[1px] transition-colors duration-500 ${completionRate >= (idx + 1) * 20 - 10 ? 'bg-white' : 'bg-neutral-800'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                </div>
              );

            case 'finances':
              return (
                <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
                   <h2 className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-1">Control Total</h2>
                   <h1 className="text-2xl font-semibold text-white mb-8">Tus Finanzas</h1>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <div className="bg-[#0a0a0a] p-6 rounded-xl border border-neutral-800/50 shadow-xl">
                       <span className="text-neutral-500 text-sm font-medium">Ingresos del Mes</span>
                       <div className="text-3xl font-bold text-green-400 mt-2">
                         ${finances.filter(f=>f.type==='income').reduce((a,b)=>a+b.amount,0).toLocaleString()}
                       </div>
                     </div>
                     <div className="bg-[#0a0a0a] p-6 rounded-xl border border-neutral-800/50 shadow-xl">
                       <span className="text-neutral-500 text-sm font-medium">Gastos del Mes</span>
                       <div className="text-3xl font-bold text-red-400 mt-2">
                         ${finances.filter(f=>f.type==='expense').reduce((a,b)=>a+b.amount,0).toLocaleString()}
                       </div>
                     </div>
                   </div>

                   <form onSubmit={addTransaction} className="bg-[#0a0a0a] p-5 rounded-xl border border-neutral-800/50 mb-8 flex gap-4 items-end shadow-xl">
                      <div className="flex-1">
                        <label className="text-xs text-neutral-500 mb-1 block">Descripción</label>
                        <input type="text" value={newFinDesc} onChange={e=>setNewFinDesc(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-neutral-500 mb-1 block">Monto</label>
                        <input type="number" value={newFinAmount} onChange={e=>setNewFinAmount(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-neutral-500 mb-1 block">Tipo</label>
                        <select value={newFinType} onChange={e=>setNewFinType(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-neutral-400">
                          <option value="expense">Gasto</option>
                          <option value="income">Ingreso</option>
                        </select>
                      </div>
                      <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200">Registrar</button>
                   </form>

                   <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800/50 overflow-hidden shadow-2xl">
                     <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="bg-neutral-900/50 text-xs text-neutral-500 uppercase tracking-wider">
                           <th className="p-4 font-medium">Fecha</th>
                           <th className="p-4 font-medium">Descripción</th>
                           <th className="p-4 font-medium text-right">Monto</th>
                         </tr>
                       </thead>
                       <tbody className="text-sm">
                         {finances.map(f => (
                           <tr key={f.id} className="border-t border-neutral-800/50 hover:bg-neutral-800/20">
                             <td className="p-4 text-neutral-400">{f.date}</td>
                             <td className="p-4">{f.desc}</td>
                             <td className={`p-4 text-right font-medium ${f.type === 'income' ? 'text-green-400' : 'text-neutral-200'}`}>
                               {f.type === 'income' ? '+' : '-'}${f.amount.toLocaleString()}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              );

            case 'training':
              const maxWeight = Math.max(...benchPressData, 100);
              
              return (
                <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
                   <h2 className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-1">Rendimiento</h2>
                   <h1 className="text-2xl font-semibold text-white mb-8">Entrenamientos</h1>

                   <div className="bg-[#0a0a0a] p-6 rounded-xl border border-neutral-800/50 mb-6 shadow-2xl">
                     <h3 className="text-sm font-semibold mb-4 text-neutral-300">Progreso: Press de Banca</h3>
                     <div className="h-48 flex items-end gap-2">
                       {benchPressData.map((weight, i) => (
                         <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                           <div className="w-full bg-indigo-500/20 rounded-t-sm hover:bg-indigo-500/40 transition-colors relative mt-auto" style={{ height: `${(weight / maxWeight) * 100}%` }}>
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                               {weight}kg
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Form to log exercises */}
                   <form onSubmit={addExercise} className="bg-[#0a0a0a] p-5 rounded-xl border border-neutral-800/50 mb-6 flex gap-4 items-end shadow-xl">
                      <div className="flex-1">
                        <label className="text-xs text-neutral-500 mb-1 block">Ejercicio (Ej. Press de Banca)</label>
                        <input type="text" value={newExName} onChange={e=>setNewExName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-neutral-500 mb-1 block">Series x Reps</label>
                        <input type="text" placeholder="3 x 10" value={newExSets} onChange={e=>setNewExSets(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-neutral-500 mb-1 block">Peso (kg)</label>
                        <input type="number" step="0.5" value={newExWeight} onChange={e=>setNewExWeight(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 flex items-center gap-2">
                        <Dumbbell size={16}/> Registrar
                      </button>
                   </form>

                   <div className="bg-[#0a0a0a] rounded-xl border border-neutral-800/50 p-6 shadow-xl">
                      <h3 className="text-sm font-semibold mb-4 text-neutral-300">Historial Reciente</h3>
                      <div className="space-y-3">
                        {exercises.map(ex => (
                          <div key={ex.id} className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                            <div>
                              <span className="text-sm text-neutral-200 block">{ex.name}</span>
                              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{ex.date}</span>
                            </div>
                            <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-md font-medium">
                              {ex.sets} - {ex.weight}kg
                            </span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              );

            case 'studies':
              return (
                <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
                   <h2 className="text-sm font-medium text-neutral-500 tracking-widest uppercase mb-1">Conocimiento</h2>
                   <h1 className="text-2xl font-semibold text-white mb-8">Tus Estudios</h1>

                   {/* POMODORO DE ESTUDIOS */}
                   <div className="bg-[#0a0a0a] p-6 rounded-xl border border-neutral-800/50 shadow-xl mb-8 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-2">En Foco</h3>
                        <select 
                          value={focusedSubId || ''} 
                          onChange={(e) => setFocusedSubId(e.target.value ? Number(e.target.value) : null)}
                          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white w-48"
                        >
                          <option value="">Selecciona materia...</option>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-light tabular-nums tracking-tight text-white mb-2">
                          {formatTime(studyTimerTime)}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={resetStudyTimer} className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors bg-neutral-900 rounded-lg border border-neutral-800">
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={toggleStudyTimer} disabled={!focusedSubId} className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                            {studyTimerActive ? <><Square size={16} fill="currentColor"/> Pausar</> : <><Play size={16} fill="currentColor"/> Iniciar Sesión</>}
                          </button>
                        </div>
                      </div>
                   </div>

                   {/* FORMULARIO AGREGAR ASIGNATURA */}
                   <form onSubmit={addSubject} className="bg-[#0a0a0a] p-5 rounded-xl border border-neutral-800/50 mb-6 flex gap-4 items-end shadow-xl">
                      <div className="flex-1">
                        <label className="text-xs text-neutral-500 mb-1 block">Nueva Asignatura</label>
                        <input type="text" value={newSubTitle} onChange={e=>setNewSubTitle(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required placeholder="Ej. Álgebra Lineal" />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-neutral-500 mb-1 block">Total de Temas</label>
                        <input type="number" value={newSubTotalTopics} onChange={e=>setNewSubTotalTopics(e.target.value)} min="1" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 flex items-center gap-2">
                        <Plus size={16} /> Añadir
                      </button>
                   </form>

                   <div className="space-y-4">
                     {subjects.map(sub => (
                       <div key={sub.id} className="bg-[#0a0a0a] p-5 rounded-xl border border-neutral-800/50 shadow-xl group">
                         {editingSubId === sub.id ? (
                           <div className="flex flex-col gap-4">
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 block">Título</label>
                                  <input type="text" value={sub.title} onChange={e => updateSubject(sub.id, { title: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 block">Temas Listos</label>
                                  <input type="number" value={sub.completedTopics} onChange={e => updateSubject(sub.id, { completedTopics: Number(e.target.value) })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 block">Total Temas</label>
                                  <input type="number" value={sub.totalTopics} onChange={e => updateSubject(sub.id, { totalTopics: Number(e.target.value) })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm" />
                                </div>
                                <div className="w-24">
                                  <label className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 block">Horas</label>
                                  <input type="number" step="0.1" value={sub.timeStudied} onChange={e => updateSubject(sub.id, { timeStudied: Number(e.target.value) })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm" />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button onClick={() => deleteSubject(sub.id)} className="text-xs text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-red-500/20">
                                  <Trash size={14} className="inline mr-1" />Eliminar
                                </button>
                                <button onClick={() => setEditingSubId(null)} className="text-xs bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-md hover:bg-indigo-500/30 transition-colors">
                                  Guardar
                                </button>
                              </div>
                           </div>
                         ) : (
                           <>
                             <div className="flex justify-between items-center mb-4">
                               <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{sub.title}</h3>
                                  <button onClick={() => setEditingSubId(sub.id)} className="text-xs text-neutral-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                               </div>
                               <span className="text-xs text-neutral-500">{Number(sub.timeStudied).toFixed(1)}h estudiadas</span>
                             </div>
                             <div className="w-full bg-neutral-900 rounded-full h-2.5 mb-2 overflow-hidden border border-neutral-800">
                               <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(100, (sub.completedTopics / sub.totalTopics) * 100)}%` }}></div>
                             </div>
                             <div className="flex justify-between text-xs text-neutral-400">
                               <span>{sub.completedTopics} de {sub.totalTopics} temas</span>
                               <span>{Math.round((sub.completedTopics / sub.totalTopics) * 100)}%</span>
                             </div>
                             
                             <div className="mt-4 pt-4 border-t border-neutral-800/50 flex gap-2">
                               <button onClick={() => updateSubject(sub.id, { completedTopics: Math.min(sub.totalTopics, sub.completedTopics + 1) })} className="bg-neutral-900 hover:bg-neutral-800 text-xs px-3 py-1.5 rounded-md border border-neutral-800 transition-colors flex items-center gap-1">
                                 <Check size={12}/> Completar Tema
                               </button>
                               <button onClick={() => updateSubject(sub.id, { timeStudied: +(sub.timeStudied + 0.5).toFixed(1) })} className="bg-neutral-900 hover:bg-neutral-800 text-xs px-3 py-1.5 rounded-md border border-neutral-800 transition-colors flex items-center gap-1">
                                 <Plus size={12}/> 30min Manual
                               </button>
                             </div>
                           </>
                         )}
                       </div>
                     ))}
                   </div>
                </div>
              );

            case 'brain':
              const renderFolders = (parentId = null, depth = 0) => {
                return folders.filter(f => f.parentId === parentId).map(folder => (
                  <div key={folder.id}>
                    <div 
                      onClick={() => setActiveFolderId(folder.id)}
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all ${activeFolderId === folder.id ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-400'}`}
                      style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    >
                      <Folder size={14} className={activeFolderId === folder.id ? 'text-indigo-400' : 'text-neutral-500'} />
                      <span className="text-sm font-medium flex-1">{folder.name}</span>
                    </div>
                    {renderFolders(folder.id, depth + 1)}
                    {notes.filter(n => n.folderId === folder.id).map(note => (
                      <div 
                        key={note.id} 
                        onClick={() => setActiveNoteId(note.id)} 
                        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all ${activeNoteId === note.id ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-400'}`} 
                        style={{ paddingLeft: `${(depth + 1) * 12 + 28}px` }}
                      >
                        <FileText size={12} className={`flex-shrink-0 ${activeNoteId === note.id ? 'text-indigo-400' : 'text-neutral-600'}`} />
                        <span className="text-xs truncate flex-1">{note.title || 'Sin título'}</span>
                      </div>
                    ))}
                  </div>
                ));
              };

              const activeNote = notes.find(n => n.id === activeNoteId);

              return (
                <div className="flex h-full flex-col relative bg-[#030303]">
                  <div className="h-12 border-b border-neutral-800/50 flex items-center px-4 bg-[#0a0a0a] gap-1 z-10 shrink-0">
                    <button 
                      onClick={() => setBrainTab('notes')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${brainTab === 'notes' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      <FileText size={14} /> Tus Notas
                    </button>
                    <button 
                      onClick={() => setBrainTab('map')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${brainTab === 'map' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      <Network size={14} /> Mapa de Conexiones
                    </button>
                  </div>

                  {brainTab === 'notes' ? (
                    <div className="flex flex-1 min-h-0">
                      <div className="w-64 border-r border-neutral-800/50 bg-[#070707] flex flex-col">
                        <div className="p-3 border-b border-neutral-800/50 flex justify-between items-center">
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Explorador</span>
                          <div className="flex gap-1">
                            <button className="p-1.5 text-neutral-500 hover:text-white rounded-md hover:bg-neutral-800" title="Nueva Carpeta">
                              <FolderPlus size={14} />
                            </button>
                            <button 
                              className="p-1.5 text-neutral-500 hover:text-white rounded-md hover:bg-neutral-800" 
                              title="Nueva Nota"
                              onClick={() => {
                                const newId = Date.now();
                                setNotes([{ id: newId, title: "Nueva Nota", content: "", folderId: activeFolderId }, ...notes]);
                                setActiveNoteId(newId);
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="p-2 flex-1 overflow-y-auto">
                          {renderFolders()}
                          <div className="mt-2 pt-2 border-t border-neutral-800/30">
                            <span className="text-[10px] font-semibold text-neutral-600 uppercase px-2 mb-1 block">Sin Clasificar</span>
                            {notes.filter(n => n.folderId === null).map(note => (
                              <div 
                                key={note.id} 
                                onClick={() => setActiveNoteId(note.id)} 
                                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all ${activeNoteId === note.id ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-400'}`}
                              >
                                <FileText size={12} className={`flex-shrink-0 ${activeNoteId === note.id ? 'text-indigo-400' : 'text-neutral-600'}`} />
                                <span className="text-xs truncate flex-1">{note.title || 'Sin título'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col bg-[#050505]">
                        {activeNote ? (
                          <>
                            <div className="px-8 py-3 border-b border-neutral-800/50 flex gap-2 items-center bg-neutral-900/20">
                              <Bot size={16} className="text-indigo-400" />
                              <span className="text-xs text-neutral-500 font-medium mr-2">IA Actions:</span>
                              <button 
                                onClick={() => handleAINoteAction("improve")}
                                disabled={isAnalyzing}
                                className="text-xs bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 px-3 py-1.5 rounded-md text-neutral-300 transition-all disabled:opacity-50"
                              >
                                Mejorar redacción
                              </button>
                              <button 
                                onClick={() => handleAINoteAction("extract")}
                                disabled={isAnalyzing}
                                className="text-xs bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 px-3 py-1.5 rounded-md text-neutral-300 transition-all disabled:opacity-50"
                              >
                                Extraer Tareas
                              </button>
                              <button 
                                onClick={() => handleAINoteAction("summarize")}
                                disabled={isAnalyzing}
                                className="text-xs bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 px-3 py-1.5 rounded-md text-neutral-300 transition-all disabled:opacity-50"
                              >
                                Resumir
                              </button>
                              {isAnalyzing && <span className="text-xs text-indigo-400 animate-pulse ml-2">Pensando...</span>}
                            </div>
                            
                            <div className="p-8 flex-1 overflow-y-auto max-w-3xl w-full mx-auto">
                              <input 
                                type="text" 
                                value={activeNote.title}
                                onChange={(e) => setNotes(notes.map(n => n.id === activeNote.id ? { ...n, title: e.target.value } : n))}
                                className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none mb-6 placeholder:text-neutral-700"
                                placeholder="Título de la nota..."
                              />
                              <textarea
                                value={activeNote.content}
                                onChange={(e) => setNotes(notes.map(n => n.id === activeNote.id ? { ...n, content: e.target.value } : n))}
                                className="w-full h-full min-h-[500px] bg-transparent text-neutral-300 text-base leading-relaxed focus:outline-none resize-none placeholder:text-neutral-700 font-serif"
                                placeholder="Empieza a escribir... Usa # para etiquetar conceptos que se conectarán en tu mapa."
                              />
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
                            Selecciona o crea una nota para empezar.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 relative overflow-hidden bg-[#020202]">
                       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                       
                       <GraphCanvas />
                       
                       <div className="absolute bottom-6 left-6 bg-[#0a0a0a] border border-neutral-800 p-4 rounded-xl shadow-2xl max-w-xs">
                         <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2"><Network size={14}/> Grafo Interactivo</h4>
                         <p className="text-[10px] text-neutral-400 leading-relaxed">
                           Los nodos se generan automáticamente al usar <strong>#hashtags</strong> en tus notas. Los puntos rojos son los conceptos centrales.
                         </p>
                       </div>
                    </div>
                  )}
                </div>
              );

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
}