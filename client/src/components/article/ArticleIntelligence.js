import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Pure client-side analysis helpers — no external API needed
// ─────────────────────────────────────────────────────────────────────────────

// 1. BIAS DETECTOR
// Scores article text for political lean using keyword frequency
const LEFT_WORDS  = ['progressive','inequality','climate change','social justice','systemic','marginalized','diversity','inclusion','welfare','regulation','union','workers','affordable','universal','reform','protest','activist','rights','equity','oppression','discrimination','vulnerable','community','public','collective'];
const RIGHT_WORDS = ['free market','deregulation','traditional','conservative','patriot','border','sovereignty','liberty','taxpayer','private sector','business','entrepreneur','growth','security','law and order','military','faith','family values','fiscal','accountability','individual','freedom','constitution','heritage','national'];
const NEUTRAL_WORDS = ['said','reported','according','announced','confirmed','stated','officials','government','data','study','research','analysis','percent','million','billion'];

function detectBias(text) {
  if (!text) return { label: 'Unknown', score: 0, confidence: 'low' };
  const lower = text.toLowerCase();
  let leftScore  = LEFT_WORDS.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);
  let rightScore = RIGHT_WORDS.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);
  const neutralScore = NEUTRAL_WORDS.reduce((acc, w) => acc + (lower.split(w).length - 1), 0);
  const total = leftScore + rightScore + neutralScore || 1;
  const neutralRatio = neutralScore / total;

  if (neutralRatio > 0.6 || (leftScore === 0 && rightScore === 0)) {
    return { label: 'Neutral', score: 0, confidence: 'medium', leftScore, rightScore };
  }
  if (leftScore > rightScore * 1.5) {
    const intensity = Math.min(leftScore / (leftScore + rightScore), 1);
    return { label: intensity > 0.7 ? 'Left-leaning' : 'Slightly Left', score: -intensity, confidence: leftScore > 3 ? 'high' : 'low', leftScore, rightScore };
  }
  if (rightScore > leftScore * 1.5) {
    const intensity = Math.min(rightScore / (leftScore + rightScore), 1);
    return { label: intensity > 0.7 ? 'Right-leaning' : 'Slightly Right', score: intensity, confidence: rightScore > 3 ? 'high' : 'low', leftScore, rightScore };
  }
  return { label: 'Balanced', score: 0, confidence: 'medium', leftScore, rightScore };
}

// 2. IMPACT SCORE
// Rates how significant the news is across dimensions
const IMPACT_KEYWORDS = {
  economy:     { words: ['gdp','inflation','recession','market','economy','trade','budget','fiscal','monetary','rbi','fed','interest rate','unemployment','growth','investment','stock','rupee','dollar'], weight: 1.2 },
  political:   { words: ['election','parliament','government','policy','minister','president','prime minister','law','bill','act','constitution','vote','party','cabinet','supreme court'], weight: 1.1 },
  social:      { words: ['health','education','poverty','welfare','women','children','disaster','flood','earthquake','pandemic','vaccine','hospital','school','crime'], weight: 1.0 },
  global:      { words: ['war','conflict','nuclear','climate','un','nato','g20','treaty','sanctions','diplomacy','international','global','world'], weight: 1.3 },
  technology:  { words: ['ai','artificial intelligence','cyber','hack','data breach','space','isro','nasa','tech','digital','internet','5g'], weight: 0.9 },
};

function calcImpactScore(title, description, content) {
  const text = `${title} ${description} ${content}`.toLowerCase();
  const scores = {};
  let total = 0;
  for (const [dim, cfg] of Object.entries(IMPACT_KEYWORDS)) {
    const hits = cfg.words.reduce((acc, w) => acc + (text.split(w).length - 1), 0);
    scores[dim] = Math.min(Math.round((hits * cfg.weight) * 10), 100);
    total += scores[dim];
  }
  const overall = Math.min(Math.round(total / Object.keys(IMPACT_KEYWORDS).length), 100);
  return { overall, dimensions: scores };
}

