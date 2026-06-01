import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Star, 
  Tag, 
  Plus, 
  FileText, 
  ChevronRight,
  Volume2,
  Sparkles
} from 'lucide-react';
import { WikiArticle } from '../types';

interface WikiViewProps {
  articles: WikiArticle[];
  onSubmitArticle: (artData: any) => Promise<void>;
  onFavoriteArticle: (artId: string) => Promise<void>;
}

export default function WikiView({ articles, onSubmitArticle, onFavoriteArticle }: WikiViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Processos');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Todas',
    'Institucional',
    'Processos',
    'Educação',
    'Tecnologia'
  ];

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      await onSubmitArticle({
        title,
        content,
        category,
        tags: parsedTags,
        excerpt: excerpt || content.slice(0, 100) + '...'
      });
      setTitle('');
      setTags('');
      setContent('');
      setExcerpt('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Speaks out the content of the wiki article
  const readArticleText = (article: WikiArticle) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Lendo artigo wiki: ${article.title}. Categoria: ${article.category}. Conteúdo: ${article.content}`
      );
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Síntese de fala não suportada neste navegador.');
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todas' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Central de Conhecimento
          </h2>
          <p className="text-xs text-zinc-400">Políticas, manuais SENAI/SESI e fluxogramas estratégicos consolidados.</p>
        </div>
        {!showAddForm && (
          <button
            id="btn_new_article_trigger"
            onClick={() => setShowAddForm(true)}
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" /> Registrar Manual (+40 pts)
          </button>
        )}
      </div>

      {showAddForm && (
        <div id="section_add_wiki_form" className="glass-panel p-5 rounded-xl border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <h3 className="text-xs font-semibold uppercase text-white font-display">Adicionar Artigo de Procedimento da Firjan</h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateArticle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Título do Artigo/Diretriz *</label>
                <input
                  id="input_wiki_title"
                  type="text"
                  placeholder="Ex: Regulamento de Homologação SESI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Categoria da Wiki</label>
                <select
                  id="select_wiki_category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Institucional">Institucional</option>
                  <option value="Processos">Processos</option>
                  <option value="Educação">Educação</option>
                  <option value="Tecnologia">Tecnologia</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Tags de Pesquisa Separadas Por Vírgula</label>
              <input
                id="input_wiki_tags"
                type="text"
                placeholder="Ex: reembolso, sap, viagem, finanças"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Resumo descritivo rápido para busca (Excertos)</label>
              <input
                id="input_wiki_excerpt"
                type="text"
                placeholder="Exercer um resumo rápido das regras abordadas nesta página"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Conteúdo do Procedimento *</label>
              <textarea
                id="textarea_wiki_content"
                placeholder="Descreva o manual com todos os detalhes operacionais oficiais de forma estruturada..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              id="btn_wiki_submit_propo"
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg text-xs font-semibold float-right"
            >
              {isSubmitting ? 'Salvando...' : 'Publicar Diretriz'}
            </button>
            <div className="clear-both" />
          </form>
        </div>
      )}

      {/* Controls: search and categorization filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            id="search_wiki_input"
            type="text"
            placeholder="Pesquisa semântica de procedimentos (tags, título)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
               id={`wiki_filter_${cat}`}
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${selectedCategory === cat ? 'bg-purple-500/20 text-purple-300 border-purple-500' : 'bg-zinc-950/40 text-zinc-400 border-zinc-900 hover:border-zinc-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wiki Feed / Split view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Article Titles List */}
        <div className="md:col-span-1 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-semibold block px-1">Artigos Disponíveis ({filteredArticles.length})</span>
          {filteredArticles.map((art) => (
            <button
              id={`wiki_item_trigger_${art.id}`}
              key={art.id}
              onClick={() => setActiveArticleId(activeArticleId === art.id ? null : art.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all block ${
                activeArticleId === art.id 
                  ? 'bg-purple-950/25 border-purple-500 text-white' 
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-xs font-semibold block leading-tight">{art.title}</span>
                {art.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0 fill-yellow-500" />}
              </div>
              <p className="text-[10px] text-zinc-500 truncate mt-1 leading-normal">{art.excerpt}</p>
              
              <div className="flex justify-between items-center text-[9px] text-zinc-500 mt-2">
                <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[8px]">{art.category}</span>
                <span>⭐ {art.favoritesCount} favoritaram</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Side: Active Article Detailed Content */}
        <div className="md:col-span-2">
          {activeArticleId ? (
            (() => {
              const art = articles.find(a => a.id === activeArticleId);
              if (!art) return null;
              return (
                <div className="glass-panel p-5 rounded-xl border-zinc-800/80 space-y-4 animate-in fade-in text-left">
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-500/10 text-purple-300 font-mono text-[9px] px-2 py-0.5 rounded border border-purple-500/10">
                          {art.category}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-zinc-500">Publicado em {new Date(art.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold font-display text-white">
                        {art.title}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="btn_read_wiki_text_voice"
                        onClick={() => readArticleText(art)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center"
                        title="Ouvir este artigo por voz"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        id="btn_fav_wiki"
                        onClick={() => onFavoriteArticle(art.id)}
                        className={`p-1.5 rounded-lg border flex items-center justify-center ${
                          art.isFavorite 
                            ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Favoritar Manual"
                      >
                        <Star className={`w-4 h-4 ${art.isFavorite ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {art.content}
                  </div>

                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-900">
                      {art.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-0.5 rounded font-mono">
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-zinc-950/30 p-3 rounded-lg border border-zinc-900 flex items-center gap-2 text-[11px] text-purple-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Dica de Acessibilidade: você pode clicar no ícone de microfone na barra flutuante de acessibilidade para ouvir esse artigo lido na íntegra.</span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="glass-panel p-16 rounded-xl border-zinc-800 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3 h-full min-h-[300px]">
              <FileText className="w-12 h-12 text-zinc-700" />
              <h4 className="text-sm font-semibold text-white">Nenhum manual de diretriz selecionado</h4>
              <p className="text-xs max-w-xs">Selecione uma norma na lista lateral para obter leitura estruturada, tags de busca e assistência por voz.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
