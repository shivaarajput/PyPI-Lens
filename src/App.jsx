import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Package,
  Download,
  Calendar,
  Users,
  Github,
  ExternalLink,
  Moon,
  Sun,
  Copy,
  Check,
  Box,
  Activity,
  Database,
  Layers,
  Terminal,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Code,
  FileArchive,
  Hash
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';

// --- Utility Functions ---

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to convert common HTML found in READMEs (like centered logos) to Markdown
const preprocessMarkdown = (markdown) => {
  if (!markdown) return '';
  let processed = markdown;

  // 0. Remove HTML Comments (e.g., <!-- tocstop -->)
  processed = processed.replace(/<!--[\s\S]*?-->/g, '');

  // 1. Convert HTML images to Markdown images
  processed = processed.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    const altMatch = match.match(/alt=["']([^"']+)["']/);
    const alt = altMatch ? altMatch[1] : 'Image';
    return `![${alt}](${src})`;
  });

  // 2. Convert HTML Links to Markdown Links
  processed = processed.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, text) => {
    return `[${text}](${href})`;
  });

  // 3. Convert HTML Headers to Markdown Headers
  processed = processed.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  processed = processed.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  processed = processed.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  processed = processed.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');
  processed = processed.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '##### $1\n\n');
  processed = processed.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '###### $1\n\n');

  // 4. Handle Breaks and Paragraphs
  processed = processed.replace(/<br\s*\/?>/gi, '\n');
  processed = processed.replace(/<p[^>]*>/gi, '\n\n');
  processed = processed.replace(/<\/p>/gi, '\n\n');

  // 5. Remove wrappers
  processed = processed.replace(/<div[^>]*>/gi, '');
  processed = processed.replace(/<\/div>/gi, '');
  processed = processed.replace(/<span[^>]*>/gi, '');
  processed = processed.replace(/<\/span>/gi, '');

  // 6. Clean up excessive whitespace
  processed = processed.replace(/\n{3,}/g, '\n\n');

  return processed;
};

// --- Components ---

// 1. Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color = "blue" }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start space-x-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
  </div>
);

// 2. Markdown Styling Components
const MarkdownComponents = {
  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-6 mt-8 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-4 mt-8 text-slate-900 dark:text-white" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-3 mt-6 text-slate-900 dark:text-white" {...props} />,
  p: ({ node, ...props }) => <div className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300" {...props} />,
  // Removed 'list-inside' and added 'pl-5' to fix bullet alignment issues
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
  pre: ({ node, ...props }) => (
    <div className="overflow-x-auto mb-6 rounded-lg bg-slate-900 text-slate-50 p-4 font-mono text-sm leading-relaxed">
      <pre {...props} />
    </div>
  ),
  code: ({ node, inline, className, children, ...props }) => {
    return inline ? (
      <code className="bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>{children}</code>
    ) : (
      <code className="bg-transparent text-inherit" {...props}>{children}</code>
    );
  },
  a: ({ node, ...props }) => <a className="text-indigo-600 dark:text-indigo-400 hover:underline break-words font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-600 dark:text-slate-400 my-6 py-1" {...props} />,
  img: ({ node, ...props }) => <img className="max-w-full h-auto rounded-lg shadow-sm my-6 border border-slate-200 dark:border-slate-700" {...props} />,
};