// 3. FAKE NEWS / CREDIBILITY CHECK
// Uses existing credibilityScore + isFakeNews + heuristics
const CREDIBLE_SOURCES = ['reuters','ap news','associated press','bbc','the hindu','indian express','ndtv','times of india','bloomberg','financial times','the guardian','nytimes','washington post','pib','ani','pti'];
const CLICKBAIT_PATTERNS = [/you won't believe/i,/shocking/i,/this will blow/i,/secret/i,/they don't want you to know/i,/miracle/i,/doctors hate/i,/one weird trick/i,/\?\?\?/,/!!!/];
const SENSATIONAL_WORDS = ['explosive','bombshell','devastating','outrage','fury','slams','destroys','obliterates','epic fail','disaster'];

function analyzeCredibility(article) {
  let score = article.credibilityScore ?? 50;
  const flags = [];
  const positives = [];

  // Source credibility
  const sourceName = (article.source?.name || '').toLowerCase();
  if (CREDIBLE_SOURCES.some(s => sourceName.includes(s))) {
    score = Math.min(score + 20, 100);
    positives.push(`Reputable source: ${article.source?.name}`);
  }

  // Clickbait check
  const title = article.title || '';
  if (CLICKBAIT_PATTERNS.some(p => p.test(title))) {
    score = Math.max(score - 20, 0);
    flags.push('Title uses clickbait patterns');
  }

  // Sensational language
  const sensCount = SENSATIONAL_WORDS.filter(w => title.toLowerCase().includes(w)).length;
  if (sensCount > 0) {
    score = Math.max(score - sensCount * 5, 0);
    flags.push(`Sensational language detected (${sensCount} words)`);
  }

  // Has author
  if (article.author && article.author !== 'Unknown') positives.push('Named author present');
  else flags.push('No named author');

  // Has description
  if (article.description && article.description.length > 50) positives.push('Detailed description provided');

  // isFakeNews flag from backend
  if (article.isFakeNews) {
    score = Math.min(score, 20);
    flags.push('Flagged as potentially misleading by our system');
  }

  const label = score >= 75 ? 'High' : score >= 50 ? 'Medium' : score >= 25 ? 'Low' : 'Very Low';
  const color = score >= 75 ? '#28a745' : score >= 50 ? '#fd7e14' : score >= 25 ? '#dc3545' : '#6c757d';
  return { score, label, color, flags, positives };
}

// 4. SENTIMENT ANALYSIS
function analyzeSentiment(article) {
  // Use backend sentiment if available
  if (article.sentiment?.label) {
    const map = { positive: { emoji: '😊', color: '#28a745', label: 'Positive' }, negative: { emoji: '😟', color: '#dc3545', label: 'Negative' }, neutral: { emoji: '😐', color: '#6c757d', label: 'Neutral' } };
    return { ...map[article.sentiment.label], score: article.sentiment.score ?? 0 };
  }
  // Fallback: simple keyword count
  const POSITIVE = ['growth','success','achievement','progress','improve','benefit','positive','win','gain','rise','boost','launch','celebrate','peace','agreement','deal'];
  const NEGATIVE = ['crisis','war','conflict','death','disaster','fail','loss','decline','attack','violence','protest','corruption','fraud','collapse','threat','risk'];
  const text = `${article.title} ${article.description}`.toLowerCase();
  const pos = POSITIVE.filter(w => text.includes(w)).length;
  const neg = NEGATIVE.filter(w => text.includes(w)).length;
  if (pos > neg + 1) return { emoji: '😊', color: '#28a745', label: 'Positive', score: pos / (pos + neg + 1) };
  if (neg > pos + 1) return { emoji: '😟', color: '#dc3545', label: 'Negative', score: -(neg / (pos + neg + 1)) };
  return { emoji: '😐', color: '#6c757d', label: 'Neutral', score: 0 };
}

