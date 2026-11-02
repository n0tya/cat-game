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
    ]},
    { id: 's11', cond: (s) => s.humanTrust < 20, text: '子供たちが追いかけてきた！', choices: [
      { text: '全速力で塀の上に逃げる', stat: { health: -5, stress: 15, humanTrust: -10, territory: 5 }, log: '高所から安全に威圧した。' },
      { text: '威嚇して脅かす', stat: { health: 0, stress: 10, humanTrust: -15, territory: 8 }, log: '子供たちが怖がって近寄らなくなった。' },
      { text: '隠れてやり過ごす', stat: { health: 0, stress: 5, humanTrust: -5, territory: 0 }, log: 'やり過ごした。' }
    ]},
    { id: 's12', cond: () => true, text: '知らない猫がテリトリーに入ってきた。', choices: [
      { text: '睨みつけて追い返す', stat: { health: -5, stress: 10, humanTrust: 0, territory: 10 }, log: '圧倒的なオーラで追い払った。' },
      { text: 'お互いスルーする', stat: { health: 0, stress: 0, humanTrust: 0, territory: -2 }, log: '領域を少し分け合った。' },
      { text: '場所を譲る', stat: { health: 0, stress: -5, humanTrust: 0, territory: -10 }, log: '縄張りが狭くなってしまった。' }
    ]},
    { id: 's13', cond: (s) => s.humanTrust > 50, text: '人間が「うちにおいで」とケージを開けている。', choices: [
      { text: '思い切って入ってみる', stat: { health: 50, stress: -30, humanTrust: 30, territory: 20 }, log: '家猫としての新しい縄張りを手に入れた！' },
      { text: '外の自由を選ぶ', stat: { health: 0, stress: 0, humanTrust: 0, territory: 10 }, log: '自由な野良猫の生き様を選んだ。' },
      { text: 'ご飯だけ持ち逃げする', stat: { health: 10, stress: 0, humanTrust: -10, territory: 5 }, log: 'うまく戦利品を持ち帰った。' }
    ]},
    { id: 's14', cond: () => true, text: '暖かい車のボンネットを見つけた。', choices: [
      { text: '中に入って寝る', stat: { health: -20, stress: 20, humanTrust: 0, territory: 0 }, log: 'エンジン始動に驚いて飛び出した！' },
      { text: '上で優雅に眠る', stat: { health: 5, stress: -5, humanTrust: 0, territory: 5 }, log: '最高の特等席として自分の匂いを残した。' },
      { text: '警戒してやめる', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '安全な場所で寝た。' }
    ]},
    { id: 's15', cond: () => true, text: 'マタタビの生えた一角を見つけた。', choices: [
      { text: '全力で満喫する', stat: { health: 5, stress: -20, humanTrust: 0, territory: 10 }, log: '最高のスポットを自分の縄張りにした！' },
      { text: '少しだけ楽しむ', stat: { health: 5, stress: -10, humanTrust: 0, territory: 3 }, log: 'リフレッシュできた。' },
      { text: 'スルーする', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: 'クールに立ち去った。' }
    ]},
    { id: 's16', cond: () => true, text: '夜の商店街の裏手で、焼き鳥の匂いが漂ってきた。', choices: [
      { text: '店員さんにおねだりする', stat: { health: 10, stress: -5, humanTrust: 10, territory: 3 }, log: '優しい店員さんがおすそ分けをくれた！' },
      { text: '焼き鳥の串をこっそり狙う', stat: { health: 5, stress: 5, humanTrust: -5, territory: 5 }, log: '見事なタイミングで肉片をゲットした。' },
      { text: '野良猫としてのプライドでスルー', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '匂いだけで我慢した。' }
    ]},
    { id: 's17', cond: () => true, text: '激しい野良猫同士の縄張り争いが起きた！', choices: [
      { text: '真っ向から勝負挑む', stat: { health: -15, stress: 15, humanTrust: 0, territory: 20 }, log: '激闘の末に勝利し、広大な縄張りを手に入れた！' },
      { text: 'うまく隙をついて威嚇だけする', stat: { health: -5, stress: 5, humanTrust: 0, territory: 5 }, log: '大きな怪我をせずに追い払った。' },
      { text: '深入りせず引き下がる', stat: { health: 0, stress: -5, humanTrust: 0, territory: -5 }, log: '安全第一でやり過ごした。' }
    ]},
    { id: 's18', cond: () => true, text: '親切な動物ボランティアの人が保護器（TNR用）を置いていった。', choices: [
      { text: '中に仕掛けられたチュールに釣られる', stat: { health: 20, stress: -10, humanTrust: 15, territory: -5 }, log: '病院で健康診断と手術を受け、安全な地域猫に認定された！' },
      { text: '不穏な気配を察知して近寄らない', stat: { health: 0, stress: 5, humanTrust: -5, territory: 0 }, log: '罠を華麗にスルーした。' },
      { text: '他の猫が捕まるのを遠くで見守る', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '人間の動きを冷静に観察した。' }
    ]},
    { id: 's19', cond: () => true, text: '神社の境内で日向ぼっこをしていたら、観光客が群がってきた。', choices: [
      { text: '堂々と撫でさせてアイドルになる', stat: { health: 5, stress: -15, humanTrust: 20, territory: 10 }, log: '「看板猫」として参拝客に可愛がられた！' },
      { text: '少し撫でられてから優雅に去る', stat: { health: 5, stress: -5, humanTrust: 10, territory: 2 }, log: '程よくコミュニケーションを取った。' },
      { text: '木の上に登って完全に無視する', stat: { health: 0, stress: 5, humanTrust: -5, territory: 0 }, log: '人間嫌いをアピールした。' }
    ]},
    { id: 's20', cond: () => true, text: '夜中にドブ川の側溝に落ちてしまった！', choices: [
      { text: '必死に壁をよじ登る', stat: { health: -20, stress: 25, humanTrust: 0, territory: 0 }, log: '満身創痍になりながら脱出に成功した。' },
      { text: '大声で助けを呼ぶ', stat: { health: 0, stress: 15, humanTrust: 15, territory: 0 }, log: '通りすがりの夜間散歩の人が助けてくれた！' },
      { text: '諦めて朝までじっと耐える', stat: { health: -10, stress: 20, humanTrust: 0, territory: -5 }, log: '精神的にかなりすり減った…。' }
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
    ]},
    { id: 'p11', cond: () => true, text: '掃除機という怪物が現れた！', choices: [
      { text: '高いところから誇らしく見下ろす', stat: { health: 0, stress: 5, humanTrust: 0, territory: 10 }, log: '王者の風格で見守った。' },
      { text: '猛ダッシュで逃げる', stat: { health: -5, stress: 10, humanTrust: 0, territory: -5 }, log: '恐れて逃げ回った。' },
      { text: '動じずに居座る', stat: { health: 0, stress: -5, humanTrust: 5, territory: 15 }, log: '怪物をむしろ圧倒した。' }
    ]},
    { id: 'p12', cond: () => true, text: 'ブラッシングの時間だ。', choices: [
      { text: 'ゴロゴロ喉を鳴らして甘える', stat: { health: 15, stress: -15, humanTrust: 10, territory: 5 }, log: '極上のリラックスタイムを満喫した。' },
      { text: 'ブラシに猫パンチする', stat: { health: 0, stress: 5, humanTrust: -5, territory: 5 }, log: '反抗してみせた。' },
      { text: '全力で逃走する', stat: { health: -5, stress: 10, humanTrust: -5, territory: 0 }, log: '捕まえられた。' }
    ]},
    { id: 'p13', cond: (s) => s.health < 60, text: '少し体調が優れない…。', choices: [
      { text: '飼い主に甘えてアピールする', stat: { health: 30, stress: -5, humanTrust: 15, territory: 5 }, log: 'すぐに病院に連れて行ってもらい万全に。' },
      { text: 'お気に入りの隠れ家でじっと耐える', stat: { health: -10, stress: 10, humanTrust: 0, territory: 5 }, log: '自力で耐え抜いた。' },
      { text: '猫草を食べる', stat: { health: 10, stress: 0, humanTrust: 0, territory: 0 }, log: 'すっきり快復した。' }
    ]},
    { id: 'p14', cond: () => true, text: '玄関のドアが少し開いている！', choices: [
      { text: '堂々と玄関の警備に向かう', stat: { health: 0, stress: -5, humanTrust: 5, territory: 15 }, log: '外の異常がないかしっかりチェックした。' },
      { text: '飛び出して大慌てで連れ戻される', stat: { health: -10, stress: 20, humanTrust: -5, territory: -5 }, log: '外の世界の厳しさを一瞬で悟った。' },
      { text: '完全スルーして部屋に戻る', stat: { health: 5, stress: 0, humanTrust: 5, territory: 0 }, log: '家の中が一番安全だ。' }
    ]},
    { id: 'p15', cond: () => true, text: '大好きなおやつが出てきた！', choices: [
      { text: '満足するまで味わい尽くす', stat: { health: 15, stress: -20, humanTrust: 15, territory: 10 }, log: '我が世の春を謳歌した！' },
      { text: '上品に食べる', stat: { health: 10, stress: -10, humanTrust: 10, territory: 5 }, log: '美味しく平らげた。' },
      { text: '一気に平らげて催促する', stat: { health: 5, stress: 0, humanTrust: -5, territory: 5 }, log: 'もっと要求した。' }
    ]},
    { id: 'p16', cond: () => true, text: '飼い主が段ボール箱の荷物を開けた。空の箱が目の前にある！', choices: [
      { text: '即座に飛び込んでジャストフィットを満喫する', stat: { health: 10, stress: -15, humanTrust: 5, territory: 15 }, log: '完璧なフィット感に身を委ね、至福のひとときを過ごした。' },
      { text: '端っこをバリバリと噛みちぎる', stat: { health: 0, stress: -10, humanTrust: -5, territory: 10 }, log: 'ストレス発散になったが、飼い主に怒られた。' },
      { text: 'すまし顔でスルーする', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '興味がないフリをした。' }
    ]},
    { id: 'p17', cond: () => true, text: '夜中に飼い主が布団に入ってきた。', choices: [
      { text: '飼い主の枕を占領して寝る', stat: { health: 10, stress: -10, humanTrust: 15, territory: 20 }, log: '布団のど真ん中をキープし、最高の寝心地だった。' },
      { text: '足元で丸くなって温めてあげる', stat: { health: 5, stress: -10, humanTrust: 20, territory: 10 }, log: '飼い主が「天使だ…」と感激していた。' },
      { text: '深夜のテンションで飼い主の足を襲う', stat: { health: -5, stress: 10, humanTrust: -10, territory: 5 }, log: '布団の上で大運動会を開催した。' }
    ]},
    { id: 'p18', cond: () => true, text: 'テレビに鳥や虫のドキュメンタリー番組が映っている。', choices: [
      { text: '画面にガチギレしながら猫パンチ連打', stat: { health: -5, stress: -10, humanTrust: 0, territory: 10 }, log: 'テレビの画面を一生懸命ハントしようとした。' },
      { text: 'かぶりつきでじっと鑑賞する', stat: { health: 5, stress: -5, humanTrust: 5, territory: 0 }, log: '最高の娯楽タイムを楽しんだ。' },
      { text: '興味なく背中を向けて寝る', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: '偽物には釣られない。' }
    ]},
    { id: 'p19', cond: () => true, text: 'お風呂上がりの飼い主の足に、なぜか飛びつきたくなった。', choices: [
      { text: '隙をついて飛びつき、ハンターの腕前を見せる', stat: { health: 0, stress: -10, humanTrust: -5, territory: 10 }, log: '飼い主に「痛っ！」と言われて満足した。' },
      { text: '足の匂いはくんくん嗅いで真顔になる', stat: { health: 0, stress: 0, humanTrust: 5, territory: 0 }, log: '独特の香りに少し引いた。' },
      { text: '完全無視して毛づくろいをする', stat: { health: 0, stress: 0, humanTrust: 0, territory: 0 }, log: 'クールにスルーした。' }
    ]},
    { id: 'p20', cond: () => true, text: 'お部屋の模様替えが行われ、家具の位置が変わった！', choices: [
      { text: '新しくできた隙間や高所をくまなく探検する', stat: { health: 5, stress: 5, humanTrust: 5, territory: 15 }, log: '我が家の新しい防衛ラインを完璧に把握した。' },
      { text: '見慣れない風景に戸惑って隠れる', stat: { health: -5, stress: 15, humanTrust: 0, territory: -5 }, log: '落ち着くまでしばらくソファの下にこもった。' },
      { text: '新しいソファの感触を真っ先に試す', stat: { health: 10, stress: -10, humanTrust: 10, territory: 10 }, log: '新しい特等席を即座に見つけた。' }
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
    setIsTop10(false);
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
      reason = newStats.stress >= 80 ? '過度なストレスと体力の限界' : '怪我と体力の消耗';
    } else if (Math.random() < deathChance) {
      isDead = true;
      if (catType === 'stray') {
        const strayReasons = ['過酷な寒さと飢え', '交通事故や外敵とのトラブル', '病気と体力の限界'];
        reason = strayReasons[Math.floor(Math.random() * strayReasons.length)];
      } else {
        const petReasons = newAge >= 15 ? ['老衰（大往生・安らかな眠り）', '天寿を全うした老衰'] : ['病気による体力の低下', 'ちょっとした体調不良'];
        reason = petReasons[Math.floor(Math.random() * petReasons.length)];
      }
    }

    if (isDead) {
      setCauseOfDeath(reason);
      setGameState('GAMEOVER');
      const calculatedScore = (newStats.territory * 10) + (newAge * 50);
      setFinalScore(calculatedScore);

      const lowestScore = dailyRankings.length < 10 ? 0 : dailyRankings[dailyRankings.length - 1].score;
      if (dailyRankings.length < 10 || calculatedScore > lowestScore) {
        setIsTop10(true);
      } else {
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

  const shareToX = () => {
    const currentUrl = window.location.href;
    const text = encodeURIComponent(
      `猫の人生シミュレーションで遊んだよ！\n\n` +
      `🐱 名前: ${catName} (${catType === 'pet' ? '飼い猫' : '野良猫'})\n` +
      `📅 寿命: ${age}歳\n` +
      `💀 死因: ${causeOfDeath}\n` +
      `🏰 スコア: ${finalScore}pt\n\n` +
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ fontSize: '52px', marginBottom: '8px' }}>😿</div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '4px', color: '#1f2937' }}>猫生終了</h1>
        <p style={{ fontSize: '16px', color: '#d97706', fontWeight: 'bold', marginBottom: '10px' }}>{catName} は {age} 歳で虹の橋を渡りました。</p>
        <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: 'bold', marginBottom: '14px', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '8px', border: '1px solid #fecaca' }}>💀 死因: {causeOfDeath}</p>
        
        {isTop10 ? (
          <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #bbf7d0', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: '#166534', fontWeight: 'bold', marginBottom: '6px' }}>🎉 デイリーランキング TOP10 入賞！</p>
            <p style={{ fontSize: '11px', color: '#15803d', marginBottom: '8px' }}>登録するプレイヤー名（空白なら「ゲスト」）</p>
            <input type="text" value={playerNameInput} onChange={e => setPlayerNameInput(e.target.value)} placeholder="例: プレイヤーA" style={{ ...styles.input, marginBottom: '10px', padding: '8px 12px', fontSize: '14px' }} />
            <button onClick={() => saveDailyRankingAndSS(finalScore, playerNameInput)} style={{ width: '100%', padding: '10px', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>ランキングに登録</button>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff7ed', padding: '12px', borderRadius: '12px', marginBottom: '14px', border: '1px solid #fde68a', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: '#9a3412', fontWeight: 'bold', marginBottom: '6px' }}>🏆 今回のスコア: <span style={{ fontSize: '16px', color: '#d97706' }}>{finalScore} pt</span></p>
            <p style={{ fontSize: '11px', color: '#c2410c' }}>プレイデータがスプレッドシートに記録されました！</p>
          </div>
        )}

        <button onClick={shareToX} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', fontWeight: 'bold', borderRadius: '14px', border: 'none', marginBottom: '8px', cursor: 'pointer', fontSize: '15px' }}>𝕏 で結果をシェアする</button>
        <button onClick={() => setGameState('START')} style={{ ...styles.submitButton, padding: '12px', fontSize: '16px' }}>🔄 新たな人生を始める</button>
      </div>
    </div>
  );
}