// 3. Custom Table Component (Replaces missing GFM support)
const CustomTable = ({ rows }) => {
  if (!rows || rows.length < 2) return null;

  // Helper to split pipe rows safely
  const parseRow = (row) => {
    return row.split('|').filter((cell, i, arr) => {
      // Remove first/last empty matches from | start | end |
      if (i === 0 && cell.trim() === '') return false;
      if (i === arr.length - 1 && cell.trim() === '') return false;
      return true;
    }).map(c => c.trim());
  };

  const headers = parseRow(rows[0]);
  // rows[1] is the separator |---|---|
  const body = rows.slice(2).map(parseRow);

  return (
    <div className="overflow-x-auto mb-6 my-4 border border-slate-200 dark:border-slate-700 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {body.map((row, i) => (
            <tr key={i} className="bg-white dark:bg-slate-900/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700/50">
                  <ReactMarkdown components={MarkdownComponents}>{cell}</ReactMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 4. File List Row Component
const VersionRow = ({ version, date, files }) => {
  const [expanded, setExpanded] = useState(false);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (a.packagetype === 'sdist' && b.packagetype !== 'sdist') return -1;
      if (a.packagetype !== 'sdist' && b.packagetype === 'sdist') return 1;
      return 0;
    });
  }, [files]);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-0">
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-1 rounded transition-transform duration-200 ${expanded ? 'rotate-90 text-indigo-600' : 'text-slate-400'}`}>
            <ChevronRight size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{version}</span>
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{files.length} files</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Released: {date}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex gap-1">
            {files.some(f => f.packagetype === 'bdist_wheel') && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">WHEEL</span>
            )}
            {files.some(f => f.packagetype === 'sdist') && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded">SOURCE</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50 dark:bg-slate-900/30 px-6 py-4 border-t border-slate-100 dark:border-slate-700/50">

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 rounded-lg">
                <tr>
                  <th className="px-4 py-2 rounded-l-lg">Filename</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Upload Date</th>
                  <th className="px-4 py-2 text-right rounded-r-lg">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedFiles.map((file, idx) => (
                  <tr key={idx} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                      {file.filename}
                      {file.digests?.sha256 && (
                        <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                          <Hash size={10} /> SHA256: {file.digests.sha256.substring(0, 12)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded border ${file.packagetype === 'bdist_wheel'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600'
                          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-600'
                        }`}>
                        {file.packagetype === 'bdist_wheel' ? 'WHEEL' : 'SOURCE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(file.upload_time)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Download size={14} className="mr-1.5" /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="sm:hidden flex flex-col gap-4 mt-2">
            {sortedFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
                  {file.filename}
                </div>

                {file.digests?.sha256 && (
                  <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                    <Hash size={10} /> SHA256: {file.digests.sha256.substring(0, 12)}...
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="font-semibold">Type:</div>
                  <div>
                    <span className={`px-2 py-0.5 rounded border ${file.packagetype === 'bdist_wheel'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-600'
                      }`}>
                      {file.packagetype === 'bdist_wheel' ? 'WHEEL' : 'SOURCE'}
                    </span>
                  </div>

                  <div className="font-semibold">Size:</div>
                  <div>{formatBytes(file.size)}</div>

                  <div className="font-semibold">Uploaded:</div>
                  <div>{formatDate(file.upload_time)}</div>
                </div>

                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full flex items-center justify-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download size={14} className="mr-1.5" /> Download
                </a>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};


// --- Main Application ---

export default function App() {
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [downloadStats, setDownloadStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Initialize Theme & History
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
    const savedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(savedSearches);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchPackageData = async (pkgName) => {
    if (!pkgName) return;
    setLoading(true);
    setError(null);
    setPackageData(null);
    setDownloadStats(null);

    try {
      const res = await fetch(`https://pypi.org/pypi/${pkgName}/json`);
      if (!res.ok) throw new Error(res.status === 404 ? 'Package not found' : 'Failed to fetch data');
      const data = await res.json();
      setPackageData(data);

      const newHistory = [pkgName, ...recentSearches.filter(s => s !== pkgName)].slice(0, 5);
      setRecentSearches(newHistory);
      localStorage.setItem('recentSearches', JSON.stringify(newHistory));

      try {
        const statsRes = await fetch(`https://pypi-stats-api.vercel.app/api/packages/${pkgName}/overall`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setDownloadStats(stats);
        }
      } catch (e) {
        console.warn("Stats API blocked by CORS or unavailable");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackageData(query);
  };

  const copyInstallCmd = () => {
    navigator.clipboard.writeText(`pip install ${packageData.info.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const releaseHistoryData = useMemo(() => {
    if (!packageData) return [];
    const releases = packageData.releases;
    const timeline = Object.keys(releases)
      .map(version => {
        const relData = releases[version];
        if (!relData || relData.length === 0) return null;
        return {
          version,
          date: new Date(relData[0].upload_time).getTime(),
          dateStr: relData[0].upload_time,
          size: relData.reduce((acc, curr) => acc + curr.size, 0)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date);
    return timeline;
  }, [packageData]);

  const downloadData = useMemo(() => {
    if (!downloadStats) return [];
    return downloadStats.data.map(d => ({ ...d, date: d.date })).slice(-30);
  }, [downloadStats]);

  // New Content Renderer that handles Tables manually
  const renderReadmeContent = (content) => {
    const processed = preprocessMarkdown(content);
    const lines = processed.split('\n');
    const chunks = [];
    let currentText = [];
    let currentTable = [];
    let inTable = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|');

      if (inTable) {
        if (isTableLine) {
          currentTable.push(trimmed);
        } else {
          // End of table
          chunks.push({ type: 'table', content: currentTable });
          currentTable = [];
          inTable = false;
          currentText.push(line);
        }
      } else {
        // Check for start of table: Current line is pipe, NEXT line is separator |---|
        if (isTableLine) {
          const nextLine = lines[index + 1]?.trim();
          const nextIsSeparator = nextLine?.startsWith('|') && /^[|\s-:]+$/.test(nextLine) && nextLine.includes('-');

          if (nextIsSeparator) {
            if (currentText.length > 0) {
              chunks.push({ type: 'text', content: currentText.join('\n') });
              currentText = [];
            }
            inTable = true;
            currentTable.push(trimmed);
          } else {
            currentText.push(line);
          }
        } else {
          currentText.push(line);
        }
      }
    });

    if (inTable) chunks.push({ type: 'table', content: currentTable });
    if (currentText.length > 0) chunks.push({ type: 'text', content: currentText.join('\n') });

    return chunks.map((chunk, i) => {
      if (chunk.type === 'text') {
        return <ReactMarkdown key={i} components={MarkdownComponents}>{chunk.content}</ReactMarkdown>;
      } else {
        return <CustomTable key={i} rows={chunk.content} />;
      }
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setPackageData(null); setQuery(''); }}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Box className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              PyPI Lens
            </span>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search package (e.g. pandas, requests)..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </form>

          <div className="flex items-center space-x-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mb-8 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search package..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
        </form>

        {/* Welcome / Empty State */}
        {!packageData && !loading && (
          <div className="flex flex-col items-center justify-center mt-10 md:mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-full mb-6">
              <Package className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Explore the Python <span className="text-indigo-600 dark:text-indigo-400">Ecosystem</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8">
              Deep dive into analytics, release history, metadata, and dependencies for any package on the Python Package Index.
            </p>

            {recentSearches.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.map(term => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); fetchPackageData(term); }}
                      className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 animate-pulse">Fetching package metadata...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Whoops!</h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Dashboard */}
        {packageData && !loading && (
          <div className="animate-in fade-in zoom-in-95 duration-500">

            {/* Info Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200 dark:border-slate-700 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Package size={200} />
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold">{packageData.info.name}</h1>
                      <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-mono font-bold">
                        v{packageData.info.version}
                      </span>
                    </div>

                    {/* PIP Install Command Moved Here */}
                    <div className="flex items-center gap-2 mb-4 mt-3 w-fit">
                      <div className="bg-slate-900 dark:bg-black rounded-lg p-1 pl-3 pr-1 flex items-center gap-3 group shadow-sm border border-slate-700">
                        <Terminal size={14} className="text-slate-400" />
                        <code className="text-sm font-mono text-white">pip install {packageData.info.name}</code>
                        <button
                          onClick={copyInstallCmd}
                          className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-300"
                        >
                          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                      {packageData.info.summary || "No description provided."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 justify-end">
                      {packageData.info.home_page && (
                        <a href={packageData.info.home_page} target="_blank" rel="noreferrer" className="text-sm flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
                          Homepage <ExternalLink size={12} />
                        </a>
                      )}
                      {packageData.info.project_urls?.Source && (
                        <a href={packageData.info.project_urls.Source} target="_blank" rel="noreferrer" className="text-sm flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                          <Github size={14} /> Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Users size={16} className="mr-2" />
                    Author: <span className="font-medium text-slate-900 dark:text-white ml-1">{packageData.info.author || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Calendar size={16} className="mr-2" />
                    Released: <span className="font-medium text-slate-900 dark:text-white ml-1">{formatDate(packageData.releases[packageData.info.version]?.[0]?.upload_time)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-8">
              {[
                { id: 'overview', label: 'Dashboard', icon: Activity },
                { id: 'readme', label: 'README', icon: BookOpen },
                { id: 'releases', label: 'Releases', icon: FileArchive }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">

              {/* 1. Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={Activity}
                      label="Total Releases"
                      value={releaseHistoryData.length}
                      color="purple"
                    />
                    <StatCard
                      icon={Download}
                      label="Last Month Downloads"
                      value={downloadStats ? downloadStats.data.reduce((a, b) => a + b.downloads, 0).toLocaleString() : 'N/A'}
                      subValue={downloadStats ? 'via PyPI Stats' : 'Data Unavailable'}
                      color="emerald"
                    />
                    <StatCard
                      icon={Database}
                      label="Latest Size"
                      value={formatBytes(packageData.releases[packageData.info.version]?.[0]?.size || 0)}
                      color="blue"
                    />
                    <StatCard
                      icon={Users}
                      label="Python Requires"
                      value={packageData.info.requires_python || "*"}
                      color="orange"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold mb-6 flex items-center">
                        Release Velocity
                        <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">All Time</span>
                      </h3>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={releaseHistoryData}>
                            <defs>
                              <linearGradient id="colorDate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(time) => new Date(time).getFullYear()}
                              stroke="#94a3b8"
                              type="number"
                              domain={['auto', 'auto']}
                              scale="time"
                            />
                            <YAxis hide />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Area
                              type="stepAfter"
                              dataKey="size"
                              stroke="#6366f1"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorDate)"
                              name="Package Size"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold mb-6">Recent Downloads</h3>
                      {downloadStats ? (
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={downloadData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="date" tick={false} axisLine={false} />
                              <RechartsTooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px' }}
                              />
                              <Bar dataKey="downloads" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                          <Activity size={32} className="mb-2 opacity-50" />
                          <p className="text-sm text-center px-4">Download statistics unavailable due to cross-origin restrictions or lack of data.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* 2. README Tab */}
              {activeTab === 'readme' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-10 overflow-hidden min-h-[400px]">
                  {packageData.info.description ? (
                    <>
                      {packageData.info.description_content_type === 'text/x-rst' ? (
                        <div>
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6 text-sm text-blue-800 dark:text-blue-300">
                            <AlertCircle size={16} />
                            <span>This package uses reStructuredText. Rendering as raw text.</span>
                          </div>
                          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 overflow-x-auto leading-relaxed">
                            {packageData.info.description}
                          </pre>
                        </div>
                      ) : (
                        <div className="w-full">
                          {renderReadmeContent(packageData.info.description)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <p>No description available for this package.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Releases & Files Tab */}
              {activeTab === 'releases' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Version History & Files</h3>
                    <span className="text-xs text-slate-500">Click a row to view files</span>
                  </div>
                  <div>
                    {Object.keys(packageData.releases)
                      .sort((a, b) => {
                        const dateA = packageData.releases[a][0]?.upload_time || 0;
                        const dateB = packageData.releases[b][0]?.upload_time || 0;
                        return new Date(dateB) - new Date(dateA);
                      })
                      .map((version) => (
                        <VersionRow
                          key={version}
                          version={version}
                          date={packageData.releases[version][0] ? formatDate(packageData.releases[version][0].upload_time) : 'N/A'}
                          files={packageData.releases[version]}
                        />
                      ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>
            PyPI Lens &copy; {new Date().getFullYear()}
          </p>

          <p className="mt-1">
            Made with <span className="text-red-500">❤️</span> by{" "}
            <a
              href="https://github.com/shivaarajput"
              target="_blank"
              rel="noreferrer"
              className="hover:underline font-medium"
            >
              Shiva :)
            </a>
          </p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}