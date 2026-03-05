import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

// 默认角色配色（当从API加载失败时使用）
const DEFAULT_CHARACTER_COLORS = {
  ironclad: { name: 'Ironclad', color: '#ff4757', bgColor: '#c0392b' },
  silent: { name: 'Silent', color: '#00d9a5', bgColor: '#00b386' },
  defect: { name: 'Defect', color: '#00d4ff', bgColor: '#00a8cc' },
  watcher: { name: 'Watcher', color: '#b967ff', bgColor: '#9d4edd' },
  colorless: { name: 'Colorless', color: '#a0a0b0', bgColor: '#7a7a8c' },
  curse: { name: 'Curse', color: '#6c5ce7', bgColor: '#5649c0' }
};

// Card type colors
const TYPE_COLORS = {
  'Attack': '#e74c3c',
  'Skill': '#3498db',
  'Power': '#f39c12',
  'Curse': '#8e44ad',
  'Status': '#95a5a6'
};

// Rarity colors
const RARITY_COLORS = {
  'Basic': '#95a5a6',
  'Common': '#7f8c8d',
  'Uncommon': '#3498db',
  'Rare': '#f1c40f',
  'Special': '#9b59b6'
};

function App() {
  const [character, setCharacter] = useState('ironclad');
  const [cardCategory, setCardCategory] = useState('character');
  const [allCards, setAllCards] = useState({});
  const [displayCards, setDisplayCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [relics, setRelics] = useState([]);
  const [selectedCards, setSelectedCards] = useState({});
  const [selectedRelics, setSelectedRelics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // API预设配置
  const API_PRESETS = {
    moonshot: {
      name: 'Moonshot AI (Kimi)',
      apiUrl: 'https://api.moonshot.cn/v1',
      model: 'moonshot-v1-8k',
      placeholder: 'sk-...'
    },
    claude: {
      name: 'Claude (Anthropic)',
      apiUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-5-sonnet-20241022',
      placeholder: 'sk-ant-...'
    },
    openai: {
      name: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      placeholder: 'sk-...'
    },
    google: {
      name: 'Google AI Studio',
      apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.5-pro',
      placeholder: 'AIza...'
    },
    custom: {
      name: 'Custom',
      apiUrl: '',
      model: '',
      placeholder: ''
    }
  };

  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem('apiConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }
    return {
      preset: 'moonshot',
      apiUrl: 'https://api.moonshot.cn/v1',
      apiKey: '',
      model: 'moonshot-v1-8k'
    };
  });
  const [showConfig, setShowConfig] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    rarity: 'all',
    type: 'all',
    cost: 'all',
    showUpgraded: false
  });
  
  // 知识库选项状态
  const [knowledgeOptions, setKnowledgeOptions] = useState({
    methodology: false,
    gameKnowledge: false,
    characterCards: [],
    allRelics: false,
    sendDeckInfo: true,
    selectedGuides: []
  });
  
  // 自定义系统提示词状态
  const [customSystemPrompt, setCustomSystemPrompt] = useState(() => {
    const saved = localStorage.getItem('customSystemPrompt');
    return saved || '';
  });
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');

  // 游戏进度状态
  const [gameProgress, setGameProgress] = useState({
    act: 1,
    floor: 1
  });
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [guideFiles, setGuideFiles] = useState([]);
  const [knowledgeCharacters, setKnowledgeCharacters] = useState([]);
  
  // 对话历史状态
  const [conversationId, setConversationId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [followUpMessage, setFollowUpMessage] = useState('');
  
  // 流式输出状态
  const [streamingContent, setStreamingContent] = useState('');
  const [thinkingContent, setThinkingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 聊天面板展开状态
  const [chatExpanded, setChatExpanded] = useState(false);
  
  // 动态角色分类配置
  const [characterColors, setCharacterColors] = useState(DEFAULT_CHARACTER_COLORS);

  // 初始化数据
  useEffect(() => {
    // 加载角色配置
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const colors = {};
          data.forEach(char => {
            colors[char.id] = {
              name: char.nameEn,
              color: char.color,
              bgColor: char.bgColor
            };
          });
          setCharacterColors(colors);
          // 如果当前角色不在新列表中，切换到第一个可用角色
          if (!colors[character]) {
            const firstChar = data[0]?.id;
            if (firstChar) {
              setCharacter(firstChar);
            }
          }
        }
      })
      .catch(err => {
        console.error('Failed to load characters:', err);
        // 使用默认配置
        setCharacterColors(DEFAULT_CHARACTER_COLORS);
      });

    fetch('/api/cards')
      .then(res => res.json())
      .then(data => {
        setAllCards(data);
        setDisplayCards(data[character] || []);
      })
      .catch(err => console.error('Failed to load cards:', err));
    
    fetch('/api/knowledge-options')
      .then(res => res.json())
      .then(data => {
        if (data.guideFiles) {
          setGuideFiles(data.guideFiles);
        }
        if (data.characters) {
          setKnowledgeCharacters(data.characters);
        }
      })
      .catch(err => console.error('Failed to load guide files:', err));
    
    fetch('/api/relics')
      .then(res => res.json())
      .then(data => {
        const allRelics = Object.values(data).flat();
        setRelics(allRelics);
      })
      .catch(err => console.error('Failed to load relics:', err));
  }, []);

  // 角色/分类切换时更新显示卡牌
  useEffect(() => {
    if (!allCards || Object.keys(allCards).length === 0) return;
    let cards = [];
    if (cardCategory === 'character') {
      cards = allCards[character] || [];
    } else if (cardCategory === 'colorless') {
      cards = allCards.colorless || [];
    } else if (cardCategory === 'curse') {
      cards = allCards.curse || [];
    }
    setDisplayCards(cards);
  }, [character, cardCategory, allCards]);

  // 筛选和搜索逻辑
  useEffect(() => {
    let cards = [...displayCards];
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(c => 
        c.nameEn.toLowerCase().includes(query) ||
        c.name?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }
    
    // 稀有度筛选
    if (filters.rarity !== 'all') {
      cards = cards.filter(c => c.rarityEn === filters.rarity);
    }
    // 类型筛选
    if (filters.type !== 'all') {
      cards = cards.filter(c => c.typeEn === filters.type);
    }
    // 费用筛选
    if (filters.cost !== 'all') {
      if (filters.cost === 'X') {
        cards = cards.filter(c => c.cost === 'X' || c.cost < 0);
      } else {
        const costNum = parseInt(filters.cost);
        cards = cards.filter(c => c.cost === costNum);
      }
    }
    
    setFilteredCards(cards);
  }, [displayCards, filters, searchQuery]);

  // 保存API配置
  useEffect(() => {
    try {
      localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        localStorage.clear();
        localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
      }
    }
  }, [apiConfig]);
  
  // 保存自定义系统提示词
  useEffect(() => {
    try {
      if (customSystemPrompt) {
        localStorage.setItem('customSystemPrompt', customSystemPrompt);
      } else {
        localStorage.removeItem('customSystemPrompt');
      }
    } catch (e) {
      console.error('Failed to save custom prompt:', e);
    }
  }, [customSystemPrompt]);

  // 处理预设切换
  const handlePresetChange = (preset) => {
    const presetConfig = API_PRESETS[preset];
    setApiConfig({
      ...apiConfig,
      preset,
      apiUrl: presetConfig.apiUrl,
      model: presetConfig.model
    });
  };

  // 卡牌操作
  const addCard = (cardId) => {
    setSelectedCards(prev => {
      const current = prev[cardId] || 0;
      return { ...prev, [cardId]: current + 1 };
    });
  };

  const removeCard = (cardId) => {
    setSelectedCards(prev => {
      const current = prev[cardId];
      if (!current || current <= 1) {
        const newCards = { ...prev };
        delete newCards[cardId];
        return newCards;
      }
      return { ...prev, [cardId]: current - 1 };
    });
  };

  const clearSelectedCards = () => setSelectedCards({});
  
  // 清除遗物
  const clearSelectedRelics = () => setSelectedRelics([]);
  
  // 一键清除所有
  const clearAll = () => {
    setSelectedCards({});
    setSelectedRelics([]);
  };

  const toggleRelic = (relicId) => {
    setSelectedRelics(prev =>
      prev.includes(relicId) ? prev.filter(id => id !== relicId) : [...prev, relicId]
    );
  };

  const getCardById = (cardId) => {
    for (const category of Object.values(allCards)) {
      const card = category.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const getTotalCardCount = () => {
    return Object.values(selectedCards).reduce((sum, count) => sum + count, 0);
  };

  // 获取当前卡组描述
  const getDeckDescription = () => {
    if (Object.keys(selectedCards).length === 0) return null;

    const deckLines = Object.entries(selectedCards).map(([cardId, count]) => {
      const card = getCardById(cardId);
      if (!card) return `${cardId} x${count}`;
      return `${card.nameEn}${count > 1 ? ` x${count}` : ''} (${card.cost}费${card.typeEn})`;
    });

    const relicLines = selectedRelics.length > 0
      ? selectedRelics.map(relicId => {
          const relic = relics.find(r => r.id === relicId);
          return relic ? relic.nameEn : relicId;
        })
      : [];

    let desc = `【当前构筑 - ${characterColors[character]?.name || character}】\n`;
    desc += `游戏进度：第${gameProgress.act}幕 第${gameProgress.floor}层\n`;
    desc += `卡组(${getTotalCardCount()}张):\n${deckLines.join('\n')}`;
    if (relicLines.length > 0) {
      desc += `\n\n遗物(${relicLines.length}个):\n${relicLines.join('\n')}`;
    }
    return desc;
  };
  
  const sendMessage = async () => {
    if (!followUpMessage.trim()) return;
    if (!apiConfig.apiKey) {
      alert('Please configure API key first');
      setShowConfig(true);
      return;
    }
    
    const deckDesc = knowledgeOptions.sendDeckInfo ? getDeckDescription() : null;
    const userContent = deckDesc 
      ? `${followUpMessage}\n\n${deckDesc}` 
      : followUpMessage;
    
    const userMsg = followUpMessage;
    setConversationHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setFollowUpMessage('');
    setLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    setThinkingContent('');
    
    try {
      const deckList = Object.entries(selectedCards).flatMap(([cardId, count]) =>
        Array(count).fill(cardId)
      );
      
      console.log('Sending knowledgeOptions:', JSON.stringify(knowledgeOptions, null, 2));
      
      const response = await fetch('/api/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deck: deckList, 
          relics: selectedRelics, 
          character, 
          apiConfig,
          knowledgeOptions,
          conversationId,
          userMessage: userContent,
          isFollowUp: conversationHistory.length > 0,
          customSystemPrompt: customSystemPrompt || null
        })
      });
      
      if (!response.ok) throw new Error('Analysis request failed');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentConvId = conversationId;
      let fullContent = '';
      let currentThinking = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'init':
                  currentConvId = data.conversationId;
                  setConversationId(data.conversationId);
                  break;
                case 'chunk':
                  fullContent += data.content;
                  setStreamingContent(prev => prev + data.content);
                  break;
                case 'thinking':
                  currentThinking = data.content;
                  setThinkingContent(data.content);
                  break;
                case 'done':
                  setIsStreaming(false);
                  setConversationHistory(prev => [...prev, { 
                    role: 'assistant', 
                    content: fullContent,
                    thinking: currentThinking 
                  }]);
                  setStreamingContent('');
                  setThinkingContent('');
                  break;
                case 'error':
                  throw new Error(data.error);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + error.message);
      setConversationHistory(prev => prev.slice(0, -1));
      setIsStreaming(false);
      setStreamingContent('');
      setThinkingContent('');
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const clearConversation = () => {
    if (conversationId) {
      fetch(`/api/conversation/${conversationId}`, { method: 'DELETE' });
    }
    setConversationHistory([]);
    setConversationId(null);
    setFollowUpMessage('');
  };

  const getCostDisplay = (cost) => {
    if (cost === 'X' || cost < 0) return 'X';
    return cost.toString();
  };

  const getCharacterColor = (char) => {
    return characterColors[char] || characterColors.ironclad || Object.values(characterColors)[0];
  };

  const currentCharColor = getCharacterColor(character);
  
  // 卡组统计
  const deckStats = useMemo(() => {
    const cards = Object.entries(selectedCards).map(([cardId, count]) => ({
      ...getCardById(cardId),
      count
    })).filter(Boolean);
    
    const total = cards.reduce((sum, c) => sum + c.count, 0);
    const attack = cards.filter(c => c.typeEn === 'Attack').reduce((sum, c) => sum + c.count, 0);
    const skill = cards.filter(c => c.typeEn === 'Skill').reduce((sum, c) => sum + c.count, 0);
    const power = cards.filter(c => c.typeEn === 'Power').reduce((sum, c) => sum + c.count, 0);
    const curse = cards.filter(c => c.typeEn === 'Curse').reduce((sum, c) => sum + c.count, 0);
    
    // 费用分布
    const costDist = {};
    cards.forEach(card => {
      const cost = card.cost === 'X' ? 'X' : (card.cost < 0 ? 'X' : card.cost);
      costDist[cost] = (costDist[cost] || 0) + card.count;
    });
    
    return { total, attack, skill, power, curse, costDist };
  }, [selectedCards]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">🎴</div>
          <h1>Slay the Spire Assistant</h1>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowKnowledgePanel(!showKnowledgePanel)} 
            className={`header-btn ${showKnowledgePanel ? 'active' : ''}`}
          >
            📚
          </button>
          <button 
            onClick={() => setShowConfig(!showConfig)} 
            className={`header-btn ${showConfig ? 'active' : ''}`}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <div className="modal-overlay" onClick={() => setShowPromptEditor(false)}>
          <div className="modal-content prompt-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 自定义系统提示词</h3>
              <button onClick={() => setShowPromptEditor(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="prompt-editor-info">
                <p>在此处设置自定义系统提示词，将替换默认的"你是杀戮尖塔构筑助手"开头。</p>
                <p>您可以添加特殊要求，例如要求使用思维链(Chain-of-Thought)等。</p>
              </div>
              <div className="prompt-template-buttons">
                <span>快速模板：</span>
                <button onClick={() => setTempPrompt('你是杀戮尖塔（Slay the Spire）构筑助手，请使用思维链(Chain-of-Thought)方式，先进行内部思考分析，然后给出最终建议。')}>
                  🤔 思维链
                </button>
                <button onClick={() => setTempPrompt('你是杀戮尖塔（Slay the Spire）顶级构筑分析专家，拥有深厚的游戏理解和数据分析能力。请提供专业、深入、数据驱动的分析。')}>
                  🏆 专家模式
                </button>
                <button onClick={() => setTempPrompt('你是杀戮尖塔（Slay the Spire）构筑助手，以简洁明了的方式给出实用的卡组建议。')}>
                  💬 简洁模式
                </button>
                <button onClick={() => setTempPrompt('')}>
                  🗑️ 清空
                </button>
              </div>
              <textarea
                className="prompt-editor-textarea"
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder="输入自定义系统提示词，留空则使用默认提示词..."
                rows={10}
              />
              <div className="prompt-editor-hint">
                <p>提示：此提示词仅替换系统消息的开头部分，知识库、卡组数据等仍会自动附加在后面。</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowPromptEditor(false)}
              >
                取消
              </button>
              <button 
                className="save-btn" 
                onClick={() => {
                  setCustomSystemPrompt(tempPrompt.trim());
                  setShowPromptEditor(false);
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Drawer */}
      {showConfig && (
        <div className="drawer">
          <div className="drawer-header">
            <h3>🔧 API Configuration</h3>
            <button onClick={() => setShowConfig(false)} className="close-btn">×</button>
          </div>
          <div className="drawer-content">
            <label className="full-width">
              <span>API Provider</span>
              <select
                value={apiConfig.preset || 'custom'}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="preset-select"
              >
                {Object.entries(API_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>API URL</span>
              <input
                type="text"
                value={apiConfig.apiUrl}
                onChange={(e) => setApiConfig({...apiConfig, apiUrl: e.target.value})}
                placeholder={API_PRESETS[apiConfig.preset || 'custom'].apiUrl}
              />
            </label>
            <label>
              <span>Model</span>
              <input
                type="text"
                value={apiConfig.model}
                onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                placeholder={API_PRESETS[apiConfig.preset || 'custom'].model}
              />
            </label>
            <label>
              <span>API Key</span>
              <input
                type="password"
                value={apiConfig.apiKey}
                onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                placeholder={API_PRESETS[apiConfig.preset || 'custom'].placeholder}
              />
            </label>
          </div>
        </div>
      )}
      
      {/* Knowledge Panel Drawer */}
      {showKnowledgePanel && (
        <div className="drawer">
          <div className="drawer-header">
            <h3>📚 Knowledge Base Options</h3>
            <button onClick={() => setShowKnowledgePanel(false)} className="close-btn">×</button>
          </div>
          <div className="drawer-content knowledge-drawer">
            <div className="knowledge-section">
              <h4>Analysis Resources</h4>
              {guideFiles.length > 0 ? (
                guideFiles.map(fileName => (
                  <label key={fileName} className="knowledge-checkbox">
                    <input 
                      type="checkbox" 
                      checked={knowledgeOptions.selectedGuides.includes(fileName)}
                      onChange={(e) => {
                        const guides = e.target.checked 
                          ? [...knowledgeOptions.selectedGuides, fileName]
                          : knowledgeOptions.selectedGuides.filter(f => f !== fileName);
                        setKnowledgeOptions({...knowledgeOptions, selectedGuides: guides});
                      }}
                    />
                    <span>{fileName}</span>
                  </label>
                ))
              ) : (
                <span className="no-guides">No guide files found</span>
              )}
            </div>
            
            <div className="knowledge-section">
              <h4>Character Card Libraries</h4>
              {knowledgeCharacters.length > 0 ? (
                knowledgeCharacters.map((char) => (
                  <label key={char.id} className="knowledge-checkbox">
                    <input 
                      type="checkbox" 
                      checked={knowledgeOptions.characterCards.includes(char.id)}
                      onChange={(e) => {
                        const chars = e.target.checked 
                          ? [...knowledgeOptions.characterCards, char.id]
                          : knowledgeOptions.characterCards.filter(c => c !== char.id);
                        setKnowledgeOptions({...knowledgeOptions, characterCards: chars});
                      }}
                    />
                    <span>{char.nameEn} - {char.name}全卡牌</span>
                  </label>
                ))
              ) : (
                <span className="no-guides">Loading characters...</span>
              )}
            </div>
            
            <div className="knowledge-section">
              <h4>Relic Database</h4>
              <label className="knowledge-checkbox">
                <input 
                  type="checkbox" 
                  checked={knowledgeOptions.allRelics}
                  onChange={(e) => setKnowledgeOptions({...knowledgeOptions, allRelics: e.target.checked})}
                />
                <span>All Relics - 全遗物数据库</span>
              </label>
            </div>
            
            <div className="knowledge-section">
              <h4>Current Context</h4>
              <label className="knowledge-checkbox">
                <input
                  type="checkbox"
                  checked={knowledgeOptions.sendDeckInfo}
                  onChange={(e) => setKnowledgeOptions({...knowledgeOptions, sendDeckInfo: e.target.checked})}
                />
                <span>Send Deck Info - 发送当前卡组信息</span>
              </label>
            </div>

            <div className="knowledge-section">
              <h4>Game Progress - 游戏进度</h4>
              <div className="progress-inputs">
                <label className="progress-input-label">
                  <span>Act - 幕</span>
                  <select
                    value={gameProgress.act}
                    onChange={(e) => setGameProgress({...gameProgress, act: parseInt(e.target.value)})}
                    className="progress-select"
                  >
                    <option value="1">Act 1</option>
                    <option value="2">Act 2</option>
                    <option value="3">Act 3</option>
                    <option value="4">Act 4</option>
                  </select>
                </label>
                <label className="progress-input-label">
                  <span>Floor - 层</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={gameProgress.floor}
                    onChange={(e) => setGameProgress({...gameProgress, floor: parseInt(e.target.value) || 1})}
                    className="progress-input"
                  />
                </label>
              </div>
            </div>
            
            <div className="knowledge-section">
              <h4>Custom System Prompt - 自定义系统提示词</h4>
              <div className="custom-prompt-section">
                <div className="custom-prompt-status">
                  <span className={`prompt-status-indicator ${customSystemPrompt ? 'active' : ''}`}>
                    {customSystemPrompt ? '✓ 已启用自定义提示词' : '○ 使用默认提示词'}
                  </span>
                  <button 
                    className="edit-prompt-btn"
                    onClick={() => {
                      setTempPrompt(customSystemPrompt);
                      setShowPromptEditor(true);
                    }}
                  >
                    {customSystemPrompt ? '编辑' : '设置'}
                  </button>
                  {customSystemPrompt && (
                    <button 
                      className="clear-prompt-btn"
                      onClick={() => {
                        if (confirm('确定要清除自定义提示词并恢复默认吗？')) {
                          setCustomSystemPrompt('');
                        }
                      }}
                    >
                      恢复默认
                    </button>
                  )}
                </div>
                {customSystemPrompt && (
                  <div className="custom-prompt-preview">
                    <label>当前自定义提示词预览：</label>
                    <div className="prompt-preview-content">
                      {customSystemPrompt.length > 100 
                        ? customSystemPrompt.substring(0, 100) + '...' 
                        : customSystemPrompt}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - 新布局：左(卡组) 右(卡牌库) */}
      <div className="main-content">
        {/* Left: Deck Builder (卡组构建区) */}
        <div className="deck-builder-panel">
          {/* 角色选择 */}
          <div className="character-tabs">
            {Object.entries(characterColors).map(([key, info]) => (
              <button
                key={key}
                className={`char-tab ${character === key && cardCategory === 'character' ? 'active' : ''} ${key}`}
                onClick={() => { 
                  if (key === 'colorless') {
                    setCardCategory('colorless');
                  } else if (key === 'curse') {
                    setCardCategory('curse');
                  } else {
                    setCharacter(key); 
                    setCardCategory('character'); 
                  }
                }}
                style={{
                  background: character === key && 
                    ((key === 'colorless' && cardCategory === 'colorless') ||
                     (key === 'curse' && cardCategory === 'curse') ||
                     (key !== 'colorless' && key !== 'curse' && cardCategory === 'character' && character === key))
                    ? info.color : `${info.color}80`,
                  opacity: (key === 'colorless' || key === 'curse') ? 0.9 : 1
                }}
              >
                {info.name}
              </button>
            ))}
          </div>

          {/* 卡组统计 */}
          <div className="deck-stats-bar">
            <div className="stat-item">
              <span className="stat-value">{deckStats.total}</span>
              <span className="stat-label">Cards</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item attack">
              <span className="stat-value">{deckStats.attack}</span>
              <span className="stat-label">Attack</span>
            </div>
            <div className="stat-item skill">
              <span className="stat-value">{deckStats.skill}</span>
              <span className="stat-label">Skill</span>
            </div>
            <div className="stat-item power">
              <span className="stat-value">{deckStats.power}</span>
              <span className="stat-label">Power</span>
            </div>
            {deckStats.curse > 0 && (
              <div className="stat-item curse">
                <span className="stat-value">{deckStats.curse}</span>
                <span className="stat-label">Curse</span>
              </div>
            )}
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{selectedRelics.length}</span>
              <span className="stat-label">Relics</span>
            </div>
          </div>

          {/* 卡牌列表 */}
          <div className="deck-list">
            <div className="deck-header">
              <span className="section-title">Current Deck</span>
              <div className="deck-actions">
                {getTotalCardCount() > 0 && (
                  <button onClick={clearSelectedCards} className="clear-btn" title="Clear Deck">
                    Clear Deck
                  </button>
                )}
                {(getTotalCardCount() > 0 || selectedRelics.length > 0) && (
                  <button onClick={clearAll} className="clear-btn clear-all" title="Clear All">
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            <div className="selected-cards-list">
              {Object.entries(selectedCards).map(([cardId, count]) => {
                const card = getCardById(cardId);
                if (!card) return null;
                return (
                  <div key={cardId} className={`selected-card-item ${card.typeEn}`}>
                    <div className="selected-cost">{getCostDisplay(card.cost)}</div>
                    <div className="selected-info">
                      <div className="selected-name">{card.nameEn}</div>
                      <div className="selected-type">{card.typeEn} · {card.rarityEn}</div>
                    </div>
                    <div className="selected-controls">
                      <button onClick={() => removeCard(cardId)} className="ctrl-btn">-</button>
                      <span className="count">{count}</span>
                      <button onClick={() => addCard(cardId)} className="ctrl-btn">+</button>
                    </div>
                  </div>
                );
              })}
              {Object.keys(selectedCards).length === 0 && (
                <div className="empty-hint">
                  <div className="empty-icon">🎴</div>
                  <p>Select cards from the right panel</p>
                </div>
              )}
            </div>
          </div>

          {/* 遗物区域 */}
          <div className="relics-section">
            <div className="relics-header">
              <span className="section-title">Relics ({selectedRelics.length})</span>
              {selectedRelics.length > 0 && (
                <button onClick={clearSelectedRelics} className="clear-btn" title="Clear Relics">
                  Clear Relics
                </button>
              )}
            </div>
            <div className="relics-grid">
              {relics.map(relic => (
                <div 
                  key={relic.id} 
                  className={`relic-item ${selectedRelics.includes(relic.id) ? 'selected' : ''}`}
                  onClick={() => toggleRelic(relic.id)}
                  title={relic.description}
                >
                  <div className="relic-icon">🏺</div>
                  <div className="relic-name">{relic.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Card Library (卡牌库) */}
        <div className="card-library-panel">
          {/* 搜索和筛选 */}
          <div className="library-toolbar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="clear-search">×</button>
              )}
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <select value={filters.rarity} onChange={(e) => setFilters({...filters, rarity: e.target.value})}>
                  <option value="all">All Rarities</option>
                  <option value="Basic">Basic</option>
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Special">Special</option>
                </select>
              </div>
              <div className="filter-group">
                <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                  <option value="all">All Types</option>
                  <option value="Attack">Attack</option>
                  <option value="Skill">Skill</option>
                  <option value="Power">Power</option>
                  <option value="Curse">Curse</option>
                </select>
              </div>
              <div className="filter-group">
                <select value={filters.cost} onChange={(e) => setFilters({...filters, cost: e.target.value})}>
                  <option value="all">All Costs</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="X">X</option>
                </select>
              </div>
              <label className="upgrade-checkbox">
                <input 
                  type="checkbox" 
                  checked={filters.showUpgraded} 
                  onChange={(e) => setFilters({...filters, showUpgraded: e.target.checked})} 
                />
                <span>Upgraded</span>
              </label>
            </div>
          </div>

          {/* 卡牌网格 */}
          <div className="library-content">
            <div className="section-title">
              <span>Card Library</span>
              <span className="card-count">{filteredCards.length} cards</span>
            </div>
            <div className="cards-grid">
              {filteredCards.map(card => (
                <div 
                  key={card.id} 
                  className={`game-card ${card.typeEn} ${card.rarityEn}`}
                  onClick={() => addCard(card.id)}
                  title={`Click to add to deck`}
                >
                  <div className={`card-cost ${card.cost === 0 ? 'zero' : ''}`}>
                    {getCostDisplay(card.cost)}
                  </div>
                  <div className="card-title">{card.nameEn}</div>
                  <div className="card-artwork">
                    <div className="artwork-placeholder">
                      {card.typeEn === 'Attack' && '⚔️'}
                      {card.typeEn === 'Skill' && '🛡️'}
                      {card.typeEn === 'Power' && '✨'}
                      {card.typeEn === 'Curse' && '💀'}
                      {card.typeEn === 'Status' && '⚡'}
                    </div>
                  </div>
                  <div className="card-type-badge" style={{ background: TYPE_COLORS[card.typeEn] || '#7f8c8d' }}>
                    {card.typeEn}
                  </div>
                  <div className="card-description">
                    {card.description}
                  </div>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <div className="empty-search">
                  <div className="empty-icon">🔍</div>
                  <p>No cards found</p>
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="clear-btn">Clear Search</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Chat Panel */}
      <div className={`chat-panel ${chatExpanded ? 'expanded' : ''}`}>
        <div className="chat-header" onClick={() => setChatExpanded(!chatExpanded)}>
          <span className="chat-title">💬 AI Assistant</span>
          <div className="chat-header-actions">
            {conversationHistory.length > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); clearConversation(); }} 
                className="clear-conversation-btn" 
                title="Clear Conversation"
              >
                🗑️ Clear
              </button>
            )}
            <button 
              className="expand-btn"
              onClick={(e) => { e.stopPropagation(); setChatExpanded(!chatExpanded); }}
              title={chatExpanded ? '收起' : '展开'}
            >
              {chatExpanded ? '⏬' : '⏫'}
            </button>
          </div>
        </div>
        
        {/* 卡组状态 */}
        {(getTotalCardCount() > 0 || selectedRelics.length > 0) && (
          <div className="deck-status-bar">
            <span className="deck-status-badge">
              <strong>{characterColors[character]?.name}</strong>
              <span>Act {gameProgress.act}-{gameProgress.floor}</span>
              <span className="separator">|</span>
              <span>{getTotalCardCount()} cards</span>
              {selectedRelics.length > 0 && <span>{selectedRelics.length} relics</span>}
            </span>
            <span className={`send-indicator ${knowledgeOptions.sendDeckInfo ? 'active' : 'inactive'}`}>
              {knowledgeOptions.sendDeckInfo ? '✓ Will send deck info' : '✗ Deck info hidden'}
            </span>
          </div>
        )}
        
        <div className="chat-content">
          {loading && !isStreaming && (
            <div className="loading">
              <div className="spinner"></div>
              <span>Thinking...</span>
            </div>
          )}
          
          {conversationHistory.length > 0 || isStreaming ? (
            <div className="conversation-history">
              {conversationHistory.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-header">
                    {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                  </div>
                  {msg.thinking && (
                    <div className="thinking-box">
                      <div className="thinking-header">
                        <span className="thinking-icon">💭</span>
                        <span>Thinking</span>
                      </div>
                      <div className="thinking-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.thinking}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  <div className="message-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {isStreaming && (
                <div className="message assistant streaming">
                  <div className="message-header">
                    🤖 Assistant
                    <span className="streaming-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </div>
                  {thinkingContent && (
                    <div className="thinking-box">
                      <div className="thinking-header">
                        <span className="thinking-icon">💭</span>
                        <span>Thinking</span>
                      </div>
                      <div className="thinking-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {thinkingContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  <div className="message-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-chat">
              <div className="empty-icon">🎮</div>
              <p>Build your deck on the left, then ask questions here</p>
              <p className="hint-text">e.g., "分析这个构筑" / "Should I remove any cards?"</p>
            </div>
          )}
        </div>
        
        <div className="chat-input-section">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder={getTotalCardCount() > 0 
                ? "Ask about your deck..." 
                : "Ask anything about Slay the Spire..."}
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows={2}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !followUpMessage.trim()}
              className="send-btn"
            >
              {loading ? '...' : '➤'}
            </button>
          </div>
          <div className="chat-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
