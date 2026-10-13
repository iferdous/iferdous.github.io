/* Public portfolio content, summarized from Ismam's resume, CV, and UW course record. */
window.PORTFOLIO = {
  projects: {
    title: 'Projects',
    description: 'Products built around communication, public transit, and personal finance.',
    palette: ['#bed2b0', '#d8db9f', '#dfac7e', '#b8d2ce', '#59959f', '#477493'],
    entries: [
      {
        id: 'offscript', title: 'OffScript', meta: 'React / TypeScript / Web APIs',
        paragraphs: [
          'A public-speaking practice app with timed prompts, browser recording, live transcription, and useful feedback after each session.',
          'The review flow looks at pace, filler words, vocabulary variety, sentence structure, and rhythm so speakers can improve clarity without flattening their voice.'
        ],
        details: { title: 'Built with', items: ['React, TypeScript, and Vite', 'Web Speech API and Web Audio API', 'LocalStorage, Node.js, and ESLint'] }
      },
      {
        id: 'septascope', title: 'SeptaScope', meta: 'Node.js / Maps / GTFS-Realtime',
        paragraphs: [
          'A real-time SEPTA tracker that brings vehicle positions, delays, service alerts, route filters, and rider reports into one map.',
          'I also built a heuristic surge forecast to surface likely crowding while keeping the difference between live data and estimates explicit.'
        ],
        details: { title: 'Built with', items: ['Node.js and Express', 'MapLibre GL and Leaflet', 'GTFS-Realtime transit feeds'] },
        links: [{ label: 'Source on GitHub', url: 'https://github.com/iferdous/SeptaScope' }]
      },
      {
        id: 'budgetwise', title: 'BudgetWise', meta: 'SwiftUI / Firebase / iOS',
        paragraphs: [
          'A personal finance tracker for categorizing expenses, reading monthly summaries, and turning spending history into practical budgeting guidance.',
          'The app uses real-time Firebase synchronization and keeps each user profile and its financial data separate.'
        ],
        details: { title: 'Product work', items: ['SwiftUI interface and application logic', 'Firebase data model and synchronization', 'Personalized budgeting insights'] },
        links: [{ label: 'Source on GitHub', url: 'https://github.com/iferdous/finance-tracker-IOS' }]
      }
    ]
  },
  research: {
    title: 'Experience & research',
    description: 'Software, research, teaching, and support work across UW-Madison and Philadelphia.',
    palette: ['#a2c7d0', '#487a9b', '#b5c0bd', '#dbca9a', '#b7cca9', '#74a49e'],
    entries: [
      {
        id: 'waisman', title: 'Waisman Center', meta: 'Undergraduate research assistant / Sep 2026 - present',
        paragraphs: [
          'At the Auditory Encoding & Processing Optimization Lab, I develop interactive visualization and tracking tools for electrophysiological and behavioral measures used in cochlear-implant research.',
          'I also contribute Python to an automated speech-recognition system that evaluates speech perception under cochlear-implant simulations and altered auditory encoding.'
        ],
        details: { title: 'Focus', items: ['Scientific data visualization', 'Python research tooling', 'Auditory perception and cochlear-implant simulation'] }
      },
      {
        id: 'niedenthal', title: 'Niedenthal Emotions Lab', meta: 'Software engineer + research assistant / Jun 2026 - present',
        paragraphs: [
          'I built a real-time video-call platform for social-connection research, where researchers can alter facial-expression and voice cues shown to each participant.',
          'The system combines MediaPipe face tracking, mouth-region morphing, Web Audio pitch shifting, participant calibration, synchronized recordings, telemetry, and researcher controls.'
        ],
        details: { title: 'Systems', items: ['Real-time video and WebRTC workflows', 'Computer vision and MediaPipe', 'Web Audio, researcher dashboards, and CSV telemetry'] }
      },
      {
        id: 'heights', title: 'Heights Philadelphia + Penn Engineering', meta: 'BLI computer science instructor / Jun - Jul 2026',
        paragraphs: [
          'I taught intermediate Java, algorithms, physics, and calculus to Philadelphia high-school students through project-based lessons with MIT4America.',
          'I wrote curriculum, mentored individual coding projects, and led guided experimental-physics labs.'
        ]
      },
      {
        id: 'uw-help-desk', title: 'UW-Madison IT Help Desk', meta: 'Support specialist / Sep 2025 - Jan 2026',
        paragraphs: [
          'I troubleshot hardware, software, networking, and classroom-technology issues across macOS and Windows.',
          'I also managed the circulation, reimaging, and maintenance of laptops, cameras, printers, and AV equipment.'
        ]
      },
      {
        id: 'learnstem', title: 'LearnSTEM', meta: 'Student researcher / Jul 2024 - Jan 2025',
        paragraphs: [
          'I implemented classification, regression, generative models, and convolutional neural networks in Python and PyTorch for MRI analysis and diagnostic prediction.',
          'The work connected model evaluation with linear algebra, probability, statistics, and clear communication of results.'
        ]
      },
      {
        id: 'flisci', title: 'FLi Sci', meta: 'Data science researcher / Oct 2024 - May 2025',
        paragraphs: [
          'I used clustering and regression in R to study socioeconomic data and identify patterns in regional income disparity.',
          'I conducted statistical analysis and presented the findings to faculty and peers under graduate-level mentorship.'
        ]
      }
    ]
  },
  learning: {
    title: 'Learning',
    description: 'Computer science and mathematics, grounded in systems, statistics, and the mathematics behind machine learning.',
    palette: ['#ccd6af', '#94b39b', '#e2cba2', '#cf9a87', '#7aa7aa', '#b1c9d3'],
    entries: [
      {
        id: 'uw-madison', title: 'University of Wisconsin-Madison', meta: 'B.S. Computer Science + Mathematics / expected May 2029',
        paragraphs: ['I study computer science and mathematics at UW-Madison, where I am building depth in algorithms, systems, statistics, and machine learning.'],
        details: { title: 'Current foundation', items: ['Data structures and advanced algorithms', 'Computer architecture and systems programming', 'Statistical modeling, multivariable calculus, and linear algebra'] }
      },
      {
        id: 'coursework', title: 'Selected coursework', meta: 'CS / ECE / STAT / MATH',
        details: { title: 'Courses', items: ['COMP SCI 300 and 400 - data structures, algorithms, and software engineering', 'COMP SCI 240 and 354 - discrete mathematics and machine organization', 'COMP SCI 252 - computer engineering and processor architecture', 'STAT 240 - data science modeling in R', 'MATH 234 and 340 - multivariable calculus and linear algebra'] }
      },
      {
        id: 'toolkit', title: 'Technical toolkit', meta: 'Software / web / mobile / machine learning',
        paragraphs: ['I choose tools around the shape of the problem, then work across the stack when a project needs it.'],
        details: { title: 'Working with', items: ['Python, Java, TypeScript, JavaScript, R, MATLAB, Swift, Kotlin, and SQL', 'React, Next.js, Electron, Node.js, SwiftUI, Tailwind CSS, HTML/CSS, and WebRTC', 'PyTorch, TensorFlow, Scikit-learn, MediaPipe, Pandas, Git, GitHub, and Firebase'] }
      }
    ]
  },
  coursework: {
    title: 'Course work',
    description: 'UW-Madison courses organized by the semesters I attended.',
    palette: ['#d4c49d', '#95b2a8', '#73929e', '#c58f78', '#b7c89b', '#a7b9c9'],
    entries: [
      {
        id: 'fall-2025', title: 'Fall 2025', meta: 'UW-Madison / 15 credits',
        details: {
          title: 'Courses',
          items: [
            'COMP SCI 300 - Programming II',
            'CNSR SCI 251 - Financial Services Leadership Symposium',
            'HISTORY 120 - Europe and the Modern World, 1815 to the Present',
            'MATH 340 - Elementary Matrix and Linear Algebra',
            'STAT 240 - Data Science Modeling I'
          ]
        }
      },
      {
        id: 'spring-2026', title: 'Spring 2026', meta: 'UW-Madison / 17 credits',
        details: {
          title: 'Courses',
          items: [
            'COMP SCI 252 - Introduction to Computer Engineering',
            'COMP SCI 400 - Programming III',
            'ENGL 100 - Introduction to College Composition',
            'HISTORY 309 - Crusades: Christianity and Islam',
            'MATH 234 - Calculus: Functions of Several Variables'
          ]
        }
      },
      {
        id: 'fall-2026', title: 'Fall 2026', meta: 'UW-Madison / current semester / 17 credits',
        details: {
          title: 'Courses',
          items: [
            'ASIAN AM 220 - Ethnic Movements in the United States',
            'CS&D 699 - Directed Study',
            'COMP SCI 240 - Introduction to Discrete Mathematics',
            'COMP SCI 354 - Machine Organization and Programming',
            'MATH 340 - Elementary Matrix and Linear Algebra',
            'PSYCH 621 - Mentored Research and Seminar: Human Emotions Lab'
          ]
        }
      }
    ]
  },
  readings: {
    title: 'Readings',
    description: '',
    palette: ['#c9c1a5', '#91a99f', '#7899a4', '#c49580', '#a9bb96', '#98aeb8'],
    entries: []
  },
  photography: {
    title: 'Photography',
    description: '',
    palette: ['#c5cfcd', '#7f9ca8', '#c2bab2', '#e3c6ad', '#a9c2b5', '#638b9c'],
    entries: [],
    gallery: true
  },
  outside: {
    title: 'Outside the classroom',
    description: '',
    palette: ['#d5d99b', '#8cad9e', '#adcbd1', '#e0ad83', '#c18679', '#73a3b1'],
    entries: []
  }
};

window.PHOTOGRAPHS = [];
