// Help Center data structure with all categories and articles

export interface Article {
  slug: string
  title: string
  content: string
  isNew?: boolean
}

export interface Category {
  id: string
  slug: string
  name: string
  icon: string
  articles: Article[]
}

export const helpCategories: Category[] = [
  {
    id: "getting-started",
    slug: "getting-started",
    name: "Getting Started",
    icon: "Rocket",
    articles: [
      {
        slug: "what-is-aria",
        title: "What is ARIA?",
        content: `
# What is ARIA?

ARIA (ABA Report & Intervention Assistant) is an AI-powered platform designed specifically for BCBAs that reduces assessment documentation time from 6-10 hours to 1-2 hours while maintaining insurance compliance standards.

## Key Features

- **21-section comprehensive reports** - All required sections for initial assessments and reassessments
- **AI-powered content generation** - Generate clinical narratives with one click
- **Standardized assessment integrations** - ABLLS-R, Vineland-3, SRS-2, MAS built-in
- **Insurance compliance** - Pre-configured for all major payers
- **HIPAA-compliant** - Enterprise-grade security and encryption

## Who is ARIA for?

ARIA is designed for:
- Board Certified Behavior Analysts (BCBAs)
- ABA therapy clinics and practices
- Behavioral health organizations
- Independent practitioners

## How does ARIA save time?

Traditional assessment documentation requires 6-10 hours of manual writing. ARIA reduces this to 1-2 hours by:

1. **Auto-populating data** across sections
2. **AI-generating clinical narratives** based on your inputs
3. **Pre-formatting** for insurance requirements
4. **Learning from your edits** to improve future generations
        `,
      },
      {
        slug: "creating-first-assessment",
        title: "Creating your first assessment",
        content: `
# Creating Your First Assessment

Follow these steps to create your first assessment in ARIA.

## Step 1: Start a New Assessment

1. From the Dashboard, click **"New Assessment"**
2. Choose between **Initial Assessment** or **Reassessment**
3. You'll be taken to the assessment wizard

## Step 2: Enter Client Information

Fill in the required client details:
- Client name and date of birth
- Diagnosis and DSM-5 level
- Insurance information
- Parent/guardian contact details

## Step 3: Complete Assessment Sections

Work through each section in the sidebar:
- Use the **✨ Generate** buttons to create AI content
- Review and edit generated text as needed
- Save your progress frequently (auto-save is enabled)

## Step 4: Generate Your Report

1. Navigate to **Generate Report** in the sidebar
2. Click **"Generate All Sections"** or generate individually
3. Review the complete report
4. Export as PDF or DOCX

## Tips for Success

- Fill in as much data as possible before generating AI content
- The more context you provide, the better the AI output
- Always review and customize generated content
- Use the learning system - ARIA improves with your edits
        `,
      },
      {
        slug: "understanding-dashboard",
        title: "Understanding the dashboard",
        content: `
# Understanding the Dashboard

The ARIA dashboard is your central hub for managing assessments and tracking your progress.

## Dashboard Sections

### Quick Stats
- **Total Assessments** - Number of assessments created
- **Time Saved** - Estimated hours saved using ARIA
- **This Month** - Assessments completed this month

### Recent Assessments
View and continue working on your recent assessments. Click any assessment to resume editing.

### Quick Actions
- **New Initial Assessment** - Start a fresh initial assessment
- **New Reassessment** - Create a reassessment for an existing client
- **Try Demo** - Explore ARIA with sample data (for new users)

### Navigation
Use the sidebar to access:
- Assessment wizard
- Report generation
- Settings and account
- Help center
        `,
      },
      {
        slug: "navigation-overview",
        title: "Navigation overview",
        content: `
# Navigation Overview

ARIA's navigation is designed to guide you through the assessment process efficiently.

## Main Navigation

### Sidebar (Assessment Mode)
When working on an assessment, the left sidebar shows:
- **Client Information** section group
- **Assessment** section group
- **Reports & Documents** section group
- **Generate Report** link

### Section Progress
Each section shows:
- ✓ Checkmark when complete
- Current section is highlighted
- Click any section to navigate directly

## Mobile Navigation

On mobile devices:
- Tap the hamburger menu (☰) to open the sidebar
- Swipe or tap outside to close
- Use the floating save button for quick saves

## Keyboard Shortcuts

- **Ctrl/Cmd + S** - Save current section
- **Ctrl/Cmd + Enter** - Generate AI content
- **Tab** - Move between fields
        `,
      },
    ],
  },
  {
    id: "assessment-sections",
    slug: "assessment-sections",
    name: "Assessment Sections",
    icon: "ClipboardList",
    articles: [
      {
        slug: "client-information",
        title: "Client Information",
        content: `
# Client Information Section

The Client Information section captures essential identifying information about the client.

## Required Fields

- **Client Name** - Full legal name
- **Date of Birth** - Used to calculate age
- **Gender** - For clinical documentation
- **Diagnosis** - Primary diagnosis (typically ASD)
- **DSM-5 Level** - Level 1, 2, or 3

## Insurance Information

- Policy holder name
- Insurance company
- Policy/member ID
- Group number
- Authorization number (if applicable)

## Tips

- Ensure all names match insurance records exactly
- Double-check policy numbers for accuracy
- Include any relevant secondary diagnoses
        `,
      },
      {
        slug: "reason-for-referral",
        title: "Reason for Referral",
        content: `
# Reason for Referral Section

This section documents why the client was referred for ABA services.

## Components

### DSM-5 Level
Select the appropriate support level:
- **Level 1** - Requiring support
- **Level 2** - Requiring substantial support
- **Level 3** - Requiring very substantial support

### Areas of Concern
Check all applicable areas:
- Functional communication
- Social-emotional reciprocity
- Transitioning between activities
- Following instructions
- Social interactions with peers
- Restricted/repetitive behaviors
- Developing relationships

### Current Problem Areas
Use the AI Generate button to create a narrative based on selected concerns, or write your own description.

### Family Goals
Document what the family hopes to achieve through ABA therapy.
        `,
      },
      {
        slug: "standardized-assessments",
        title: "Standardized Assessments",
        isNew: true,
        content: `
# Standardized Assessments Section

ARIA integrates common standardized assessments used in ABA evaluations.

## Supported Assessments

### ABLLS-R
The Assessment of Basic Language and Learning Skills - Revised includes 12 domains:
- Cooperation & Reinforcer Effectiveness
- Visual Performance
- Receptive Language
- Motor Imitation
- Vocal Imitation
- Requests (Mands)
- Labeling (Tacts)
- Intraverbals
- Spontaneous Vocalizations
- Syntax & Grammar
- Play & Leisure
- Social Interaction

Enter scores and notes for each domain. ARIA calculates percentages automatically.

### Vineland-3
Both Parent/Caregiver and Teacher forms are supported with scales for:
- Communication
- Daily Living Skills
- Socialization
- Motor Skills (if applicable)

### SRS-2
Social Responsiveness Scale subscales:
- Social Awareness
- Social Cognition
- Social Communication
- Social Motivation
- Restricted/Repetitive Behaviors

### MAS
Motivation Assessment Scale for identifying behavior function:
- Sensory
- Escape
- Attention
- Tangible
        `,
      },
      {
        slug: "fade-plan",
        title: "Fade Plan & Discharge Criteria",
        isNew: true,
        content: `
# Fade Plan & Discharge Criteria Section

This section documents the plan for gradually reducing services and criteria for discharge.

## Treatment Phases

### Phase 1: Intensive
- Highest level of support
- Typically 30-40 hours/week
- Focus on skill acquisition and behavior reduction

### Phase 2: Moderate
- Reduced direct hours
- Increased independence
- Typically 20-30 hours/week

### Phase 3: Maintenance
- Focus on generalization
- Preparing for discharge
- Typically 10-20 hours/week

### Phase 4: Discharge
- Services concluded
- Follow-up recommendations provided

## Discharge Criteria

Document measurable criteria for discharge:
- Goal achievement percentages
- Behavior reduction targets
- Generalization across settings
- Caregiver competency levels
- Skill maintenance duration
        `,
      },
      {
        slug: "barriers-generalization",
        title: "Barriers & Generalization",
        isNew: true,
        content: `
# Barriers & Generalization Section

Document potential barriers to treatment and strategies for generalization.

## Treatment Barriers

### Client-Related
- Medical conditions
- Co-occurring diagnoses
- Medication effects
- Sensory sensitivities

### Environmental
- Home environment factors
- School coordination challenges
- Community access limitations

### Family/Caregiver
- Schedule constraints
- Training availability
- Implementation consistency

### Systemic
- Insurance limitations
- Provider availability
- Transportation issues

## Generalization Strategies

### Stimulus Generalization
Training across different:
- Settings (home, school, community)
- People (parents, teachers, peers)
- Materials and activities

### Response Generalization
Promoting skill variations and flexibility in:
- Communication methods
- Social responses
- Problem-solving approaches

### Maintenance
Strategies for maintaining skills over time without direct intervention.
        `,
      },
    ],
  },
  {
    id: "ai-features",
    slug: "ai-features",
    name: "AI Features",
    icon: "Sparkles",
    articles: [
      {
        slug: "how-ai-generation-works",
        title: "How AI generation works",
        content: `
# How AI Generation Works

ARIA uses advanced AI to generate clinical narratives that save you hours of documentation time.

## The Generation Process

When you click a ✨ Generate button, ARIA:

1. **Collects context** - Gathers data from relevant sections
2. **Applies clinical knowledge** - Uses ABA-specific training
3. **Matches insurance requirements** - Formats for compliance
4. **Generates narrative** - Creates professional clinical text

## What Makes ARIA's AI Special

### RAG Knowledge Base
ARIA learns from 250+ approved assessment examples, improving output quality over time.

### Insurance Compliance
Generated content is pre-optimized for major insurance payers' documentation requirements.

### Clinical Accuracy
Our AI is trained specifically on ABA terminology, DSM-5 criteria, and evidence-based practices.

## Best Practices

1. **Fill in data first** - More context = better output
2. **Review everything** - AI assists, you decide
3. **Edit freely** - ARIA learns from your changes
4. **Save frequently** - Don't lose your customizations
        `,
      },
      {
        slug: "using-generate-buttons",
        title: "Using the Generate buttons",
        content: `
# Using the ✨ Generate Buttons

Generate buttons appear throughout ARIA to help create clinical content.

## How to Use

1. **Fill in required fields** for the section
2. **Click the ✨ Generate button**
3. **Wait for generation** (usually 2-5 seconds)
4. **Review the output** in the text area
5. **Edit as needed** to match your clinical judgment

## Generate Button Locations

- **Reason for Referral** - Problem areas narrative
- **Background History** - Summary sections
- **Behavior Analysis** - Function statements
- **Goals** - SMART goal objectives
- **Treatment Recommendations** - Intervention descriptions
- **And more...**

## Tips

- If output isn't ideal, try adding more context and regenerate
- The AI improves as you use ARIA more
- Generated content is a starting point, not final copy
        `,
      },
      {
        slug: "ai-analyze-behavior",
        title: "AI Analyze for behavior function",
        content: `
# AI Analyze for Behavior Function

Use AI analysis to identify the function of challenging behaviors.

## How It Works

1. Enter ABC (Antecedent-Behavior-Consequence) data
2. Click **"AI Analyze"**
3. ARIA identifies patterns and suggests functions:
   - **Attention** - Behavior maintained by social responses
   - **Escape** - Behavior maintained by removal of demands
   - **Tangible** - Behavior maintained by access to items/activities
   - **Sensory** - Behavior maintained by automatic reinforcement

## Analysis Output

ARIA provides:
- Hypothesized function with confidence level
- Supporting evidence from your data
- Suggested intervention strategies
- Recommended replacement behaviors

## Best Practices

- Enter at least 5-10 ABC observations
- Include varied antecedents and consequences
- Note environmental factors
- Review AI suggestions against your clinical judgment
        `,
      },
      {
        slug: "customizing-ai-outputs",
        title: "Customizing AI outputs",
        content: `
# Customizing AI Outputs

ARIA's AI learns from your edits to improve future generations.

## The Learning System

When you:
1. Generate AI content
2. Edit it to your preference
3. Save and use in final report

ARIA remembers these edits and incorporates your style into future generations.

## Customization Options

### During Generation
- Provide more detailed input data
- Use specific terminology in form fields

### After Generation
- Edit freely - changes are tracked
- Add your clinical voice and observations
- Include client-specific details

## Tips for Better Output

1. **Be specific in inputs** - "Hits peers" vs "Aggression"
2. **Use consistent terminology** - ARIA learns your preferences
3. **Review and refine** - Each edit improves future output
4. **Complete more assessments** - More data = better AI
        `,
      },
    ],
  },
  {
    id: "standardized-assessments-guide",
    slug: "standardized-assessments-guide",
    name: "Standardized Assessments",
    icon: "BarChart3",
    articles: [
      {
        slug: "ablls-r-integration",
        title: "ABLLS-R integration",
        content: `
# ABLLS-R Integration

The Assessment of Basic Language and Learning Skills - Revised (ABLLS-R) is fully integrated into ARIA.

## Entering Scores

For each of the 12 domains:
1. Enter the **Score** achieved
2. Enter the **Maximum** possible score
3. Add **Notes** for clinical context

## Domains Tracked

| Domain | Description |
|--------|-------------|
| Cooperation | Reinforcer effectiveness and compliance |
| Visual Performance | Matching, sorting, sequencing |
| Receptive Language | Following directions, identifying |
| Motor Imitation | Gross and fine motor imitation |
| Vocal Imitation | Echoics and sound imitation |
| Requests (Mands) | Requesting items and actions |
| Labeling (Tacts) | Naming objects and actions |
| Intraverbals | Conversational responses |
| Spontaneous Vocalizations | Unprompted language |
| Syntax & Grammar | Sentence structure |
| Play & Leisure | Independent and social play |
| Social Interaction | Peer and adult interactions |

## AI Interpretation

Click **"Generate AI Summary"** to create a narrative interpretation of scores for your report.
        `,
      },
      {
        slug: "vineland-3",
        title: "Vineland-3 (Parent & Teacher)",
        content: `
# Vineland-3 Integration

ARIA supports both Parent/Caregiver and Teacher forms of the Vineland-3.

## Entering Scores

For each scale, enter:
- **Standard Score** (mean = 100, SD = 15)
- **Age Equivalent** (optional)
- **Percentile** (optional)

## Scales

### Communication
- Receptive
- Expressive
- Written

### Daily Living Skills
- Personal
- Domestic
- Community

### Socialization
- Interpersonal Relationships
- Play and Leisure Time
- Coping Skills

### Motor Skills
- Gross Motor
- Fine Motor

## Score Interpretation

ARIA automatically interprets scores:
- **130+** - Very High
- **115-129** - High
- **85-114** - Average
- **70-84** - Low
- **Below 70** - Very Low
        `,
      },
      {
        slug: "srs-2-scoring",
        title: "SRS-2 scoring",
        content: `
# SRS-2 Scoring

The Social Responsiveness Scale, Second Edition measures social deficits associated with ASD.

## Subscales

Enter T-scores (mean = 50, SD = 10) for:

1. **Social Awareness** - Ability to pick up on social cues
2. **Social Cognition** - Interpreting social behavior
3. **Social Communication** - Expressive social communication
4. **Social Motivation** - Motivation to engage socially
5. **Restricted/Repetitive Behaviors** - Stereotyped behaviors and interests

## T-Score Interpretation

| T-Score | Interpretation |
|---------|---------------|
| ≤59 | Within normal limits |
| 60-65 | Mild range |
| 66-75 | Moderate range |
| ≥76 | Severe range |

## Using in Reports

ARIA generates interpretive summaries based on the score pattern across subscales.
        `,
      },
      {
        slug: "mas-motivation-assessment",
        title: "MAS (Motivation Assessment Scale)",
        content: `
# Motivation Assessment Scale (MAS)

The MAS helps identify the function of challenging behaviors.

## Function Categories

Rate behaviors on a scale for each function:

### Sensory
- Behavior provides automatic reinforcement
- Self-stimulatory in nature

### Escape
- Behavior allows avoidance of demands
- Terminates aversive situations

### Attention
- Behavior results in social responses
- Maintained by reactions from others

### Tangible
- Behavior provides access to preferred items
- Results in obtaining desired activities

## Ranking System

ARIA calculates and ranks functions from highest to lowest based on your ratings, helping identify primary and secondary maintaining variables.

## Clinical Use

MAS results inform:
- Function-based interventions
- Replacement behavior selection
- Antecedent modifications
- Consequence strategies
        `,
      },
    ],
  },
  {
    id: "reports-export",
    slug: "reports-export",
    name: "Reports & Export",
    icon: "FileText",
    articles: [
      {
        slug: "generating-full-reports",
        title: "Generating full reports",
        content: `
# Generating Full Reports

ARIA generates comprehensive 21-section assessment reports.

## Generate All Sections

1. Navigate to **Generate Report** in the sidebar
2. Click **"Generate All Sections"**
3. Wait for all sections to complete (progress shown)
4. Review each section

## Generate Individual Sections

- Click on any section chip to expand
- Click **"Generate"** for that section
- Edit inline as needed

## Section Status

- **Gray** - Not yet generated
- **Green** - Successfully generated
- **Blue** - Currently generating
- **Red** - Error (click to retry)

## Review Process

1. Read through each generated section
2. Edit for clinical accuracy
3. Add client-specific details
4. Ensure consistency across sections
        `,
      },
      {
        slug: "pdf-export",
        title: "PDF export options",
        content: `
# PDF Export Options

Export your completed assessment as a professional PDF document.

## How to Export

1. Complete all report sections
2. Click **"Export PDF"** button
3. Choose export options
4. Download begins automatically

## Export Options

- **Include cover page** - Professional title page
- **Include table of contents** - Navigable sections
- **Include page numbers** - Footer numbering
- **Include signatures** - Signature lines at end

## PDF Formatting

- Professional letterhead-style header
- Consistent fonts and spacing
- Insurance-compliant formatting
- Print-ready quality

## Tips

- Preview before exporting
- Check all sections are complete
- Verify client information accuracy
- Save a backup copy
        `,
      },
      {
        slug: "medical-necessity-letters",
        title: "Medical Necessity letters",
        content: `
# Medical Necessity Letters

Generate compliant medical necessity documentation for insurance authorization.

## What's Included

- Client demographics
- Diagnosis and severity
- Functional limitations
- Treatment recommendations
- Requested services and hours
- Supporting clinical evidence

## Generation Process

1. Complete the assessment
2. Navigate to **Medical Necessity** section
3. Click **"Generate Letter"**
4. Review and customize
5. Export as separate document

## Insurance Requirements

ARIA formats letters to meet requirements for:
- Initial authorization requests
- Continued authorization
- Appeals for denied services
- Peer-to-peer review support
        `,
      },
    ],
  },
  {
    id: "insurance-compliance",
    slug: "insurance-compliance",
    name: "Insurance & Compliance",
    icon: "Shield",
    articles: [
      {
        slug: "supported-payers",
        title: "Supported insurance payers",
        content: `
# Supported Insurance Payers

ARIA is pre-configured for documentation requirements of major insurance payers.

## National Payers

- **Aetna** - Including Aetna Better Health
- **Blue Cross Blue Shield** - All state plans
- **United Healthcare** - Including Optum Behavioral
- **Cigna** - Including Evernorth
- **Anthem** - All regional plans
- **Humana** - Including Humana Behavioral Health

## Behavioral Health Carve-Outs

- **Optum** - Behavioral health management
- **Magellan** - Specialty behavioral health
- **Beacon Health** - Behavioral health services

## Government Programs

- **TRICARE** - Military families
- **Medicaid** - State-specific formatting available
- **Medicare** - When applicable for ABA

## Payer-Specific Features

Each payer configuration includes:
- Required documentation sections
- Specific terminology preferences
- Authorization request formatting
- Medical necessity criteria alignment
        `,
      },
      {
        slug: "cpt-codes",
        title: "CPT codes for ABA",
        content: `
# CPT Codes for ABA

ARIA uses current CPT codes for ABA services in authorization requests and reports.

## Assessment Codes

| Code | Description | Time |
|------|-------------|------|
| 97151 | Behavior identification assessment | First 30 min |
| 97152 | Behavior identification assessment | Each add'l 30 min |

## Treatment Codes

| Code | Description | Time |
|------|-------------|------|
| 97153 | Adaptive behavior treatment | Each 15 min |
| 97155 | Treatment with protocol modification | Each 15 min |

## Family/Group Codes

| Code | Description | Time |
|------|-------------|------|
| 97156 | Family adaptive behavior guidance | Each 15 min |
| 97157 | Multiple-family group treatment | Each 15 min |
| 97158 | Group adaptive behavior treatment | Each 15 min |

## Using in ARIA

When generating authorization requests, ARIA automatically:
- Calculates appropriate codes
- Applies correct time units
- Formats for payer requirements
        `,
      },
      {
        slug: "documentation-requirements",
        title: "Documentation requirements",
        content: `
# Documentation Requirements

ARIA ensures your assessments meet insurance documentation standards.

## Required Elements

### Client Information
- Full legal name matching insurance
- Date of birth
- Insurance member ID
- Authorization numbers

### Clinical Justification
- DSM-5 diagnosis with specifiers
- Functional limitations
- Medical necessity rationale
- Treatment goals

### Assessment Data
- Standardized assessment results
- Behavioral observations
- Baseline measurements
- Skill deficits identified

### Treatment Plan
- SMART goals with objectives
- Intervention descriptions
- Service hours recommended
- Duration of treatment

## Compliance Checks

ARIA warns you about:
- Missing required fields
- Incomplete sections
- Inconsistent data
- Documentation gaps
        `,
      },
      {
        slug: "avoiding-denials",
        title: "Avoiding denials",
        content: `
# Avoiding Insurance Denials

Tips for creating documentation that gets approved.

## Common Denial Reasons

1. **Insufficient medical necessity** - Weak clinical justification
2. **Missing information** - Incomplete documentation
3. **Lack of progress** - No measurable outcomes
4. **Coding errors** - Wrong CPT codes or units

## Prevention Strategies

### Strong Medical Necessity
- Document functional limitations clearly
- Connect deficits to treatment needs
- Use objective, measurable language
- Reference standardized assessments

### Complete Documentation
- Fill all required fields
- Include supporting data
- Document everything thoroughly
- Use ARIA's completeness checks

### Show Progress
- Include baseline data
- Set measurable goals
- Track objective data
- Document skill acquisition

### Accurate Coding
- Use correct CPT codes
- Calculate units properly
- Match services to codes
- Verify authorization coverage
        `,
      },
    ],
  },
  {
    id: "hipaa-security",
    slug: "hipaa-security",
    name: "HIPAA & Security",
    icon: "Lock",
    articles: [
      {
        slug: "data-encryption",
        title: "Data encryption",
        content: `
# Data Encryption

ARIA uses enterprise-grade encryption to protect client data.

## Encryption at Rest

- AES-256 encryption for stored data
- Encrypted database backups
- Secure key management

## Encryption in Transit

- TLS 1.3 for all connections
- HTTPS enforced site-wide
- Secure API communications

## Access Controls

- Role-based access control
- Multi-factor authentication available
- Session timeout protection
- Audit logging enabled
        `,
      },
      {
        slug: "baa-agreements",
        title: "BAA agreements",
        content: `
# Business Associate Agreements

ARIA provides BAA agreements for HIPAA compliance.

## What is a BAA?

A Business Associate Agreement is a contract required by HIPAA when a covered entity (your practice) shares PHI with a business associate (ARIA).

## Requesting a BAA

1. Navigate to **/hipaa**
2. Complete the BAA request form
3. Submit organization information
4. Receive executed BAA within 48 hours

## BAA Coverage

Our BAA covers:
- Data storage and processing
- Technical support access
- Backup and recovery
- Security incident response

## Your Responsibilities

As a covered entity, you must:
- Maintain your own HIPAA compliance
- Train staff on proper use
- Report any security concerns
- Follow access control policies
        `,
      },
      {
        slug: "privacy-practices",
        title: "Privacy practices",
        content: `
# Privacy Practices

ARIA is committed to protecting the privacy of your clients' information.

## Data Collection

We collect only:
- Information you enter for assessments
- Account and billing information
- Usage data for improvement

## Data Use

Your data is used for:
- Generating assessment reports
- Improving AI capabilities
- Providing support services

## Data Sharing

We never:
- Sell personal information
- Share data with third parties for marketing
- Use PHI for unauthorized purposes

## Your Rights

You can:
- Access your data anytime
- Export all your information
- Request data deletion
- Revoke consent
        `,
      },
      {
        slug: "data-retention",
        title: "Data retention",
        content: `
# Data Retention

Understanding how long ARIA retains your data.

## Active Accounts

- Assessment data retained indefinitely while account active
- Billing records kept per legal requirements
- Usage logs retained for 90 days

## Account Closure

When you close your account:
- Assessment data deleted within 30 days
- Backups purged within 90 days
- Billing records retained per law (typically 7 years)

## Data Export

Before closing, you can:
- Export all assessments as PDF
- Download raw data files
- Request complete data package

## Compliance

Our retention policies comply with:
- HIPAA requirements
- State record retention laws
- Industry best practices
        `,
      },
    ],
  },
  {
    id: "faq",
    slug: "faq",
    name: "FAQ",
    icon: "HelpCircle",
    articles: [
      {
        slug: "account-billing",
        title: "Account & billing questions",
        content: `
# Account & Billing FAQ

Common questions about accounts and billing.

## How do I change my plan?

Navigate to Account Settings > Subscription and select your new plan. Changes take effect at your next billing cycle.

## Can I get a refund?

We offer a 7-day money-back guarantee for new subscriptions. Contact support for refund requests.

## How do I cancel?

Go to Account Settings > Subscription > Cancel. Your access continues until the end of the billing period.

## Do you offer discounts?

- Annual billing: 20% discount
- Non-profit organizations: Contact us
- Educational institutions: Contact us

## How do I update payment info?

Account Settings > Billing > Update Payment Method

## What happens if payment fails?

We retry failed payments 3 times over 7 days. You'll receive email notifications and can update your payment method to avoid service interruption.
        `,
      },
      {
        slug: "technical-issues",
        title: "Technical issues",
        content: `
# Technical Issues FAQ

Troubleshooting common technical problems.

## The AI isn't generating content

1. Check your internet connection
2. Ensure all required fields are filled
3. Try refreshing the page
4. Clear browser cache and retry

## My data isn't saving

1. Check the save indicator in the sidebar
2. Ensure stable internet connection
3. Try manual save (Ctrl/Cmd + S)
4. Contact support if issue persists

## PDF export isn't working

1. Ensure all sections are generated
2. Disable browser popup blockers
3. Try a different browser
4. Clear browser cache

## The page is loading slowly

1. Check your internet speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Try a different browser

## I can't log in

1. Verify your email address
2. Check caps lock
3. Try "Forgot Password"
4. Contact support if locked out
        `,
      },
      {
        slug: "feature-requests",
        title: "Feature requests",
        content: `
# Feature Requests

We love hearing from our users!

## How to Submit

1. Email: support@ariaba.app
2. Subject: "Feature Request: [Your Idea]"
3. Include:
   - Description of the feature
   - How it would help your workflow
   - Any examples or mockups

## What We Consider

- User demand and frequency of requests
- Alignment with ARIA's mission
- Technical feasibility
- Impact on existing features

## Recent Additions (from user requests)

- Standardized Assessments integration
- Fade Plan & Discharge Criteria section
- Barriers & Generalization section
- Mobile-responsive design improvements

## Feature Roadmap

We're working on:
- Team collaboration features
- Custom report templates
- Additional assessment integrations
- Enhanced analytics dashboard
        `,
      },
    ],
  },
  {
    id: "glossary",
    slug: "glossary",
    name: "Glossary",
    icon: "BookOpen",
    articles: [
      {
        slug: "aba-terminology",
        title: "ABA terminology A-Z",
        content: `
# ABA Terminology Glossary

Common terms used in Applied Behavior Analysis and ARIA.

## A

**ABC Data** - Antecedent-Behavior-Consequence recording format for analyzing behavior function.

**ABLLS-R** - Assessment of Basic Language and Learning Skills - Revised; criterion-referenced assessment for children with autism.

**Antecedent** - What happens immediately before a behavior occurs.

## B

**BCBA** - Board Certified Behavior Analyst; master's-level certification for behavior analysts.

**Baseline** - Initial measurement of behavior before intervention begins.

**Behavior Intervention Plan (BIP)** - Written plan describing strategies to address challenging behaviors.

## C

**Consequence** - What happens immediately after a behavior occurs.

**CPT Codes** - Current Procedural Terminology codes used for billing ABA services.

## D

**Discrete Trial Training (DTT)** - Structured teaching method using clear antecedents, prompts, and reinforcement.

**DSM-5** - Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition.

## E-F

**Extinction** - Withholding reinforcement for previously reinforced behavior.

**Functional Behavior Assessment (FBA)** - Process for identifying behavior function.

**Function** - The purpose a behavior serves (attention, escape, tangible, sensory).

## G-H

**Generalization** - Transfer of skills across settings, people, and materials.

**HIPAA** - Health Insurance Portability and Accountability Act; federal privacy law.

## I-M

**Intervention** - Treatment strategy designed to change behavior.

**Mand** - Verbal behavior controlled by motivation; a request.

**Medical Necessity** - Documentation showing treatment is required for health.

## N-R

**Natural Environment Teaching (NET)** - Teaching in everyday settings and activities.

**Prompt** - Assistance given to help learner perform correct response.

**Reinforcement** - Consequence that increases future behavior.

## S

**SMART Goals** - Specific, Measurable, Achievable, Relevant, Time-bound objectives.

**SRS-2** - Social Responsiveness Scale, Second Edition.

**STO** - Short-Term Objective; measurable step toward a goal.

## T-V

**Tact** - Verbal behavior controlled by nonverbal stimuli; labeling.

**Target Behavior** - Specific behavior selected for intervention.

**Vineland-3** - Vineland Adaptive Behavior Scales, Third Edition.
        `,
      },
    ],
  },
]

