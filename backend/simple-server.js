const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5002;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Basic request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock data for portfolio
const portfolioData = {
  about: {
    name: "Kale Sinclair",
    title: "Biomedical Engineering Student",
    university: "FAMU-FSU College of Engineering",
    bio: "Passionate Biomedical Engineering student focused on creating innovative healthcare solutions through technology."
  },
  skills: {
    "Engineering Tools": [
      { name: "MATLAB", level: 70, icon: "🔬" },
      { name: "Simulink", level: 45, icon: "📊" },
      { name: "Biomedical Design", level: 80, icon: "🔧" },
      { name: "Device Development", level: 50, icon: "🏥" },
      { name: "Process Engineering", level: 85, icon: "⚙️" },
      { name: "Regulatory Compliance", level: 82, icon: "📋" },
      { name: "Quality Control", level: 85, icon: "✅" }
    ],
    "Healthcare Technology": [
      { name: "Patient Care Technology", level: 88, icon: "👨‍⚕️" },
      { name: "Healthcare Systems", level: 85, icon: "🏥" },
      { name: "Medical Imaging", level: 80, icon: "🖼️" },
      { name: "Diagnostic Technology", level: 85, icon: "🔍" },
      { name: "Electronic Health Records", level: 75, icon: "📱" },
      { name: "Telemedicine", level: 70, icon: "💻" },
      { name: "Wearable Health Tech", level: 78, icon: "⌚" }
    ],
    "Programming & Technology": [
      { name: "Python", level: 85, icon: "🐍" },
      { name: "JavaScript", level: 70, icon: "📜" },
      { name: "React Native", level: 70, icon: "📱" },
      { name: "C++", level: 75, icon: "💻" },
      { name: "Arduino/IoT", level: 80, icon: "🔌" },
      { name: "Data Analysis", level: 80, icon: "📊" },
      { name: "Database Management", level: 68, icon: "🗄️" },
      { name: "Version Control (Git)", level: 72, icon: "🔀" }
    ],
    "Combat Sports & Athletics": [
      { name: "Boxing Technique", level: 95, icon: "🥊" },
      { name: "Wrestling", level: 90, icon: "🤼" },
      { name: "Strength Training", level: 92, icon: "💪" },
      { name: "Cardio Conditioning", level: 90, icon: "🏃" },
      { name: "Ring Strategy", level: 88, icon: "🎯" },
      { name: "Athletic Training", level: 85, icon: "🏋️" },
      { name: "Nutrition Planning", level: 80, icon: "🥗" },
      { name: "Mental Toughness", level: 95, icon: "🧠" }
    ],
    "Interpersonal & Soft Skills": [
      { name: "Patient Communication", level: 90, icon: "💬" },
      { name: "Team Collaboration", level: 88, icon: "🤝" },
      { name: "Leadership", level: 82, icon: "👑" },
      { name: "Problem Solving", level: 90, icon: "🧩" },
      { name: "Time Management", level: 85, icon: "⏰" },
      { name: "Presentation Skills", level: 80, icon: "🎤" },
      { name: "Critical Thinking", level: 88, icon: "🤔" },
      { name: "Adaptability", level: 85, icon: "🔄" }
    ]
  },
  projects: [
    {
      projectTitle: "Trauma Flow App",
      projectSubTitle: "Healthcare Technology",
      projectTimeline: "2024 - Present",
      projectTagline: "Mobile application designed to streamline trauma patient workflow and improve emergency response times in healthcare settings",
      projectLink: "trauma-flow-app",
      projectImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=Trauma+Flow+App"
      ],
      technologies: ["React Native", "Healthcare Systems", "Mobile Development"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: true,
      likesCount: 0
    },
    {
      projectTitle: "HazWatch - Safety Monitoring System",
      projectSubTitle: "IoT & Wearable Technology",
      projectTimeline: "2024 - Present",
      projectTagline: "Wearable safety monitoring system for hazardous work environments with real-time health tracking and alert systems",
      projectLink: "hazwatch-safety-system",
      projectImages: [
        "https://via.placeholder.com/400x300/EE7624/FFFFFF?text=HazWatch+System"
      ],
      technologies: ["IoT", "Wearable Tech", "Safety Systems", "Arduino"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: false,
      likesCount: 0
    },
    {
      projectTitle: "Training Tracker",
      projectSubTitle: "Fitness & Sports Technology",
      projectTimeline: "2023 - Present",
      projectTagline: "Comprehensive fitness and training tracking application with progress analytics, goal setting, and performance monitoring",
      projectLink: "training-tracker",
      projectImages: [
        "https://via.placeholder.com/400x300/CEB888/000000?text=Training+Tracker"
      ],
      technologies: ["Mobile Development", "Data Analytics", "Fitness Tech"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: false,
      likesCount: 0
    },
    {
      projectTitle: "Mass Energy Balance Bible",
      projectSubTitle: "Biomedical Engineering Education",
      projectTimeline: "2024 - Present",
      projectTagline: "Educational resource and calculation tool for mass and energy balance principles in biomedical engineering applications",
      projectLink: "mass-energy-balance-bible",
      projectImages: [
        "https://via.placeholder.com/400x300/008344/FFFFFF?text=Mass+Energy+Bible"
      ],
      technologies: ["Engineering Calculations", "Educational Software", "MATLAB"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: false,
      likesCount: 0
    },
    {
      projectTitle: "Process Bible",
      projectSubTitle: "Process Engineering",
      projectTimeline: "2024 - Present",
      projectTagline: "Comprehensive guide and toolkit for biomedical process engineering and optimization methodologies",
      projectLink: "process-bible",
      projectImages: [
        "https://via.placeholder.com/400x300/5CB8B2/FFFFFF?text=Process+Bible"
      ],
      technologies: ["Process Engineering", "Documentation", "Engineering Tools"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: false,
      likesCount: 0
    },
    {
      projectTitle: "AI Calendar",
      projectSubTitle: "Artificial Intelligence",
      projectTimeline: "2024 - Present",
      projectTagline: "Intelligent calendar application with AI-powered scheduling optimization and smart time management features",
      projectLink: "ai-calendar",
      projectImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=AI+Calendar"
      ],
      technologies: ["Artificial Intelligence", "Calendar Systems", "Machine Learning"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: false,
      likesCount: 0
    },
    {
      projectTitle: "Panada Strip",
      projectSubTitle: "Biomedical Devices",
      projectTimeline: "2024 - Present",
      projectTagline: "Innovative biomedical testing strip technology for rapid diagnostic applications in clinical settings",
      projectLink: "panada-strip",
      projectImages: [
        "https://via.placeholder.com/400x300/EE7624/FFFFFF?text=Panada+Strip"
      ],
      technologies: ["Biomedical Devices", "Diagnostic Technology", "Lab Testing"],
      github: "#",
      demo: "#",
      status: "In Development",
      featured: false,
      likesCount: 0
    }
  ],
  involvements: [
    {
      involvementTitle: "FSU Renegade Boxing Club",
      involvementSubTitle: "Active Member & Competitor",
      involvementTimeline: "2022 - Present",
      involvementTagline: "Developing boxing technique, physical conditioning, and mental discipline through competitive training and tournaments",
      involvementLink: "fsu-renegade-boxing-club",
      involvementImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=FSU+Boxing+Club"
      ],
      activities: ["Competitive Boxing", "Technical Training", "Physical Conditioning", "Tournament Participation"],
      featured: true,
      likesCount: 0
    },
    {
      involvementTitle: "Gainz Boxing Club",
      involvementSubTitle: "Training Member",
      involvementTimeline: "2023 - Present",
      involvementTagline: "Advanced boxing training focused on technique refinement, strength building, and competitive preparation",
      involvementLink: "gainz-boxing-club",
      involvementImages: [
        "https://via.placeholder.com/400x300/EE7624/FFFFFF?text=Gainz+Boxing"
      ],
      activities: ["Advanced Boxing Training", "Strength & Conditioning", "Technical Development", "Sparring"],
      featured: false,
      likesCount: 0
    },
    {
      involvementTitle: "Generational Relief in Prosthetics (GRiP)",
      involvementSubTitle: "Biomedical Engineering Volunteer",
      involvementTimeline: "2023 - Present",
      involvementTagline: "Contributing to prosthetic device development and accessibility initiatives to improve quality of life for amputees",
      involvementLink: "generational-relief-prosthetics",
      involvementImages: [
        "https://via.placeholder.com/400x300/008344/FFFFFF?text=GRiP+Prosthetics"
      ],
      activities: ["Prosthetic Design", "Community Outreach", "Medical Device Development", "Patient Support"],
      featured: false,
      likesCount: 0
    },
    {
      involvementTitle: "Society of Petroleum Engineers (SPE)",
      involvementSubTitle: "Student Member",
      involvementTimeline: "2023 - Present",
      involvementTagline: "Engaging with energy industry professionals and advancing knowledge in petroleum engineering and energy technologies",
      involvementLink: "society-petroleum-engineers",
      involvementImages: [
        "https://via.placeholder.com/400x300/CEB888/000000?text=SPE+Member"
      ],
      activities: ["Professional Networking", "Technical Workshops", "Industry Events", "Energy Technology Research"],
      featured: false,
      likesCount: 0
    },
    {
      involvementTitle: "Biomedical Engineering Society (BMES)",
      involvementSubTitle: "Active Student Member",
      involvementTimeline: "2022 - Present",
      involvementTagline: "Participating in biomedical engineering advancement through research collaboration, professional development, and innovation",
      involvementLink: "biomedical-engineering-society",
      involvementImages: [
        "https://via.placeholder.com/400x300/5CB8B2/FFFFFF?text=BMES+Society"
      ],
      activities: ["Research Collaboration", "Professional Development", "Technical Presentations", "Innovation Projects"],
      featured: false,
      likesCount: 0
    },
    {
      involvementTitle: "National Society of Black Engineers (NSBE)",
      involvementSubTitle: "Student Chapter Member",
      involvementTimeline: "2022 - Present",
      involvementTagline: "Promoting diversity in engineering through academic excellence, professional development, and community service",
      involvementLink: "national-society-black-engineers",
      involvementImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=NSBE+Chapter"
      ],
      activities: ["Academic Excellence", "Community Service", "Professional Development", "Mentorship Programs"],
      featured: false,
      likesCount: 0
    }
  ],
  experience: [
    {
      experienceTitle: "Therapy Technician",
      experienceSubTitle: "PT Solutions Physical Therapy",
      experienceTimeline: "2024 - Present",
      experienceTagline: "Assisting licensed physical therapists with patient care, equipment maintenance, and therapeutic exercise programs to support patient recovery and rehabilitation",
      experienceLink: "pt-solutions-therapy-tech",
      experienceImages: [
        "https://via.placeholder.com/400x300/008344/FFFFFF?text=PT+Solutions"
      ],
      responsibilities: ["Patient Care Assistance", "Equipment Maintenance", "Therapeutic Exercise Support", "Recovery Documentation"],
      featured: true,
      likesCount: 0
    },
    {
      experienceTitle: "Professional Tax Preparer",
      experienceSubTitle: "Jackson Hewitt Tax Service",
      experienceTimeline: "2023 - 2024",
      experienceTagline: "Providing professional tax preparation services, ensuring accurate filing and maximizing client refunds while maintaining compliance with federal and state regulations",
      experienceLink: "jackson-hewitt-tax-preparer",
      experienceImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=Jackson+Hewitt"
      ],
      responsibilities: ["Tax Return Preparation", "Client Consultation", "Regulatory Compliance", "Financial Documentation"],
      featured: false,
      likesCount: 0
    },
    {
      experienceTitle: "Night Shift Cashier Assistant",
      experienceSubTitle: "Circle K Gas Station",
      experienceTimeline: "2022 - 2023",
      experienceTagline: "Managing overnight operations including customer service, inventory management, and store security while ensuring safe and efficient service delivery",
      experienceLink: "circle-k-cashier-assistant",
      experienceImages: [
        "https://via.placeholder.com/400x300/CEB888/000000?text=Circle+K"
      ],
      responsibilities: ["Customer Service", "Inventory Management", "Store Security", "Cash Handling"],
      featured: false,
      likesCount: 0
    },
    {
      experienceTitle: "Leather Worker",
      experienceSubTitle: "The Speakeasy Leather Co.",
      experienceTimeline: "2021 - 2022",
      experienceTagline: "Crafting high-quality leather goods through traditional techniques, custom design work, and precision manufacturing of artisanal leather products",
      experienceLink: "speakeasy-leather-worker",
      experienceImages: [
        "https://via.placeholder.com/400x300/5CB8B2/FFFFFF?text=Speakeasy+Leather"
      ],
      responsibilities: ["Leather Crafting", "Custom Design", "Quality Control", "Artisan Manufacturing"],
      featured: false,
      likesCount: 0
    }
  ],
  honors: [
    {
      honorTitle: "Beine Award",
      honorSubTitle: "Academic Excellence Recognition",
      honorTimeline: "2024",
      honorTagline: "Prestigious academic award recognizing outstanding achievement and dedication in biomedical engineering studies and research excellence",
      honorLink: "beine-award",
      honorImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=Beine+Award"
      ],
      achievements: ["Academic Excellence", "Research Recognition", "Engineering Leadership", "Scholarly Achievement"],
      featured: true,
      likesCount: 0
    },
    {
      honorTitle: "The Best Vs The Best Competition Winner",
      honorSubTitle: "Athletic Achievement",
      honorTimeline: "2023",
      honorTagline: "First place victory in competitive athletic tournament demonstrating exceptional skill, strategy, and mental toughness in high-level competition",
      honorLink: "best-vs-best-winner",
      honorImages: [
        "https://via.placeholder.com/400x300/F4811F/FFFFFF?text=Best+Vs+Best"
      ],
      achievements: ["First Place Victory", "Athletic Excellence", "Competitive Strategy", "Mental Toughness"],
      featured: false,
      likesCount: 0
    },
    {
      honorTitle: "Salvation Army Volunteer Work",
      honorSubTitle: "Community Service",
      honorTimeline: "2022 - Present",
      honorTagline: "Dedicated community service supporting homeless assistance programs, food distribution, and community outreach initiatives with The Salvation Army",
      honorLink: "salvation-army-volunteer",
      honorImages: [
        "https://via.placeholder.com/400x300/008344/FFFFFF?text=Salvation+Army"
      ],
      achievements: ["Community Service", "Homeless Assistance", "Food Distribution", "Outreach Programs"],
      featured: false,
      likesCount: 0
    },
    {
      honorTitle: "Wrestling Event Volunteer Work",
      honorSubTitle: "Sports Event Coordination",
      honorTimeline: "2021 - Present",
      honorTagline: "Volunteer coordination and support for wrestling tournaments and events, ensuring smooth operations and positive athlete experiences",
      honorLink: "wrestling-event-volunteer",
      honorImages: [
        "https://via.placeholder.com/400x300/CEB888/000000?text=Wrestling+Events"
      ],
      achievements: ["Event Coordination", "Sports Management", "Volunteer Leadership", "Athletic Support"],
      featured: false,
      likesCount: 0
    },
    {
      honorTitle: "BLS Certification",
      honorSubTitle: "Basic Life Support Certified",
      honorTimeline: "2023 - Present",
      honorTagline: "American Heart Association Basic Life Support certification demonstrating proficiency in emergency response and life-saving medical procedures",
      honorLink: "bls-certification",
      honorImages: [
        "https://via.placeholder.com/400x300/5CB8B2/FFFFFF?text=BLS+Certified"
      ],
      achievements: ["Emergency Response", "Life Support Skills", "Medical Training", "CPR Certification"],
      featured: false,
      likesCount: 0
    },
    {
      honorTitle: "Associate in Arts General Education Degree",
      honorSubTitle: "Academic Achievement",
      honorTimeline: "2022",
      honorTagline: "Completed Associate in Arts degree with focus on general education foundation, demonstrating broad academic competency and college readiness",
      honorLink: "associate-arts-degree",
      honorImages: [
        "https://via.placeholder.com/400x300/782F40/FFFFFF?text=AA+Degree"
      ],
      achievements: ["Academic Completion", "General Education", "College Readiness", "Foundational Knowledge"],
      featured: false,
      likesCount: 0
    }
  ]
};

