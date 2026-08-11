// This is the one place the frontend will call the Express backend later.
// Until then, it returns local demo data so the site remains usable.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getProjectStatus() {
  if (!API_BASE_URL) return { message: 'Frontend foundation is ready for the SmartToken team.' }

  const response = await fetch(`${API_BASE_URL}/api/status`)
  if (!response.ok) throw new Error('Unable to load project status')
  return response.json()
}