// 5. WHAT MIGHT HAPPEN NEXT (prediction engine)
const PREDICTION_RULES = [
  { keywords: ['election','vote','poll','campaign'], predictions: ['Voter turnout data will be closely watched', 'Opposition parties likely to respond with counter-campaigns', 'Market may react to political uncertainty', 'International observers may comment on the process'] },
  { keywords: ['inflation','interest rate','rbi','fed','monetary'], predictions: ['Central bank may adjust policy rates in next meeting', 'Currency markets likely to react', 'Consumer spending patterns may shift', 'Bond yields could move in response'] },
  { keywords: ['war','conflict','military','attack','strike'], predictions: ['Diplomatic channels likely to be activated', 'Refugee and humanitarian concerns may escalate', 'Energy and commodity prices could be affected', 'International community may call for ceasefire'] },
  { keywords: ['climate','flood','cyclone','earthquake','disaster'], predictions: ['Relief and rehabilitation operations will be launched', 'Government may announce emergency funds', 'Insurance claims likely to surge', 'Long-term infrastructure review may follow'] },
  { keywords: ['budget','fiscal','tax','gdp','economy'], predictions: ['Markets will price in the policy changes', 'Industry bodies likely to release impact assessments', 'Consumer sentiment surveys may shift', 'Rating agencies may review outlook'] },
  { keywords: ['court','verdict','judgment','supreme court','high court'], predictions: ['Appeals or review petitions may be filed', 'Policy amendments may follow the ruling', 'Affected parties will assess compliance timelines', 'Legal experts will debate implications'] },
  { keywords: ['technology','ai','launch','startup','ipo'], predictions: ['Competitors may accelerate their own roadmaps', 'Investor interest in the sector likely to increase', 'Regulatory scrutiny may follow rapid adoption', 'Talent demand in the sector may rise'] },
  { keywords: ['health','pandemic','vaccine','disease','outbreak'], predictions: ['Health authorities may issue updated advisories', 'Pharmaceutical companies may fast-track research', 'Travel and trade restrictions could be reviewed', 'Public health spending may increase'] },
  { keywords: ['trade','export','import','tariff','sanction'], predictions: ['Affected industries will lobby for relief measures', 'Supply chains may be restructured', 'Currency exchange rates likely to be impacted', 'Bilateral negotiations may intensify'] },
];

function generatePredictions(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const rule of PREDICTION_RULES) {
    if (rule.keywords.some(k => text.includes(k))) {
      return rule.predictions;
    }
  }
  return [
    'Follow-up reporting expected in coming days',
    'Stakeholders will likely issue official responses',
    'Related policy discussions may be triggered',
    'Public and expert opinion will continue to evolve',
  ];
}

