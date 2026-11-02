import React, { useState, useEffect, useRef } from 'react';

// --- 設定: Google Apps Script (GAS) のウェブアプリURL ---
const GAS_URL = "https://script.google.com/macros/s/AKfycbzctkXSVMIa7OkA1Me1kXRJZu_S8339d-zUkTvX5Obk1WFjT0w_LukUpOJdBWv1FZIB/exec";

// --- イベントデータベース ---
const EVENT_DB = {
  stray: [
    { id: 's1', cond: () => true, text: 'ゴミ捨て場で美味しそうな匂いがする。', choices: [
      { text: '漁ってみる', stat: { health: 10, stress: -5, humanTrust: 0, territory: 5 }, log: '残飯を食べて体力回復。自分の縄張りをアピールした。' },
      { text: '人間が怖いからやめる', stat: { health: -5, stress: 0, humanTrust: 0, territory: 0 }, log: 'お腹を空かせたままやり過ごした。' },
      { text: '他の猫が来るのを待つ', stat: { health: 0, stress: 5, humanTrust: 0, territory: -2 }, log: '場所を譲ってしまい、縄張りが少し狭まった。' }
    ]},
    { id: 's2', cond: () => true, text: '冷たい雨が降ってきた。', choices: [
      { text: '車の下に隠れる', stat: { health: 0, stress: -10, humanTrust: 0, territory: 0 }, log: '車の下で安全に雨を凌いだ。' },
      { text: '民家の軒下を借りる', stat: { health: 5, stress: -5, humanTrust: 5, territory: 3 }, log: '新しいお気に入りの雨宿りスポットを見つけた。' },
      { text: '気にせず歩き続ける', stat: { health: -15, stress: 15, humanTrust: 0, territory: 0 }, log: '体が冷え切ってしまった。' }
    ]},
    { id: 's3', cond: (s) => s.humanTrust > 10, text: '人間が「チッチッチッ」と呼んでいる。', choices: [
      { text: '近寄ってみる', stat: { health: 15, stress: -10, humanTrust: 15, territory: 5 }, log: '美味しいカリカリをもらい、このエリアの顔になった！' },
      { text: '距離を保って様子を見る', stat: { health: 0, stress: 0, humanTrust: 5, territory: 0 }, log: '警戒しつつも良好な距離感を保った。' },
      { text: '走って逃げる', stat: { health: -5, stress: 5, humanTrust: -10, territory: -5 }, log: '慌てて別のエリアへ逃げ込んだ。' }
    ]},
    { id: 's4', cond: () => true, text: '縄張りのボス猫に遭遇した！', choices: [
      { text: '威嚇して追い払う', stat: { health: -10, stress: 10, humanTrust: 0, territory: 15 }, log: '見事にボスを撃退し、縄張りを広げた！' },
      { text: 'お腹を見せて服従する', stat: { health: 0, stress: 15, humanTrust: 0, territory: -10 }, log: '縄張りの一部を譲る羽目になった。' },
      { text: '全力でダッシュで逃げる', stat: { health: -5, stress: 5, humanTrust: 0, territory: -5 }, log: 'すごすごと退散した。' }
    ]},
    { id: 's5', cond: () => true, text: '冬の夜、とても寒い。', choices: [
      { text: '自動販売機の下に潜り込む', stat: { health: 5, stress: -5, humanTrust: 0, territory: 2 }, log: '温かい特等席で一晩過ごした。' },
      { text: '走り回って体を温める', stat: { health: -10, stress: 0, humanTrust: 0, territory: 0 }, log: '体力を消耗しただけだった…。' },
      { text: '仲間の野良猫と身を寄せる', stat: { health: 10, stress: -15, humanTrust: 0, territory: 5 }, log: '仲間との絆が深まった。' }
    ]},
    { id: 's6', cond: (s) => s.health < 50, text: '怪我をして体が重い…。', choices: [
      { text: '安全な茂みでひたすら休む', stat: { health: 20, stress: -5, humanTrust: 0, territory: 0 }, log: '隠れ家でじっと体力を回復させた。' },
      { text: '無理してご飯を探す', stat: { health: -15, stress: 10, humanTrust: 0, territory: -5 }, log: '無理がたたり悪化した。' },
      { text: '人間のいる公園で倒れ込む', stat: { health: 30, stress: 10, humanTrust: 20, territory: 10 }, log: '優しい人に保護され、安全な場所を知った。' }
    ]},
    { id: 's7', cond: () => true, text: '鳥が地面を歩いている。', choices: [
      { text: '狩りの本能に従い飛びかかる', stat: { health: 15, stress: -10, humanTrust: 0, territory: 5 }, log: '見事に捕まえ、ハンターとしての格を示した。' },
      { text: '気付かれないよう観察する', stat: { health: 0, stress: -5, humanTrust: 0, territory: 0 }, log: '静かに観察してやり過ごした。' },
      { text: '面倒くさいから寝る', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: 'のんびり昼寝をした。' }
    ]},
    { id: 's8', cond: (s) => s.humanTrust > 30, text: 'よくご飯をくれる人間が近づいてきた。', choices: [
      { text: '足元にすり寄る', stat: { health: 10, stress: -15, humanTrust: 20, territory: 5 }, log: '人間の家周辺の安全地帯を広げた。' },
      { text: '少し離れてご飯だけ待つ', stat: { health: 10, stress: 0, humanTrust: 5, territory: 0 }, log: '美味しくご飯をいただいた。' },
      { text: '今日は気分じゃないので無視', stat: { health: -5, stress: 0, humanTrust: -5, territory: 0 }, log: 'マイペースを貫いた。' }
    ]},
    { id: 's9', cond: () => true, text: '道路の向こう側に美味しそうなネズミがいる。', choices: [
      { text: '左右を確認して慎重に渡る', stat: { health: 10, stress: 5, humanTrust: 0, territory: 8 }, log: '安全に狩りをして、自分のテリトリーを広げた。' },
      { text: '一直線に飛び出す！', stat: { health: -30, stress: 20, humanTrust: 0, territory: 0 }, log: '車に驚いて大怪我をした！' },
      { text: '諦める', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '無理はしないでおいた。' }
    ]},
    { id: 's10', cond: () => true, text: 'カラスの群れがご飯を狙っている。', choices: [
      { text: '勇敢に立ち向かう', stat: { health: -15, stress: 15, humanTrust: 0, territory: 10 }, log: 'カラスを追い払い、縄張りを守り抜いた！' },
      { text: 'こっそり横取りする', stat: { health: 5, stress: 5, humanTrust: 0, territory: 2 }, log: 'うまく立ち回ってご飯にありついた。' },
      { text: '別の場所を探す', stat: { health: -5, stress: 0, humanTrust: 0, territory: -5 }, log: 'すごすごと引き下がった。' }
    ]}
  ],
  pet: [
    { id: 'p1', cond: () => true, text: '飼い主が猫じゃらしを振っている。', choices: [
      { text: '本気で狩りにいく', stat: { health: 5, stress: -15, humanTrust: 5, territory: 5 }, log: '部屋全体の制圧完了！' },
      { text: '寝転がりながら手だけ出す', stat: { health: 0, stress: -5, humanTrust: 5, territory: 2 }, log: '省エネで遊んであげた。' },
      { text: '完全に無視する', stat: { health: 0, stress: 0, humanTrust: -5, territory: 0 }, log: '飼い主が寂しそうにしている。' }
    ]},
    { id: 'p2', cond: () => true, text: '見慣れないキャリーケースが出された…。', choices: [
      { text: '全力でベッドの下に隠れる', stat: { health: 0, stress: 15, humanTrust: -5, territory: 0 }, log: '引きずり出されて病院行き…。' },
      { text: '大人しく入る', stat: { health: 15, stress: 5, humanTrust: 10, territory: 5 }, log: 'お利口さんと褒められた。' },
      { text: '立てこもって抵抗する', stat: { health: 0, stress: 20, humanTrust: -10, territory: 10 }, log: '強い意志で病院を阻止した！' }
    ]},
    { id: 'p3', cond: () => true, text: '机の上に水の入ったコップがある。', choices: [
      { text: '前足でチョイチョイして落とす', stat: { health: 0, stress: -10, humanTrust: -5, territory: 15 }, log: 'ここが自分の家だと盛大にアピールした。' },
      { text: '中に入っている水を飲む', stat: { health: 5, stress: 0, humanTrust: 0, territory: 2 }, log: '美味しく水分補給した。' },
      { text: '見つめるだけ', stat: { health: 0, stress: 0, humanTrust: 5, territory: 0 }, log: 'お利口にやり過ごした。' }
    ]},
    { id: 'p4', cond: () => true, text: 'ご飯のお皿が空っぽだ！', choices: [
      { text: '大声で鳴いて要求する', stat: { health: 5, stress: -5, humanTrust: 5, territory: 5 }, log: 'すぐに美味しいご飯が出てきた。' },
      { text: '無言の圧力をかける', stat: { health: 0, stress: 5, humanTrust: 0, territory: 3 }, log: 'プレッシャーに負けて補充された。' },
      { text: 'ふて寝する', stat: { health: -5, stress: 5, humanTrust: 0, territory: 0 }, log: 'お腹を空かせたまま拗ねた。' }
    ]},
    { id: 'p5', cond: () => true, text: '新しいふわふわのベッドが用意された。', choices: [
      { text: '真っ先に占領する', stat: { health: 10, stress: -10, humanTrust: 10, territory: 10 }, log: '最高の寝床をマイテリトリーにした！' },
      { text: '付属の段ボールに入る', stat: { health: 5, stress: -15, humanTrust: 0, territory: 5 }, log: 'やっぱり段ボールが落ち着く。' },
      { text: 'いつもの場所で寝る', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '安心の定位置を守った。' }
    ]},
    { id: 'p6', cond: (s) => s.stress > 20, text: 'なんだかイライラする…。', choices: [
      { text: '部屋中を猛ダッシュする', stat: { health: -5, stress: -20, humanTrust: 0, territory: 10 }, log: '家中を駆け巡り自分の匂いをつけて回った！' },
      { text: '壁で思いっきり爪研ぎする', stat: { health: 0, stress: -15, humanTrust: -10, territory: 15 }, log: 'ここに自分の縄張りだと深く刻み込んだ。' },
      { text: '飼い主に甘噛みする', stat: { health: 0, stress: -10, humanTrust: -15, territory: 0 }, log: 'ストレスを発散した。' }
    ]},
    { id: 'p7', cond: () => true, text: '飼い主がパソコンで作業をしている。', choices: [
      { text: 'キーボードの上を陣取る', stat: { health: 0, stress: -10, humanTrust: 5, territory: 15 }, log: 'パソコンは私のクッションだ！' },
      { text: '裏から覗き込む', stat: { health: 0, stress: -5, humanTrust: 5, territory: 5 }, log: '可愛くアピールした。' },
      { text: '膝の上で丸くなる', stat: { health: 10, stress: -15, humanTrust: 15, territory: 10 }, log: '最上級の特等席をキープした。' }
    ]},
    { id: 'p8', cond: () => true, text: '窓の外に鳥が止まっている。', choices: [
      { text: 'クラッキングで威嚇する', stat: { health: 0, stress: -5, humanTrust: 0, territory: 5 }, log: '「ここは私の領域だ！」と主張した。' },
      { text: '窓に飛びつく', stat: { health: -5, stress: 5, humanTrust: 0, territory: 2 }, log: 'ガラスに激突した。' },
      { text: '無視して寝る', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '室内が一番安全だ。' }
    ]},
    { id: 'p9', cond: () => true, text: 'お風呂場から水の音がする。', choices: [
      { text: 'ドアの前で心配そうに鳴く', stat: { health: 0, stress: 5, humanTrust: 5, territory: 5 }, log: '浴室の警備主任を務めた。' },
      { text: 'こっそり覗く', stat: { health: 0, stress: 0, humanTrust: 0, territory: 2 }, log: '湿気に負けて退散した。' },
      { text: '遠くで無視', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '水には近づかない。' }
    ]},
    { id: 'p10', cond: (s) => s.humanTrust > 30, text: '飼い主が友達を連れてきた。', choices: [
      { text: '堂々と玄関でお出迎えする', stat: { health: 5, stress: -10, humanTrust: 10, territory: 20 }, log: '「この家の主はこの私だ」と知らしめた！' },
      { text: '遠くから観察する', stat: { health: 0, stress: 5, humanTrust: 0, territory: 5 }, log: '安全な場所から見張った。' },
      { text: '押し入れにこもる', stat: { health: 0, stress: 10, humanTrust: 0, territory: -5 }, log: '籠城した。' }
    ]}
  ]
};

