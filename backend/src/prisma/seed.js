import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed Sofulano Ukulondja...");
  const adminPw = await bcrypt.hash("admin123", 10);
  const studPw = await bcrypt.hash("aluno123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sofulano.com" },
    update: {},
    create: { name: "Administrador", email: "admin@sofulano.com", password: adminPw, role: "ADMIN" },
  });
  const student = await prisma.user.upsert({
    where: { email: "aluno@sofulano.com" },
    update: {},
    create: { name: "Aluno Demo", email: "aluno@sofulano.com", password: studPw, role: "STUDENT" },
  });

  // ==================== LIMPEZA APENAS DAS TABELAS RELACIONADAS A CURSOS ====================
  // NOTA: Apagar cursos apaga em cascata as lições, exercícios e quizzes associados
  console.log("🔄 A limpar dados antigos de cursos...");
  await prisma.quiz.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.enrollment.deleteMany({});
  console.log("✅ Limpeza concluída.");

  // ==================== CRIAÇÃO DO CURSO DE INGLÊS ====================
  console.log("📚 A criar curso de Inglês...");
  const english = await prisma.course.create({
    data: {
      title: "Inglês para Iniciantes (PT-Angola)",
      description:
        "Curso de inglês com instruções em português de Angola. " +
        "Inclui lições, exercícios de preencher lacunas, frases embaralhadas, " +
        "tradução e quizzes de múltipla escolha.",
      level: "BEGINNER",
      language: "en",
      cover: null,
    },
  });

  // ==================== CRIAÇÃO DO CURSO DE PORTUGUÊS ====================
  console.log("📚 A criar curso de Português...");
  const portuguese = await prisma.course.create({
    data: {
      title: "Português Avançado",
      description: "Aprofunda a gramática, ortografia e vocabulário do português.",
      level: "ADVANCED",
      language: "pt",
      cover: null,
    },
  });

  // ==================== CRIAÇÃO DO CURSO DE UMBUNDU ====================
  console.log("📚 A criar curso de Umbundu...");
  const umbundu = await prisma.course.create({
    data: {
      title: "Umbundu para Iniciantes",
      description:
        "Aprenda a língua umbundu falada pelos ovimbundu de Angola. " +
        "Este curso inclui saudações, pronomes, números, vocabulário da família, verbos, " +
        "partes do corpo, expressões úteis e provérbios tradicionais.",
      level: "BEGINNER",
      language: "umb",
      cover: null,
    },
  });

  // ==================== LIÇÕES DE INGLÊS ====================
  console.log("📖 A criar lições de Inglês...");
  const englishLessons = [
    {
      title: "1 — Saudações e apresentações",
      content:
        "Olá! Nesta lição vais aprender as saudações mais usadas em inglês.\n\n" +
        "• Hello / Hi — Olá\n• Good morning — Bom dia\n• Good afternoon — Boa tarde\n" +
        "• Good evening — Boa noite (cumprimento)\n• Good night — Boa noite (despedida)\n" +
        "• How are you? — Como estás?\n• I'm fine, thank you. — Estou bem, obrigado.\n" +
        "• What is your name? — Como te chamas?\n• My name is... — O meu nome é...",
      order: 1,
      exercises: [
        { type: "FILL_BLANK", prompt: "Completa: 'Good _____' (bom dia)", answer: "morning", hint: "Começa por M" },
        { type: "TRANSLATE",  prompt: "Traduz para inglês: 'O meu nome é Ana.'", answer: "My name is Ana", hint: "Começa com My" },
        { type: "SCRAMBLED",  prompt: "Reordena as palavras: 'are / you / how'", answer: "how are you", hint: "Pergunta sobre estado" },
        { type: "FILL_BLANK", prompt: "'_____ to meet you' (prazer em conhecer-te)", answer: "nice", hint: "Adjetivo de simpatia" },
      ],
      quizzes: [
        { question: "Qual é a tradução de 'Boa tarde'?", options: ["Good morning", "Good afternoon", "Good night", "Goodbye"], correct: 1, feedback: "Good afternoon = Boa tarde" },
        { question: "Como respondes a 'How are you?'", options: ["My name is John", "I am fine, thank you", "Goodbye", "Yes, please"], correct: 1, feedback: "I am fine, thank you = Estou bem, obrigado" },
      ],
    },
    {
      title: "2 — Números, dias e meses",
      content:
        "Aprende os números, dias da semana e meses do ano.\n\n" +
        "Números: one, two, three, four, five, six, seven, eight, nine, ten.\n" +
        "Dias: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.\n" +
        "Meses: January, February, March, April, May, June, July, August, September, October, November, December.",
      order: 2,
      exercises: [
        { type: "FILL_BLANK", prompt: "O número 7 em inglês é: _____", answer: "seven", hint: "Começa com S" },
        { type: "TRANSLATE",  prompt: "Traduz: 'Hoje é segunda-feira.'", answer: "Today is Monday", hint: "Today = hoje" },
        { type: "SCRAMBLED",  prompt: "Reordena: 'is / Tuesday / today'", answer: "today is tuesday", hint: "Hoje é terça" },
        { type: "FILL_BLANK", prompt: "O mês de Janeiro em inglês é: _____", answer: "january", hint: "Começa com J" },
      ],
      quizzes: [
        { question: "Qual o terceiro dia da semana (a começar em Monday)?", options: ["Tuesday", "Wednesday", "Thursday", "Friday"], correct: 1, feedback: "Monday(1), Tuesday(2), Wednesday(3)" },
        { question: "Qual é o mês 'December'?", options: ["Outubro", "Novembro", "Dezembro", "Setembro"], correct: 2, feedback: "December = Dezembro" },
        { question: "Quanto é 'twelve'?", options: ["10", "11", "12", "13"], correct: 2, feedback: "Twelve = 12" },
      ],
    },
    {
      title: "3 — A família",
      content:
        "Vocabulário da família.\n\n" +
        "father (pai), mother (mãe), brother (irmão), sister (irmã), son (filho), daughter (filha), " +
        "grandfather (avô), grandmother (avó), uncle (tio), aunt (tia), cousin (primo/a).",
      order: 3,
      exercises: [
        { type: "TRANSLATE",  prompt: "Traduz: 'A minha mãe é professora.'", answer: "My mother is a teacher", hint: "mother = mãe" },
        { type: "FILL_BLANK", prompt: "'My _____ is my father's father.' (avô)", answer: "grandfather", hint: "Pai do pai" },
        { type: "SCRAMBLED",  prompt: "Reordena: 'sister / I / a / have'", answer: "i have a sister", hint: "Eu tenho uma irmã" },
      ],
      quizzes: [
        { question: "Qual é a tradução de 'aunt'?", options: ["Tia", "Prima", "Irmã", "Avó"], correct: 0, feedback: "Aunt = Tia" },
        { question: "Qual a relação de 'cousin'?", options: ["Pai", "Primo/a", "Tio", "Irmão"], correct: 1, feedback: "Cousin = Primo/a" },
      ],
    },
    {
      title: "4 — Verbo 'to be' (ser/estar)",
      content:
        "O verbo 'to be' significa 'ser' ou 'estar'. Formas no presente:\n\n" +
        "I am (eu sou/estou) — I'm\nYou are (tu és/estás) — You're\nHe is (ele é/está) — He's\n" +
        "She is — She's\nIt is — It's\nWe are — We're\nThey are — They're\n\n" +
        "Negativo: I am not (I'm not), You aren't, He isn't...\nInterrogativo: Am I...? Are you...? Is he...?",
      order: 4,
      exercises: [
        { type: "FILL_BLANK", prompt: "'She _____ a doctor.' (ela é médica)", answer: "is", hint: "3ª pessoa singular" },
        { type: "FILL_BLANK", prompt: "'They _____ from Angola.' (eles são de Angola)", answer: "are", hint: "3ª pessoa plural" },
        { type: "TRANSLATE",  prompt: "Traduz: 'Eu sou estudante.'", answer: "I am a student", hint: "I am = eu sou" },
        { type: "SCRAMBLED",  prompt: "Reordena: 'happy / am / I'", answer: "i am happy", hint: "Eu estou feliz" },
      ],
      quizzes: [
        { question: "Qual é a forma correta? 'We ___ friends.'", options: ["am", "is", "are", "be"], correct: 2, feedback: "We are = Nós somos/estamos" },
        { question: "Negativo de 'He is tired'", options: ["He no is tired", "He isn't tired", "He don't tired", "He not is tired"], correct: 1, feedback: "He isn't tired = Ele não está cansado" },
      ],
    },
    {
      title: "5 — Cores e objectos da sala",
      content:
        "Cores: red, blue, green, yellow, black, white, orange, purple, pink, brown.\n" +
        "Sala: table (mesa), chair (cadeira), book (livro), pen (caneta), pencil (lápis), door (porta), window (janela).",
      order: 5,
      exercises: [
        { type: "TRANSLATE",  prompt: "Traduz: 'O livro é vermelho.'", answer: "The book is red", hint: "book = livro, red = vermelho" },
        { type: "FILL_BLANK", prompt: "'Open the _____ please.' (janela)", answer: "window", hint: "Abre a ..." },
        { type: "SCRAMBLED",  prompt: "Reordena: 'is / blue / pen / the'", answer: "the pen is blue", hint: "A caneta é azul" },
      ],
      quizzes: [
        { question: "Qual é 'amarelo' em inglês?", options: ["Yellow", "Orange", "Green", "Brown"], correct: 0, feedback: "Yellow = Amarelo" },
        { question: "'Chair' significa:", options: ["Mesa", "Cadeira", "Porta", "Janela"], correct: 1, feedback: "Chair = Cadeira" },
      ],
    },
    {
      title: "6 — Presente simples (rotinas)",
      content:
        "O presente simples usa-se para hábitos e rotinas.\n\n" +
        "I work / You work / He works / She works / We work / They work.\n" +
        "Na 3ª pessoa do singular acrescenta-se -s ou -es.\n" +
        "Negativo: don't / doesn't. Interrogativo: Do you...? Does he...?",
      order: 6,
      exercises: [
        { type: "FILL_BLANK", prompt: "'He _____ English every day.' (study → 3ª pess.)", answer: "studies", hint: "Acrescenta -ies" },
        { type: "TRANSLATE",  prompt: "Traduz: 'Eu acordo às 6.'", answer: "I wake up at 6", hint: "wake up = acordar" },
        { type: "SCRAMBLED",  prompt: "Reordena: 'football / play / I / on Sundays'", answer: "i play football on sundays", hint: "Eu jogo futebol aos domingos" },
      ],
      quizzes: [
        { question: "Negativo de 'She likes coffee'", options: ["She not likes coffee", "She doesn't like coffee", "She don't likes coffee", "She isn't likes coffee"], correct: 1, feedback: "She doesn't like coffee = Ela não gosta de café" },
        { question: "Pergunta correta:", options: ["You do speak English?", "Do you speak English?", "Are you speak English?", "Does you speak English?"], correct: 1, feedback: "Do you speak English? = Tu falas inglês?" },
      ],
    },
    {
      title: "7 — Comida e bebida",
      content:
        "Alimentos: bread (pão), rice (arroz), fish (peixe), meat (carne), chicken (frango), egg (ovo), milk (leite), water (água), juice (sumo).",
      order: 7,
      exercises: [
        { type: "TRANSLATE",  prompt: "Traduz: 'Eu bebo água.'", answer: "I drink water", hint: "drink = beber" },
        { type: "FILL_BLANK", prompt: "'I eat _____ for breakfast.' (ovos)", answer: "eggs", hint: "Plural de egg" },
        { type: "SCRAMBLED",  prompt: "Reordena: 'like / milk / I / cold'", answer: "i like cold milk", hint: "Eu gosto de leite frio" },
      ],
      quizzes: [
        { question: "'Bread' significa:", options: ["Arroz", "Pão", "Carne", "Sumo"], correct: 1, feedback: "Bread = Pão" },
        { question: "Qual é a bebida?", options: ["Chicken", "Fish", "Juice", "Egg"], correct: 2, feedback: "Juice = Sumo" },
      ],
    },
  ];

  for (const lessonData of englishLessons) {
    const created = await prisma.lesson.create({
      data: {
        courseId: english.id,
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order,
      },
    });
    for (const ex of lessonData.exercises) {
      await prisma.exercise.create({
        data: {
          type: ex.type,
          prompt: ex.prompt,
          answer: ex.answer,
          hint: ex.hint || null,
          lessonId: created.id,
        },
      });
    }
    for (const q of lessonData.quizzes) {
      await prisma.quiz.create({
        data: {
          lessonId: created.id,
          question: q.question,
          options: JSON.stringify(q.options),
          correct: q.correct,
        },
      });
    }
  }
  console.log("✅ Curso de Inglês criado com 7 lições.");

  // ==================== LIÇÕES DE PORTUGUÊS ====================
  console.log("📖 A criar lições de Português...");
  const portugueseLesson = await prisma.lesson.create({
    data: {
      courseId: portuguese.id,
      title: "1 — Acentuação e ortografia",
      content:
        "Regras básicas de acentuação em português, com exemplos do português de Angola.\n\n" +
        "• Palavras agudas: acentuam-se quando terminam em a, e, o, em, ens seguidos.\n" +
        "• Palavras graves: acentuam-se quando terminam em l, n, r, x, ps, ã, ão, hiato.\n" +
        "• Palavras proparoxítonas: são sempre acentuadas.\n\n" +
        "Exemplos: África, última, música, gráfica.",
      order: 1,
    },
  });
  await prisma.quiz.create({
    data: {
      lessonId: portugueseLesson.id,
      question: "Qual destas palavras está correctamente acentuada?",
      options: JSON.stringify(["áfrica", "África", "africa", "Africá"]),
      correct: 1,
      
    },
  });
  console.log("✅ Curso de Português criado.");

  // ==================== LIÇÕES DE UMBUNDU ====================
  console.log("📖 A criar lições de Umbundu...");
  const umbunduLessons = [
    {
      title: "1 — Saudações e Cumprimentos (Okupandula)",
      content:
        "As saudações são muito importantes na cultura umbundu. " +
        "Cumprimentar correctamente demonstra respeito.\n\n" +
        "• Kalunga / Kalungapo — Olá! / Viva! (saudação geral a qualquer hora)\n" +
        "• Utanya uwa — Bom dia! (focado na luz do sol / manhã)\n" +
        "• Kombunge uwa — Boa tarde!\n" +
        "• Uteke uwa — Boa noite!\n" +
        "• Walale? — Passou bem a noite? (manhã)\n" +
        "• Ndalale potchwaa — Passei bem (resposta)\n" +
        "• Walanga? — Passou bem o dia? (tarde/noite)\n" +
        "• Ndalanga potchwaa — Passei bem (resposta)\n" +
        "• Wakola potchwa? — Está bem?\n" +
        "• Sali potchwaa — Adeus, fique bem\n" +
        "• Lalipo — Ciao / Até logo\n" +
        "• Okuiya kuwa — Bem-vindo\n" +
        "• Twapandula — Obrigado\n" +
        "• Lachimue — De nada",
      order: 1,
      exercises: [
        { type: "FILL_BLANK", prompt: "Para dizer 'Olá' a qualquer hora, usa-se: '_____'", answer: "Kalunga", hint: "Começa com K" },
        { type: "FILL_BLANK", prompt: "'Bom dia' em umbundu é: '_____ _____'", answer: "Utanya uwa", hint: "Duas palavras" },
        { type: "TRANSLATE",  prompt: "Traduz para umbundu: 'Boa tarde'", answer: "Kombunge uwa", hint: "Kombunge = tarde" },
        { type: "FILL_BLANK", prompt: "Para perguntar 'Passou bem a noite?', diz-se: '_____?'", answer: "Walale", hint: "Pergunta matinal" },
        { type: "FILL_BLANK", prompt: "A resposta para 'Walanga?' é: '_____'", answer: "Ndalanga potchwaa", hint: "Passei bem" },
        { type: "SCRAMBLED",  prompt: "Reordena: 'potchwaa / wakola'", answer: "wakola potchwaa", hint: "Está bem?" },
        { type: "FILL_BLANK", prompt: "'Obrigado' diz-se: '_____'", answer: "Twapandula", hint: "Agradacer" },
        { type: "FILL_BLANK", prompt: "'De nada' é: '_____'", answer: "Lachimue", hint: "Resposta a obrigado" },
      ],
      quizzes: [
        { question: "Como se diz 'Boa noite' em umbundu?", options: ["Utanya uwa", "Kombunge uwa", "Uteke uwa", "Kalunga"], correct: 2, feedback: "'Uteke' significa noite. 'Uwa' significa bom/boa." },
        { question: "Qual saudação se usa especificamente pela manhã?", options: ["Kalunga", "Uteke uwa", "Utanya uwa", "Kombunge uwa"], correct: 2, feedback: "'Utanya' refere-se à luz do sol/manhã." },
        { question: "Como responder 'Walale?' (passou bem a noite?)", options: ["Ndalanga potchwaa", "Ndalale potchwaa", "Wakola potchwa", "Sali potchwaa"], correct: 1, feedback: "'Ndalale potchwaa' significa 'Passei bem a noite'." },
        { question: "'Sali potchwaa' significa:", options: ["Olá", "Bem-vindo", "Adeus, fique bem", "Obrigado"], correct: 2, feedback: "Usa-se ao despedir-se." },
        { question: "'Okuiya kuwa' é usado para:", options: ["Dar as boas-vindas", "Agradecer", "Despedir-se", "Perguntar como está"], correct: 0, feedback: "Significa 'Bem-vindo'." },
      ],
    },
    {
      title: "2 — Pronomes Pessoais e Verbo 'Estar'",
      content:
        "Pronomes sujeitos (Ameso Okuikumbatisa):\n\n" +
        "• Ame — Eu\n• Ove — Tu\n• Eye — Ele / Ela\n• Etu — Nós\n• Ene — Vós\n• Ovo — Eles / Elas\n\n" +
        "Verbo 'kukala' (estar/ser):\n" +
        "• Ame ndikala — Eu estou/sou\n• Ove okala — Tu estás/és\n• Eye ukala — Ele/ela está/é\n" +
        "• Etu tukala — Nós estamos/somos\n• Ene vukala — Vós estais/sais\n• Ovo vakala — Eles estão/são",
      order: 2,
      exercises: [
        { type: "FILL_BLANK", prompt: "O pronome para 'Eu' é: '_____'", answer: "Ame" },
        { type: "FILL_BLANK", prompt: "'Tu' em umbundu é: '_____'", answer: "Ove" },
        { type: "FILL_BLANK", prompt: "'Eye' significa: _____ ou _____", answer: "Ele, Ela", hint: "dois significados" },
        { type: "FILL_BLANK", prompt: "'Nós' diz-se: '_____'", answer: "Etu" },
        { type: "FILL_BLANK", prompt: "O verbo 'estar/ser' em umbundu é: 'oku_____'", answer: "kala", hint: "3 letras" },
        { type: "TRANSLATE",  prompt: "Traduz para umbundu: 'Eu estou bem'", answer: "Ame ndikala tchiwa", hint: "tchiwa = bem" },
        { type: "FILL_BLANK", prompt: "'Ove okala' significa: 'Tu _____'", answer: "és/estás" },
      ],
      quizzes: [
        { question: "Qual pronome significa 'Eles'?", options: ["Etu", "Ene", "Ovo", "Eye"], correct: 2, feedback: "'Ovo' é o pronome para eles/elas." },
        { question: "Como se diz 'Eu sou médico' em umbundu?", options: ["Ove okala médico", "Eye ukala médico", "Ame ndikala médico", "Etu tukala médico"], correct: 2, feedback: "'Ame ndikala' + profissão." },
        { question: "'Ene' significa:", options: ["Nós", "Vós", "Eles", "Tu"], correct: 1, feedback: "'Ene' é a forma para vós." },
        { question: "Qual a forma correta para 'Tu estás cansado'?", options: ["Ame ndikala ekavo", "Ove okala ekavo", "Eye ukala ekavo", "Etu tukala ekavo"], correct: 1, feedback: "'Ekavo' significa cansado." },
      ],
    },
    {
      title: "3 — Números (Tutendi) e Quantidades",
      content:
        "Aprende os números em umbundu:\n\n" +
        "1 — Mosi\n2 — Vali\n3 — Tatu\n4 — Kwála\n5 — Tálo\n6 — Epandu\n" +
        "7 — Epanduvali (6+1)\n8 — Ecélalá\n9 — Ecea\n10 — Ekwi\n" +
        "11 — Ekwi la mosi (10+1)\n20 — Akui avali\n30 — Akui atatu\n" +
        "100 — Ocita\n200 — Ocita vivali\n1000 — Ohuukái\n" +
        "1.000.000 — Ohuua\n\n" +
        "Expressões de quantidade:\n• Tchalua — Muito\n• Tchitito / Katito — Pouco / Pequeno\n• Nene / tchinene — Grande",
      order: 3,
      exercises: [
        { type: "FILL_BLANK", prompt: "O número 5 em umbundu é: '_____'", answer: "Tálo" },
        { type: "FILL_BLANK", prompt: "'Epandu' corresponde ao número: _____", answer: "6", hint: "Seis" },
        { type: "FILL_BLANK", prompt: "11 diz-se: '_____ _____'", answer: "Ekwi la mosi", hint: "10 + 1" },
        { type: "FILL_BLANK", prompt: "20 em umbundu é: '_____ _____'", answer: "Akui avali", hint: "2 × 10" },
        { type: "TRANSLATE", prompt: "Traduz para umbundu: 'cem'", answer: "Ocita" },
        { type: "FILL_BLANK", prompt: "'Muito' em umbundu é: '_____'", answer: "Tchalua" },
        { type: "FILL_BLANK", prompt: "O antónimo de 'tchalua' é: '_____' (pouco)", answer: "Tchitito", hint: "Também pode ser Katito" },
      ],
      quizzes: [
        { question: "Qual o número 'Epanduvali'?", options: ["6", "7", "8", "9"], correct: 1, feedback: "Epanduvali = Epandu (6) + vali (1) = 7" },
        { question: "Como se diz '1000' em umbundu?", options: ["Ocita", "Ekwi", "Ohuukái", "Epandu"], correct: 2, feedback: "'Ohuukái' significa mil." },
        { question: "Qual palavra significa 'grande'?", options: ["Tchitito", "Nene", "Katito", "Tchalua"], correct: 1, feedback: "'Nene' ou 'tchinene' significa grande." },
        { question: "'Kwála' é o número:", options: ["3", "4", "5", "6"], correct: 1, feedback: "Kwála = 4" },
      ],
    },
    {
      title: "4 — Família (Epata) e Relações",
      content:
        "Vocabulário da família em umbundu:\n\n" +
        "• Ulume — Homem\n• Ukai / Ukáyi — Mulher\n• Omóla — Criança, filhos\n• Oñgañga / Okamola — Bebé\n" +
        "• Ise — Pai\n• Ina — Mãe\n• Sekulo — Esposo / mais velho / soba\n• Makulo — Esposa\n" +
        "• Kuku / Inakulu — Avó\n• Onjende / Kanjende — Velho, idoso\n• Ufeko — Moça (rapariga)\n" +
        "• Ukuenje — Rapaz\n• Omisi — Grávida\n• Vamandje — Irmãos\n• Epalume / Apalume — Primos\n" +
        "• Ondjali — Pais (plural)\n• Ovimumbe — Filhos",
      order: 4,
      exercises: [
        { type: "FILL_BLANK", prompt: "'Pai' em umbundu é: '_____'", answer: "Ise" },
        { type: "FILL_BLANK", prompt: "'Ina' significa: '_____'", answer: "Mãe" },
        { type: "TRANSLATE", prompt: "Traduz para umbundu: 'criança'", answer: "Omóla" },
        { type: "FILL_BLANK", prompt: "'Ukai' significa: '_____'", answer: "Mulher" },
        { type: "FILL_BLANK", prompt: "'Sekulo' pode significar 'esposo' ou '_____'", answer: "mais velho", hint: "Pessoa respeitada" },
        { type: "FILL_BLANK", prompt: "'Avó' diz-se: '_____' ou 'inakulu'", answer: "Kuku" },
        { type: "FILL_BLANK", prompt: "'Ufeko' é uma: '_____' (jovem feminino)", answer: "moça" },
      ],
      quizzes: [
        { question: "Como se diz 'grávida' em umbundu?", options: ["Ukai", "Omisi", "Ufeko", "Makulo"], correct: 1, feedback: "'Omisi' é o termo para mulher grávida." },
        { question: "'Vamandje' significa:", options: ["Primos", "Pais", "Irmãos", "Filhos"], correct: 2, feedback: "Refere-se aos irmãos." },
        { question: "Qual o termo para 'bebé'?", options: ["Omóla", "Ukuenje", "Oñgañga", "Ukai"], correct: 2, feedback: "'Oñgañga' ou 'Okamola' significa bebé." },
        { question: "'Makulo' é:", options: ["Esposo", "Esposa", "Pai", "Avó"], correct: 1, feedback: "'Makulo' significa esposa." },
      ],
    },
    {
      title: "5 — Partes do Corpo e Saúde (Ocipital)",
      content:
        "Partes do corpo (Utima Utue):\n\n" +
        "• Útue — Cabeça\n• Vimo — Barriga\n• Utima — Coração\n• Omuma — Fígado\n• Vochilena — Bexiga\n" +
        "• Osangui — Sangue\n• Ovava — Água, líquido\n• Onyama — Mama\n\n" +
        "Saúde e doença:\n• Ombambi — Febre / frio\n• Uveyi — Doença\n• Ombei — Doente\n• Okosola? — Tosse?\n" +
        "• Osanja? — Vomita?\n• Tchibala? — Dói?\n• Nhe oveyite? — O que sente?\n• Pipa bala? — Onde dói?\n" +
        "• Kolela! — Coragem! / Valente!\n• Fwima lungusu! — Respire fundo!",
      order: 5,
      exercises: [
        { type: "FILL_BLANK", prompt: "'Cabeça' em umbundu é: '_____'", answer: "Útue" },
        { type: "FILL_BLANK", prompt: "Para perguntar 'Dói?', diz-se: '_____?'", answer: "Tchibala" },
        { type: "FILL_BLANK", prompt: "'Ombambi' significa: '_____'", answer: "Febre", hint: "Também pode significar frio" },
        { type: "FILL_BLANK", prompt: "Como se pergunta 'Onde dói?': '_____ _____?'", answer: "Pipa bala", hint: "Pipa = onde, bala = dói" },
        { type: "TRANSLATE", prompt: "Traduz para umbundu: 'O coração não está bem'", answer: "Utima kaukasi tchiwa", hint: "kaukasi = não está" },
        { type: "FILL_BLANK", prompt: "'Doente' diz-se: '_____'", answer: "Ombei" },
        { type: "FILL_BLANK", prompt: "'Kolela' é uma palavra de incentivo que significa: '_____'", answer: "Coragem", hint: "Para dar força" },
      ],
      quizzes: [
        { question: "Como se diz 'Estou com febre'?", options: ["Ndikasi l'otulo", "Okuete ombambi", "Ndikasi l'ombambi", "Utima chibala"], correct: 2, feedback: "'Ndikasi l'ombambi' = Estou com febre." },
        { question: "'Nhe oveyite?' significa:", options: ["Onde dói?", "Como estás?", "O que sentes?", "Estás doente?"], correct: 2, feedback: "Pergunta sobre os sintomas." },
        { question: "Qual parte do corpo é 'Vimo'?", options: ["Coração", "Cabeça", "Barriga", "Fígado"], correct: 2, feedback: "'Vimo' é a barriga." },
        { question: "'Fwima lungusu!' significa:", options: ["Tome assento", "Respire fundo", "Tenha coragem", "Vomite"], correct: 1, feedback: "Usado em contexto médico." },
      ],
    },
    {
      title: "6 — Verbos Comuns e Conjugação no Presente",
      content:
        "Verbos em umbundu têm o prefixo 'oku-' no infinitivo.\n\n" +
        "Conjugação no presente (afirmativo):\n" +
        "• Ame (eu): prefixo Ndi-  (ex: Ndisole — gosto)\n• Ove (tu): prefixo O-    (ex: Osole — gostas)\n" +
        "• Eye (ele/ela): prefixo U- (ex: Usole — gosta)\n• Etu (nós): prefixo Tu-  (ex: Tusole — gostamos)\n" +
        "• Ene (vós): prefixo Vu-  (ex: Vusole — gostais)\n• Ovo (eles): prefixo Va-  (ex: Vasole — gostam)\n\n" +
        "Negação: acrescenta-se prefixo Si- / Ku- / Ka- (ex: Ame sisole — Não gosto)\n\n" +
        "Verbos importantes:\n• Okulia — Comer\n• Okunua — Beber\n• Okuenda — Ir/Andar\n• Okuya — Vir\n" +
        "• Okulinga — Fazer\n• Okusole — Gostar\n• Okuvongola — Querer\n• Okukala — Estar/Ser\n" +
        "• Okulilongisa — Aprender\n• Okulongisa — Ensinar\n• Okupandula — Agradecer\n• Okuvandija — Ver/Olhar\n" +
        "• Okumãla — Acabar\n• Ofuka — Morrer",
      order: 6,
      exercises: [
        { type: "FILL_BLANK", prompt: "O infinitivo do verbo 'comer' é: 'oku_____'", answer: "lia" },
        { type: "FILL_BLANK", prompt: "'Eu gosto' diz-se: 'Ame ndi_____'", answer: "sole", hint: "verbo gostar" },
        { type: "FILL_BLANK", prompt: "Para dizer 'tu queres', usa-se: 'Ove oku_____'", answer: "vongola", hint: "verbo querer" },
        { type: "TRANSLATE", prompt: "Traduz: 'Eu vou a casa'", answer: "Ame ndenda ko'ondjo", hint: "ondjo = casa" },
        { type: "FILL_BLANK", prompt: "A forma negativa de 'Ndisole' é: 'Ame _____'", answer: "sisole", hint: "não gosto" },
        { type: "FILL_BLANK", prompt: "'Aprender' é 'oku_____'", answer: "lilongisa", hint: "verbo reflexivo" },
        { type: "SCRAMBLED", prompt: "Reordena: 'kwenda / pi / ove' (para onde vais?)", answer: "ove kwenda pi", hint: "pi = onde" },
      ],
      quizzes: [
        { question: "Qual o prefixo para 'ele' no presente afirmativo?", options: ["Ndi-", "O-", "U-", "Tu-"], correct: 2, feedback: "'Eye' usa o prefixo U- (ex: ukala, usole)" },
        { question: "Como se diz 'Nós vamos'?", options: ["Ame ndenda", "Ove wenda", "Etu tuenda", "Ovo vaenda"], correct: 2, feedback: "Etu + prefixo tu- + verbo" },
        { question: "Qual o verbo para 'ver/olhar'?", options: ["Okusole", "Okuvandija", "Okulongisa", "Okupandula"], correct: 1, feedback: "'Okuvandija' significa ver ou olhar." },
        { question: "'Twapandula' é derivado de:", options: ["Okusole", "Okuvongola", "Okupandula", "Okulilongisa"], correct: 2, feedback: "'Okupandula' = agradecer." },
      ],
    },
    {
      title: "7 — Provérbios (Alupolo / Olusapo) e Sabedoria",
      content:
        "Os provérbios são muito valorizados na cultura umbundu. Transmitem sabedoria e ensinamentos.\n\n" +
        "• 'Akulu hati' — Aos mais velhos (respeito aos mais velhos)\n" +
        "• 'Nda wasanga ombia yo kaliye, kaciyo ka kowinesi' — Panela velha faz boa comida (a experiência tem valor)\n" +
        "• 'Unene wa ngando ko vava' — A força do jacaré está na água. Deixe estar o jacaré que já secará a lagoa (paciência e tempo resolvem)\n" +
        "• 'Nda vimbo muafa onjamba, ombangulo onjamba' — Se morre um elefante na aldeia, ele é o principal assunto (eventos importantes dominam as conversas)",
      order: 7,
      exercises: [
        { type: "FILL_BLANK", prompt: "O provérbio que ensina a respeitar os mais velhos é: '_____ _____'", answer: "Akulu hati", hint: "Aos mais velhos" },
        { type: "FILL_BLANK", prompt: "'Panela velha faz boa comida' corresponde a: 'Nda wasanga ombia yo _____'", answer: "kaliye", hint: "kaliye = velha" },
        { type: "FILL_BLANK", prompt: "Complete: 'Unene wa _____ ko vava' (a força do jacaré)", answer: "ngando", hint: "jacaré em umbundu" },
        { type: "TRANSLATE", prompt: "Traduz o ensinamento de 'Akulu hati'", answer: "Respeitar os mais velhos" },
        { type: "FILL_BLANK", prompt: "O provérbio sobre o elefante termina com: 'ombangulo _____'", answer: "onjamba", hint: "o assunto é o elefante" },
      ],
      quizzes: [
        { question: "O que ensina 'Nda wasanga ombia yo kaliye, kaciyo ka kowinesi'?", options: ["A juventude é melhor", "A experiência tem valor", "Panela nova é mais cara", "Comida fria é ruim"], correct: 1, feedback: "O provérbio valoriza a experiência dos mais velhos." },
        { question: "'Unene wa ngando ko vava' ensina principalmente:", options: ["A força da água", "Paciência e esperar o tempo certo", "Caçar jacarés", "Coragem para lutar"], correct: 1, feedback: "Ensinamos que com paciência, os problemas se resolvem." },
        { question: "Qual provérbio fala sobre o respeito à hierarquia?", options: ["Akulu hati", "Nda vimbo muafa onjamba", "Unene wa ngando", "Kaciyo ka kowinesi"], correct: 0, feedback: "'Akulu hati' significa 'Aos mais velhos'." },
      ],
    },
  ];

  for (const lessonData of umbunduLessons) {
    const created = await prisma.lesson.create({
      data: {
        courseId: umbundu.id,
        title: lessonData.title,
        content: lessonData.content,
        order: lessonData.order,
      },
    });
    for (const ex of lessonData.exercises) {
      await prisma.exercise.create({
        data: {
          type: ex.type,
          prompt: ex.prompt,
          answer: ex.answer,
          hint: ex.hint || null,
          lessonId: created.id,
        },
      });
    }
    for (const q of lessonData.quizzes) {
      await prisma.quiz.create({
        data: {
          lessonId: created.id,
          question: q.question,
          options: JSON.stringify(q.options),
          correct: q.correct,
         
        },
      });
    }
  }
  console.log("✅ Curso de Umbundu criado com 7 lições.");

  // ==================== INSCRIÇÕES ====================
  console.log("📝 A criar inscrições...");
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: english.id } },
    update: { status: "APPROVED" },
    create: { userId: student.id, courseId: english.id, status: "APPROVED" },
  });
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: umbundu.id } },
    update: { status: "APPROVED" },
    create: { userId: student.id, courseId: umbundu.id, status: "APPROVED" },
  });

  // ==================== NOTIFICAÇÃO ====================
  await prisma.notification.create({
    data: {
      userId: student.id,
      title: "Bem-vindo à Sofulano Ukulondja!",
      body: "A sua inscrição nos cursos de Inglês e Umbundu foi aprovada. Bons estudos!",
    },
  });

  console.log("\n✅ Seed concluído com sucesso!");
  
}

main()
  .catch((e) => { console.error("❌ Erro durante seed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());