// 6. TIMELINE KEYWORDS — extract key events from content
function extractTimeline(content, title) {
  if (!content) return [];
  const text = content.replace(/<[^>]*>/g, ' ');
  // Match sentences with year/date patterns
  const datePattern = /(\b(19|20)\d{2}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*(19|20)\d{2}\b|\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(19|20)\d{2}\b)/gi;
  const sentences = text.replace(/([.!?])\s+/g, '$1|').split('|');
  const events = [];
  sentences.forEach(s => {
    const match = s.match(datePattern);
    if (match && s.trim().length > 20 && s.trim().length < 200) {
      events.push({ date: match[0], text: s.trim().replace(datePattern, '').trim().slice(0, 120) });
    }
  });
  // Deduplicate and limit
  const seen = new Set();
  return events.filter(e => {
    if (seen.has(e.date)) return false;
    seen.add(e.date);
    return true;
  }).slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ArticleIntelligence({ article }) {
  const [activePanel, setActivePanel] = useState(null);

  const text = `${article?.title || ''} ${article?.description || ''} ${(article?.content || '').replace(/<[^>]*>/g, ' ')}`;

  const bias       = useMemo(() => detectBias(text), [text]);
  const impact     = useMemo(() => calcImpactScore(article?.title, article?.description, article?.content || ''), [article]);
  const credibility = useMemo(() => analyzeCredibility(article || {}), [article]);
  const sentiment  = useMemo(() => analyzeSentiment(article || {}), [article]);
  const predictions = useMemo(() => generatePredictions(article?.title || '', article?.description || ''), [article]);
  const timeline   = useMemo(() => extractTimeline(article?.content || '', article?.title || ''), [article]);

  if (!article) return null;

  const toggle = (panel) => setActivePanel(activePanel === panel ? null : panel);

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <span className="ai-panel__title">🧠 Article Intelligence</span>
        <span className="ai-panel__sub">AI-powered analysis</span>
      </div>

      {/* Quick Stats Row */}
      <div className="ai-quick-stats">
        <div className="ai-stat" title="Credibility Score">
          <span className="ai-stat__icon">🛡️</span>
          <span className="ai-stat__val" style={{ color: credibility.color }}>{credibility.score}</span>
          <span className="ai-stat__label">Credibility</span>
        </div>
        <div className="ai-stat" title="Impact Score">
          <span className="ai-stat__icon">⚡</span>
          <span className="ai-stat__val" style={{ color: impact.overall >= 60 ? '#dc3545' : impact.overall >= 30 ? '#fd7e14' : '#28a745' }}>{impact.overall}</span>
          <span className="ai-stat__label">Impact</span>
        </div>
        <div className="ai-stat" title="Sentiment">
          <span className="ai-stat__icon">{sentiment.emoji}</span>
          <span className="ai-stat__val" style={{ color: sentiment.color }}>{sentiment.label}</span>
          <span className="ai-stat__label">Tone</span>
        </div>
        <div className="ai-stat" title="Political Bias">
          <span className="ai-stat__icon">⚖️</span>
          <span className="ai-stat__val">{bias.label.split(' ')[0]}</span>
          <span className="ai-stat__label">Bias</span>
        </div>
      </div>

      {/* Expandable Panels */}
      <div className="ai-panels">

        {/* Bias Detector */}
        <AiSection
          id="bias"
          active={activePanel === 'bias'}
          onToggle={() => toggle('bias')}
          icon="⚖️"
          label="Bias Detector"
          badge={bias.label}
          badgeColor={bias.score < -0.3 ? '#0d6efd' : bias.score > 0.3 ? '#dc3545' : '#28a745'}
        >
          <div className="ai-bias">
            <div className="ai-bias__bar-wrap">
              <span className="ai-bias__side">Left</span>
              <div className="ai-bias__bar">
                <div
                  className="ai-bias__fill"
                  style={{
                    width: `${50 + bias.score * 50}%`,
                    background: bias.score < -0.2 ? '#0d6efd' : bias.score > 0.2 ? '#dc3545' : '#28a745',
                  }}
                />
                <div className="ai-bias__center" />
              </div>
              <span className="ai-bias__side">Right</span>
            </div>
            <p className="ai-bias__label">{bias.label}</p>
            <p className="ai-bias__confidence">Confidence: {bias.confidence}</p>
            <p className="ai-note">Based on keyword frequency analysis. Not a definitive political classification.</p>
          </div>
        </AiSection>

        {/* Impact Score */}
        <AiSection
          id="impact"
          active={activePanel === 'impact'}
          onToggle={() => toggle('impact')}
          icon="⚡"
          label="Impact Score"
          badge={`${impact.overall}/100`}
          badgeColor={impact.overall >= 60 ? '#dc3545' : impact.overall >= 30 ? '#fd7e14' : '#28a745'}
        >
          <div className="ai-impact">
            <div className="ai-impact__overall">
              <div className="ai-impact__ring" style={{ '--pct': impact.overall }}>
                <span>{impact.overall}</span>
              </div>
              <span className="ai-impact__overall-label">Overall Impact</span>
            </div>
            <div className="ai-impact__dims">
              {Object.entries(impact.dimensions).map(([dim, score]) => (
                <div key={dim} className="ai-impact__dim">
                  <span className="ai-impact__dim-label">{dim.charAt(0).toUpperCase() + dim.slice(1)}</span>
                  <div className="ai-impact__dim-bar">
                    <div className="ai-impact__dim-fill" style={{ width: `${score}%`, background: score >= 60 ? '#dc3545' : score >= 30 ? '#fd7e14' : '#0d6efd' }} />
                  </div>
                  <span className="ai-impact__dim-score">{score}</span>
                </div>
              ))}
            </div>
          </div>
        </AiSection>

        {/* Credibility / Fake News Check */}
        <AiSection
          id="credibility"
          active={activePanel === 'credibility'}
          onToggle={() => toggle('credibility')}
          icon="🛡️"
          label="Credibility Check"
          badge={credibility.label}
          badgeColor={credibility.color}
        >
          <div className="ai-cred">
            <div className="ai-cred__score-row">
              <div className="ai-cred__score" style={{ color: credibility.color }}>{credibility.score}<span>/100</span></div>
              <span className="ai-cred__label" style={{ color: credibility.color }}>{credibility.label} Credibility</span>
            </div>
            <div className="ai-cred__bar">
              <div className="ai-cred__bar-fill" style={{ width: `${credibility.score}%`, background: credibility.color }} />
            </div>
            {credibility.positives.length > 0 && (
              <div className="ai-cred__section">
                <div className="ai-cred__section-label">✅ Positive signals</div>
                {credibility.positives.map((p, i) => <p key={i} className="ai-cred__item ai-cred__item--pos">{p}</p>)}
              </div>
            )}
            {credibility.flags.length > 0 && (
              <div className="ai-cred__section">
                <div className="ai-cred__section-label">⚠️ Flags</div>
                {credibility.flags.map((f, i) => <p key={i} className="ai-cred__item ai-cred__item--flag">{f}</p>)}
              </div>
            )}
            <p className="ai-note">Automated check. Always verify with primary sources.</p>
          </div>
        </AiSection>

        {/* Prediction Engine */}
        <AiSection
          id="predict"
          active={activePanel === 'predict'}
          onToggle={() => toggle('predict')}
          icon="🔮"
          label="What Might Happen Next?"
          badge="Predictions"
          badgeColor="#6f42c1"
        >
          <ul className="ai-predict-list">
            {predictions.map((p, i) => (
              <li key={i} className="ai-predict-item">
                <span className="ai-predict-num">{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="ai-note">Pattern-based predictions. Not guaranteed outcomes.</p>
        </AiSection>

        {/* Timeline */}
        {timeline.length > 0 && (
          <AiSection
            id="timeline"
            active={activePanel === 'timeline'}
            onToggle={() => toggle('timeline')}
            icon="📅"
            label="Issue Timeline"
            badge={`${timeline.length} events`}
            badgeColor="#1a6b3c"
          >
            <div className="ai-timeline">
              {timeline.map((event, i) => (
                <div key={i} className="ai-timeline__item">
                  <div className="ai-timeline__dot" />
                  <div className="ai-timeline__content">
                    <span className="ai-timeline__date">{event.date}</span>
                    <p className="ai-timeline__text">{event.text || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </AiSection>
        )}

        {/* Source Comparison */}
        <AiSection
          id="sources"
          active={activePanel === 'sources'}
          onToggle={() => toggle('sources')}
          icon="🔍"
          label="Find Other Sources"
          badge="Compare"
          badgeColor="#fd7e14"
        >
          <div className="ai-sources">
            <p className="ai-sources__desc">Search this story on other outlets:</p>
            {[
              { name: 'Google News', url: `https://news.google.com/search?q=${encodeURIComponent(article.title?.slice(0, 60) || '')}`, icon: '🔍' },
              { name: 'The Hindu', url: `https://www.thehindu.com/search/?q=${encodeURIComponent(article.title?.slice(0, 40) || '')}`, icon: '📰' },
              { name: 'Indian Express', url: `https://indianexpress.com/?s=${encodeURIComponent(article.title?.slice(0, 40) || '')}`, icon: '📰' },
              { name: 'Reuters', url: `https://www.reuters.com/search/news?blob=${encodeURIComponent(article.title?.slice(0, 40) || '')}`, icon: '📡' },
              { name: 'BBC News', url: `https://www.bbc.co.uk/search?q=${encodeURIComponent(article.title?.slice(0, 40) || '')}`, icon: '📺' },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" className="ai-source-link">
                <span>{s.icon}</span>
                <span>{s.name}</span>
                <span className="ai-source-arrow">↗</span>
              </a>
            ))}
            <Link
              to={`/search?q=${encodeURIComponent(article.title?.slice(0, 50) || '')}`}
              className="ai-source-link ai-source-link--internal"
            >
              <span>🗞️</span>
              <span>Search on WorldToday</span>
              <span className="ai-source-arrow">→</span>
            </Link>
          </div>
        </AiSection>

      </div>
    </div>
  );
}

// ── Collapsible Section ────────────────────────────────────────────────────

function AiSection({ id, active, onToggle, icon, label, badge, badgeColor, children }) {
  return (
    <div className={`ai-section${active ? ' ai-section--open' : ''}`}>
      <button className="ai-section__btn" onClick={onToggle} aria-expanded={active}>
        <span className="ai-section__icon">{icon}</span>
        <span className="ai-section__label">{label}</span>
        <span className="ai-section__badge" style={{ background: badgeColor }}>{badge}</span>
        <span className="ai-section__chevron">{active ? '▲' : '▼'}</span>
      </button>
      {active && <div className="ai-section__body">{children}</div>}
    </div>
  );
}