// API Routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Server is running!', status: 'success' });
});

app.get('/api/portfolio', (req, res) => {
  res.json(portfolioData);
});

app.get('/api/about', (req, res) => {
  res.json(portfolioData.about);
});

app.get('/api/skills', (req, res) => {
  res.json(portfolioData.skills);
});

app.get('/api/getskills', (req, res) => {
  res.json(portfolioData.skills);
});

app.get('/api/projects', (req, res) => {
  res.json(portfolioData.projects);
});

app.get('/api/getprojects', (req, res) => {
  res.json(portfolioData.projects);
});

app.get('/api/getprojects/:projectLink', (req, res) => {
  const projectLink = req.params.projectLink;
  const project = portfolioData.projects.find(p => p.projectLink === projectLink);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

app.get('/api/experience', (req, res) => {
  res.json(portfolioData.experience);
});

app.get('/api/involvements', (req, res) => {
  res.json(portfolioData.involvements);
});

app.get('/api/getinvolvements', (req, res) => {
  res.json(portfolioData.involvements);
});

app.get('/api/getinvolvements/:involvementLink', (req, res) => {
  const involvementLink = req.params.involvementLink;
  const involvement = portfolioData.involvements.find(i => i.involvementLink === involvementLink);
  if (involvement) {
    res.json(involvement);
  } else {
    res.status(404).json({ error: 'Involvement not found' });
  }
});

app.get('/api/honors', (req, res) => {
  res.json(portfolioData.honors);
});

app.get('/api/gethonors', (req, res) => {
  res.json(portfolioData.honors);
});

app.get('/api/gethonors/:honorLink', (req, res) => {
  const honorLink = req.params.honorLink;
  const honor = portfolioData.honors.find(h => h.honorLink === honorLink);
  if (honor) {
    res.json(honor);
  } else {
    res.status(404).json({ error: 'Honor not found' });
  }
});

// Missing endpoints that frontend is requesting
app.get('/api/must-load-images', (req, res) => {
  res.json([
    '/contact-bg.webp',
    '/home-bg.webp',
    '/about-bg.webp'
  ]);
});

app.get('/api/dynamic-images', (req, res) => {
  res.json([
    '/projects-bg.webp',
    '/skills-bg.webp',
    '/experience-bg.webp'
  ]);
});

app.get('/api/getskillcomponents', (req, res) => {
  res.json(portfolioData.skills);
});

app.get('/api/getexperiences', (req, res) => {
  res.json(portfolioData.experience);
});

app.get('/api/github-stats/top-langs', (req, res) => {
  // Mock GitHub language stats
  res.json({
    "Python": { "size": 35, "color": "#3776ab" },
    "JavaScript": { "size": 25, "color": "#f1e05a" },
    "C++": { "size": 20, "color": "#f34b7d" },
    "MATLAB": { "size": 15, "color": "#e16737" },
    "CSS": { "size": 5, "color": "#563d7c" }
  });
});

// Like functionality
app.post('/api/addLike', (req, res) => {
  const { type, id } = req.body;

  if (type === 'project') {
    const project = portfolioData.projects.find(p => p.projectLink === id);
    if (project) {
      project.likesCount = (project.likesCount || 0) + 1;
      res.json({ success: true, likesCount: project.likesCount });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } else if (type === 'involvement') {
    const involvement = portfolioData.involvements.find(i => i.involvementLink === id);
    if (involvement) {
      involvement.likesCount = (involvement.likesCount || 0) + 1;
      res.json({ success: true, likesCount: involvement.likesCount });
    } else {
      res.status(404).json({ error: 'Involvement not found' });
    }
  } else if (type === 'experience') {
    const experience = portfolioData.experience.find(e => e.experienceLink === id);
    if (experience) {
      experience.likesCount = (experience.likesCount || 0) + 1;
      res.json({ success: true, likesCount: experience.likesCount });
    } else {
      res.status(404).json({ error: 'Experience not found' });
    }
  } else {
    res.status(400).json({ error: 'Invalid type' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Simple portfolio server running on port ${PORT}`);
});