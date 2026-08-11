import { useEffect, useState } from 'react'
import { getProjectStatus } from './services/api'

const navigation = [
  ['Home', '#/'],
  ['Project', '#/project'],
  ['Team', '#/team'],
  ['Planning Presentation v1', '#/planning-v1'],
]

const teamMembers = [
  { name: 'Team member 1', role: 'Project lead' },
  { name: 'Team member 2', role: 'Frontend & user experience' },
  { name: 'Team member 3', role: 'Backend & database' },
  { name: 'Team member 4', role: 'Documentation & testing' },
]

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  const page = route.replace('#/', '') || 'home'

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#/" aria-label="SmartToken home">Smart<span>Token</span></a>
        <nav aria-label="Main navigation">
          {navigation.map(([label, href]) => <a className={route === href ? 'active' : ''} href={href} key={href}>{label}</a>)}
        </nav>
      </header>
      <main>
        {page === 'project' && <Project />}
        {page === 'team' && <Team />}
        {page === 'planning-v1' && <Planning />}
        {page === 'home' && <Home />}
      </main>
      <footer>SmartToken team project · <a href="#/project">View project details</a></footer>
    </>
  )
}

function Home() {
  const [status, setStatus] = useState(null)

  useEffect(() => { getProjectStatus().then(setStatus) }, [])

  return <>
    <section className="hero">
      <p className="eyebrow">Team software engineering project</p>
      <h1>Keep every document version <em>clear and trusted.</em></h1>
      <p className="lead">SmartToken is a simple platform for securely managing, tracking, and retrieving document versions.</p>
      <div className="actions"><a className="button" href="#/project">Explore the project</a><a className="text-link" href="#/planning-v1">Planning Presentation v1 →</a></div>
      {status && <p className="status" aria-live="polite">{status.message}</p>}
    </section>
    <section className="three-column" aria-label="SmartToken highlights">
      <article><h2>Organize</h2><p>Keep important files and their history together in one understandable place.</p></article>
      <article><h2>Track</h2><p>See what changed, when it changed, and which version is current.</p></article>
      <article><h2>Protect</h2><p>Build toward controlled access and reliable document handling for teams.</p></article>
    </section>
  </>
}

function Project() { return <section className="page"><p className="eyebrow">About SmartToken</p><h1>Project overview</h1><p className="lead">Our goal is to make document version management less confusing for collaborative teams.</p><div className="content-grid"><article><h2>Problem</h2><p>Files are often duplicated, renamed inconsistently, or shared without a clear record of which copy is correct.</p></article><article><h2>Proposed solution</h2><p>SmartToken will provide a focused workspace for uploading documents, creating versions, and viewing their history.</p></article><article><h2>Planned technology</h2><p>React for the interface, Express for the application service, PostgreSQL for records, and local storage during development.</p></article></div></section> }

function Team() { return <section className="page"><p className="eyebrow">The people behind the project</p><h1>Our team</h1><p className="lead">Replace these placeholders with your team’s names and agreed responsibilities.</p><div className="team-grid">{teamMembers.map((member) => <article key={member.name}><div className="avatar" aria-hidden="true">{member.name.at(-1)}</div><h2>{member.name}</h2><p>{member.role}</p></article>)}</div></section> }

function Planning() { return <section className="page presentation"><p className="eyebrow">Project milestone</p><h1>Planning Presentation v1</h1><p className="lead">The first planning presentation will be available here once the team has finalized it.</p><div className="placeholder"><span aria-hidden="true">▣</span><h2>Presentation placeholder</h2><p>Add a PDF, slide link, or embedded presentation at this location.</p></div><a className="button" href="#/project">Return to project overview</a></section> }

export default App
