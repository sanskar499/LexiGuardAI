DEMO_HTML = """<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LexiGuard AI — Legal Tech Contradiction Detection Studio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #060913; color: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06B6D4; }
    </style>
</head>
<body class="bg-[#060913] text-slate-100 min-h-screen">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        function App() {
            const [contract, setContract] = useState(null);
            const [selectedSection, setSelectedSection] = useState(null);
            const [activeDiff, setActiveDiff] = useState(null);
            const [loading, setLoading] = useState(true);
            const [severityFilter, setSeverityFilter] = useState('ALL');

            useEffect(() => {
                fetch('/api/contracts/sample', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        setContract(data);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        setLoading(false);
                    });
            }, []);

            if (loading || !contract) {
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-mono text-cyan-400">Loading LexiGuard Legal AI Analysis Engine...</p>
                    </div>
                );
            }

            const filteredContradictions = contract.contradictions.filter(c => {
                if (severityFilter === 'ALL') return true;
                return c.severity === severityFilter;
            });

            return (
                <div className="h-screen flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
                                LG
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-base font-bold text-white tracking-tight">LexiGuard<span className="text-cyan-400">AI</span></h1>
                                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                                        HF3-SW-11 LegalTech
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">Contradiction Detection Across Cross-References</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-xs font-mono text-slate-400">{contract.title}</span>
                            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold font-mono">
                                {contract.contradiction_count} Conflicts Flagged
                            </span>
                        </div>
                    </header>

                    {/* 3 Column Layout */}
                    <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
                        {/* Col 1: Contract Viewer */}
                        <div className="col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden shadow-xl">
                            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Contract Clauses ({contract.clauses.length})</h2>
                                <span className="text-[10px] text-cyan-400 font-mono">Click clause to inspect</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {contract.clauses.map(clause => {
                                    const isSelected = selectedSection === clause.section_number;
                                    const hasConflict = clause.has_contradiction;
                                    return (
                                        <div
                                            key={clause.id}
                                            onClick={() => setSelectedSection(clause.section_number)}
                                            className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50'
                                                    : hasConflict
                                                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                                                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${hasConflict ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-cyan-400'}`}>
                                                    {clause.section_number}
                                                </span>
                                                {hasConflict && (
                                                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                                                        Conflict
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xs font-semibold text-slate-200 mb-1">{clause.title}</h3>
                                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{clause.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Col 2: Cross Reference Graph */}
                        <div className="col-span-4 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden shadow-xl">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Cross-Reference Dependency Graph</h2>
                                <div className="flex items-center space-x-3 text-[10px]">
                                    <span className="text-cyan-400">● Valid Reference</span>
                                    <span className="text-rose-400 font-bold">● Contradiction</span>
                                </div>
                            </div>
                            <div className="flex-1 relative p-4 flex flex-col justify-center items-center">
                                <GraphCanvas clauses={contract.clauses} crossRefs={contract.cross_references} contradictions={contract.contradictions} selectedSection={selectedSection} onSelectSection={setSelectedSection} />
                            </div>
                        </div>

                        {/* Col 3: Explainable Risk Report */}
                        <div className="col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col min-h-0 overflow-hidden shadow-xl">
                            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">Explainable Risk Report</h2>
                                <div className="flex space-x-1 text-[10px]">
                                    {['ALL', 'HIGH', 'MEDIUM'].map(sev => (
                                        <button
                                            key={sev}
                                            onClick={() => setSeverityFilter(sev)}
                                            className={`px-2 py-0.5 rounded font-medium ${severityFilter === sev ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'}`}
                                        >
                                            {sev}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {filteredContradictions.map(cntr => {
                                    const isRelevant = selectedSection === cntr.source_section || selectedSection === cntr.target_section;
                                    return (
                                        <div
                                            key={cntr.id}
                                            className={`p-4 rounded-xl border space-y-3 transition-all ${
                                                isRelevant ? 'bg-slate-850 border-rose-500 shadow-lg' : 'bg-slate-950/60 border-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                                    {cntr.severity} SEVERITY
                                                </span>
                                                <span className="text-[10px] font-mono text-cyan-400">
                                                    Confidence: {Math.round(cntr.confidence_score * 100)}%
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div onClick={() => setSelectedSection(cntr.source_section)} className="p-2.5 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                                                    <span className="font-mono font-bold text-cyan-400 block text-[11px]">{cntr.source_section}</span>
                                                    <span className="text-slate-300 font-medium block text-[10px] truncate">{cntr.source_clause_title}</span>
                                                    <span className="text-[10px] font-bold text-rose-300 mt-1 inline-block bg-rose-950/60 px-1.5 py-0.5 rounded">{cntr.source_value}</span>
                                                </div>

                                                <div onClick={() => setSelectedSection(cntr.target_section)} className="p-2.5 rounded bg-slate-900 border border-slate-800 cursor-pointer">
                                                    <span className="font-mono font-bold text-cyan-400 block text-[11px]">{cntr.target_section}</span>
                                                    <span className="text-slate-300 font-medium block text-[10px] truncate">{cntr.target_clause_title}</span>
                                                    <span className="text-[10px] font-bold text-rose-300 mt-1 inline-block bg-rose-950/60 px-1.5 py-0.5 rounded">{cntr.target_value}</span>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                                                <div className="text-amber-400 font-semibold text-[11px]">Conflict Explanation</div>
                                                <p className="text-slate-300 text-[11px] leading-relaxed">{cntr.explanation}</p>
                                            </div>

                                            <div className="p-3 rounded bg-cyan-950/30 border border-cyan-800/50 text-xs text-cyan-200 space-y-1">
                                                <div className="text-cyan-400 font-semibold text-[11px]">Suggested Action</div>
                                                <p className="text-[11px] leading-relaxed">{cntr.suggested_action}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function GraphCanvas({ clauses, crossRefs, contradictions, selectedSection, onSelectSection }) {
            const containerRef = useRef(null);

            useEffect(() => {
                if (!containerRef.current || !clauses) return;

                const nodes = clauses.map(c => {
                    const hasConflict = c.has_contradiction;
                    return {
                        id: c.section_number,
                        label: c.section_number,
                        color: {
                            background: hasConflict ? '#991B1B' : '#0F172A',
                            border: hasConflict ? '#F87171' : '#38BDF8',
                            highlight: { background: '#DC2626', border: '#FFFFFF' }
                        },
                        font: { color: '#FFFFFF', face: 'monospace', size: 12 },
                        shape: 'circle',
                        size: hasConflict ? 24 : 18
                    };
                });

                const edges = [];
                crossRefs.forEach(xr => {
                    edges.push({
                        from: xr.source_section,
                        to: xr.target_section,
                        color: { color: '#06B6D4' },
                        width: 1.5,
                        dashes: false
                    });
                });

                contradictions.forEach(cntr => {
                    edges.push({
                        from: cntr.source_section,
                        to: cntr.target_section,
                        color: { color: '#EF4444' },
                        width: 3,
                        dashes: [6, 4]
                    });
                });

                const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
                const options = {
                    physics: { barnesHut: { gravitationalConstant: -3000, springLength: 95 } },
                    interaction: { hover: true }
                };

                const network = new vis.Network(containerRef.current, data, options);
                network.on('click', (params) => {
                    if (params.nodes.length > 0) {
                        onSelectSection(params.nodes[0]);
                    }
                });

                return () => network.destroy();
            }, [clauses, crossRefs, contradictions]);

            return <div ref={containerRef} className="w-full h-full min-h-[350px]" />;
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
"""
