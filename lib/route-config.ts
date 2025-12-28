// Centralizada configuración de rutas para evitar hardcoding
export const ROUTE_CONFIG = {
  DASHBOARD: "/dashboard",
  ASSESSMENT: {
    NEW: "/assessment/new",
    SETUP: "/assessment/setup",
    CLIENT_INFO: "/assessment/client-info",
    BACKGROUND: "/assessment/background-history",
    DOCUMENTS: "/assessment/documents-reviewed",
    EVALUATION: "/assessment/evaluation",
    DOMAINS: "/assessment/domains",
    ABC: "/assessment/abc-observation",
    RISK: "/assessment/risk-assessment",
    CAREGIVER: "/assessment/caregiver-training",
    INTERVENTIONS: "/assessment/interventions",
    TEACHING: "/assessment/teaching-protocols",
    GOALS: "/assessment/goals",
    SERVICE_PLAN: "/assessment/service-plan",
    GENERALIZATION: "/assessment/generalization",
    COORDINATION: "/assessment/coordination-care",
    SIGNATURES: "/assessment/signatures",
    CPT: "/assessment/cpt-authorization",
    MEDICAL: "/assessment/medical-necessity",
    REPORT: "/assessment/generate-report",
    ASSESSMENTS_LIST: "/assessments",
  },
}

// Helper para obtener la ruta siguiente
export function getNextRoute(currentPath: string): string | null {
  const routes = Object.values(ROUTE_CONFIG.ASSESSMENT) as string[]
  const currentIndex = routes.indexOf(currentPath)
  if (currentIndex >= 0 && currentIndex < routes.length - 1) {
    return routes[currentIndex + 1]
  }
  return null
}

// Helper para obtener la ruta anterior
export function getPreviousRoute(currentPath: string): string | null {
  const routes = Object.values(ROUTE_CONFIG.ASSESSMENT) as string[]
  const currentIndex = routes.indexOf(currentPath)
  if (currentIndex > 0) {
    return routes[currentIndex - 1]
  }
  return null
}
