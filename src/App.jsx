import { useEffect, useState } from 'react'

const adminTokenKey = 'smarttoken-admin-token'
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const planningV1PageCount = 12
const planningV1PageImage = page => `/presentations/planning-v1-pages/page-${String(page).padStart(2, '0')}.png`

async function parseJson(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Number(payload.userId)
  } catch {
    return null
  }
}

async function loginToAdmin(email, password) {
  const response = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Login failed')
  return data.token
}

async function uploadFile(token, deliverableId, versionId, file) {
  const formData = new FormData()
  formData.append('version_id', versionId)
  formData.append('file', file)

  const response = await fetch(`${apiBase}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Upload failed')
  return data
}

async function publishVersion(token, versionId) {
  const response = await fetch(`${apiBase}/versions/${versionId}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Publish failed')
  return data
}

async function fetchDeliverables(token) {
  const response = await fetch(`${apiBase}/deliverables`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Unable to load deliverables')
  return data
}

async function fetchVersions(token, deliverableId) {
  const response = await fetch(`${apiBase}/deliverables/${deliverableId}/versions`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Unable to load versions')
  return data
}

async function createDeliverable(token, title, slug) {
  const response = await fetch(`${apiBase}/deliverables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, slug }),
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Unable to create deliverable')
  return data
}

async function createVersion(token, payload) {
  const response = await fetch(`${apiBase}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await parseJson(response)
  if (!response.ok) throw new Error(data.error || 'Unable to create version')
  return data
}

const navigation = [
  ['Home', '#/'],
  ['Project', '#/project'],
  ['Team', '#/team'],
  ['Presentations', '#/presentations'],
  ['Admin', '#/admin'],
]

const teamMembers = [
  { name: 'Arnav Chachra', id: '1024170073', role: 'Backend & Testing' },
  { name: 'Kunwar Shauryaveer', id: '1024170078', role: 'Frontend' },
  { name: 'Piyush Sharan', id: '1024170072', role: 'Database & Documentation' },
]

const problemStatement = '“Recording participation awards during a live university lab interrupts the faculty workflow and can lead to missed, delayed, or incorrectly attributed entries. SmartToken will reduce that interruption while preserving faculty control, correction history, and reliable operation during network failure.”'

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  const page = route.replace('#/', '') || 'home'
  const pages = {
    home: <Home />,
    project: <Project />,
    team: <Team />,
    presentations: <Presentations />,
    'planning-v1': <PlanningV1 />,
    admin: <Admin />,
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#/" aria-label="SmartToken home">
          <span className="brand-mark" aria-hidden="true"><TokenIcon /></span>
          <span>Smart<span>Token</span></span>
        </a>
        <nav aria-label="Main navigation">
          {navigation.map(([label, href]) => (
            <a className={route === href ? 'active' : ''} href={href} key={href}>{label}</a>
          ))}
        </nav>
      </header>
      <main>{pages[page] || <NotFound />}</main>
      <footer className="site-footer">
        <span>SmartToken · Software Engineering team project</span>
        <a href="#/presentations">View project deliverables</a>
      </footer>
    </div>
  )
}

function Home() {
  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot" />Built for live university labs</p>
        <h1 id="hero-title">Participation recording that <em>respects the room.</em></h1>
        <p className="lead">SmartToken is a faculty-controlled participation and token system designed to keep live lab teaching moving while making every award, correction, and rule accountable.</p>
        <div className="actions">
          <a className="button" href="#/planning-v1">Open Planning Presentation v1 <ArrowIcon /></a>
          <a className="text-link" href="#/project">Explore the project <ArrowIcon /></a>
        </div>
      </div>
      <div className="hero-system" aria-label="SmartToken system overview">
        <div className="signal signal-one" /><div className="signal signal-two" />
        <div className="system-card lab-card"><span className="card-icon"><LabIcon /></span><div><small>Live lab</small><strong>Faculty & TA workflow</strong></div></div>
        <div className="system-core"><TokenIcon /><span>Smart<br />Token</span></div>
        <div className="system-card record-card"><span className="card-icon"><HistoryIcon /></span><div><small>Reliable record</small><strong>Audit & corrections</strong></div></div>
        <div className="system-tag tag-offline">Offline-ready</div>
        <div className="system-tag tag-control">Faculty decision</div>
      </div>
    </section>

    <section className="statement-band" aria-labelledby="statement-heading">
      <div><p className="eyebrow">Approved project problem statement</p><h2 id="statement-heading">The problem we are solving</h2></div>
      <blockquote>{problemStatement}</blockquote>
    </section>

    <section className="section" aria-labelledby="principles-heading">
      <div className="section-heading"><p className="eyebrow">Core system idea</p><h2 id="principles-heading">Fast in the moment. Accountable afterward.</h2><p>SmartToken supports the people running the lab—not an automated substitute for their judgment.</p></div>
      <div className="feature-grid">
        <Feature icon={<BoltIcon />} title="Fast faculty workflow" text="Record participation with minimal interruption during a live session." />
        <Feature icon={<RulesIcon />} title="Versioned token rules" text="Configure token rules clearly and retain their history as the project evolves." />
        <Feature icon={<SyncIcon />} title="Offline operation & sync" text="Keep working through network failure, then synchronize changes safely." />
        <Feature icon={<HistoryIcon />} title="Audit & corrections" text="Maintain append-only history so corrections remain visible and trustworthy." />
        <Feature icon={<PrivacyIcon />} title="Private student view" text="Students can review their own token history and corrections privately." />
      </div>
    </section>

    <section className="section timeline-section" aria-labelledby="milestone-heading">
      <div className="section-heading"><p className="eyebrow">Current project status</p><h2 id="milestone-heading">Planning the path to a live-lab pilot.</h2></div>
      <ol className="timeline">
        <li className="current"><span>Now</span><div><h3>Planning Presentation v1</h3><p>The current deliverable establishes the project direction, workflow, and engineering plan.</p><a href="#/planning-v1">View the presentation page <ArrowIcon /></a></div></li>
        <li><span>Week 7</span><div><h3>Usable pilot</h3><p>A usable SmartToken pilot is targeted for the team’s planned workflow.</p></div></li>
        <li><span>Weeks 9–15</span><div><h3>Supervised live-lab deployment</h3><p>Planned deployment in university labs under supervision.</p></div></li>
      </ol>
    </section>
  </>
}

function Feature({ icon, title, text }) { return <article className="feature-card"><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article> }

function Project() { return <section className="page">
  <p className="eyebrow">About SmartToken</p><h1>A dependable participation record for the pace of the lab.</h1>
  <p className="lead">SmartToken is a low-interruption, faculty-controlled system for recording participation awards in live university labs. It is an engineering project website’s subject—not a document-management product.</p>
  <div className="quote-card"><p className="eyebrow">Frozen problem statement</p><blockquote>{problemStatement}</blockquote></div>
  <div className="content-grid">
    <article><span className="feature-icon"><LabIcon /></span><h2>Designed around the live lab</h2><p>Faculty and TAs need to record participation without breaking the teaching flow or losing attribution accuracy.</p></article>
    <article><span className="feature-icon"><PrivacyIcon /></span><h2>Human decision stays central</h2><p>Faculty explicitly records a short response and makes the final evaluation and token decision. AI assistance, if used, is optional.</p></article>
    <article><span className="feature-icon"><SyncIcon /></span><h2>Reliable by design</h2><p>Offline operation, conflict-safe synchronization, configurable rules, and append-only audit history support real deployment conditions.</p></article>
  </div>
  <section className="architecture" aria-labelledby="architecture-heading"><div><p className="eyebrow">Planned engineering architecture</p><h2 id="architecture-heading">Simple, extensible foundations</h2><p>The team website will use a React frontend on GitHub Pages. The planned product services use Node.js and Express, PostgreSQL, and object storage; cloud implementation is intentionally outside the current frontend stage.</p></div><div className="architecture-stack"><span>React<br /><small>Team website</small></span><i>+</i><span>Node.js + Express<br /><small>Planned service</small></span><i>+</i><span>PostgreSQL<br /><small>Planned records</small></span></div></section>
</section> }

function Team() { return <section className="page">
  <p className="eyebrow">The team</p><h1>People building SmartToken.</h1>
  <div className="team-grid">{teamMembers.map((member, index) => <article key={member.id}><div className="avatar" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div><p className="member-label">{member.id}</p><h2>{member.name}</h2><h3>{member.role}</h3></article>)}</div>
  <div className="team-note"><PrivacyIcon /><p><strong>Roles represented in the system:</strong> Faculty, TA, Student, and Administrator. These are SmartToken user roles, distinct from the team’s own project responsibilities.</p></div>
</section> }

function Presentations() { return <section className="page">
  <p className="eyebrow">Project documentation & presentations</p><h1>Deliverables with their history intact.</h1><p className="lead">This area is for the team’s Software Engineering deliverables. Each published version will retain its presentation date, authors, and change summary.</p>
  <div className="deliverable-list"><article className="deliverable current-deliverable"><div className="deliverable-number">01</div><div><p className="eyebrow">Current deliverable</p><h2>Planning Presentation v1</h2><p>Initial planning presentation for the SmartToken project.</p><dl><div><dt>Presentation date</dt><dd>—</dd></div><div><dt>Version</dt><dd>v1</dd></div><div><dt>Authors</dt><dd>Arnav Chachra · Kunwar Shauryaveer · Piyush Sharan</dd></div></dl></div><a className="button" href="#/planning-v1">Open presentation <ArrowIcon /></a></article></div>
</section> }

function PlanningV1() {
  const [planningV1Page, setPlanningV1Page] = useState(1)

  return (
    <section className="page presentation-page">
      <a className="back-link" href="#/presentations">← All presentations</a><p className="eyebrow">Current deliverable · v1</p><h1>Planning Presentation v1</h1><p className="lead">The team will present this planning material directly from the SmartToken website.</p>
      <div className="presentation-meta"><div><span>Presentation date</span><strong>—</strong></div><div><span>Version</span><strong>v1</strong></div><div><span>Authors</span><strong>Arnav Chachra · Kunwar Shauryaveer · Piyush Sharan</strong></div></div>
      <div className="presentation-stage"><div className="stage-top"><span className="stage-mark"><TokenIcon /></span><span>SmartToken / Planning v1</span></div><div className="stage-content"><p className="eyebrow">Planning presentation</p><h2>SmartToken</h2></div></div>
      <section className="pdf-viewer-shell" aria-labelledby="planning-v1-pdf-heading">
        <div className="pdf-viewer-header">
          <div>
            <p className="eyebrow" id="planning-v1-pdf-heading">Open presentation PDF</p>
            <h2>Planning Presentation v1</h2>
          </div>
          <div className="pdf-viewer-actions">
            <span className="pdf-page-indicator">Page {planningV1Page} / {planningV1PageCount}</span>
            <a className="text-link" href="/presentations/planning-v1.pdf" target="_blank" rel="noreferrer">Open PDF in new tab <ArrowIcon /></a>
          </div>
        </div>
        <div className="pdf-viewer-controls" aria-label="PDF navigation controls">
          <button className="pdf-nav-button" type="button" onClick={() => setPlanningV1Page(current => Math.max(1, current - 1))} disabled={planningV1Page === 1}>← Previous</button>
          <button className="pdf-nav-button" type="button" onClick={() => setPlanningV1Page(current => Math.min(planningV1PageCount, current + 1))} disabled={planningV1Page === planningV1PageCount}>Next →</button>
        </div>
        <div className="pdf-viewer-frame">
          <img
            className="pdf-viewer"
            src={planningV1PageImage(planningV1Page)}
            alt={`Planning Presentation v1 page ${planningV1Page}`}
          />
        </div>
      </section>
      <div className="change-log"><h2>Version notes</h2><p><strong>v1 · Initial planning presentation.</strong></p></div>
    </section>
  )
}

function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(adminTokenKey) || '')
  const [authorId, setAuthorId] = useState(() => getUserIdFromToken(sessionStorage.getItem(adminTokenKey) || ''))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [deliverables, setDeliverables] = useState([])
  const [versions, setVersions] = useState([])
  const [selectedDeliverableId, setSelectedDeliverableId] = useState('')
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('')
  const [newDeliverableSlug, setNewDeliverableSlug] = useState('')
  const [newVersionNumber, setNewVersionNumber] = useState('v1')
  const [newVersionDate, setNewVersionDate] = useState('')
  const [newVersionSummary, setNewVersionSummary] = useState('')

  useEffect(() => {
    if (token) sessionStorage.setItem(adminTokenKey, token)
    else sessionStorage.removeItem(adminTokenKey)
  }, [token])

  useEffect(() => {
    if (!token) return
    let active = true

    async function loadDeliverables() {
      try {
        const data = await fetchDeliverables(token)
        if (!active) return
        setDeliverables(data)
        if (!selectedDeliverableId && data[0]) {
          setSelectedDeliverableId(String(data[0].id))
        }
      } catch (err) {
        if (active) setError(err.message)
      }
    }

    loadDeliverables()
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (!token || !selectedDeliverableId) return
    let active = true

    async function loadVersions() {
      try {
        const data = await fetchVersions(token, selectedDeliverableId)
        if (!active) return
        setVersions(data)
        if (data[0]) {
          setSelectedVersionId(String(data[0].id))
        } else {
          setSelectedVersionId('')
        }
      } catch (err) {
        if (active) setError(err.message)
      }
    }

    loadVersions()
    return () => { active = false }
  }, [token, selectedDeliverableId])

  async function handleLogin(event) {
    event.preventDefault()
    setBusy('login')
    setError('')
    setMessage('')
    try {
      const nextToken = await loginToAdmin(email.trim(), password)
      setToken(nextToken)
      setAuthorId(getUserIdFromToken(nextToken))
      setPassword('')
      setMessage('Logged in successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  async function handleCreateDeliverable(event) {
    event.preventDefault()
    setBusy('create-deliverable')
    setError('')
    setMessage('')
    try {
      const result = await createDeliverable(token, newDeliverableTitle.trim(), newDeliverableSlug.trim())
      setDeliverables(current => [result, ...current])
      setSelectedDeliverableId(String(result.id))
      setNewDeliverableTitle('')
      setNewDeliverableSlug('')
      setMessage(`Deliverable ${result.title} created.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  async function handleCreateVersion(event) {
    event.preventDefault()
    setBusy('create-version')
    setError('')
    setMessage('')
    try {
      if (!selectedDeliverableId) throw new Error('Choose a deliverable first.')
      const result = await createVersion(token, {
        deliverable_id: Number(selectedDeliverableId),
        version_number: newVersionNumber.trim(),
        date: newVersionDate,
        change_summary: newVersionSummary.trim(),
        author_id: authorId,
        status: 'draft',
      })
      setVersions(current => [result, ...current])
      setSelectedVersionId(String(result.id))
      setMessage(`Version ${result.version_number} created.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  async function handleUpload(event) {
    event.preventDefault()
    setBusy('upload')
    setError('')
    setMessage('')
    try {
      if (!file) throw new Error('Choose a file first.')
      if (!selectedVersionId) throw new Error('Choose or create a version first.')
      const result = await uploadFile(token, selectedDeliverableId, selectedVersionId, file)
      setMessage(`Uploaded ${result.original_name}.`)
      setFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  async function handlePublish(event) {
    event.preventDefault()
    setBusy('publish')
    setError('')
    setMessage('')
    try {
      if (!selectedVersionId) throw new Error('Choose or create a version first.')
      const result = await publishVersion(token, selectedVersionId)
      setMessage(`Version ${result.version_number} published.`)
      setVersions(current => current.map(version => (
        String(version.id) === String(result.id) ? result : version
      )))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  function handleLogout() {
    setToken('')
    setEmail('')
    setPassword('')
    setFile(null)
    setMessage('Logged out.')
    setError('')
    setDeliverables([])
    setVersions([])
    setSelectedDeliverableId('')
    setSelectedVersionId('')
    setAuthorId(null)
    setNewDeliverableTitle('')
    setNewDeliverableSlug('')
    setNewVersionNumber('v1')
    setNewVersionDate('')
    setNewVersionSummary('')
  }

  return (
    <section className="page admin-page">
      <p className="eyebrow">Instructor & team administration</p>
      <h1>Admin</h1>
      {!token ? (
        <form className="admin-panel" onSubmit={handleLogin}>
          <h2>Login</h2>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} required />
          </label>
          <button className="button" type="submit" disabled={busy === 'login'}>{busy === 'login' ? 'Logging in...' : 'Log in'}</button>
        </form>
      ) : (
        <>
          <div className="admin-toolbar">
            <p>Logged in for this session.</p>
            <button className="text-button" type="button" onClick={handleLogout}>Log out</button>
          </div>
          <form className="admin-panel" onSubmit={handleCreateDeliverable}>
            <h2>Create deliverable</h2>
            <label>
              <span>Title</span>
              <input value={newDeliverableTitle} onChange={event => setNewDeliverableTitle(event.target.value)} required />
            </label>
            <label>
              <span>Slug</span>
              <input value={newDeliverableSlug} onChange={event => setNewDeliverableSlug(event.target.value)} required />
            </label>
            <button className="button" type="submit" disabled={busy === 'create-deliverable'}>{busy === 'create-deliverable' ? 'Creating...' : 'Create deliverable'}</button>
          </form>
          <form className="admin-panel" onSubmit={handleCreateVersion}>
            <h2>Create version</h2>
            <label>
              <span>Deliverable</span>
              <select className="admin-select" value={selectedDeliverableId} onChange={event => setSelectedDeliverableId(event.target.value)} required>
                <option value="" disabled>Select deliverable</option>
                {deliverables.map(deliverable => (
                  <option key={deliverable.id} value={deliverable.id}>{deliverable.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Version number</span>
              <input value={newVersionNumber} onChange={event => setNewVersionNumber(event.target.value)} required />
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={newVersionDate} onChange={event => setNewVersionDate(event.target.value)} required />
            </label>
            <label>
              <span>Change summary</span>
              <input value={newVersionSummary} onChange={event => setNewVersionSummary(event.target.value)} required />
            </label>
            <button className="button" type="submit" disabled={busy === 'create-version'}>{busy === 'create-version' ? 'Creating...' : 'Create version'}</button>
          </form>
          <form className="admin-panel" onSubmit={handleUpload}>
            <h2>Upload file</h2>
            <label>
              <span>Selected deliverable</span>
              <select className="admin-select" value={selectedDeliverableId} onChange={event => setSelectedDeliverableId(event.target.value)} required>
                <option value="" disabled>Select deliverable</option>
                {deliverables.map(deliverable => (
                  <option key={deliverable.id} value={deliverable.id}>{deliverable.title}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Selected version</span>
              <select className="admin-select" value={selectedVersionId} onChange={event => setSelectedVersionId(event.target.value)} required>
                <option value="" disabled>Select version</option>
                {versions.map(version => (
                  <option key={version.id} value={version.id}>{version.version_number} · {version.status}</option>
                ))}
              </select>
            </label>
            <label>
              <span>File</span>
              <input type="file" onChange={event => setFile(event.target.files?.[0] || null)} required />
            </label>
            <button className="button" type="submit" disabled={busy === 'upload'}>{busy === 'upload' ? 'Uploading...' : 'Upload file'}</button>
          </form>
          <form className="admin-panel" onSubmit={handlePublish}>
            <h2>Publish version</h2>
            <label>
              <span>Selected version</span>
              <select className="admin-select" value={selectedVersionId} onChange={event => setSelectedVersionId(event.target.value)} required>
                <option value="" disabled>Select version</option>
                {versions.map(version => (
                  <option key={version.id} value={version.id}>{version.version_number} · {version.status}</option>
                ))}
              </select>
            </label>
            <button className="button" type="submit" disabled={busy === 'publish'}>{busy === 'publish' ? 'Publishing...' : 'Publish version'}</button>
          </form>
        </>
      )}
      {(message || error) && <p className={error ? 'admin-feedback error' : 'admin-feedback success'}>{error || message}</p>}
    </section>
  )
}

function NotFound() { return <section className="page not-found"><p className="eyebrow">Page not found</p><h1>That page has not been published.</h1><a className="button" href="#/">Return home <ArrowIcon /></a></section> }

function TokenIcon() { return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.4"/><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2.4"/><path d="M16 1.5v4M16 26.5v4M1.5 16h4M26.5 16h4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg> }
function ArrowIcon() { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function LabIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3h6M10 3v6.1L5.2 17a2.6 2.6 0 0 0 2.2 4h9.2a2.6 2.6 0 0 0 2.2-4L14 9.1V3M8.5 16h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function HistoryIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function BoltIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function RulesIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5h14M5 12h14M5 19h14M8 3v4M16 10v4M11 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg> }
function SyncIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 7h-5V2M4 17h5v5M19.2 12A7.5 7.5 0 0 0 6.4 6.7L5 7M4.8 12a7.5 7.5 0 0 0 12.8 5.3L19 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function PrivacyIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v5c0 4.8 2.9 8.4 7 10 4.1-1.6 7-5.2 7-10V6l-7-3ZM9.5 12l1.6 1.6 3.7-3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg> }

export default App