const RANDOM_CAT_NAMES = ['タマ', 'クロ', 'ミケ', 'チャトラ', 'レオ', 'ルーク', 'ハナ', 'モモ', 'コタロー', 'キジ', 'ソラ', 'チビ', 'マロン', 'トラ'];

export default function CatLifeGame() {
  const [gameState, setGameState] = useState('START');
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('pet');
  const [age, setAge] = useState(0);
  const [stats, setStats] = useState({ health: 100, stress: 0, humanTrust: 50, territory: 10 });
  const [usedEvents, setUsedEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [history, setHistory] = useState([]);
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [finalScore, setFinalScore] = useState(0);

  const [dailyRankings, setDailyRankings] = useState([]);
  const [isTop10, setIsTop10] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const [timeLeft, setTimeLeft] = useState(5.0);
  const [speed, setSpeed] = useState(1); 
  const timerRef = useRef(null);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const savedKey = `cat_daily_ranking_${todayStr}`;
    const saved = localStorage.getItem(savedKey);

    if (saved) {
      try {
        setDailyRankings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialRankings = [
        { name: 'シャム (みけ)', score: 1850, age: 16, type: '飼い猫' },
        { name: 'クロ (たろう)', score: 1420, age: 12, type: '野良猫' },
      ];
      setDailyRankings(initialRankings);
      localStorage.setItem(savedKey, JSON.stringify(initialRankings));
    }
  }, []);

  const calculatePercentile = (score) => {
    const allScores = [...dailyRankings.map(r => r.score), score].sort((a, b) => b - a);
    const rank = allScores.indexOf(score) + 1;
    const totalPlayers = Math.max(100, dailyRankings.length * 10);
    const calculatedRank = Math.min(totalPlayers, Math.max(1, Math.round((rank / dailyRankings.length) * 15)));
    return Math.max(1, Math.min(100, Math.round((calculatedRank / totalPlayers) * 100)));
  };

  const sendToSpreadsheet = async (scoreToSave, customUserName) => {
    if (!GAS_URL || GAS_URL.includes("ここにGASの")) return;
    
    const payload = {
      date: new Date().toLocaleString(),
      player: customUserName.trim() === '' ? 'ゲスト' : customUserName.trim(),
      catName: catName,
      type: catType === 'pet' ? '飼い猫' : '野良猫',
      age: age,
      score: scoreToSave,
      reason: causeOfDeath
    };

    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('スプレッドシート送信エラー', e);
    }
  };

  const saveDailyRankingAndSS = (scoreToSave, customUserName) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const savedKey = `cat_daily_ranking_${todayStr}`;
    const displayName = customUserName.trim() === '' ? 'ゲスト' : customUserName.trim();

    const newEntry = {
      name: `${catName} (${displayName})`,
      score: scoreToSave,
      age: age,
      type: catType === 'pet' ? '飼い猫' : '野良猫'
    };

    const currentList = [...dailyRankings, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setDailyRankings(currentList);
    localStorage.setItem(savedKey, JSON.stringify(currentList));
    sendToSpreadsheet(scoreToSave, displayName);
    setIsRegistered(true);
  };

  const startGame = (e) => {
    e.preventDefault();
    const finalName = catName.trim() === '' 
      ? RANDOM_CAT_NAMES[Math.floor(Math.random() * RANDOM_CAT_NAMES.length)] 
      : catName;

    setCatName(finalName);
    setAge(0);
    setStats({ 
      health: catType === 'pet' ? 100 : 80, 
      stress: 0, 
      humanTrust: catType === 'pet' ? 80 : 10,
      territory: catType === 'pet' ? 30 : 15
    });
    setUsedEvents([]);
    setHistory([]);
    setCauseOfDeath('');
    setIsRegistered(false);
    setIsTop10(false);
    setGameState('PLAYING');
    setSpeed(1);
    pickNextEvent(catType, [], { health: 100, stress: 0, humanTrust: 50, territory: 10 });
  };

  const pickNextEvent = (currentType, currentUsedEvents, currentStats) => {
    setTimeLeft(5.0);
    let db = EVENT_DB[currentType] || EVENT_DB.pet;
    let availableEvents = db.filter(
      ev => !currentUsedEvents.includes(ev.id) && ev.cond(currentStats)
    );
    if (availableEvents.length === 0) {
      availableEvents = db.filter(ev => ev.cond(currentStats));
      if (availableEvents.length === 0) availableEvents = db;
    }
    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    setCurrentEvent(randomEvent);
  };

  const handleChoice = (choice) => {
    const newStats = {
      health: Math.min(120, Math.max(0, stats.health + choice.stat.health)),
      stress: Math.max(0, stats.stress + choice.stat.stress),
      humanTrust: Math.max(0, stats.humanTrust + choice.stat.humanTrust),
      territory: Math.max(0, stats.territory + choice.stat.territory)
    };
    const newAge = age + 1;
    const newUsedEvents = [...usedEvents, currentEvent.id];
    
    setStats(newStats);
    setAge(newAge);
    setUsedEvents(newUsedEvents);
    
    setHistory(prev => [
      ...prev,
      `[${newAge}歳] ${currentEvent.text} -> ${choice.text} (${choice.log})`
    ]);

    let deathChance = 0;
    if (catType === 'stray') {
      deathChance = newAge > 3 ? (newAge - 3) * 0.15 : 0.03;
    } else {
      if (newAge <= 12) {
        deathChance = 0.01;
      } else if (newAge <= 15) {
        deathChance = 0.08;
      } else {
        deathChance = 0.35 + (newAge - 16) * 0.2;
      }
    }
    
    if (newStats.health < 40) deathChance += 0.2;
    if (newStats.health < 10) deathChance += 0.5;

    let isDead = false;
    let reason = '';

    if (newStats.health <= 0) {
      isDead = true;
      reason = newStats.stress >= 80 ? '過度なストレスによる心身の衰弱' : '度重なる怪我と体力の限界';
    } else if (Math.random() < deathChance) {
      isDead = true;
      
      // --- ☠️ 20種類の死因バリエーション ---
      const deathReasons = catType === 'stray' ? [
        '過酷な冬の寒さと飢えによる力尽き',
        '縄張り争いに敗北した傷がもとでの力尽き',
        '交通事故による突然の不慮の事故',
        '野良猫特有の感染症による体調悪化',
        '食べてはいけないものを食べたことによる中毒',
        'カラスの群れとの激しい抗争の敗北',
        '雨風を凌げず低体温症で眠るように...',
        '野良犬に追われて崖から転落',
        '心優しい人間に保護されてそのまま家猫に（リタイア）',
        '寿命を迎えて大好きな路地裏で安らかな眠り'
      ] : [
        '老衰（大往生・コタツの中での安らかな眠り）',
        '持病の悪化による穏やかなお別れ',
        'フードの食べ過ぎによるまさかの肥満トラブル',
        '高所からのジャンプ失敗によるちょっぴり恥ずかしい負傷',
        '動物病院の注射のストレスによるショック',
        'お風呂に入れられたショックによるフリーズ',
        'お気に入りのオモチャを飲み込んでしまい緊急手術ののち...',
        '換毛期の毛玉が喉につまったことによる体調不良',
        '雷の音にパニックを起こしてハートが限界に',
        '飼い主に溺愛されすぎて天寿を全うした大往生'
      ];

      reason = deathReasons[Math.floor(Math.random() * deathReasons.length)];
    }

    if (isDead) {
      setCauseOfDeath(reason);
      setGameState('GAMEOVER');
      const calculatedScore = (newStats.territory * 10) + (newAge * 50);
      setFinalScore(calculatedScore);
      setIsRegistered(false);

      const lowestScore = dailyRankings.length < 10 ? 0 : dailyRankings[dailyRankings.length - 1].score;
      if (dailyRankings.length < 10 || calculatedScore > lowestScore) {
        setIsTop10(true);
      } else {
        setIsTop10(false);
        sendToSpreadsheet(calculatedScore, 'ゲスト');
      }
      return;
    }

    pickNextEvent(catType, newUsedEvents, newStats);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING' || speed === 0 || !currentEvent) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - (0.1 * speed);
        if (nextTime <= 0) {
          clearInterval(timerRef.current);
          handleChoice(currentEvent.choices[0]);
          return 5.0;
        }
        return nextTime;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [gameState, speed, currentEvent, stats, age, usedEvents]);

  // --- Xシェア文面の最適化 (2番の実装) ---
  const shareToX = () => {
    const currentUrl = window.location.href;
    const percentile = calculatePercentile(finalScore);
    const typeStr = catType === 'pet' ? '🏠 飼い猫' : '🐾 野良猫';
    
    const text = encodeURIComponent(
      `我が家の愛猫【${catName}】の猫生が終わりました。\n\n` +
      `生き方: ${typeStr}\n` +
      `寿命: ${age}歳\n` +
      `最期の言葉（死因）: ${causeOfDeath}\n` +
      `最終スコア: ${finalScore}pt （デイリー上位 ${percentile}%）\n\n` +
      `皆も過酷な（あるいは優雅な）猫生を体験してみよう！🐾\n` +
      `#猫の人生シミュレーション\n` +
      `${currentUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#1f2937', padding: '16px', boxSizing: 'border-box' },
    card: { backgroundColor: '#ffffff', padding: '32px 24px', borderRadius: '24px', boxShadow: '0 12px 30px rgba(245, 158, 11, 0.15)', maxWidth: '480px', width: '100%', textAlign: 'center', border: '2px solid #fde68a', boxSizing: 'border-box', position: 'relative' },
    title: { fontSize: '28px', fontWeight: '900', color: '#d97706', marginBottom: '8px' },
    input: { width: '100%', padding: '12px 16px', fontSize: '15px', border: '2px solid #e5e7eb', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937' },
    submitButton: { width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '14px', cursor: 'pointer', marginBottom: '10px' }
  };

  if (gameState === 'START') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: '48px', marginBottom: '12px', marginTop: '8px' }}>🐱🐾</div>
          <h1 style={styles.title}>猫の人生シミュレーション</h1>
          <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '24px' }}>あなたの猫生はどんな物語になるでしょうか？</p>
          
          <form onSubmit={startGame}>
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>名前</label>
              <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="空白時は自動でランダム生成（タマ、クロ等）" style={styles.input} />
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>生き方を選ぶ</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setCatType('pet')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '15px', border: catType === 'pet' ? '2px solid #d97706' : '2px solid #e5e7eb', background: catType === 'pet' ? '#fff7ed' : '#fff', cursor: 'pointer' }}>🏠 飼い猫</button>
                <button type="button" onClick={() => setCatType('stray')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '15px', border: catType === 'stray' ? '2px solid #d97706' : '2px solid #e5e7eb', background: catType === 'stray' ? '#fff7ed' : '#fff', cursor: 'pointer' }}>🐾 野良猫</button>
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>✨ 人生を始める</button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'left', backgroundColor: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <p style={{ fontWeight: 'bold', color: '#b45309', fontSize: '12px', marginBottom: '6px' }}>🌍 デイリーランキング (Top 10)</p>
            {dailyRankings.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#6b7280' }}>まだ記録がありません。最初の挑戦者になろう！</p>
            ) : (
              dailyRankings.map((r, i) => (
                <div key={i} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dashed #fed7aa' }}>
                  <span>{i + 1}. {r.name} ({r.type} / {r.age}歳)</span>
                  <span style={{ fontWeight: 'bold', color: '#d97706' }}>{r.score} pt</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'PLAYING') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fffbeb', display: 'flex', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', border: '1px solid #fef3c7', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706', margin: '0 0 2px 0' }}>{catName} <span style={{ fontSize: '13px', color: '#6b7280' }}>({catType === 'pet' ? '🏠 飼い猫' : '🐾 野良猫'})</span></h2>
              <p style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>📅 現在: {age} 歳</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563', fontWeight: '600' }}>
              <div>❤️ 体力: {stats.health} | ⚡ ストレス: {stats.stress}</div>
              <div style={{ color: '#d97706', fontWeight: 'bold', marginTop: '2px' }}>🏰 縄張り: {stats.territory}pt</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { label: '⏸️ 停止', val: 0 },
              { label: '▶️ x0.5', val: 0.5 },
              { label: '▶️ x1', val: 1 },
              { label: '▶️ x2', val: 2 },
              { label: '▶️ x5', val: 5 }
            ].map(s => (
              <button 
                key={s.val} 
                onClick={() => setSpeed(s.val)} 
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  background: speed === s.val ? '#d97706' : '#fff', 
                  color: speed === s.val ? '#fff' : '#374151', 
                  border: speed === s.val ? '2px solid #d97706' : '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontWeight: speed === s.val ? 'bold' : 'normal'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '24px 20px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', marginBottom: '16px', border: '1px solid #fef3c7' }}>
            <h3 style={{ fontSize: '19px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', lineHeight: '1.4' }}>{currentEvent?.text}</h3>
            <div style={{ width: '100%', backgroundColor: '#f3f4f6', height: '8px', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f59e0b', height: '100%', width: `${(timeLeft / 5) * 100}%`, transition: 'width 0.1s linear' }}></div>
            </div>
            <div>
              {currentEvent?.choices.map((choice, idx) => (
                <button key={idx} onClick={() => handleChoice(choice)} style={{ width: '100%', textAlign: 'left', padding: '16px 18px', marginBottom: '12px', borderRadius: '12px', border: idx === 0 ? '3px solid #f59e0b' : '2px solid #e5e7eb', background: idx === 0 ? '#fffbeb' : '#f9fafb', fontSize: '15px', fontWeight: '600', cursor: 'pointer', lineHeight: '1.4' }}>
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPercentile = calculatePercentile(finalScore);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>😿</div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '4px', color: '#1f2937' }}>猫生終了</h1>
        <p style={{ fontSize: '16px', color: '#d97706', fontWeight: 'bold', marginBottom: '10px' }}>{catName} は {age} 歳で虹の橋を渡りました。</p>
        <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold', marginBottom: '14px', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '8px', border: '1px solid #fecaca' }}>💀 死因: {causeOfDeath}</p>
        
        {isTop10 ? (
          <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #bbf7d0', textAlign: 'left' }}>
            {isRegistered ? (
              <p style={{ fontSize: '14px', color: '#166534', fontWeight: 'bold', textAlign: 'center', padding: '10px 0' }}>✨ ランキングに登録されました！</p>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#166534', fontWeight: 'bold', marginBottom: '6px' }}>🎉 デイリーランキング TOP10 入賞！ (上位 {currentPercentile}%)</p>
                <p style={{ fontSize: '11px', color: '#15803d', marginBottom: '8px' }}>登録するプレイヤー名（空白なら「ゲスト」）</p>
                <input type="text" value={playerNameInput} onChange={e => setPlayerNameInput(e.target.value)} placeholder="例: プレイヤーA" style={{ ...styles.input, marginBottom: '10px', padding: '8px 12px', fontSize: '14px' }} />
                <button onClick={() => saveDailyRankingAndSS(finalScore, playerNameInput)} style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>ランキングに登録</button>
              </>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #fde68a', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <p style={{ fontSize: '13px', color: '#9a3412', fontWeight: 'bold', margin: 0 }}>🏆 今回のスコア: <span style={{ fontSize: '16px', color: '#d97706' }}>{finalScore} pt</span></p>
              <span style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fde68a', color: '#b45309', padding: '2px 8px', borderRadius: '6px' }}>上位 {currentPercentile}%</span>
            </div>
            <p style={{ fontSize: '11px', color: '#c2410c', margin: 0 }}>次はどんな猫生を歩んでみる？</p>
          </div>
        )}

        <button onClick={shareToX} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', fontWeight: 'bold', borderRadius: '14px', border: 'none', marginBottom: '8px', cursor: 'pointer', fontSize: '15px' }}>𝕏 で結果をシェアする</button>
        <button onClick={() => setGameState('START')} style={{ ...styles.submitButton, padding: '12px', fontSize: '16px' }}>🔄 新たな人生を始める</button>
      </div>
    </div>
  );
}