// Helper function to get article by slug
export function getArticle(categorySlug: string, articleSlug: string): { category: Category; article: Article } | null {
  const category = helpCategories.find((c) => c.slug === categorySlug)
  if (!category) return null

  const article = category.articles.find((a) => a.slug === articleSlug)
  if (!article) return null

  return { category, article }
}

// Helper function to search articles
export function searchArticles(query: string): { category: Category; article: Article }[] {
  const results: { category: Category; article: Article }[] = []
  const lowerQuery = query.toLowerCase()

  for (const category of helpCategories) {
    for (const article of category.articles) {
      if (article.title.toLowerCase().includes(lowerQuery) || article.content.toLowerCase().includes(lowerQuery)) {
        results.push({ category, article })
      }
    }
  }

  return results
}

// Popular articles for homepage
export const popularArticles = [
  { categorySlug: "getting-started", articleSlug: "what-is-aria" },
  { categorySlug: "getting-started", articleSlug: "creating-first-assessment" },
  { categorySlug: "ai-features", articleSlug: "how-ai-generation-works" },
  { categorySlug: "reports-export", articleSlug: "generating-full-reports" },
  { categorySlug: "insurance-compliance", articleSlug: "cpt-codes" },
  { categorySlug: "hipaa-security", articleSlug: "baa-agreements" },
]
