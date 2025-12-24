import type { ClientData, AssessmentData } from "./types"

// Parse PDF text content
async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        resolve(text)
      } catch (error) {
        reject(new Error("Failed to read PDF file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// Parse CSV content
async function parseCSV(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const data = lines.map((line) => line.split(",").map((cell) => cell.trim()))
        resolve(data)
      } catch (error) {
        reject(new Error("Failed to parse CSV"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// Parse JSON content
async function parseJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        resolve(json)
      } catch (error) {
        reject(new Error("Invalid JSON format"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// Extract client data from various file types
export async function parseClientDataFile(file: File): Promise<Partial<ClientData>> {
  const fileType = file.name.split(".").pop()?.toLowerCase()

  if (fileType === "json") {
    const data = await parseJSON(file)
    return {
      firstName: data.firstName || data.first_name || "",
      lastName: data.lastName || data.last_name || "",
      dateOfBirth: data.dateOfBirth || data.dob || data.date_of_birth || "",
      diagnosis: data.diagnosis || "",
      insuranceProvider: data.insuranceProvider || data.insurance || "",
      insuranceId: data.insuranceId || data.policy_number || data.member_id || "",
      guardianName: data.guardianName || data.parent_name || "",
      guardianPhone: data.guardianPhone || data.phone || "",
      guardianEmail: data.guardianEmail || data.email || "",
    }
  }

  if (fileType === "csv") {
    const data = await parseCSV(file)
    if (data.length < 2) throw new Error("CSV file must have header and data rows")

    const headers = data[0].map((h) => h.toLowerCase())
    const values = data[1]

    const findValue = (keys: string[]) => {
      for (const key of keys) {
        const index = headers.indexOf(key)
        if (index !== -1) return values[index] || ""
      }
      return ""
    }

    return {
      firstName: findValue(["firstname", "first_name", "first name"]),
      lastName: findValue(["lastname", "last_name", "last name"]),
      dateOfBirth: findValue(["dob", "dateofbirth", "date_of_birth", "birthdate"]),
      diagnosis: findValue(["diagnosis", "dx"]),
      insuranceProvider: findValue(["insurance", "insuranceprovider", "payer"]),
      insuranceId: findValue(["insuranceid", "policy", "member_id", "memberid"]),
      guardianName: findValue(["guardian", "parent", "guardianname", "parent_name"]),
      guardianPhone: findValue(["phone", "guardianphone", "contact"]),
      guardianEmail: findValue(["email", "guardianemail", "contact_email"]),
    }
  }

  if (fileType === "txt" || fileType === "pdf") {
    const text = await extractTextFromPDF(file)

    // Use regex to extract common patterns
    const extractPattern = (pattern: RegExp) => {
      const match = text.match(pattern)
      return match ? match[1].trim() : ""
    }

    return {
      firstName: extractPattern(/(?:First Name|Name):\s*([A-Za-z]+)/i),
      lastName: extractPattern(/(?:Last Name|Surname):\s*([A-Za-z]+)/i),
      dateOfBirth: extractPattern(/(?:DOB|Date of Birth):\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i),
      diagnosis: extractPattern(/(?:Diagnosis|Dx):\s*([^\n]+)/i),
      insuranceProvider: extractPattern(/(?:Insurance|Payer):\s*([^\n]+)/i),
      insuranceId: extractPattern(/(?:Policy|Member ID|Insurance ID):\s*([^\n]+)/i),
    }
  }

  throw new Error("Unsupported file format")
}

// Parse assessment scores from file
export async function parseAssessmentDataFile(file: File): Promise<Partial<AssessmentData>> {
  const fileType = file.name.split(".").pop()?.toLowerCase()

  if (fileType === "json") {
    const data = await parseJSON(file)
    return {
      ablsScores: data.ablsScores || data.abls || {},
      vbmappScores: data.vbmappScores || data.vbmapp || {},
      efl: data.efl || {},
      barriers: data.barriers || {},
      transitionSkills: data.transitionSkills || {},
    }
  }

  if (fileType === "csv") {
    const data = await parseCSV(file)
    const scores: any = {
      ablsScores: {},
      vbmappScores: {},
    }

    // Parse CSV with format: Domain, Score, Percentile
    for (let i = 1; i < data.length; i++) {
      const [domain, score, percentile] = data[i]
      if (domain && score) {
        const domainKey = domain.toLowerCase().replace(/\s+/g, "")
        scores.ablsScores[domainKey] = {
          raw: Number.parseInt(score) || 0,
          percentile: Number.parseInt(percentile) || 0,
        }
      }
    }

    return scores
  }

  throw new Error("Unsupported file format")
}

// Parse goal data from file
export async function parseGoalsFile(file: File): Promise<any[]> {
  const fileType = file.name.split(".").pop()?.toLowerCase()

  if (fileType === "json") {
    const data = await parseJSON(file)
    return Array.isArray(data) ? data : [data]
  }

  if (fileType === "csv") {
    const data = await parseCSV(file)
    const goals = []

    for (let i = 1; i < data.length; i++) {
      const [domain, goal, baseline, target] = data[i]
      if (domain && goal) {
        goals.push({
          domain,
          goal,
          baseline: baseline || "",
          target: target || "",
        })
      }
    }

    return goals
  }

  throw new Error("Unsupported file format")
}

export async function parseReassessmentDataFile(
  file: File,
  importType: "scores" | "progress" | "graphs",
): Promise<any> {
  const fileType = file.name.split(".").pop()?.toLowerCase()

  // Handle image imports for graphs
  if (importType === "graphs" && ["png", "jpg", "jpeg"].includes(fileType || "")) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve({
          graphImages: [
            {
              name: file.name,
              url: e.target?.result as string,
              uploadedAt: new Date().toISOString(),
            },
          ],
        })
      }
      reader.readAsDataURL(file)
    })
  }

  // Parse scores from JSON
  if (importType === "scores" && fileType === "json") {
    const data = await parseJSON(file)
    return {
      domains: data.domains || [],
      reassessmentDate: data.reassessmentDate || data.date || "",
      reassessmentType: data.reassessmentType || data.type || "",
      revisedHoursRecommended: data.revisedHoursRecommended || data.hours || 0,
    }
  }

  // Parse scores from CSV
  if (importType === "scores" && fileType === "csv") {
    const data = await parseCSV(file)
    const domains = []

    // Expected format: Domain, Score, MaxScore, Notes
    for (let i = 1; i < data.length; i++) {
      const [domain, score, maxScore, notes] = data[i]
      if (domain && score) {
        domains.push({
          domain: domain.trim(),
          score: Number.parseInt(score) || 0,
          maxScore: Number.parseInt(maxScore) || 100,
          notes: notes?.trim() || "",
        })
      }
    }

    return { domains }
  }

  // Parse progress data from JSON
  if (importType === "progress" && fileType === "json") {
    const data = await parseJSON(file)
    return {
      progressSummary: data.progressSummary || data.summary || "",
      goalsMetCount: data.goalsMetCount || data.goalsMet || 0,
      goalsContinuedCount: data.goalsContinuedCount || data.goalsContinued || 0,
      newGoalsCount: data.newGoalsCount || data.newGoals || 0,
      hoursJustification: data.hoursJustification || data.justification || "",
    }
  }

  // Parse progress from CSV
  if (importType === "progress" && fileType === "csv") {
    const data = await parseCSV(file)

    // Find key-value pairs in CSV
    const findValue = (key: string) => {
      for (const row of data) {
        if (row[0]?.toLowerCase().includes(key.toLowerCase())) {
          return row[1] || ""
        }
      }
      return ""
    }

    return {
      goalsMetCount: Number.parseInt(findValue("goals met")) || 0,
      goalsContinuedCount: Number.parseInt(findValue("goals continued")) || 0,
      newGoalsCount: Number.parseInt(findValue("new goals")) || 0,
      progressSummary: findValue("summary") || findValue("progress"),
    }
  }

  // Parse from PDF (extract text and look for patterns)
  if (fileType === "pdf" || fileType === "txt") {
    const text = await extractTextFromPDF(file)

    const extractPattern = (pattern: RegExp) => {
      const match = text.match(pattern)
      return match ? match[1].trim() : ""
    }

    const extractNumber = (pattern: RegExp) => {
      const value = extractPattern(pattern)
      return Number.parseInt(value) || 0
    }

    if (importType === "scores") {
      // Extract domain scores from text
      const domainMatches = text.matchAll(/([A-Z][a-z\s]+):\s*(\d+)(?:\/(\d+))?/g)
      const domains = []

      for (const match of domainMatches) {
        domains.push({
          domain: match[1].trim(),
          score: Number.parseInt(match[2]) || 0,
          maxScore: Number.parseInt(match[3]) || 100,
          notes: "",
        })
      }

      return {
        domains: domains.length > 0 ? domains : undefined,
        reassessmentDate: extractPattern(/(?:Date|Assessment Date):\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i),
      }
    }

    if (importType === "progress") {
      return {
        goalsMetCount: extractNumber(/Goals?\s+Met:\s*(\d+)/i),
        goalsContinuedCount: extractNumber(/Goals?\s+Continued:\s*(\d+)/i),
        newGoalsCount: extractNumber(/New\s+Goals?:\s*(\d+)/i),
        progressSummary: extractPattern(/(?:Progress\s+Summary|Overall\s+Progress):\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i),
      }
    }
  }

  throw new Error(`Unsupported file format for ${importType} import`)
}
