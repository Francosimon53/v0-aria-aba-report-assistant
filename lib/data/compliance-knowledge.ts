export const hipaaGuidelines = {
  overview: `HIPAA (Health Insurance Portability and Accountability Act) protects patient health information (PHI). ABA providers must comply with HIPAA regulations when handling client data.`,

  phi_definition: [
    "Names, addresses, and contact information",
    "Social Security numbers",
    "Medical record numbers",
    "Health insurance information",
    "Diagnosis codes",
    "Assessment results and clinical notes",
    "Session data and progress reports",
    "Photographs or videos of clients",
  ],

  requirements: [
    {
      title: "Administrative Safeguards",
      items: [
        "Designate a Privacy Officer",
        "Conduct regular risk assessments",
        "Train all staff on HIPAA policies",
        "Implement access controls for PHI",
        "Create written policies and procedures",
      ],
    },
    {
      title: "Physical Safeguards",
      items: [
        "Secure storage for paper records",
        "Lock file cabinets and offices",
        "Control facility access",
        "Properly dispose of PHI (shredding)",
        "Secure workstations when unattended",
      ],
    },
    {
      title: "Technical Safeguards",
      items: [
        "Use encrypted electronic communications",
        "Implement secure password policies",
        "Use HIPAA-compliant software",
        "Regular data backups",
        "Audit logs for PHI access",
      ],
    },
  ],

  bestPractices: [
    "Never discuss client information in public areas",
    "Use secure, encrypted email for PHI transmission",
    "Obtain written consent before sharing information",
    "Limit PHI access to only those who need it",
    "Report breaches within 60 days",
    "Keep Business Associate Agreements (BAAs) with vendors",
  ],
}

export const abaEthicsGuidelines = [
  {
    code: "1.0 Responsible Conduct",
    description:
      "BCBAs act with integrity, maintain high standards, and comply with professional and legal requirements.",
  },
  {
    code: "2.0 Competence",
    description:
      "Provide services only within scope of competence based on education, training, and supervised experience.",
  },
  {
    code: "3.0 Responsibility to Clients",
    description: "Put client needs first, maintain confidentiality, and obtain informed consent.",
  },
  {
    code: "4.0 Responsibility to Stakeholders",
    description: "Communicate effectively with parents, caregivers, and other professionals involved in client care.",
  },
]

export const insuranceCompliance = {
  bcbs: {
    name: "Blue Cross Blue Shield",
    requirements: [
      "Medical necessity statement required",
      "Initial assessment within 30 days of authorization",
      "Progress reports every 6 months",
      "Treatment plan updates quarterly",
      "Must demonstrate skill acquisition or behavior reduction",
    ],
    documentation: [
      "Detailed baseline data",
      "Measurable treatment goals",
      "Progress graphs and data sheets",
      "Parent training documentation",
      "School collaboration notes",
    ],
  },
  aetna: {
    name: "Aetna",
    requirements: [
      "Pre-authorization required before services begin",
      "Comprehensive assessment report",
      "Treatment plan with specific, measurable goals",
      "Monthly progress summaries",
      "Reauthorization every 6 months",
    ],
    documentation: [
      "Functional behavior assessment (FBA)",
      "Skill acquisition programs",
      "Data collection sheets",
      "Caregiver training logs",
      "Clinical notes for each session",
    ],
  },
  medicaid: {
    name: "Medicaid",
    requirements: [
      "State-specific authorization process",
      "Medical necessity criteria varies by state",
      "Detailed treatment plan required",
      "Progress notes for every session",
      "Quarterly progress reports",
    ],
    documentation: [
      "Comprehensive assessment",
      "Individualized treatment plan",
      "Daily session notes",
      "Monthly data summaries",
      "Parent/caregiver participation logs",
    ],
  },
}

export const faqs = [
  {
    category: "Assessment & Diagnosis",
    questions: [
      {
        q: "What assessments are typically required for ABA services?",
        a: "Common assessments include VB-MAPP, ABLLS-R, PEAK, and adaptive behavior assessments like Vineland-3. The specific assessment depends on the client's age, skills, and insurance requirements.",
      },
      {
        q: "How do I justify the need for ABA services?",
        a: "Document specific skill deficits, challenging behaviors, and functional impairments. Include baseline data, explain how deficits impact daily functioning, and reference evidence-based research supporting ABA for the client's diagnosis.",
      },
      {
        q: "What qualifies as medical necessity?",
        a: "Medical necessity requires: (1) diagnosis of autism or related condition, (2) significant functional impairment, (3) evidence that ABA will improve functioning, and (4) no less intensive treatment would be effective.",
      },
    ],
  },
  {
    category: "Treatment Planning",
    questions: [
      {
        q: "How many treatment hours should I recommend?",
        a: "Hours depend on severity of deficits, age, and intensity of need. Typical ranges: 10-15 hours (mild), 20-30 hours (moderate), 30-40 hours (severe). Always justify with assessment data and research.",
      },
      {
        q: "What makes a good treatment goal?",
        a: "Goals should be SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. Include baseline level, target criteria, measurement method, and expected timeline.",
      },
      {
        q: "How often should goals be updated?",
        a: "Review goals monthly and update quarterly or when mastered. Most insurances require progress reports every 3-6 months showing goal advancement.",
      },
    ],
  },
  {
    category: "Documentation",
    questions: [
      {
        q: "What should be included in session notes?",
        a: "Document date, duration, services provided, interventions used, client responses, data collected, progress toward goals, and parent/caregiver involvement.",
      },
      {
        q: "How long should I keep client records?",
        a: "Maintain records for at least 7 years after last service date (longer if client is a minor). Check state requirements as some mandate 10+ years.",
      },
      {
        q: "What's required for a progress report?",
        a: "Include current skill levels, progress on each goal (with data/graphs), new skills acquired, ongoing challenges, treatment plan updates, and recommendations for continued services.",
      },
    ],
  },
  {
    category: "HIPAA & Privacy",
    questions: [
      {
        q: "Can I discuss a client case in a team meeting?",
        a: "Yes, but only share minimum necessary information with team members directly involved in care. Use secure locations and don't use full names in public settings.",
      },
      {
        q: "How should I send assessment reports to insurance?",
        a: "Use secure, encrypted methods like HIPAA-compliant portals or encrypted email. Never send PHI via regular email or text message.",
      },
      {
        q: "What do I do if there's a data breach?",
        a: "Immediately notify your Privacy Officer, document the breach, determine which clients were affected, and notify affected individuals within 60 days per HIPAA requirements.",
      },
    ],
  },
]
