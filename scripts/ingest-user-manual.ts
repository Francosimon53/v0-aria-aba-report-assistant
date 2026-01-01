import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

// User manual documents to ingest
const userManualDocuments = [
  {
    title: "What is ARIA?",
    content:
      "ARIA (ABA Report & Intervention Assistant) is an AI-powered platform designed specifically for BCBAs (Board Certified Behavior Analysts) that reduces assessment documentation time from 6-10 hours to 1-2 hours while maintaining insurance compliance standards. Key benefits include: Time Savings (reduces 80% of documentation time), Specialized AI (generates professional clinical content), Compliance (automatically meets insurance requirements), Auto-save (never lose your work), and Export (PDF, Word, copy to portals).",
  },
  {
    title: "Dashboard - Control Center",
    content:
      "The Dashboard is your control center where you can view statistics and quick actions. Statistics cards include: Total Assessments (total number of assessments created), Completed Reports (reports finalized and ready to submit), In Progress (assessments in development), and Time Saved (hours saved using AI). Quick actions available are: '+ Create New Assessment' to start a new assessment, 'View All Assessments' to see list of all your assessments, 'Generate Report' to go directly to report generation, and 'Parent Training' to access the parent training module.",
  },
  {
    title: "Client Info - Client Information",
    content:
      "The Client Info section contains basic client information. Fields include: Name (client's full name), Date of Birth (client's DOB), Diagnosis (primary diagnosis such as Autism Spectrum Disorder Level 2), and Insurance (insurance company like Blue Cross Blue Shield). This information is fundamental to the entire assessment and is used in report generation and medical necessity documentation.",
  },
  {
    title: "ABC Observations - Behavioral Observations",
    content:
      "The ABC Observations section documents behavioral observations using the Antecedent-Behavior-Consequence format. To add an observation: 1) Click '+ Add Observation', 2) Complete the fields Antecedent (what happened before the behavior), Behavior (description of the behavior), Consequence (what happened after), and Function (hypothesized function). Each field has an 'AI Generate' button to automatically generate content. The 'AI Analyze' button determines the probable function of the behavior (Attention, Escape, Tangible, or Automatic) based on the entered data.",
  },
  {
    title: "AI Analyze - Behavior Function Analysis",
    content:
      "To use AI to analyze behavior function: 1) Complete the Antecedent, Behavior, and Consequence fields, 2) Click 'AI Analyze', 3) AI will determine the probable function among Attention (seeking attention), Escape (escape from demands), Tangible (access to tangibles), or Automatic (automatic reinforcement), 4) Review the reasoning provided by AI. This feature helps identify the purpose of the behavior to select appropriate interventions.",
  },
  {
    title: "Risk Assessment - Risk Evaluation",
    content:
      "The Risk Assessment section evaluates and documents client risk factors. Risk factors include checkboxes for: Self-mutilation/cutting, Caring for ill family member, Coping with significant loss, Prior psychiatric inpatient admission, and Other (specify). The 'AI Generate Crisis Plan' button generates a personalized crisis plan based on selected factors. The Emergency Procedures section has its own 'AI Generate' button that generates emergency procedures including de-escalation strategies, when to call 911, safe places, and post-crisis documentation.",
  },
  {
    title: "Goal Bank - Goals Library",
    content:
      "The Goal Bank is a library of SMART goals organized by domain. Available domains include: Communication, Social Skills, Daily Living Skills, Behavior Reduction, Academic Skills, and Motor Skills. To add a goal from the Goal Bank: 1) Navigate to the desired domain, 2) Click on the goal to expand details, 3) Click 'Add to Assessment' to add it to the Goals Tracker. Goals follow the SMART format (Specific, Measurable, Achievable, Relevant, Time-bound).",
  },
  {
    title: "Goals Tracker - Goal Monitoring",
    content:
      "The Goals Tracker manages and monitors client goals. To create a custom goal: 1) Click '+ Add Goal', 2) Complete the fields for Domain, Goal description, Baseline, Target, and Target date. The 'AI Suggest Goals' button suggests goals based on assessment data. Goals can be edited, deleted, and have their progress tracked. The system automatically calculates the percentage of progress toward the objective.",
  },
  {
    title: "Interventions - Treatment Interventions",
    content:
      "The Interventions section allows you to select and document evidence-based interventions. Interventions are organized by behavior function: For Attention use DRA, NCR, Planned Ignoring; for Escape use Escape Extinction, Task Modification, FCT; for Tangible use Token Economy, Delay Tolerance Training; for Automatic use Environmental Modification, Response Interruption. The 'AI Suggest' button recommends interventions based on functions identified in ABC Observations.",
  },
  {
    title: "Parent Training - Caregiver Training",
    content:
      "The Parent Training module includes training for parents/caregivers. Available modules are: 1) Introduction to ABA & Your Role, 2) Reinforcement & Motivation, 3) Prompting & Prompt Fading, 4) Managing Problem Behavior, 5) Data Collection for Parents. To use AI Generate Content: 1) Expand the desired module, 2) Click 'AI Generate Content', 3) It will generate Learning Objectives, Key Concepts, Procedure Steps, Practice Scenarios, Home Activities, Fidelity Checklist, and Quiz Questions. Progress tracking includes Fidelity Score (0-100) after each session, Session Notes for documentation, and Progress to Mastery requiring 90% fidelity in 2 consecutive sessions.",
  },
  {
    title: "Service Schedule - Weekly Schedule",
    content:
      "The Service Schedule section plans the weekly service schedule with CPT codes. CPT codes include: 97153 (RBT - Adaptive behavior treatment by protocol), 97155 (BCBA/Lead - Behavior identification assessment), 97155HN (Assistant), 97156 (Family Training BCBA), 97156HN (Family Training Assistant). The 'AI Suggest Schedule' button generates an optimal schedule considering authorized hours per CPT code, ABA best practices, and balanced weekly distribution.",
  },
  {
    title: "Generate Report - Report Generation",
    content:
      "The report generator compiles all assessment sections. Report sections include: Client Demographics, Referral Information, Assessment Methods, Background Information, Medical History, Developmental History, Educational History, Behavioral Observations, ABC Analysis, Functional Behavior Assessment, Skill Assessment, Treatment Recommendations, Goals & Objectives, Intervention Strategies, Caregiver Training Goals, Parent Training Progress, Medical Necessity Statement, and Additional Required Sections. To generate an individual section: 1) Click 'Generate' next to the section, 2) Wait while AI generates the content, 3) Review and edit if necessary, 4) Click 'Regenerate' for a new version.",
  },
  {
    title: "Medical Necessity Generator",
    content:
      "The Medical Necessity Generator creates statements optimized for insurance approval. To auto-fill data there are two options: 1) 'AI Smart Fill (Recommended)' - AI fills all fields using assessment data and optimizes for insurance approval, 2) 'Auto-fill from Assessment Data' - fills with existing data without AI optimization. Input fields are: Child's Diagnosis, Target Behaviors, Severity/Frequency, Functional Impact, Previous Treatment, Requested Service Hours, and Environmental Factors. The 'Generate Draft' button creates the complete statement. Insurance Key Phrases include: significant impairment, evidence-based treatment, medically necessary, skilled intervention required.",
  },
  {
    title: "AI Functions Summary",
    content:
      "ARIA uses artificial intelligence in multiple areas. AI functions include: AI Generate (in text fields to generate individual content), AI Analyze (in ABC Observations to determine behavior function), AI Suggest Goals (in Goals Tracker to suggest goals based on data), AI Suggest Interventions (in Interventions to recommend by function), AI Generate Content (in Parent Training to generate complete modules), AI Suggest Schedule (in Service Schedule to create optimal schedule), AI Smart Fill (in Medical Necessity to fill and optimize all fields), Generate Draft (in Medical Necessity to generate complete statement), and AI Generate Crisis Plan (in Risk Assessment to generate crisis plan).",
  },
  {
    title: "Save All - Saving Data",
    content:
      "The 'Save All' button (green, top right corner) saves the entire assessment. Button states are: Ready ('Save All' green, ready to save), Saving ('Saving...' with spinner, save in progress), Saved ('Saved' green, save successful), and Error ('Error' red, save failed). Data is saved to Cloud (Supabase) with persistent cloud data, and localStorage as local browser backup. Auto-Save saves automatically every 30 seconds while you work.",
  },
  {
    title: "FAQ - Data Security",
    content:
      "Are my data secure? Yes, data is stored securely in Supabase with Row Level Security (RLS), meaning only you can access your data. Can I access from different devices? Yes, your data syncs to the cloud and you can access from any device with your account. What happens if I lose internet connection? ARIA saves a local copy in your browser and when you regain connection, data will sync automatically.",
  },
  {
    title: "FAQ - AI Functions",
    content:
      "Does AI replace my clinical judgment? No, AI generates drafts and suggestions that should always be reviewed and approved by the BCBA. You are responsible for the final content. Does generated content meet insurance standards? Yes, content is optimized to include key phrases and formats that insurances look for, but always review according to specific insurer requirements. What do I do if AI generates incorrect content? You can edit content directly, use 'Regenerate' for a new version, or write manually.",
  },
  {
    title: "FAQ - Technical Issues",
    content:
      "Save button shows 'Error'? Check your internet connection. If it persists, data was saved locally and will sync when the problem is resolved. A page doesn't load correctly? Try: 1) Reload the page (F5), 2) Clear browser cache, 3) Log out and log back in. Data from one section doesn't appear in another? Make sure to click 'Save All' after completing each section so data syncs between sections.",
  },
  {
    title: "CPT Codes for ABA",
    content:
      "CPT codes used in ARIA are: 97153 - RBT (Adaptive behavior treatment by protocol, administered by technician), 97155 - BCBA/Lead (Adaptive behavior treatment with protocol modification), 97155HN - Assistant (HN modifier for assistant), 97156 - Family Training by BCBA (Family adaptive behavior treatment guidance), 97156HN - Family Training by Assistant. These codes are used in Service Schedule and CPT Authorization to document and bill ABA services.",
  },
  {
    title: "ABA Glossary of Terms",
    content:
      "Glossary: ABC (Antecedent-Behavior-Consequence) is the behavior analysis method. ABA (Applied Behavior Analysis). BCBA (Board Certified Behavior Analyst). RBT (Registered Behavior Technician). CPT Code (Current Procedural Terminology) are billing codes. DTT (Discrete Trial Training) is structured teaching. FCT (Functional Communication Training). DRA (Differential Reinforcement of Alternative Behavior). NET (Natural Environment Training). Fidelity is the accuracy with which a procedure is implemented.",
  },
]

