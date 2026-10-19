// Lokale Prüfregeln aus PatrickFischerKSA/argumentationspruefer (server.js).
// Browser-Port: ausschließlich Heuristiken, keine externen Dienste.
function normalizeInputText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countMarkerOccurrences(text, markers) {
  return markers.reduce((sum, marker) => {
    const regex = new RegExp(`\\b${escapeRegExp(marker)}\\b`, 'gi');
    const matches = text.match(regex);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function splitWords(text) {
  return text.match(/[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+(?:-[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+)*/g) || [];
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scoreStatus(score) {
  if (score >= 75) return 'stark';
  if (score >= 50) return 'solide';
  return 'ausbaufähig';
}

function analyzeArgumentation(text) {
  const lowerText = text.toLowerCase();
  const paragraphs = text.split(/\n\s*\n/).map((entry) => entry.trim()).filter(Boolean);
  const sentences = splitSentences(text);
  const words = splitWords(text);
  const paragraphData = paragraphs.map((paragraph, index) => ({
    index,
    text: paragraph,
    lower: paragraph.toLowerCase(),
    words: splitWords(paragraph).length
  }));

  const thesisMarkers = [
    'ich bin der meinung',
    'meiner meinung nach',
    'ich finde',
    'ich behaupte',
    'meine these',
    'es ist klar',
    'ich vertrete die auffassung',
    'meines erachtens'
  ];
  const reasonMarkers = [
    'weil',
    'denn',
    'da',
    'deshalb',
    'daher',
    'folglich',
    'somit',
    'zum einen',
    'zum anderen',
    'erstens',
    'zweitens',
    'darum'
  ];
  const evidenceMarkers = [
    'zum beispiel',
    'beispielsweise',
    'etwa',
    'laut',
    'studie',
    'statistik',
    'zahl',
    'zahlen',
    'beleg',
    'quelle'
  ];
  const counterMarkers = [
    'allerdings',
    'jedoch',
    'andererseits',
    'hingegen',
    'zwar',
    'obwohl',
    'dennoch',
    'trotzdem',
    'einwand',
    'gegenargument'
  ];
  const conclusionMarkers = [
    'zusammenfassend',
    'abschliessend',
    'abschließend',
    'fazit',
    'insgesamt',
    'schlussendlich',
    'darum zeigt sich',
    'somit lässt sich',
    'somit laesst sich'
  ];
  const appealMarkers = [
    'wir sollten',
    'man sollte',
    'deshalb sollten wir',
    'es ist nötig',
    'es ist noetig',
    'es braucht',
    'ich fordere',
    'darum muss'
  ];
  const fillerMarkers = [
    'irgendwie',
    'sozusagen',
    'eigentlich',
    'ein bisschen',
    'gewissermassen',
    'gewissermaßen',
    'halt',
    'quasi',
    'natürlich',
    'natuerlich'
  ];
  const emphasisMarkers = [
    'sehr',
    'extrem',
    'wirklich',
    'offensichtlich',
    'klar',
    'eindeutig'
  ];

  const firstPart = paragraphs.slice(0, Math.max(1, Math.ceil(paragraphs.length / 3))).join(' ');
  const lastPart = paragraphs.slice(-Math.max(1, Math.ceil(paragraphs.length / 3))).join(' ');

  const thesisCount = countMarkerOccurrences(lowerText, thesisMarkers);
  const reasonCount = countMarkerOccurrences(lowerText, reasonMarkers);
  const evidenceCount =
    countMarkerOccurrences(lowerText, evidenceMarkers) +
    (text.match(/\d+(?:[.,]\d+)?\s?(?:%|prozent|million(?:en)?|milliarden?)/gi) || []).length +
    (text.match(/[„"][^„”"]{8,}[”"]/g) || []).length;
  const counterCount = countMarkerOccurrences(lowerText, counterMarkers);
  const conclusionCount = countMarkerOccurrences(lastPart.toLowerCase(), conclusionMarkers);
  const appealCount = countMarkerOccurrences(lowerText, appealMarkers);
  const connectorCount = reasonCount + counterCount + conclusionCount;

  const avgSentenceLength = sentences.length ? words.length / sentences.length : 0;
  const avgParagraphLength = paragraphs.length ? words.length / paragraphs.length : words.length;
  const rhetoricalQuestions = (text.match(/\?/g) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  const fillerCount = countMarkerOccurrences(lowerText, fillerMarkers);
  const emphasisCount = countMarkerOccurrences(lowerText, emphasisMarkers);
  const passiveCount = countPassivePatterns(text);
  const nominalizationCount = countNominalizations(words);
  const repeatedWords = findRepeatedKeywords(words);
  const sentenceDiagnostics = analyzeSentences(sentences);
  const quoteAnalysis = analyzeQuoteUsage(text, sentences);
  const paragraphDiagnostics = analyzeParagraphs(paragraphData, {
    thesisMarkers,
    reasonMarkers,
    evidenceMarkers,
    counterMarkers,
    conclusionMarkers
  });
  const audienceScore = clamp(
    35 +
      Math.min(appealCount, 3) * 12 +
      Math.min(rhetoricalQuestions, 2) * 8 +
      (sentenceDiagnostics.longSentenceCount <= 2 ? 10 : 0),
    0,
    100
  );

  const structureScore = clamp(
    30 + Math.min(paragraphs.length, 6) * 8 + Math.min(connectorCount, 6) * 5 + (conclusionCount > 0 ? 12 : 0),
    0,
    100
  );
  const thesisScore = clamp(
    25 + Math.min(thesisCount, 3) * 18 + Math.min(countMarkerOccurrences(firstPart.toLowerCase(), thesisMarkers), 2) * 12,
    0,
    100
  );
  const evidenceScore = clamp(18 + Math.min(evidenceCount, 5) * 15, 0, 100);
  const counterScore = clamp(15 + Math.min(counterCount, 4) * 18, 0, 100);
  const languageScore = clamp(
    45 +
      (avgSentenceLength >= 11 && avgSentenceLength <= 24 ? 22 : avgSentenceLength <= 32 ? 10 : -8) +
      Math.min(rhetoricalQuestions, 2) * 8 +
      Math.min(exclamations, 1) * 4 +
      Math.min(appealCount, 3) * 7,
    0,
    100
  );
  const coherenceScore = clamp(
    28 +
      Math.min(reasonCount, 6) * 9 +
      Math.min(connectorCount, 5) * 7 +
      (avgParagraphLength >= 45 && avgParagraphLength <= 140 ? 8 : 0),
    0,
    100
  );
  const citationScore = quoteAnalysis.score;

  const categories = [
    {
      id: 'these',
      label: 'These und Position',
      score: thesisScore,
      status: scoreStatus(thesisScore),
      observation:
        thesisScore >= 75
          ? 'Die zentrale Position ist gut erkennbar und früh im Text verankert.'
          : thesisScore >= 50
            ? 'Eine Position ist erkennbar, könnte aber noch deutlicher und früher formuliert werden.'
            : 'Die Hauptthese bleibt zu implizit oder erscheint erst spät im Text.',
      advice:
        'Formuliere zu Beginn einen klaren Leitsatz, auf den sich die folgenden Abschnitte sichtbar beziehen.'
    },
    {
      id: 'begruendung',
      label: 'Begründung und Logik',
      score: coherenceScore,
      status: scoreStatus(coherenceScore),
      observation:
        coherenceScore >= 75
          ? 'Die Gedankenschritte greifen gut ineinander und werden sprachlich verbunden.'
          : coherenceScore >= 50
            ? 'Die Argumentation ist grundsätzlich nachvollziehbar, wirkt aber stellenweise sprunghaft.'
            : 'Zwischen den Aussagen fehlen verbindende Begründungen oder klare Übergänge.',
      advice:
        'Nutze mehr kausale und folgernde Verknüpfungen wie "weil", "daher" oder "folglich", um Schlussketten sichtbarer zu machen.'
    },
    {
      id: 'belege',
      label: 'Belege und Beispiele',
      score: evidenceScore,
      status: scoreStatus(evidenceScore),
      observation:
        evidenceScore >= 75
          ? 'Mehrere Beispiele oder Belege stützen die Aussagen überzeugend ab.'
          : evidenceScore >= 50
            ? 'Es gibt einzelne Beispiele, doch einige Behauptungen bleiben noch unbelegt.'
            : 'Wichtige Aussagen stehen weitgehend ohne Beispiel, Quelle oder konkreten Fall da.',
      advice:
        'Ergänze kritische Aussagen mit einem Beispiel, einer Zahl oder einem klar benannten Einzelfall.'
    },
    {
      id: 'gegenargument',
      label: 'Gegenargumente und Differenzierung',
      score: counterScore,
      status: scoreStatus(counterScore),
      observation:
        counterScore >= 75
          ? 'Der Text nimmt Einwände auf und differenziert die eigene Position sichtbar.'
          : counterScore >= 50
            ? 'Ansätze zur Differenzierung sind vorhanden, könnten aber expliziter ausgebaut werden.'
            : 'Der Text bleibt einseitig und setzt sich kaum mit möglichen Einwänden auseinander.',
      advice:
        'Baue mindestens ein Gegenargument ein und entkräfte es anschliessend mit einer klaren Gewichtung.'
    },
    {
      id: 'aufbau',
      label: 'Aufbau und Schluss',
      score: structureScore,
      status: scoreStatus(structureScore),
      observation:
        structureScore >= 75
          ? 'Die Gliederung trägt den Gedankengang, und der Schluss bündelt das Ergebnis gut.'
          : structureScore >= 50
            ? 'Der Aufbau funktioniert, könnte aber mit markanterem Schluss und klareren Abschnitten gewinnen.'
            : 'Der Text braucht eine deutlichere Gliederung mit Einleitung, Mittelteil und Schluss.',
      advice:
        'Setze auf eine klare Dreiteilung: Ausgangsthese, argumentative Entfaltung, bündelndes Fazit.'
    },
    {
      id: 'sprache',
      label: 'Sprachliche Wirkung',
      score: languageScore,
      status: scoreStatus(languageScore),
      observation:
        languageScore >= 75
          ? 'Der Stil wirkt adressatenbezogen und unterstützt die Überzeugungskraft des Textes.'
          : languageScore >= 50
            ? 'Die Sprache ist brauchbar, könnte aber präziser und wirkungsbewusster eingesetzt werden.'
            : 'Der Stil bleibt noch zu allgemein oder monoton, um stark zu überzeugen.',
      advice:
        'Schärfe Schlüsselbegriffe und setze pointierte Formulierungen gezielt statt zu oft ein.'
    },
    {
      id: 'adressat',
      label: 'Adressatenführung',
      score: audienceScore,
      status: scoreStatus(audienceScore),
      observation:
        audienceScore >= 75
          ? 'Der Text führt Lesende klar und wirkt argumentativ gut ausgerichtet.'
          : audienceScore >= 50
            ? 'Der Text ist ansprechbar, könnte aber die Leserführung sichtbarer machen.'
            : 'Der Text bleibt zu allgemein und führt die Lesenden noch zu wenig durch die Argumentation.',
      advice:
        'Markiere stärker, warum ein Gedankenschritt für die Lesenden wichtig ist und wohin er führt.'
    },
    {
      id: 'zitatarbeit',
      label: 'Zitatarbeit und Quellenbezug',
      score: citationScore,
      status: scoreStatus(citationScore),
      observation: quoteAnalysis.observation,
      advice: quoteAnalysis.advice
    }
  ];

  const strengths = categories
    .filter((entry) => entry.score >= 70)
    .map((entry) => `${entry.label}: ${entry.observation}`);

  const suggestions = categories
    .filter((entry) => entry.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((entry) => `${entry.label}: ${entry.advice}`);

  const styleAlerts = buildStyleAlerts({
    repeatedWords,
    fillerCount,
    emphasisCount,
    passiveCount,
    nominalizationCount,
    sentenceDiagnostics
  });
  const priorityActions = buildPriorityActions({
    categories,
    paragraphDiagnostics,
    sentenceDiagnostics,
    styleAlerts,
    quoteAnalysis
  });
  const sentenceWork = buildSentenceWork(sentences, sentenceDiagnostics);

  const overallScore = Math.round(
    thesisScore * 0.2 +
      coherenceScore * 0.25 +
      evidenceScore * 0.2 +
      counterScore * 0.15 +
      structureScore * 0.1 +
      languageScore * 0.05 +
      audienceScore * 0.05 +
      citationScore * 0.05
  );

  return {
    overallScore,
    verdict:
      overallScore >= 80
        ? 'Die Argumentation wirkt bereits überzeugend und gut strukturiert.'
        : overallScore >= 60
          ? 'Die Argumentation ist tragfähig, hat aber noch Ausbaupotenzial bei Präzision und Absicherung.'
          : 'Die Grundidee ist erkennbar, braucht aber klarere Struktur und belastbarere Begründungen.',
    stats: {
      characters: text.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageSentenceLength: Number(avgSentenceLength.toFixed(1)),
      rhetoricalQuestions
    },
    signals: {
      thesisMarkers: thesisCount,
      reasonMarkers: reasonCount,
      evidenceMarkers: evidenceCount,
      counterMarkers: counterCount,
      conclusionMarkers: conclusionCount,
      passivePatterns: passiveCount,
      nominalizations: nominalizationCount,
      fillerMarkers: fillerCount
    },
    categories,
    strengths: strengths.length ? strengths : ['Der Text verfolgt bereits eine erkennbare argumentative Absicht.'],
    suggestions,
    priorityActions,
    quoteAnalysis,
    structureMap: {
      introDetected: paragraphDiagnostics.introDetected,
      conclusionDetected: paragraphDiagnostics.conclusionDetected,
      paragraphFeedback: paragraphDiagnostics.feedback
    },
    sentenceWork,
    styleAlerts,
    languageHeuristics: {
      repeatedWords,
      fillerCount,
      emphasisCount,
      passiveCount,
      nominalizationCount,
      longSentenceCount: sentenceDiagnostics.longSentenceCount
    },
    rewriteTemplates: buildRewriteTemplates({
      thesisScore,
      evidenceScore,
      counterScore,
      structureScore,
      languageScore,
      citationScore
    })
  };
}

function buildRewriteTemplates(scores) {
  const templates = [];

  if (scores.thesisScore < 70) {
    templates.push({
      label: 'These schärfen',
      text: 'Meine zentrale These lautet: ..., weil ... und weil ... .'
    });
  }

  if (scores.evidenceScore < 70) {
    templates.push({
      label: 'Beleg ergänzen',
      text: 'Das zeigt sich zum Beispiel an ..., denn dort wird deutlich, dass ... .'
    });
  }

  if (scores.counterScore < 70) {
    templates.push({
      label: 'Gegenargument einbauen',
      text: 'Zwar könnte man einwenden, dass ... , dennoch überzeugt dieses Argument weniger, weil ... .'
    });
  }

  if (scores.structureScore < 70) {
    templates.push({
      label: 'Schluss formulieren',
      text: 'Abschliessend zeigt sich, dass ... . Deshalb ist ... überzeugender als ... .'
    });
  }

  if (scores.languageScore < 70) {
    templates.push({
      label: 'Begründung präzisieren',
      text: 'Dieses Argument überzeugt vor allem deshalb, weil ... und dadurch ... deutlich wird.'
    });
  }

  if (scores.citationScore < 70) {
    templates.push({
      label: 'Zitat einbetten',
      text: 'Wie Autor/in X betont, „...“. Dieses Zitat ist für mein Argument wichtig, weil ... .'
    });
    templates.push({
      label: 'Sinngemäss zitieren',
      text: 'Nach Autor/in X lässt sich festhalten, dass ... . Für meinen Gedankengang ist daran entscheidend, dass ... .'
    });
  }

  if (!templates.length) {
    templates.push({
      label: 'Stil verdichten',
      text: 'Entscheidend ist nicht nur ..., sondern vor allem ..., weil dadurch ... sichtbar wird.'
    });
  }

  return templates;
}

function countPassivePatterns(text) {
  const matches = text.match(/\b(?:wird|werden|wurde|wurden|worden)\s+[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]+(?:t|en)\b/gi);
  return matches ? matches.length : 0;
}

function countNominalizations(words) {
  return words.filter((word) => /(?:ung|keit|heit|tion|ismus|tät)$/i.test(word)).length;
}

function findRepeatedKeywords(words) {
  const stopwords = new Set([
    'und', 'oder', 'aber', 'doch', 'denn', 'weil', 'dass', 'das', 'die', 'der', 'dem', 'den',
    'ein', 'eine', 'einer', 'einem', 'einen', 'ist', 'sind', 'war', 'waren', 'wie', 'mit',
    'auch', 'nicht', 'noch', 'nur', 'schon', 'sehr', 'mehr', 'wenn', 'dann', 'man', 'wir',
    'sie', 'ich', 'du', 'er', 'es', 'zu', 'im', 'in', 'am', 'an', 'auf', 'fuer', 'für', 'von',
    'des', 'so', 'als', 'bei', 'aus', 'einerseits', 'andererseits', 'dies', 'diese', 'dieser'
  ]);

  const counts = new Map();
  words.forEach((raw) => {
    const word = raw.toLowerCase();
    if (word.length < 5 || stopwords.has(word)) return;
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));
}

function analyzeSentences(sentences) {
  const diagnostics = sentences.map((sentence, index) => {
    const wordCount = splitWords(sentence).length;
    const lower = sentence.toLowerCase();
    const hasWeakStart = /^(ich finde|man sieht|es ist|es gibt|ich denke|meiner meinung nach)/i.test(sentence);
    const hasEnumeration = /\b(?:erstens|zweitens|drittens|zum einen|zum anderen)\b/i.test(sentence);
    const hasQuote = /["„].+["”]/.test(sentence);
    const issueHints = [];

    if (wordCount >= 30) issueHints.push('zu lang');
    if (wordCount <= 5) issueHints.push('zu kurz');
    if (hasWeakStart) issueHints.push('schwacher Einstieg');
    if (lower.includes('weil') && !/[,:;]/.test(sentence) && wordCount >= 24) issueHints.push('verschachtelt');

    return {
      index,
      sentence,
      wordCount,
      hasWeakStart,
      hasEnumeration,
      hasQuote,
      issueHints
    };
  });

  return {
    diagnostics,
    longSentenceCount: diagnostics.filter((entry) => entry.wordCount >= 30).length,
    shortSentenceCount: diagnostics.filter((entry) => entry.wordCount <= 5).length,
    weakStartCount: diagnostics.filter((entry) => entry.hasWeakStart).length
  };
}

function analyzeParagraphs(paragraphData, markerConfig) {
  const feedback = paragraphData.map((paragraph, index) => {
    const role = determineParagraphRole(index, paragraphData.length, paragraph.lower, markerConfig);
    const markerCounts = {
      thesis: countMarkerOccurrences(paragraph.lower, markerConfig.thesisMarkers),
      reasons: countMarkerOccurrences(paragraph.lower, markerConfig.reasonMarkers),
      evidence: countMarkerOccurrences(paragraph.lower, markerConfig.evidenceMarkers),
      counter: countMarkerOccurrences(paragraph.lower, markerConfig.counterMarkers),
      conclusion: countMarkerOccurrences(paragraph.lower, markerConfig.conclusionMarkers)
    };

    let diagnosis = 'Der Abschnitt erfüllt seine Funktion grundsätzlich.';
    let revisionGoal = 'Abschnitt sprachlich weiter zuspitzen.';

    if (role === 'einleitung' && markerCounts.thesis === 0) {
      diagnosis = 'Die Einleitung führt ins Thema ein, markiert die Kernthese aber noch zu wenig deutlich.';
      revisionGoal = 'In der Einleitung einen klaren Leitsatz oder Standpunkt benennen.';
    } else if (role === 'hauptteil' && markerCounts.reasons === 0) {
      diagnosis = 'Im Hauptteil fehlt hier eine sichtbare Begründung oder Überleitung.';
      revisionGoal = 'Kausale Verknüpfung oder Begründungssatz ergänzen.';
    } else if (role === 'hauptteil' && markerCounts.evidence === 0 && paragraph.words >= 55) {
      diagnosis = 'Der Abschnitt behauptet viel, liefert aber noch wenig Konkretion.';
      revisionGoal = 'Beispiel, Zahl, Beobachtung oder Quelle einfügen.';
    } else if (role === 'schluss' && markerCounts.conclusion === 0) {
      diagnosis = 'Der Schluss wirkt noch offen und bündelt das Ergebnis nicht klar genug.';
      revisionGoal = 'Fazit markieren und die Hauptaussage pointiert abschliessen.';
    } else if (paragraph.words >= 120) {
      diagnosis = 'Der Abschnitt ist sehr dicht und könnte für Lesende leichter geführt werden.';
      revisionGoal = 'Abschnitt teilen oder einen klaren Schlusssatz setzen.';
    }

    return {
      index: index + 1,
      role,
      snippet: paragraph.text.slice(0, 160),
      diagnosis,
      revisionGoal,
      markerCounts
    };
  });

  return {
    introDetected: feedback.some((entry) => entry.role === 'einleitung'),
    conclusionDetected: feedback.some((entry) => entry.role === 'schluss'),
    feedback
  };
}

function determineParagraphRole(index, total, lowerParagraph, markerConfig) {
  if (index === 0) return 'einleitung';
  if (index === total - 1) return 'schluss';
  if (countMarkerOccurrences(lowerParagraph, markerConfig.conclusionMarkers) > 0) return 'schluss';
  return 'hauptteil';
}

function buildStyleAlerts(data) {
  const alerts = [];

  if (data.repeatedWords.length) {
    const top = data.repeatedWords[0];
    alerts.push({
      title: 'Wortwiederholung',
      evidence: `Das Wort "${top.word}" taucht ${top.count} Mal auf.`,
      advice: 'Prüfe Synonyme oder fasse Wiederholungen zusammen, wenn sie nicht bewusst gesetzt sind.'
    });
  }

  if (data.fillerCount >= 2) {
    alerts.push({
      title: 'Füllwörter',
      evidence: `${data.fillerCount} eher weiche Formulierungen machen die Aussage unpräziser.`,
      advice: 'Streiche Füllwörter oder ersetze sie durch konkrete Aussagen.'
    });
  }

  if (data.passiveCount >= 2) {
    alerts.push({
      title: 'Passivformen',
      evidence: `${data.passiveCount} Passivkonstruktionen können die Aussagekraft abschwächen.`,
      advice: 'Wo möglich aktiv formulieren: Wer handelt? Wer begründet?'
    });
  }

  if (data.nominalizationCount >= 8) {
    alerts.push({
      title: 'Nominalstil',
      evidence: 'Der Text nutzt mehrere abstrakte Hauptwörter auf -ung, -keit oder -tion.',
      advice: 'Prüfe, ob sich manche Stellen mit starken Verben direkter formulieren lassen.'
    });
  }

  if (data.sentenceDiagnostics.longSentenceCount >= 2) {
    alerts.push({
      title: 'Lange Sätze',
      evidence: `${data.sentenceDiagnostics.longSentenceCount} Sätze sind sehr lang.`,
      advice: 'Teile besonders verschachtelte Sätze in Hauptaussage und Begründung auf.'
    });
  }

  return alerts;
}

function buildPriorityActions(data) {
  const actions = [];
  const weakestCategories = [...data.categories]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  weakestCategories.forEach((category) => {
    actions.push({
      title: category.label,
      severity: category.score < 45 ? 'hoch' : category.score < 65 ? 'mittel' : 'niedrig',
      reason: category.observation,
      action: category.advice
    });
  });

  const paragraphNeed = data.paragraphDiagnostics.feedback.find((entry) =>
    entry.diagnosis !== 'Der Abschnitt erfüllt seine Funktion grundsätzlich.'
  );
  if (paragraphNeed) {
    actions.push({
      title: `Abschnitt ${paragraphNeed.index} überarbeiten`,
      severity: 'mittel',
      reason: paragraphNeed.diagnosis,
      action: paragraphNeed.revisionGoal
    });
  }

  if (data.styleAlerts[0]) {
    actions.push({
      title: data.styleAlerts[0].title,
      severity: 'niedrig',
      reason: data.styleAlerts[0].evidence,
      action: data.styleAlerts[0].advice
    });
  }

  if (data.quoteAnalysis && data.quoteAnalysis.priority) {
    actions.push(data.quoteAnalysis.priority);
  }

  return actions.slice(0, 5);
}

function buildSentenceWork(sentences, diagnostics) {
  const entries = [];

  diagnostics.diagnostics.forEach((entry) => {
    if (!entry.issueHints.length || entries.length >= 4) return;

    let revisionGoal = 'Satz präzisieren.';
    let suggestion = 'Formuliere die Hauptaussage zuerst und führe die Begründung anschliessend aus.';

    if (entry.issueHints.includes('zu lang')) {
      revisionGoal = 'Satz aufteilen und Lesefluss verbessern.';
      suggestion = 'Teile den Satz an der stärksten gedanklichen Zäsur in zwei Aussagen.';
    } else if (entry.issueHints.includes('schwacher Einstieg')) {
      revisionGoal = 'Mit einer konkreten Aussage statt mit einer Vorformel starten.';
      suggestion = 'Beginne direkt mit der Behauptung oder Beobachtung statt mit "Ich finde ..."';
    } else if (entry.issueHints.includes('zu kurz')) {
      revisionGoal = 'Satz inhaltlich stärker anbinden.';
      suggestion = 'Ergänze, warum diese Aussage für die Argumentation wichtig ist.';
    }

    entries.push({
      original: entry.sentence,
      issue: entry.issueHints.join(', '),
      revisionGoal,
      suggestion
    });
  });

  return entries;
}

function analyzeQuoteUsage(text, sentences) {
  const literalMatches = [...text.matchAll(/[„"]([^"”“]{6,220})[”“"]/g)].map((match) => match[1].trim());
  const sourceCuePattern =
    /\b(?:laut|nach|vgl\.?|siehe|sinngemäss|sinngemäß|paraphrasiert|in anlehnung an|bei|gemäss|gemäß)\b/i;
  const authorYearPattern =
    /\b[A-ZÄÖÜ][A-Za-zÄÖÜäöüß'’.-]+(?:\s+[A-ZÄÖÜ][A-Za-zÄÖÜäöüß'’.-]+)?\s*\((?:19|20)\d{2}[a-z]?\)/;
  const quoteIntroPattern =
    /\b(?:schreibt|betont|argumentiert|erklärt|formuliert|stellt fest|hält fest|zeigt|meint|laut|nach)\b/i;
  const quoteAnalysisPattern =
    /\b(?:das zeigt|dies zeigt|daran wird deutlich|dadurch wird deutlich|das bedeutet|das verdeutlicht|für mein argument|für die argumentation|somit|folglich|also|darum)\b/i;

  const sentenceEntries = sentences.map((sentence, index) => ({
    index,
    sentence,
    hasLiteralQuote: /[„"][^"”“]{6,220}[”“"]/.test(sentence),
    hasSourceCue: sourceCuePattern.test(sentence),
    hasAuthorYear: authorYearPattern.test(sentence),
    hasIntro: quoteIntroPattern.test(sentence) || /:\s*[„"]/.test(sentence),
    hasAnalysis: quoteAnalysisPattern.test(sentence),
    likelyParaphrase:
      !/[„"][^"”“]{6,220}[”“"]/.test(sentence) &&
      (sourceCuePattern.test(sentence) || authorYearPattern.test(sentence))
  }));

  const literalDetails = sentenceEntries
    .filter((entry) => entry.hasLiteralQuote)
    .map((entry) => {
      const previous = sentenceEntries[entry.index - 1];
      const next = sentenceEntries[entry.index + 1];
      const introduced = entry.hasIntro || previous?.hasIntro || previous?.hasSourceCue || previous?.hasAuthorYear;
      const analysed = entry.hasAnalysis || next?.hasAnalysis;
      const issueParts = [];
      if (!introduced) issueParts.push('Zitat wird nicht klar eingeführt.');
      if (!analysed) issueParts.push('Zitat wird kaum ausgewertet oder angebunden.');
      return {
        type: 'wörtlich',
        sentence: entry.sentence,
        introduced,
        analysed,
        issue: issueParts.join(' ')
      };
    });

  const paraphraseDetails = sentenceEntries
    .filter((entry) => entry.likelyParaphrase)
    .map((entry) => {
      const next = sentenceEntries[entry.index + 1];
      const clearlyMarked = entry.hasSourceCue || entry.hasAuthorYear;
      const analysed = entry.hasAnalysis || next?.hasAnalysis;
      const issueParts = [];
      if (!clearlyMarked) issueParts.push('Sinngemässe Übernahme ist nicht klar markiert.');
      if (!analysed) issueParts.push('Paraphrase wird nicht sichtbar auf das eigene Argument bezogen.');
      return {
        type: 'sinngemäss',
        sentence: entry.sentence,
        clearlyMarked,
        analysed,
        issue: issueParts.join(' ')
      };
    });

  const literalCount = literalDetails.length;
  const paraphraseCount = paraphraseDetails.length;
  const sourceReferenceCount = sentenceEntries.filter((entry) => entry.hasSourceCue || entry.hasAuthorYear).length;
  const introducedCount = literalDetails.filter((entry) => entry.introduced).length;
  const analysedCount =
    literalDetails.filter((entry) => entry.analysed).length +
    paraphraseDetails.filter((entry) => entry.analysed).length;

  let distinctionScore = 72;
  let integrationScore = 72;

  if (literalCount || paraphraseCount) {
    distinctionScore = clamp(
      35 +
        literalCount * 10 +
        paraphraseCount * 10 +
        Math.min(sourceReferenceCount, 4) * 8 +
        (literalCount && paraphraseCount ? 15 : 0),
      0,
      100
    );

    const totalCitations = Math.max(1, literalCount + paraphraseCount);
    integrationScore = clamp(
      25 +
        Math.round((introducedCount / Math.max(1, literalCount || 1)) * 30) +
        Math.round((analysedCount / totalCitations) * 35),
      0,
      100
    );
  }

  const score = literalCount || paraphraseCount
    ? Math.round(distinctionScore * 0.45 + integrationScore * 0.55)
    : 72;

  let observation = 'Im Text sind derzeit keine ausgeprägten Zitatstellen erkennbar. Falls mit Literatur gearbeitet wird, sollte die Zitatform sichtbar markiert werden.';
  let advice = 'Kennzeichne wörtliche und sinngemässe Übernahmen unterschiedlich und binde jede Quelle in den eigenen Gedankengang ein.';

  if (literalCount || paraphraseCount) {
    if (score >= 75) {
      observation = 'Die Zitatarbeit ist grundsätzlich erkennbar; Quellen werden meist klar markiert und in den Argumentgang eingebunden.';
      advice = 'Halte die gute Praxis bei: Quelle einführen, Aussage nennen und ihre Bedeutung für das eigene Argument explizit machen.';
    } else if (score >= 50) {
      observation = 'Es gibt Ansätze guter Zitatarbeit, aber die Unterscheidung zwischen wörtlichem und sinngemässem Zitieren oder die Einbettung ist noch nicht immer deutlich.';
      advice = 'Markiere wörtliche Zitate mit Anführungszeichen und sinngemässe Übernahmen mit Signalwörtern wie „nach“, „laut“ oder „sinngemäss“.';
    } else {
      observation = 'Zitate oder Paraphrasen stehen noch zu unverbunden im Text oder sind nicht klar als Zitatart erkennbar.';
      advice = 'Führe jedes Zitat ein, ordne es einer Zitatform zu und erkläre unmittelbar danach seine Funktion für dein Argument.';
    }
  }

  const findings = [];
  literalDetails.slice(0, 3).forEach((entry) => {
    findings.push({
      label: 'Wörtliches Zitat',
      sentence: entry.sentence,
      diagnosis: entry.issue || 'Das Zitat ist erkennbar eingeführt und argumentativ eingebunden.'
    });
  });
  paraphraseDetails.slice(0, 3).forEach((entry) => {
    findings.push({
      label: 'Sinngemässes Zitat',
      sentence: entry.sentence,
      diagnosis: entry.issue || 'Die paraphrasierte Quelle ist markiert und in den Gedankengang eingebettet.'
    });
  });

  const priority =
    (literalCount || paraphraseCount) && score < 70
      ? {
          title: 'Zitatarbeit klären',
          severity: score < 45 ? 'hoch' : 'mittel',
          reason: observation,
          action: advice
        }
      : null;

  return {
    score,
    literalCount,
    paraphraseCount,
    sourceReferenceCount,
    distinctionScore,
    integrationScore,
    observation,
    advice,
    findings,
    priority
  };
}


export function reviewArgument(text){
 const normalized=normalizeInputText(text);
 if(splitWords(normalized).length<20)throw Error('Bitte mindestens 20 Wörter für eine aussagekräftigere Prüfung eingeben.');
 if(normalized.length>60000)throw Error('Bitte höchstens 60 000 Zeichen pro Prüfung verwenden.');
 return analyzeArgumentation(normalized);
}