async function ingestUserManual() {
  // Initialize Supabase client
  const supabase = createClient(process.env.ARIA_SUPABASE_URL!, process.env.ARIA_SUPABASE_SERVICE_ROLE_KEY!)

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  console.log("Starting ingestion of 20 user manual documents...")

  let successCount = 0
  let errorCount = 0

  for (const doc of userManualDocuments) {
    try {
      console.log(`\nProcessing: ${doc.title}`)

      // Insert document into rag_documents table
      const { data: insertedDoc, error: docError } = await supabase
        .from("rag_documents")
        .insert({
          title: doc.title,
          content: doc.content,
          document_type: "user_manual",
          metadata: {
            category: "user_manual",
            ingested_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (docError) {
        console.error(`Error inserting document: ${docError.message}`)
        errorCount++
        continue
      }

      console.log(`✓ Document inserted with ID: ${insertedDoc.id}`)

      // Generate embedding for the content
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: doc.content,
      })

      const embedding = embeddingResponse.data[0].embedding

      // Insert embedding into rag_embeddings table
      const { error: embeddingError } = await supabase.from("rag_embeddings").insert({
        document_id: insertedDoc.id,
        chunk_text: doc.content,
        embedding: embedding,
        chunk_index: 0,
        metadata: {
          title: doc.title,
          category: "user_manual",
        },
      })

      if (embeddingError) {
        console.error(`Error inserting embedding: ${embeddingError.message}`)
        errorCount++
        continue
      }

      console.log(`✓ Embedding created for: ${doc.title}`)
      successCount++

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Error processing ${doc.title}:`, error)
      errorCount++
    }
  }

  console.log("\n" + "=".repeat(50))
  console.log("Ingestion complete!")
  console.log(`✓ Successfully processed: ${successCount} documents`)
  console.log(`✗ Errors: ${errorCount} documents`)
  console.log("=".repeat(50))

  // Query total embeddings count
  const { count } = await supabase.from("rag_embeddings").select("*", { count: "exact", head: true })

  console.log(`\nTotal embeddings in database: ${count}`)
}

// Run the ingestion
ingestUserManual().catch(console.error)
