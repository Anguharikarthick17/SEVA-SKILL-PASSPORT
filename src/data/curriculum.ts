export interface DetailedLesson {
  id: string;
  moduleId: string;
  number: number;
  title: string;
  duration: string;
  shortDescription: string;
  learningObjectives: string[];
  conceptExplanation: string;
  codeExample: {
    language: string;
    code: string;
    caption: string;
  };
  keyTakeaways: string[];
  skills: string[];
}

export interface LabDefinition {
  id: string;
  moduleId: string;
  title: string;
  objective: string;
  requirements: string[];
  hints: string[];
  expectedOutput: string;
  skillsTested: string[];
  submissionRequirements: string;
  starterCode?: string;
}

export interface PracticeActivity {
  id: string;
  type: 'conceptual' | 'debugging' | 'coding' | 'scenario';
  title: string;
  description: string;
  task: string;
  options?: string[];
  correctAnswer?: string;
}

export interface ModuleCurriculum {
  id: string;
  number: string;
  title: string;
  slug: string;
  description: string;
  primarySkill: string;
  skills: string[];
  status: 'completed' | 'current' | 'locked';
  lessons: DetailedLesson[];
  lab: LabDefinition;
  practiceActivities: PracticeActivity[];
}

export const FULL_STACK_MODULES: ModuleCurriculum[] = [
  // =========================================================================
  // MODULE 01: WEB FUNDAMENTALS
  // =========================================================================
  {
    id: 'mod-01',
    number: '01',
    title: 'Web Fundamentals',
    slug: 'web-fundamentals',
    description: 'Foundations of web systems: HTTP protocol, client-server lifecycle, DNS resolution, and browser rendering.',
    primarySkill: 'Web Fundamentals',
    skills: ['Web Fundamentals', 'HTTP', 'Networking'],
    status: 'completed',
    lab: {
      id: 'lab-01',
      moduleId: 'mod-01',
      title: 'Inspect an HTTP Request',
      objective: 'Capture, inspect, and analyze the request and response headers of a web API transaction using browser DevTools or curl.',
      requirements: [
        'Open browser DevTools Network tab or a command line terminal with curl.',
        'Trigger a GET request to a public API endpoint (e.g. /api/health or jsonplaceholder).',
        'Extract Method, Path, Status Code, Content-Type, and Cache-Control headers.',
        'Document how the browser negotiates compression with Accept-Encoding.'
      ],
      hints: [
        'Look at the General section in DevTools Network tab for Request URL and Remote Address.',
        'Observe the difference between 200 OK and 304 Not Modified when reloading with cache enabled.'
      ],
      expectedOutput: 'A structured breakdown of Request Line, Headers (Host, User-Agent, Accept), and Response Status (200 OK) with Content-Length.',
      skillsTested: ['Web Fundamentals', 'HTTP', 'Debugging'],
      submissionRequirements: 'Submit the parsed JSON inspection log detailing Request Headers, Response Headers, and status verification.'
    },
    practiceActivities: [
      {
        id: 'prac-01-1',
        type: 'conceptual',
        title: 'Identify client/server responsibilities',
        description: 'Categorize whether tasks like DOM rendering, business validation, data persistence, and input handling belong to Client or Server.',
        task: 'Classify: 1. Calculating a dynamic CSS transition (Client). 2. Enforcing password hashing with bcrypt (Server). 3. Storing payment records in PostgreSQL (Server). 4. Validating email regex on blur for instant user feedback (Client).'
      },
      {
        id: 'prac-01-2',
        type: 'debugging',
        title: 'Analyze an HTTP request',
        description: 'Diagnose why a client request to /api/users returns a 405 Method Not Allowed error.',
        task: 'The client initiated a POST request to an endpoint configured strictly for GET. Rectify the HTTP method or server route definition.'
      }
    ],
    lessons: [
      {
        id: 'les-01-01',
        moduleId: 'mod-01',
        number: 1,
        title: 'How the Web Works',
        duration: '15 min',
        shortDescription: 'The global distributed architecture connecting clients, internet transit, and web servers.',
        learningObjectives: [
          'Understand client-server architecture over the global internet',
          'Trace a request packet through routers, switches, and ISPs',
          'Identify TCP/IP packet transmission basics'
        ],
        conceptExplanation: 'The World Wide Web is a distributed hypertext system operating on top of the Internet protocol suite. When a user requests a resource, the browser initiates a TCP connection to the host address resolved by DNS. Data travels in discrete IP packets across internet exchange points, is reassembled at the destination server, and triggers application processing before returning an HTTP response.',
        codeExample: {
          language: 'bash',
          code: `# Trace packet route to destination server
traceroute api.example.com
# Check TCP connection status
nc -zv api.example.com 443`,
          caption: 'Diagnostic networking commands to trace internet transit path'
        },
        keyTakeaways: [
          'The Internet is the physical network infrastructure; the Web is an application layer built on it.',
          'TCP guarantees ordered, error-checked packet delivery between client and server.',
          'Latency is governed by physical distance, routing hops, and server processing capacity.'
        ],
        skills: ['Web Fundamentals', 'Networking']
      },
      {
        id: 'les-01-02',
        moduleId: 'mod-01',
        number: 2,
        title: 'Client vs Server',
        duration: '18 min',
        shortDescription: 'Delineating responsibilities between user-facing frontend runtimes and secure backend servers.',
        learningObjectives: [
          'Distinguish untrusted client environments from trusted server environments',
          'Analyze state management tradeoffs across client and server boundaries',
          'Prevent security vulnerabilities caused by relying solely on client validation'
        ],
        conceptExplanation: 'The client (browser, mobile app) executes in an untrusted user environment focused on presentation, user input capture, and immediate visual feedback. The server operates in a secure environment responsible for authorization, database persistence, transaction integrity, and confidential business logic. Never trust client-supplied data without server-side validation.',
        codeExample: {
          language: 'typescript',
          code: `// Client: Optimistic UI & Presentation
function handleFormSubmit(payload: UserInput) {
  displaySpinner();
  fetch('/api/account', { method: 'POST', body: JSON.stringify(payload) });
}

// Server: Authoritative Validation & Persistence
async function handleAccountCreation(req: Request) {
  const verified = await verifyAuthToken(req.headers.authorization);
  if (!verified) throw new UnauthorizedError();
  return await db.accounts.insert(req.body);
}`,
          caption: 'Separation of concerns between client UI dispatch and authoritative server logic'
        },
        keyTakeaways: [
          'The client is inherently accessible to user inspection and tamper.',
          'All business rules and validation must be re-verified authoritatively on the server.',
          'API contracts define the communication protocol between both realms.'
        ],
        skills: ['Web Fundamentals', 'Architecture']
      },
      {
        id: 'les-01-03',
        moduleId: 'mod-01',
        number: 3,
        title: 'HTTP and HTTPS',
        duration: '20 min',
        shortDescription: 'Hypertext Transfer Protocol semantics and Transport Layer Security (TLS) encryption.',
        learningObjectives: [
          'Explain the stateless nature of HTTP/1.1 and multiplexing in HTTP/2 & HTTP/3',
          'Understand TLS handshake mechanisms and public key infrastructure',
          'Identify how SSL/TLS certificates prevent eavesdropping and man-in-the-middle attacks'
        ],
        conceptExplanation: 'HTTP is an application-layer protocol for transmitting hypermedia documents. Plaintext HTTP (port 80) transmits requests without encryption, exposing credentials and session tokens to packet sniffing. HTTPS (port 443) layers HTTP over TLS (Transport Layer Security), which encrypts the payload, ensures data integrity, and validates server identity using cryptographic certificates signed by Certificate Authorities.',
        codeExample: {
          language: 'bash',
          code: `# Inspect TLS certificate chain & protocol negotiation
curl -Iv https://seva.skillpassport.in

# Verify TLS handshake cipher suites
openssl s_client -connect seva.skillpassport.in:443 -tls1_3`,
          caption: 'Verifying TLS 1.3 cryptographic handshake using OpenSSL'
        },
        keyTakeaways: [
          'HTTPS encrypts the request URI path, headers, and body, leaving only the hostname visible (SNI).',
          'TLS provides three vital guarantees: Confidentiality, Integrity, and Authentication.',
          'Modern web browsers enforce HTTPS via HSTS (HTTP Strict Transport Security).'
        ],
        skills: ['Web Fundamentals', 'Security']
      },
      {
        id: 'les-01-04',
        moduleId: 'mod-01',
        number: 4,
        title: 'Request and Response',
        duration: '22 min',
        shortDescription: 'Structure of HTTP messages: Start line, Headers, Body, and Status Codes.',
        learningObjectives: [
          'Dissect raw HTTP requests (Method, Path, Protocol, Headers, Body)',
          'Dissect raw HTTP responses (Status Code, Status Message, Headers, Body)',
          'Interpret HTTP status code families (1xx, 2xx, 3xx, 4xx, 5xx)'
        ],
        conceptExplanation: 'Every HTTP exchange consists of a request message and a response message. The request specifies a Verb (GET, POST, PUT, DELETE), Target URI, and Headers like Content-Type and Authorization. The response returns a 3-digit Status Code indicating outcome: 2xx (Success), 3xx (Redirection), 4xx (Client Error), or 5xx (Server Error), followed by metadata headers and optional payload body.',
        codeExample: {
          language: 'http',
          code: `POST /api/v1/students HTTP/1.1
Host: api.seva.edu
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1Ni...

{ "name": "Arjun Sharma", "course": "Full Stack" }

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/students/std-101

{ "id": "std-101", "status": "enrolled" }`,
          caption: 'Raw HTTP POST request and 201 Created response'
        },
        keyTakeaways: [
          'Headers contain metadata controlling caching, authorization, content negotiation, and compression.',
          '4xx status codes mean the client submitted an invalid or unauthorized request; 5xx means server failed internally.',
          'Safe methods (GET, HEAD) must not alter server state; idempotent methods (PUT, DELETE) produce identical results on repeated calls.'
        ],
        skills: ['Web Fundamentals', 'HTTP']
      },
      {
        id: 'les-01-05',
        moduleId: 'mod-01',
        number: 5,
        title: 'URLs, DNS and Hosting',
        duration: '18 min',
        shortDescription: 'Uniform Resource Locators, hierarchical domain name resolution, and web hosting architectures.',
        learningObjectives: [
          'Break down URL anatomy: scheme, host, port, path, query parameters, fragment',
          'Trace recursive and authoritative DNS resolution (A, CNAME, AAAA, MX records)',
          'Compare shared hosting, VPS, serverless edge runtimes, and static asset CDNs'
        ],
        conceptExplanation: 'A URL provides the address of a resource on the web. Before reaching the host, the browser resolves the human-readable domain name (example.com) to a numerical IP address (198.51.100.24) through DNS resolvers, starting from root servers, TLD name servers (.com), and authoritative name servers. Modern hosting combines edge Content Delivery Networks (CDNs) for static assets with compute servers for dynamic APIs.',
        codeExample: {
          language: 'bash',
          code: `# Query DNS A record resolution with dig
dig A seva.skillpassport.in +trace

# Query canonical CNAME aliases
dig CNAME cdn.seva.skillpassport.in +short`,
          caption: 'Tracing recursive DNS lookup path with dig utility'
        },
        keyTakeaways: [
          'DNS caching occurs at browser, OS, router, and recursive resolver levels to minimize latency.',
          'Query parameters (?sort=desc&limit=10) pass non-hierarchical filters to the server.',
          'CDNs cache assets in edge locations physically close to users around the world.'
        ],
        skills: ['Web Fundamentals', 'Networking']
      },
      {
        id: 'les-01-06',
        moduleId: 'mod-01',
        number: 6,
        title: 'Browser Fundamentals',
        duration: '24 min',
        shortDescription: 'The Critical Rendering Path: HTML parsing, DOM construction, CSSOM, Render Tree, Layout, and Paint.',
        learningObjectives: [
          'Trace the Critical Rendering Path step-by-step',
          'Differentiate between Reflow (Layout) and Repaint performance costs',
          'Explain the browser single-threaded JavaScript execution environment'
        ],
        conceptExplanation: 'When a browser receives an HTML document stream, its rendering engine tokenizes tags into DOM nodes. Concurrently, linked CSS files are parsed into the CSSOM (CSS Object Model). The engine combines DOM and CSSOM to build the Render Tree (excluding hidden elements). Next, the Layout phase computes exact geometry and coordinates on screen, followed by Painting pixels to GPU layers and compositing.',
        codeExample: {
          language: 'javascript',
          code: `// Measure DOM construction & paint timing using Performance API
window.addEventListener('load', () => {
  const [navTiming] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  console.log('DNS Lookup:', navTiming.domainLookupEnd - navTiming.domainLookupStart, 'ms');
  console.log('DOM Interactive:', navTiming.domInteractive, 'ms');
  console.log('DOM Complete:', navTiming.domComplete, 'ms');
});`,
          caption: 'Auditing page load metrics using the browser Performance Navigation Timing API'
        },
        keyTakeaways: [
          'Render-blocking scripts and stylesheets delay first paint until downloaded and parsed.',
          'Modifying geometry properties (width, padding) triggers expensive Layout reflows; transform and opacity only trigger composite.',
          'Modern browsers use speculative parsers to preload linked resources in the HTML stream.'
        ],
        skills: ['Web Fundamentals', 'Browser Internals']
      }
    ]
  },

  // =========================================================================
  // MODULE 02: HTML & CSS
  // =========================================================================
  {
    id: 'mod-02',
    number: '02',
    title: 'HTML & CSS',
    slug: 'html-css',
    description: 'Semantic markup, accessible web forms, modern CSS layout engines (Flexbox & Grid), and responsive interfaces.',
    primarySkill: 'HTML/CSS',
    skills: ['HTML/CSS', 'Accessibility', 'Responsive Design'],
    status: 'completed',
    lab: {
      id: 'lab-02',
      moduleId: 'mod-02',
      title: 'Build a Responsive Landing Page',
      objective: 'Create a mobile-first, semantic, accessible product landing page with a responsive navigation bar, hero section, card grid, and accessible contact form.',
      requirements: [
        'Use semantic landmark elements: <header>, <nav>, <main>, <section>, <article>, and <footer>.',
        'Implement mobile-first responsive layout with CSS Grid and Flexbox with breakpoints at 640px and 1024px.',
        'Build accessible form controls with explicit <label for=""> attributes and ARIA error states.',
        'Ensure WCAG AA contrast ratio compliance (at least 4.5:1 for normal text).'
      ],
      hints: [
        'Use repeat(auto-fit, minmax(280px, 1fr)) for an inherently responsive card grid without excessive media queries.',
        'Use rem units for scalable typography and padding.'
      ],
      expectedOutput: 'A clean HTML5 & CSS stylesheet that renders fluidly across viewport widths from 320px to 1920px with 100% lighthouse accessibility.',
      skillsTested: ['HTML/CSS', 'Responsive Design', 'Accessibility'],
      submissionRequirements: 'Submit HTML and CSS files demonstrating responsive breakpoints and semantic landmark validation.'
    },
    practiceActivities: [
      {
        id: 'prac-02-1',
        type: 'debugging',
        title: 'Fix a Broken Responsive Layout',
        description: 'A 3-column card grid overflows horizontally on mobile devices causing an ugly horizontal scrollbar.',
        task: 'Remove rigid fixed width: 1200px styles. Replace with width: 100%, max-width: 1200px, and CSS Grid with auto-fit minmax column definitions.'
      },
      {
        id: 'prac-02-2',
        type: 'conceptual',
        title: 'Accessibility & Landmark Audit',
        description: 'Audit markup lacking proper screen reader navigation hooks.',
        task: 'Replace generic <div> containers with <header>, <main>, <aside>, and <nav> to provide accessible landmark regions.'
      }
    ],
    lessons: [
      {
        id: 'les-02-01',
        moduleId: 'mod-02',
        number: 1,
        title: 'HTML Document Structure',
        duration: '15 min',
        shortDescription: 'Doctype declaration, head metadata, viewport configuration, and document hierarchy.',
        learningObjectives: [
          'Write valid HTML5 document skeletons with proper doctype and language attributes',
          'Configure essential meta tags: charset, viewport, and Open Graph previews',
          'Structure root documents for internationalization and search engine crawlers'
        ],
        conceptExplanation: 'Every web document begins with <!DOCTYPE html> which instructs the browser to render in standard mode rather than quirks mode. The <head> contains machine-readable metadata including UTF-8 character encoding, responsive viewport scaling directives, and document titles, while the <body> encapsulates all visible markup.',
        codeExample: {
          language: 'html',
          code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SEVA Skill Passport | Technical Verification</title>
    <meta name="description" content="Proof of course to proof of ability." />
  </head>
  <body>
    <h1>Skill Passport</h1>
  </body>
</html>`,
          caption: 'Standard HTML5 document boilerplate with responsive viewport metadata'
        },
        keyTakeaways: [
          'The viewport meta tag is essential for responsive mobile layout calculation.',
          'Missing character encoding can result in mojibake character corruption.',
          'Document language (lang="en") enables correct screen reader pronunciation.'
        ],
        skills: ['HTML/CSS']
      },
      {
        id: 'les-02-02',
        moduleId: 'mod-02',
        number: 2,
        title: 'Semantic HTML',
        duration: '18 min',
        shortDescription: 'Using meaningful tags (<header>, <article>, <nav>, <aside>) instead of div soups.',
        learningObjectives: [
          'Select appropriate semantic tags for common content patterns',
          'Construct an accessible document outline using h1-h6 hierarchies',
          'Enhance SEO and assistive technology navigation with landmark elements'
        ],
        conceptExplanation: 'Semantic HTML introduces tags that carry meaning about their content rather than pure presentation. Assistive technologies (screen readers) utilize semantic landmarks to allow visually impaired users to jump directly to navigation, main content, or search areas without hearing entire page headers re-read.',
        codeExample: {
          language: 'html',
          code: `<header>
  <nav aria-label="Primary navigation">
    <a href="/">Home</a>
  </nav>
</header>
<main>
  <article>
    <h2>Understanding Event Loop</h2>
    <p>The event loop continuously monitors call stack...</p>
  </article>
</main>
<footer>
  <p>&copy; 2026 SEVA Skill Passport</p>
</footer>`,
          caption: 'Semantic document layout using structural landmark elements'
        },
        keyTakeaways: [
          'Use <main> exactly once per document to house the core topic of the page.',
          'Do not skip heading levels (e.g. h1 directly to h3) to maintain navigable document hierarchies.',
          'Semantic HTML improves organic search engine crawl efficiency.'
        ],
        skills: ['HTML/CSS', 'Accessibility']
      },
      {
        id: 'les-02-03',
        moduleId: 'mod-02',
        number: 3,
        title: 'Forms and Inputs',
        duration: '22 min',
        shortDescription: 'Building robust, accessible data collection interfaces with input types and validation attributes.',
        learningObjectives: [
          'Connect inputs with explicit labels using the for/id attribute pairing',
          'Leverage modern HTML5 input types (email, tel, number, date) for native mobile keyboards',
          'Implement client-side validation using required, pattern, and min/max constraints'
        ],
        conceptExplanation: 'Forms bridge user interactions to backend services. Every input element must have an associated <label> connected via matching for and id attributes to provide a large clickable hit area and screen reader context. Native HTML validation attributes (required, pattern) provide immediate feedback before form transmission.',
        codeExample: {
          language: 'html',
          code: `<form action="/api/register" method="POST">
  <div>
    <label for="user-email">Email Address</label>
    <input 
      type="email" 
      id="user-email" 
      name="email" 
      required 
      autocomplete="email" 
    />
  </div>
  <button type="submit">Enroll Now</button>
</form>`,
          caption: 'Accessible form control with explicit label linkage and native validation'
        },
        keyTakeaways: [
          'Clicking a label automatically focuses its bound input control.',
          'Always specify input type="button", "submit", or "reset" on button elements to avoid accidental form submissions.',
          'Autocomplete attributes streamline password managers and browser autofill.'
        ],
        skills: ['HTML/CSS', 'Accessibility']
      },
      {
        id: 'les-02-04',
        moduleId: 'mod-02',
        number: 4,
        title: 'Accessibility Fundamentals',
        duration: '20 min',
        shortDescription: 'WCAG compliance: Color contrast, keyboard focus management, alt text, and ARIA roles.',
        learningObjectives: [
          'Understand WCAG 2.1 AA requirements for digital products',
          'Implement visible focus rings and logical tab order for keyboard-only navigation',
          'Apply descriptive alt attributes for informative images and empty alt for decorative icons'
        ],
        conceptExplanation: 'Web accessibility (a11y) ensures that people with disabilities can perceive, understand, navigate, and interact with the web. This includes keyboard accessibility (navigable via Tab/Enter/Space without getting trapped), sufficient color contrast, and proper ARIA (Accessible Rich Internet Applications) attributes when native HTML elements fall short.',
        codeExample: {
          language: 'html',
          code: `<!-- Accessible icon button with screen-reader text -->
<button type="button" aria-label="Close notification dialog">
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
</button>`,
          caption: 'Accessible icon button with aria-label and decorative SVG hidden from assistive tech'
        },
        keyTakeaways: [
          'Never remove outline: none without providing a high-visibility custom focus indicator.',
          'First rule of ARIA: Do not use ARIA if a native HTML element already possesses the needed semantics.',
          'Text color contrast must meet at least 4.5:1 ratio against background.'
        ],
        skills: ['Accessibility', 'HTML/CSS']
      },
      {
        id: 'les-02-05',
        moduleId: 'mod-02',
        number: 5,
        title: 'CSS Fundamentals',
        duration: '18 min',
        shortDescription: 'Selectors, specificity hierarchy, cascade rules, and inheritance.',
        learningObjectives: [
          'Calculate selector specificity scores (inline > ID > class/attribute > element)',
          'Understand how CSS property inheritance works from parent to child',
          'Leverage modern CSS custom properties (variables) for coherent design tokens'
        ],
        conceptExplanation: 'CSS governs presentation. When multiple style rules target the same DOM element, the browser cascade resolves conflicts based on origin, specificity, and source order. Specificity is calculated as a 3-component tuple (IDs, Classes/Attributes/Pseudo-classes, Elements/Pseudo-elements). Maintain flat specificity using class-based styling to avoid selector wars.',
        codeExample: {
          language: 'css',
          code: `:root {
  --primary-navy: #1e3a8a;
  --accent-saffron: #f97316;
}

.passport-card {
  background-color: white;
  border-left: 4px solid var(--accent-saffron);
  color: var(--primary-navy);
}`,
          caption: 'Using CSS custom properties to maintain consistent design tokens'
        },
        keyTakeaways: [
          'Avoid using !important; fix specificity by refactoring selector chains instead.',
          'Inherited properties include font-family, color, and line-height.',
          'CSS variables cascade dynamically down the DOM tree and can be updated at runtime.'
        ],
        skills: ['HTML/CSS']
      },
      {
        id: 'les-02-06',
        moduleId: 'mod-02',
        number: 6,
        title: 'Box Model',
        duration: '16 min',
        shortDescription: 'Content, padding, border, margin, and border-box sizing calculations.',
        learningObjectives: [
          'Dissect the four concentric layers of the CSS Box Model',
          'Understand the difference between content-box and border-box',
          'Prevent unintended layout overflow using universal border-box resets'
        ],
        conceptExplanation: 'Every rendered HTML element is treated as a rectangular box comprising Content, Padding (inner spacing), Border (boundary line), and Margin (outer clearance). In legacy content-box mode, padding and border are added onto the specified width. In modern border-box mode, the specified width includes padding and border, ensuring predictable column layouts.',
        codeExample: {
          language: 'css',
          code: `*, *::before, *::after {
  box-sizing: border-box;
}

.metric-card {
  width: 300px;
  padding: 24px;
  border: 2px solid #e2e8f0;
  margin: 16px;
  /* Rendered element width is exactly 300px */
}`,
          caption: 'Universal border-box reset ensuring predictable sizing calculations'
        },
        keyTakeaways: [
          'Vertical margins between block elements can collapse into the single largest margin value.',
          'Inline elements (span, a) ignore top and bottom margins.',
          'Padding adds clickable surface area to interactive controls.'
        ],
        skills: ['HTML/CSS']
      },
      {
        id: 'les-02-07',
        moduleId: 'mod-02',
        number: 7,
        title: 'Flexbox',
        duration: '22 min',
        shortDescription: 'One-dimensional layouts: Main axis, cross axis, justify-content, and align-items.',
        learningObjectives: [
          'Master flex container properties: flex-direction, justify-content, align-items, flex-wrap',
          'Control flex item behavior: flex-grow, flex-shrink, and flex-basis',
          'Build complex navigation bars, centered dialogs, and button clusters with Flexbox'
        ],
        conceptExplanation: 'Flexible Box Layout (Flexbox) provides an efficient mechanism to lay out, align, and distribute space among items in a container along a single axis (either horizontal row or vertical column). It automatically expands items to fill available free space or shrinks them to prevent overflow.',
        codeExample: {
          language: 'css',
          code: `.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-bar {
  flex: 1 1 auto; /* Grow to take remaining space */
}`,
          caption: 'Building a responsive navigation bar with Flexbox and gap property'
        },
        keyTakeaways: [
          'Flexbox is optimal for one-dimensional layouts (a single row or single column).',
          'Use the modern gap property instead of margin hacks between flex children.',
          'Centering an element in both axes is as simple as display: flex; justify-content: center; align-items: center.'
        ],
        skills: ['HTML/CSS', 'Responsive Design']
      },
      {
        id: 'les-02-08',
        moduleId: 'mod-02',
        number: 8,
        title: 'CSS Grid',
        duration: '24 min',
        shortDescription: 'Two-dimensional layouts: Grid template columns, rows, areas, and auto-fit minmax.',
        learningObjectives: [
          'Construct two-dimensional grid layouts managing simultaneous row and column alignment',
          'Utilize fractional units (fr) and minmax() functions for responsive columns without media queries',
          'Assign elements using named grid-template-areas for complex dashboards'
        ],
        conceptExplanation: 'CSS Grid Layout is the most powerful layout system available in CSS. It divides a page into major regions and relationships in terms of size, position, and layer across two dimensions simultaneously. You can place items anywhere along explicit or implicit column and row tracks.',
        codeExample: {
          language: 'css',
          code: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.featured-widget {
  grid-column: span 2;
}`,
          caption: 'Fluid multi-column card grid using auto-fit minmax pattern'
        },
        keyTakeaways: [
          'Use CSS Grid for overall page scaffolding and 2D widgets; use Flexbox for 1D micro-components.',
          'auto-fit minmax enables fluid responsiveness that gracefully reorganizes cards as screen width changes.',
          'Grid supports subgrid for child components to inherit parent track alignments.'
        ],
        skills: ['HTML/CSS', 'Responsive Design']
      },
      {
        id: 'les-02-09',
        moduleId: 'mod-02',
        number: 9,
        title: 'Responsive Design',
        duration: '20 min',
        shortDescription: 'Mobile-first strategy, CSS media queries, fluid units, and responsive images.',
        learningObjectives: [
          'Adopt a mobile-first development methodology using min-width media queries',
          'Select standard device breakpoints (640px, 768px, 1024px, 1280px)',
          'Implement responsive typography using clamp() and fluid viewport units'
        ],
        conceptExplanation: 'Responsive Web Design (RWD) enables websites to adjust automatically to whatever screen size a user happens to be viewing them on. The mobile-first strategy writes base CSS for small screens first, progressively enhancing layout capabilities at larger viewport breakpoints using @media (min-width: ...).',
        codeExample: {
          language: 'css',
          code: `/* Mobile First Base */
.container {
  padding: 16px;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}

/* Tablet & Desktop Enhancements */
@media (min-width: 768px) {
  .container {
    padding: 32px;
  }
}`,
          caption: 'Mobile-first breakpoint progression with fluid clamp() typography'
        },
        keyTakeaways: [
          'Designing mobile-first reduces bloated desktop CSS and speeds up mobile bandwidth rendering.',
          'Avoid rigid pixel breakpoints; base breakpoints on content requirements rather than specific phone models.',
          'Test with touch interactions and varying pixel density (Retina) screens.'
        ],
        skills: ['Responsive Design', 'HTML/CSS']
      }
    ]
  },

  // =========================================================================
  // MODULE 03: JAVASCRIPT FUNDAMENTALS
  // =========================================================================
  {
    id: 'mod-03',
    number: '03',
    title: 'JavaScript Fundamentals',
    slug: 'javascript-fundamentals',
    description: 'Core JavaScript programming: Types, control structures, functions, array transformations, objects, scope, and error handling.',
    primarySkill: 'JavaScript',
    skills: ['JavaScript'],
    status: 'completed',
    lab: {
      id: 'lab-03',
      moduleId: 'mod-03',
      title: 'Build a JavaScript Expense Calculator',
      objective: 'Build an in-memory expense tracker utility that processes a list of transactions, categorizes expenses, computes totals and averages, and flags anomalies.',
      requirements: [
        'Define functions to calculate total expenditure, monthly category breakdown, and highest expense.',
        'Use immutable array methods (filter, map, reduce) rather than mutating loops.',
        'Implement defensive input validation and custom error throwing for malformed transaction records.',
        'Return formatted summary objects with currency formatting.'
      ],
      hints: [
        'Use Array.prototype.reduce to accumulate totals grouped by category in a single pass.',
        'Handle edge cases like empty transaction arrays gracefully without dividing by zero.'
      ],
      expectedOutput: 'A clean JavaScript module exporting calculateSummary(transactions) producing accurate numeric totals and categorized breakdowns.',
      skillsTested: ['JavaScript'],
      submissionRequirements: 'Submit JavaScript code with unit assertions validating calculation accuracy on sample datasets.'
    },
    practiceActivities: [
      {
        id: 'prac-03-1',
        type: 'coding',
        title: 'Array Data Transformation',
        description: 'Transform an array of raw student grades into standardized percentage objects.',
        task: 'Write a pure function transformScores(scores) that doubles scores under 40 and filters out non-numeric values.'
      },
      {
        id: 'prac-03-2',
        type: 'coding',
        title: 'Object Processing',
        description: 'Aggregate student competency records grouped by technical discipline.',
        task: 'Implement groupCompetenciesByCategory(skills) returning a mapped object with count and average score per category.'
      },
      {
        id: 'prac-03-3',
        type: 'debugging',
        title: 'Debug the Broken Function',
        description: 'A discount calculation function returns NaN due to incorrect type coercion and variable scoping.',
        task: 'Fix the function by converting string inputs to Number and replacing var with block-scoped let/const.'
      }
    ],
    lessons: [
      {
        id: 'les-03-01',
        moduleId: 'mod-03',
        number: 1,
        title: 'Variables and Data Types',
        duration: '18 min',
        shortDescription: 'Primitive types, reference types, let vs const vs var, and type coercion.',
        learningObjectives: [
          'Distinguish between 7 primitive types and reference types (Objects/Arrays)',
          'Understand block scope rules for let and const versus function-scoped var',
          'Avoid unintended implicit type coercion bugs in JavaScript'
        ],
        conceptExplanation: 'JavaScript features dynamic typing. Primitives (string, number, boolean, null, undefined, symbol, bigint) are stored directly on the call stack and passed by value. Objects, arrays, and functions are reference types stored in memory heap. Use const by default to prevent reassignment, and let when values must mutate.',
        codeExample: {
          language: 'javascript',
          code: `const candidateId = "GSP-101"; // Immutable binding
let competencyScore = 82;      // Mutable variable

// Primitives are compared by value; Objects by reference
const a = { score: 90 };
const b = { score: 90 };
console.log(a === b); // false (different memory references)`,
          caption: 'Comparison of value vs reference semantics in JavaScript'
        },
        keyTakeaways: [
          'Never use var in modern JavaScript due to hoisting and lack of block scope.',
          'const prevents re-binding the identifier, but does not freeze object properties.',
          'Always use strict equality === instead of loose equality ==.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-02',
        moduleId: 'mod-03',
        number: 2,
        title: 'Operators',
        duration: '15 min',
        shortDescription: 'Arithmetic, logical, nullish coalescing (??), and optional chaining (?.) operators.',
        learningObjectives: [
          'Utilize modern logical assignment and nullish coalescing operators',
          'Safely access deep nested object properties using optional chaining (?.)',
          'Understand short-circuit evaluation in boolean expressions'
        ],
        conceptExplanation: 'Operators perform computations on operands. Modern JavaScript includes powerful defensive operators: Optional Chaining (?.) short-circuits to undefined if an intermediate property is null or undefined, while Nullish Coalescing (??) provides a fallback only when the left operand is null or undefined (unlike || which also triggers on 0 or "").',
        codeExample: {
          language: 'javascript',
          code: `const student = { profile: { scores: null } };

// Optional chaining + Nullish coalescing
const verifiedScore = student.profile?.scores?.javascript ?? 0;
console.log(verifiedScore); // 0 (safe fallback without TypeError)`,
          caption: 'Defensive data access using optional chaining and nullish coalescing'
        },
        keyTakeaways: [
          'Optional chaining prevents the notorious "TypeError: Cannot read properties of undefined".',
          '?? differs from || because it treats 0 and "" as valid defined values.',
          'Unary plus (+str) provides a concise way to parse numbers.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-03',
        moduleId: 'mod-03',
        number: 3,
        title: 'Conditions',
        duration: '15 min',
        shortDescription: 'if/else branching, ternary expressions, and switch statements.',
        learningObjectives: [
          'Evaluate truthy and falsy values in logical conditionals',
          'Refactor verbose if-else ladders into clean ternary expressions or lookup tables',
          'Implement pattern matching strategies using switch statements'
        ],
        conceptExplanation: 'Conditional statements direct program execution based on boolean truthiness. Falsy values in JavaScript are false, 0, -0, 0n, "", null, undefined, and NaN. All other values (including empty arrays [] and empty objects {}) evaluate to truthy.',
        codeExample: {
          language: 'javascript',
          code: `function getPassportGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  return 'C';
}`,
          caption: 'Early-return guard pattern for clean conditional logic'
        },
        keyTakeaways: [
          'Prefer early return patterns over deep nested if statements.',
          'Empty arrays [] are truthy; always check array.length > 0.',
          'Ternary operators should only be used for simple, single-line value assignments.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-04',
        moduleId: 'mod-03',
        number: 4,
        title: 'Loops',
        duration: '16 min',
        shortDescription: 'for, for...of, for...in, while loops, and loop control statements.',
        learningObjectives: [
          'Select the right loop construct: for...of for iterables vs for...in for object keys',
          'Control iteration flow using break and continue',
          'Understand loop performance implications on large data sets'
        ],
        conceptExplanation: 'Loops execute a code block repeatedly while a condition holds. for...of iterates over values of iterable collections (Arrays, Sets, Strings), whereas for...in inspects enumerable property keys of an object. For most array transformations, declarative higher-order methods are preferred over manual index counters.',
        codeExample: {
          language: 'javascript',
          code: `const skills = ['React', 'Node.js', 'PostgreSQL'];

// for...of iterates over values cleanly
for (const skill of skills) {
  if (skill === 'Node.js') continue; // Skip to next
  console.log('Certified in:', skill);
}`,
          caption: 'Clean iterable traversal using for...of with control statements'
        },
        keyTakeaways: [
          'Use for...of for arrays and strings; avoid using for...in on arrays.',
          'Avoid modifying the array length or elements while iterating over it.',
          'while loops are suited for scenarios where the number of iterations is unknown in advance.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-05',
        moduleId: 'mod-03',
        number: 5,
        title: 'Functions',
        duration: '22 min',
        shortDescription: 'Function declarations, expressions, arrow functions, parameters, and return values.',
        learningObjectives: [
          'Understand hoisting differences between declarations and function expressions',
          'Master arrow function lexical this binding semantics',
          'Implement default parameters and rest parameter syntax (...args)'
        ],
        conceptExplanation: 'Functions are first-class citizens in JavaScript; they can be stored in variables, passed as arguments, and returned from other functions. Arrow functions (() => {}) provide a concise syntax and lexically bind the this value from their enclosing execution context, making them ideal for callbacks.',
        codeExample: {
          language: 'javascript',
          code: `// Function declaration (hoisted)
function calculateAverage(...scores) {
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return scores.length ? sum / scores.length : 0;
}

// Arrow function expression
const formatScore = (score, prefix = 'Rating: ') => \`\${prefix}\${score}%\`;`,
          caption: 'Modern function declaration with rest parameters and arrow functions'
        },
        keyTakeaways: [
          'Arrow functions do not have their own this, arguments, or super bindings.',
          'Pure functions do not cause side effects and return identical output for identical inputs.',
          'Use default parameters to prevent undefined calculation bugs.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-06',
        moduleId: 'mod-03',
        number: 6,
        title: 'Arrays',
        duration: '24 min',
        shortDescription: 'Immutable methods: map, filter, reduce, find, some, every, slice, and concat.',
        learningObjectives: [
          'Differentiate between mutating methods (push, splice, sort) and immutable methods (map, filter, concat)',
          'Chain map, filter, and reduce for complex data aggregation pipelines',
          'Perform element lookups using find, findIndex, and includes'
        ],
        conceptExplanation: 'Arrays represent ordered lists of data. In modern reactive and functional programming, manipulating arrays immutably—creating new arrays rather than modifying existing ones in-place—prevents subtle state bugs and enables reliable state comparison in UI frameworks like React.',
        codeExample: {
          language: 'javascript',
          code: `const candidates = [
  { name: 'Aarav', score: 88, passed: true },
  { name: 'Diya', score: 94, passed: true },
  { name: 'Kiran', score: 62, passed: false }
];

// Pure functional pipeline
const honorRoll = candidates
  .filter(c => c.passed && c.score >= 85)
  .map(c => c.name.toUpperCase());
// ['AARAV', 'DIYA']`,
          caption: 'Declarative array transformation pipeline using filter and map'
        },
        keyTakeaways: [
          'reduce is a Swiss-army knife for converting arrays into single values, lookup maps, or groupings.',
          'Array.prototype.sort mutates the original array in place; use toSorted() or [...arr].sort() to avoid side effects.',
          'includes is simpler and more readable than indexOf(item) !== -1.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-07',
        moduleId: 'mod-03',
        number: 7,
        title: 'Objects',
        duration: '20 min',
        shortDescription: 'Object literals, property accessors, Object.keys/values/entries, and object cloning.',
        learningObjectives: [
          'Create and manipulate key-value dictionary structures',
          'Iterate over objects using Object.entries and Object.values',
          'Perform shallow copies with spread syntax and deep clones using structuredClone'
        ],
        conceptExplanation: 'Objects are collections of key-value properties. In JavaScript, keys are strings or Symbols. Modern JavaScript provides utilities like Object.keys, Object.values, and Object.entries to transform objects into arrays for processing, and structuredClone() for native deep copying.',
        codeExample: {
          language: 'javascript',
          code: `const passport = {
  candidateId: 'GSP-001',
  scores: { js: 91, react: 88 }
};

// Shallow copy with spread
const updated = { ...passport, status: 'Active' };

// Native deep copy
const cloned = structuredClone(passport);`,
          caption: 'Object manipulation, shallow spreading, and deep cloning with structuredClone'
        },
        keyTakeaways: [
          'Spread syntax ({ ...obj }) only performs a shallow clone; nested objects still share memory references.',
          'Use computed property names [dynamicKey]: value for dynamic dictionary construction.',
          'Object.freeze(obj) prevents adding, removing, or modifying top-level properties.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-08',
        moduleId: 'mod-03',
        number: 8,
        title: 'Destructuring',
        duration: '18 min',
        shortDescription: 'Array and object destructuring, renaming, default values, and rest patterns.',
        learningObjectives: [
          'Unpack object properties into distinct variables with renaming and defaults',
          'Destructure arrays and swap variable values without temporary variables',
          'Use rest parameter syntax in function signatures and object destructuring'
        ],
        conceptExplanation: 'Destructuring assignment is a concise syntax that makes it possible to unpack values from arrays, or properties from objects, into distinct variables. It simplifies extracting nested properties and passing configuration options to functions.',
        codeExample: {
          language: 'javascript',
          code: `const student = { name: 'Arjun', meta: { score: 92 } };

// Nested destructuring with property renaming and defaults
const {
  name: studentName,
  meta: { score, grade = 'A' }
} = student;

// Array element swapping
let [x, y] = [10, 20];
[x, y] = [y, x]; // x is 20, y is 10`,
          caption: 'Nested object destructuring with defaults and array variable swapping'
        },
        keyTakeaways: [
          'Destructuring cleans up function parameters: function render({ title, count = 0 }).',
          'Rest syntax in object destructuring ({ id, ...rest }) extracts the remaining properties cleanly.',
          'Destructuring an undefined object throws a TypeError; provide default empty objects {}.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-09',
        moduleId: 'mod-03',
        number: 9,
        title: 'Scope',
        duration: '20 min',
        shortDescription: 'Global scope, function scope, block scope, lexical environment, and shadowing.',
        learningObjectives: [
          'Trace variable resolution through the Scope Chain up to the Global Object',
          'Understand how block scoping protects variables inside if statements and loops',
          'Analyze variable shadowing and avoid accidental global leakages'
        ],
        conceptExplanation: 'Scope defines the accessibility of variables, functions, and objects in some particular part of your code during runtime. JavaScript has Global Scope, Function Scope, and Block Scope (introduced with let and const). Lexical scoping means that variable resolution is determined by the physical placement of code during compilation, not where it is called.',
        codeExample: {
          language: 'javascript',
          code: `const globalDomain = 'web';

function evaluateCandidate() {
  const localRating = 85;
  
  if (localRating > 80) {
    const status = 'Certified'; // Block-scoped to if statement
    console.log(status, localRating, globalDomain); // All accessible
  }
  // status is not accessible here (ReferenceError)
}`,
          caption: 'Demonstrating block scope isolation and scope chain lookup'
        },
        keyTakeaways: [
          'Variables declared inside a block {} with let/const are inaccessible outside that block.',
          'Inner functions have access to variables declared in their outer parent scopes (lexical scoping).',
          'Always run in strict mode ("use strict") to prevent accidental implicit global variables.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-03-10',
        moduleId: 'mod-03',
        number: 10,
        title: 'Error Handling',
        duration: '20 min',
        shortDescription: 'try, catch, finally, custom Error classes, and error propagation.',
        learningObjectives: [
          'Catch runtime exceptions defensively without crashing application execution',
          'Subclass Error to create domain-specific application errors',
          'Ensure resource cleanup using the finally block'
        ],
        conceptExplanation: 'Robust software must anticipate failure. The try...catch statement marks a block of statements to try, and specifies a response should an exception be thrown. The finally block always executes regardless of whether an error occurred, making it critical for cleanup tasks like closing database connections or clearing timers.',
        codeExample: {
          language: 'javascript',
          code: `class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function parseScore(input) {
  try {
    const num = Number(input);
    if (isNaN(num)) throw new ValidationError('Invalid score format', 'score');
    return num;
  } catch (err) {
    console.error(\`[\${err.name}] \${err.message}\`);
    throw err; // Re-throw or handle gracefully
  } finally {
    console.log('Validation cycle completed.');
  }
}`,
          caption: 'Custom error class definition and structured try-catch-finally handling'
        },
        keyTakeaways: [
          'Only catch errors that you can meaningfully handle or log; otherwise allow them to bubble.',
          'Custom error subclasses provide clean error classification across multi-tiered architectures.',
          'The finally block executes even if the try or catch block contains an explicit return statement.'
        ],
        skills: ['JavaScript', 'Debugging']
      }
    ]
  },

  // =========================================================================
  // MODULE 04: ADVANCED JAVASCRIPT
  // =========================================================================
  {
    id: 'mod-04',
    number: '04',
    title: 'Advanced JavaScript',
    slug: 'advanced-javascript',
    description: 'Asynchronous execution, Promises, Async/Await, browser Event Loop, closures, ES modules, and debugging.',
    primarySkill: 'JavaScript',
    skills: ['JavaScript', 'Debugging', 'Async Programming'],
    status: 'current',
    lab: {
      id: 'lab-04',
      moduleId: 'mod-04',
      title: 'Build an API-powered Search Application',
      objective: 'Create an interactive search interface that queries a remote REST API with debounced user typing, loading indicators, cancellation of stale in-flight requests, and cached responses.',
      requirements: [
        'Implement debounced search triggering network fetch only after 300ms of user idle time.',
        'Use the AbortController API to cancel previous in-flight requests when a new search term is typed.',
        'Implement an in-memory Map cache to serve repeated search queries instantly without network calls.',
        'Handle HTTP 4xx/5xx network errors gracefully with retry mechanism and user-friendly error messages.'
      ],
      hints: [
        'Pass { signal: controller.signal } to fetch() to enable abort capability.',
        'Store cache entries keyed by query string lowercase.'
      ],
      expectedOutput: 'A responsive search client that smoothly handles rapid keystrokes without race conditions or memory leaks.',
      skillsTested: ['JavaScript', 'Async Programming', 'Debugging'],
      submissionRequirements: 'Submit JavaScript code demonstrating async/await error boundaries, AbortController cancellation, and debounce implementation.'
    },
    practiceActivities: [
      {
        id: 'prac-04-1',
        type: 'coding',
        title: 'Convert Promise Chain to Async/Await',
        description: 'Refactor nested .then().catch() promise chains into linear, readable async/await functions.',
        task: 'Refactor fetchStudent().then(s => fetchScores(s.id)).then(sc => render(sc)).catch(e => handleError(e)) into an async function with try/catch.'
      },
      {
        id: 'prac-04-2',
        type: 'debugging',
        title: 'Debug Async Code',
        description: 'Fix a race condition in a multi-step data loading function where results display out of order.',
        task: 'Implement sequential Promise handling or timestamp version tags so stale slower responses do not overwrite newer user input.'
      },
      {
        id: 'prac-04-3',
        type: 'coding',
        title: 'Implement Debounced Search',
        description: 'Create a reusable debounce(fn, delay) utility function.',
        task: 'Write a higher-order debounce function that captures timer IDs in a closure and executes the callback once the specified delay has passed.'
      }
    ],
    lessons: [
      {
        id: 'les-04-01',
        moduleId: 'mod-04',
        number: 1,
        title: 'Higher-Order Functions',
        duration: '20 min',
        shortDescription: 'Functions that accept functions as arguments or return new functions.',
        learningObjectives: [
          'Understand functions as first-class citizens and mathematical abstractions',
          'Implement function composition, currying, and partial application',
          'Build utility decorators like logging wrappers and memoization wrappers'
        ],
        conceptExplanation: 'A Higher-Order Function (HOD) is a function that either takes one or more functions as arguments or returns a function as its result. Built-in examples include map, filter, and reduce. Custom higher-order functions enable powerful patterns like caching, authorization checks, and event throttling.',
        codeExample: {
          language: 'javascript',
          code: `// Memoization Higher-Order Function
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}`,
          caption: 'Higher-order function memoizing expensive calculation results'
        },
        keyTakeaways: [
          'Higher-order functions enable declarative, reusable code architecture.',
          'They form the conceptual foundation of React components, middleware, and hooks.',
          'Keep higher-order utilities pure to avoid unintended state retention.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-04-02',
        moduleId: 'mod-04',
        number: 2,
        title: 'Callbacks',
        duration: '18 min',
        shortDescription: 'Asynchronous callbacks, error-first patterns, and avoiding Callback Hell.',
        learningObjectives: [
          'Understand how callbacks execute after asynchronous operations complete',
          'Analyze Node.js error-first callback conventions: callback(err, data)',
          'Identify readability and error handling bottlenecks in deep callback pyramids'
        ],
        conceptExplanation: 'A callback is a function passed into another function as an argument to be executed later. Historically, asynchronous JavaScript (such as timer execution or file system access) relied exclusively on callbacks. Deeply nested callbacks led to Callback Hell, which was resolved by Promises.',
        codeExample: {
          language: 'javascript',
          code: `// Error-first callback pattern
function fetchCandidateData(id, callback) {
  setTimeout(() => {
    if (!id) return callback(new Error('Candidate ID required'), null);
    callback(null, { id, name: 'Arjun Sharma' });
  }, 200);
}`,
          caption: 'Classic Node.js error-first callback pattern'
        },
        keyTakeaways: [
          'Callbacks can be synchronous (like array.forEach) or asynchronous (like setTimeout).',
          'Error-first callbacks always pass the error as the first argument, or null on success.',
          'Promises and async/await have largely superseded callbacks for complex async flows.'
        ],
        skills: ['JavaScript', 'Async Programming']
      },
      {
        id: 'les-04-03',
        moduleId: 'mod-04',
        number: 3,
        title: 'Promises',
        duration: '24 min',
        shortDescription: 'Promise lifecycle: Pending, Fulfilled, Rejected, chaining, and Promise.all.',
        learningObjectives: [
          'Construct custom Promises using the new Promise((resolve, reject) => {}) constructor',
          'Chain operations with .then(), .catch(), and .finally()',
          'Coordinate concurrent requests using Promise.all, Promise.allSettled, and Promise.race'
        ],
        conceptExplanation: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation. A promise is in one of three states: pending (initial state), fulfilled (operation completed successfully), or rejected (operation failed). Once settled, a promise cannot change state.',
        codeExample: {
          language: 'javascript',
          code: `// Fetch multiple resources concurrently
const p1 = fetch('/api/user/profile');
const p2 = fetch('/api/user/evidence');

Promise.all([p1, p2])
  .then(async ([resProfile, resEvidence]) => {
    const profile = await resProfile.json();
    const evidence = await resEvidence.json();
    return { profile, evidence };
  })
  .catch(err => console.error('One or more requests failed:', err));`,
          caption: 'Parallel asynchronous resolution using Promise.all'
        },
        keyTakeaways: [
          'Promise.all rejects immediately if any single promise rejects (fail-fast).',
          'Promise.allSettled waits for all promises to settle regardless of outcome.',
          'Always attach a .catch handler to prevent UnhandledPromiseRejection errors.'
        ],
        skills: ['JavaScript', 'Async Programming']
      },
      {
        id: 'les-04-04',
        moduleId: 'mod-04',
        number: 4,
        title: 'Async/Await',
        duration: '22 min',
        shortDescription: 'Syntactic sugar over Promises for readable, linear asynchronous code.',
        learningObjectives: [
          'Write asynchronous code that reads sequentially like synchronous code',
          'Handle errors cleanly using standard try/catch blocks',
          'Avoid common performance traps: sequential awaits when concurrency is possible'
        ],
        conceptExplanation: 'The async and await keywords were introduced in ECMAScript 2017. An async function always returns a Promise. The await operator pauses execution of the async function until the Promise settles, resuming with the resolved value or throwing the rejection error into an enclosing try/catch.',
        codeExample: {
          language: 'javascript',
          code: `async function syncSkillEvidence(userId) {
  try {
    const response = await fetch(\`/api/evidence/\${userId}\`);
    if (!response.ok) throw new Error(\`HTTP Error: \${response.status}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sync evidence:', error);
    throw error;
  }
}`,
          caption: 'Clean async/await function with structured error handling'
        },
        keyTakeaways: [
          'await can only be used inside async functions or top-level modules.',
          'Awaiting independent promises sequentially causes waterfall latency; use Promise.all to fetch concurrently.',
          'Uncaught exceptions inside async functions manifest as rejected promises.'
        ],
        skills: ['JavaScript', 'Async Programming']
      },
      {
        id: 'les-04-05',
        moduleId: 'mod-04',
        number: 5,
        title: 'Fetch API',
        duration: '22 min',
        shortDescription: 'Modern HTTP networking in the browser: Request, Response, Headers, and CORS.',
        learningObjectives: [
          'Perform GET, POST, PUT, DELETE requests with proper headers and JSON bodies',
          'Handle HTTP error statuses (fetch does not reject on 404 or 500)',
          'Understand Cross-Origin Resource Sharing (CORS) preflight handshakes'
        ],
        conceptExplanation: 'The Fetch API provides a modern JavaScript interface for accessing and manipulating HTTP pipeline parts like requests and responses. Critical gotcha: a fetch() promise will NOT reject on HTTP error status codes (like 404 Not Found or 500 Server Error); it only rejects on physical network failures or aborted requests.',
        codeExample: {
          language: 'javascript',
          code: `async function submitEvidence(payload) {
  const response = await fetch('/api/evidence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errBody = await response.json();
    throw new Error(errBody.message || 'Submission failed');
  }

  return await response.json();
}`,
          caption: 'Production-ready fetch POST call with response.ok validation'
        },
        keyTakeaways: [
          'Always check response.ok (status 200–299) before parsing response body.',
          'CORS preflight (OPTIONS request) is triggered when custom headers like Authorization are included.',
          'Use AbortController to set request timeouts.'
        ],
        skills: ['JavaScript', 'REST API']
      },
      {
        id: 'les-04-06',
        moduleId: 'mod-04',
        number: 6,
        title: 'Event Loop',
        duration: '26 min',
        shortDescription: 'Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (setTimeout).',
        learningObjectives: [
          'Trace JavaScript execution across Call Stack, Microtasks, and Macrotasks',
          'Understand execution order: synchronous code > Microtask queue > Macrotask queue',
          'Prevent blocking the browser UI thread with CPU-intensive tasks'
        ],
        conceptExplanation: 'JavaScript is single-threaded; it has one call stack. When asynchronous operations initiate, the runtime offloads them to browser Web APIs or Node.js libuv threads. When complete, their callbacks enter either the Microtask Queue (Promises, queueMicrotask) or Macrotask Queue (setTimeout, setInterval, I/O). The Event Loop prioritizes emptying all microtasks before executing the next macrotask.',
        codeExample: {
          language: 'javascript',
          code: `console.log('1: Synchronous Stack');

setTimeout(() => console.log('4: Macrotask (setTimeout)'), 0);

Promise.resolve().then(() => console.log('3: Microtask (Promise)'));

console.log('2: Synchronous Stack End');
// Output Order: 1 -> 2 -> 3 -> 4`,
          caption: 'Demonstrating execution precedence between Microtask and Macrotask queues'
        },
        keyTakeaways: [
          'Synchronous code always finishes executing before any callback runs.',
          'Microtasks run immediately after the current script executes, before browser rendering or macrotasks.',
          'Starving the call stack or flooding microtasks freezes the browser tab.'
        ],
        skills: ['JavaScript', 'Browser Internals']
      },
      {
        id: 'les-04-07',
        moduleId: 'mod-04',
        number: 7,
        title: 'Closures',
        duration: '22 min',
        shortDescription: 'Lexical scoping, persistent outer function variables, data privacy, and factories.',
        learningObjectives: [
          'Define closures and identify how functions retain access to their outer lexical environment',
          'Implement private variables and encapsulation without class fields',
          'Avoid closure memory leaks by unbinding unneeded references'
        ],
        conceptExplanation: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In JavaScript, closures are created every time a function is created, at function creation time. This allows inner functions to access outer variables even after the outer function has returned.',
        codeExample: {
          language: 'javascript',
          code: `function createScoreCounter(initial = 0) {
  let score = initial; // Private variable encapsulated in closure
  
  return {
    increment: (amount = 1) => { score += amount; return score; },
    getScore: () => score
  };
}

const counter = createScoreCounter(80);
counter.increment(5);
console.log(counter.getScore()); // 85 (score cannot be altered directly)`,
          caption: 'Encapsulating private state using JavaScript closures'
        },
        keyTakeaways: [
          'Closures enable data privacy and module encapsulation.',
          'React hooks (like useState) rely internally on closures to persist state between re-renders.',
          'Retaining large objects in long-lived closures can prevent garbage collection.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-04-08',
        moduleId: 'mod-04',
        number: 8,
        title: 'Modules',
        duration: '18 min',
        shortDescription: 'ES Modules (import/export), default vs named exports, and CommonJS differences.',
        learningObjectives: [
          'Structure modular codebases using ESM export and import syntax',
          'Compare ES Modules (static, asynchronous) with CommonJS require() (dynamic, synchronous)',
          'Utilize dynamic imports for code splitting and lazy loading'
        ],
        conceptExplanation: 'JavaScript modules allow you to break up code into separate files, making maintenance and reuse effortless. Standard ECMAScript Modules (ESM) use static import/export statements analyzed at compile time, enabling bundlers (Webpack, Vite, Rollup) to perform tree-shaking (dead code elimination).',
        codeExample: {
          language: 'javascript',
          code: `// math.js - Named exports
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// main.js - Import and dynamic import
import { add } from './math.js';

async function loadAnalytics() {
  const { trackEvent } = await import('./analytics.js');
  trackEvent('MODULE_LOADED');
}`,
          caption: 'Named ES Module exports and dynamic on-demand code splitting import'
        },
        keyTakeaways: [
          'Always prefer named exports for better refactoring tooling and autocomplete.',
          'ES Modules run in strict mode automatically.',
          'Dynamic import() returns a Promise, enabling on-demand component and route loading.'
        ],
        skills: ['JavaScript']
      },
      {
        id: 'les-04-09',
        moduleId: 'mod-04',
        number: 9,
        title: 'Local Storage',
        duration: '16 min',
        shortDescription: 'Client-side persistence: localStorage, sessionStorage, cookies, and quota limits.',
        learningObjectives: [
          'Persist and retrieve stringified JSON data in localStorage and sessionStorage',
          'Compare localStorage (5MB, permanent) with sessionStorage (tab lifetime) and cookies',
          'Recognize security restrictions: never store sensitive tokens in localStorage due to XSS risks'
        ],
        conceptExplanation: 'Web Storage API provides mechanisms to store key-value string pairs in browser storage. localStorage persists across browser sessions and tab closes until explicitly cleared, while sessionStorage is scoped to the current browser tab. Storage is limited to ~5MB per origin and is synchronous, blocking the main thread during large reads/writes.',
        codeExample: {
          language: 'javascript',
          code: `const StorageHelper = {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota exceeded or private mode error:', e);
    }
  },
  load(key, fallback = null) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }
};`,
          caption: 'Defensive storage helper with JSON serialization and quota handling'
        },
        keyTakeaways: [
          'localStorage only stores strings; always serialize objects with JSON.stringify.',
          'Accessing localStorage in private browsing or when quota is full throws an exception.',
          'Never store sensitive authentication tokens (like refresh tokens) in localStorage due to XSS vulnerability.'
        ],
        skills: ['JavaScript', 'Web Fundamentals']
      },
      {
        id: 'les-04-10',
        moduleId: 'mod-04',
        number: 10,
        title: 'Debugging Techniques',
        duration: '22 min',
        shortDescription: 'Chrome DevTools, debugger statements, breakpoints, call stack inspection, and console APIs.',
        learningObjectives: [
          'Set conditional breakpoints and logpoints in browser DevTools Sources panel',
          'Trace execution flow and variable state across stack frames',
          'Utilize advanced console formatting (console.table, console.time, console.group)'
        ],
        conceptExplanation: 'Effective debugging separates senior engineers from juniors. Rather than scattering console.log statements, professional engineers utilize browser DevTools to pause execution with conditional breakpoints, step through code (Step Over, Step Into, Step Out), inspect scope variables, and profile performance bottlenecks.',
        codeExample: {
          language: 'javascript',
          code: `function verifyCompetency(candidate) {
  console.time('Score Calculation');
  
  // Programmatic breakpoint triggers DevTools when open
  if (!candidate.scores) debugger;
  
  console.table(candidate.skills); // Clean tabular visualization
  console.timeEnd('Score Calculation');
}`,
          caption: 'Utilizing console.table, performance timers, and debugger breakpoints'
        },
        keyTakeaways: [
          'The debugger statement pauses JavaScript execution when developer tools are active.',
          'Use console.table to inspect arrays of objects cleanly.',
          'Network throttling and CPU throttling in DevTools reveal real-world performance issues.'
        ],
        skills: ['Debugging', 'JavaScript']
      }
    ]
  },

  // =========================================================================
  // MODULE 05: REACT
  // =========================================================================
  {
    id: 'mod-05',
    number: '05',
    title: 'React',
    slug: 'react',
    description: 'Declarative component architecture, Virtual DOM, JSX, Props, Hooks (useState, useEffect, custom hooks), forms, and component composition.',
    primarySkill: 'React',
    skills: ['React', 'Frontend'],
    status: 'locked',
    lab: {
      id: 'lab-05',
      moduleId: 'mod-05',
      title: 'Build a Task Management Interface',
      objective: 'Construct an interactive, production-ready Task Management component featuring categorized task lists, status toggling, priority filters, form validation, and persistence.',
      requirements: [
        'Break down UI into reusable subcomponents: TaskList, TaskItem, TaskFilter, and TaskForm.',
        'Manage task state using useState and custom hook useLocalStorage for persistence.',
        'Implement controlled form inputs with validation (required title, due date).',
        'Add filter capabilities: All, In-Progress, Completed, and sort by priority.'
      ],
      hints: [
        'Lift state up to a parent component or encapsulate in a custom hook.',
        'Use key prop with unique IDs rather than array index for stable reconciliation.'
      ],
      expectedOutput: 'A modular, accessible React component tree with instant client updates and zero reconciliation warnings.',
      skillsTested: ['React'],
      submissionRequirements: 'Submit React component files demonstrating state isolation, prop passing, and custom hook usage.'
    },
    practiceActivities: [
      {
        id: 'prac-05-1',
        type: 'coding',
        title: 'Build a reusable React component',
        description: 'Construct a reusable Badge component with variant styles and icon slots.',
        task: 'Implement <Badge variant="success" icon={<CheckIcon />}>Verified</Badge> with TypeScript props and accessible ARIA attributes.'
      },
      {
        id: 'prac-05-2',
        type: 'coding',
        title: 'Manage form state',
        description: 'Implement a multi-field controlled form with real-time validation errors.',
        task: 'Build a form managing name, email, and skill rating with custom error display and submit blocking when invalid.'
      },
      {
        id: 'prac-05-3',
        type: 'coding',
        title: 'Fetch and display API data',
        description: 'Build a data-fetching component that handles Loading, Error, and Success states gracefully.',
        task: 'Use useEffect and AbortController to fetch student evidence records, rendering Skeleton loaders during transit.'
      }
    ],
    lessons: [
      {
        id: 'les-05-01',
        moduleId: 'mod-05',
        number: 1,
        title: 'React Fundamentals',
        duration: '18 min',
        shortDescription: 'Declarative UI paradigm, component model, Virtual DOM, and reconciliation.',
        learningObjectives: [
          'Understand declarative programming versus imperative DOM manipulation',
          'Explain how the Virtual DOM and React Fiber diffing algorithm optimize updates',
          'Set up modern React applications with Vite build tooling'
        ],
        conceptExplanation: 'React is a declarative, component-based JavaScript library for building user interfaces. Instead of manually querying and mutating DOM elements (imperative), you declare how the UI should look given current state. React maintains a lightweight Virtual DOM representation in memory, computes minimal DOM diffs (reconciliation), and batches updates efficiently.',
        codeExample: {
          language: 'jsx',
          code: `// Declarative React Component
export default function SkillScore({ score }) {
  const isPassing = score >= 75;
  return (
    <div className="p-4 border rounded">
      <p>Competency Score: {score}%</p>
      <span className={isPassing ? 'text-green-600' : 'text-amber-600'}>
        {isPassing ? 'Verified Competent' : 'Developing Evidence'}
      </span>
    </div>
  );
}`,
          caption: 'Declarative component rendering based on state and props'
        },
        keyTakeaways: [
          'React re-renders components when their props or internal state change.',
          'Declarative code is easier to reason about, test, and maintain than imperative DOM code.',
          'The Virtual DOM minimizes direct browser layout calculations and repaints.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-02',
        moduleId: 'mod-05',
        number: 2,
        title: 'Components',
        duration: '20 min',
        shortDescription: 'Functional components, component composition, single responsibility, and folder architecture.',
        learningObjectives: [
          'Structure applications into atomic, reusable functional components',
          'Apply the Single Responsibility Principle to component boundaries',
          'Organize component directories with styles, tests, and types'
        ],
        conceptExplanation: 'Components let you split the UI into independent, reusable pieces, and think about each piece in isolation. In modern React, components are pure JavaScript functions that receive props as an input argument and return JSX describing what should appear on screen.',
        codeExample: {
          language: 'jsx',
          code: `// Container / Composition pattern
function PassportHeader({ title, candidateName }) {
  return (
    <header className="header-container">
      <h1>{title}</h1>
      <p>Candidate: {candidateName}</p>
    </header>
  );
}`,
          caption: 'Pure functional React component with typed inputs'
        },
        keyTakeaways: [
          'Component names must start with a capital letter (PascalCase).',
          'Keep components focused on a single responsibility; split large files early.',
          'Components should ideally be pure functions with respect to their props.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-03',
        moduleId: 'mod-05',
        number: 3,
        title: 'JSX',
        duration: '16 min',
        shortDescription: 'Syntax extension for JavaScript: expressions, attributes, fragments, and compilation.',
        learningObjectives: [
          'Embed dynamic JavaScript expressions inside JSX using curly braces {}',
          'Understand why JSX requires single root elements or <> React Fragments',
          'Recognize how JSX compiles to React.createElement function calls'
        ],
        conceptExplanation: 'JSX is a syntax extension for JavaScript that looks similar to HTML. It is compiled by tools like Babel or SWC into regular JavaScript calls (React.createElement or jsx runtime calls). JSX allows you to write HTML structure directly inside JavaScript files while retaining full programming power.',
        codeExample: {
          language: 'jsx',
          code: `function MetricDisplay({ label, value }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-bold text-navy-900">{value.toLocaleString()}</dd>
    </>
  );
}`,
          caption: 'React Fragment preventing unnecessary wrapper DOM nodes'
        },
        keyTakeaways: [
          'Use React Fragments (<>...</>) to return multiple elements without adding unnecessary <div> tags.',
          'In JSX, class becomes className and for becomes htmlFor.',
          'All tags must be explicitly closed in JSX (e.g. <img />, <input />).'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-04',
        moduleId: 'mod-05',
        number: 4,
        title: 'Props',
        duration: '18 min',
        shortDescription: 'Passing data to child components, prop immutability, children prop, and default values.',
        learningObjectives: [
          'Pass primitive, object, and function values as props down the component tree',
          'Understand unidirectional data flow and prop immutability',
          'Utilize the special children prop for layout wrappers and modal dialogs'
        ],
        conceptExplanation: 'Props (short for properties) are the mechanism by which parent components pass data down to child components. In React, data flows strictly downwards in a unidirectional flow. Props are read-only; a child component must never modify its received props directly.',
        codeExample: {
          language: 'jsx',
          code: `function Card({ title, children, variant = 'default' }) {
  return (
    <div className={\`card \${variant}\`}>
      <h3 className="card-title">{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}`,
          caption: 'Using props and children composition for flexible layout cards'
        },
        keyTakeaways: [
          'Props are immutable; children cannot mutate props passed from parents.',
          'The children prop enables flexible compound and slot-based component patterns.',
          'Destructure props with defaults directly in the function argument signature.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-05',
        moduleId: 'mod-05',
        number: 5,
        title: 'State',
        duration: '22 min',
        shortDescription: 'Managing component memory with useState, updater functions, and immutable state updates.',
        learningObjectives: [
          'Declare reactive component state using the useState hook',
          'Update state immutably when managing arrays and nested objects',
          'Use functional state updates (prev => prev + 1) to prevent race conditions'
        ],
        conceptExplanation: 'While props are passed from above, state is a component’s personal memory. When state updates, React schedules a re-render of the component and its children. State must always be treated as immutable; never modify state variables directly—always call the set function with a new value or copy.',
        codeExample: {
          language: 'jsx',
          code: `import { useState } from 'react';

export function EvidenceList() {
  const [items, setItems] = useState(['Challenge #1', 'Lab #1']);

  const addEvidence = (newTitle) => {
    // Immutable array update using spread
    setItems((prev) => [...prev, newTitle]);
  };

  return <button onClick={() => addEvidence('Project Capstone')}>Add</button>;
}`,
          caption: 'Immutable array state update using the functional setter pattern'
        },
        keyTakeaways: [
          'Never mutate state directly (e.g. state.push()); always pass a new object or array copy.',
          'State updates may be batched by React for performance optimization.',
          'Use the functional updater form when new state depends on previous state.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-06',
        moduleId: 'mod-05',
        number: 6,
        title: 'Events',
        duration: '18 min',
        shortDescription: 'Synthetic events, event handlers, passing arguments, and preventing default behavior.',
        learningObjectives: [
          'Handle browser interactions using React SyntheticEvent wrappers',
          'Pass event handler functions without immediately invoking them',
          'Prevent page reloads on form submit using e.preventDefault()'
        ],
        conceptExplanation: 'React handles events using a cross-browser wrapper called SyntheticEvent. Synthetic events normalize differences across browsers and use efficient event delegation at the root DOM node. Event handler names use camelCase (onClick, onChange, onSubmit).',
        codeExample: {
          language: 'jsx',
          code: `function SearchBar({ onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent full page reload
    onSearch(e.target.elements.query.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="query" placeholder="Search skills..." />
      <button type="submit">Filter</button>
    </form>
  );
}`,
          caption: 'Handling form submission event and suppressing native browser reload'
        },
        keyTakeaways: [
          'Pass the function reference onClick={handleClick}, do not call it inline onClick={handleClick()}.',
          'e.preventDefault() is critical on form submit handlers to prevent page reload.',
          'React handles event delegation automatically at the container root.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-07',
        moduleId: 'mod-05',
        number: 7,
        title: 'Conditional Rendering',
        duration: '18 min',
        shortDescription: 'Rendering logic: if/else, ternary operator (? :), logical AND (&&), and guard clauses.',
        learningObjectives: [
          'Conditionally render components using ternary operators and logical AND (&&)',
          'Avoid the zero bug in logical AND: count && <Component /> rendering 0',
          'Implement clean early return guard clauses for loading and error states'
        ],
        conceptExplanation: 'In React, there is no special syntax for conditional logic; you use regular JavaScript operators. You can use an if statement, ternary operator (condition ? <TrueView /> : <FalseView />), or short-circuit logical AND (condition && <Component />).',
        codeExample: {
          language: 'jsx',
          code: `function VerificationBadge({ isVerified, score }) {
  if (!score) return <p className="text-slate-400">Awaiting assessment</p>;

  return (
    <div className="badge">
      {isVerified ? (
        <span className="text-emerald-600">✓ Verified Passport</span>
      ) : (
        <span className="text-amber-600">⚠ Pending Audit</span>
      )}
    </div>
  );
}`,
          caption: 'Clean conditional rendering with early return guard and ternary expressions'
        },
        keyTakeaways: [
          'Beware of count && <Component />: if count is 0, React renders the number 0 on screen.',
          'Early returns simplify complex components by handling loading and error states upfront.',
          'Extract complex conditional UI into separate child components.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-08',
        moduleId: 'mod-05',
        number: 8,
        title: 'Lists and Keys',
        duration: '20 min',
        shortDescription: 'Rendering arrays with map(), stable key assignment, and reconciliation performance.',
        learningObjectives: [
          'Render dynamic lists of items using Array.prototype.map in JSX',
          'Understand why unique, stable keys are mandatory for React reconciliation',
          'Avoid using array index as keys when lists can be reordered, sorted, or filtered'
        ],
        conceptExplanation: 'When rendering lists of data in React, you transform arrays into elements using map(). Each rendered item must be given a unique key prop. Keys help React identify which items have changed, been added, or been removed, allowing the reconciliation engine to reuse existing DOM nodes efficiently.',
        codeExample: {
          language: 'jsx',
          code: `function SkillsList({ skills }) {
  return (
    <ul className="divide-y">
      {skills.map((skill) => (
        <li key={skill.id} className="py-2 flex justify-between">
          <span>{skill.name}</span>
          <span className="font-bold">{skill.score}%</span>
        </li>
      ))}
    </ul>
  );
}`,
          caption: 'Rendering dynamic lists with stable, unique ID keys'
        },
        keyTakeaways: [
          'Keys must be unique among siblings; they do not need to be globally unique.',
          'Do not use array indexes as keys if the list can change order, as this causes UI glitches with input state.',
          'Keys are internal to React and are not accessible as props inside child components.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-09',
        moduleId: 'mod-05',
        number: 9,
        title: 'Forms',
        duration: '22 min',
        shortDescription: 'Controlled vs uncontrolled components, form validation, and multi-field handlers.',
        learningObjectives: [
          'Implement controlled form inputs where React state acts as the single source of truth',
          'Handle multi-field forms cleanly with a single change handler using input name attributes',
          'Display inline validation errors and manage submission disable states'
        ],
        conceptExplanation: 'An HTML form element whose value is controlled by React state is called a controlled component. When a user types into an input, an onChange handler updates React state, which then re-renders the input with the new value. This gives you absolute control over validation, formatting, and submission logic.',
        codeExample: {
          language: 'jsx',
          code: `import { useState } from 'react';

export function ProfileForm() {
  const [formData, setFormData] = useState({ name: '', role: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <input 
      name="name" 
      value={formData.name} 
      onChange={handleChange} 
      placeholder="Full Name" 
    />
  );
}`,
          caption: 'Multi-field controlled form with dynamic computed property updating'
        },
        keyTakeaways: [
          'Controlled components make real-time input formatting and instant validation effortless.',
          'Ensure the value prop is never undefined, or React will warn about uncontrolled to controlled transitions.',
          'Uncontrolled components with useRef are useful for file inputs or external library integrations.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-10',
        moduleId: 'mod-05',
        number: 10,
        title: 'useEffect',
        duration: '26 min',
        shortDescription: 'Synchronizing with external systems: API fetching, timers, event listeners, and cleanups.',
        learningObjectives: [
          'Execute side effects after component rendering using the useEffect hook',
          'Manage dependency arrays: empty array [] vs specific dependencies vs omitted',
          'Implement cleanup functions to prevent memory leaks, timer accumulation, and zombie listeners'
        ],
        conceptExplanation: 'useEffect allows you to synchronize a component with external systems like APIs, browser DOM events, or timers. It runs after the browser paints screen updates. If your effect subscribes to an external event or sets a timer, it must return a cleanup function that React executes before re-running the effect and upon component unmount.',
        codeExample: {
          language: 'jsx',
          code: `import { useState, useEffect } from 'react';

export function WindowWidthMonitor() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Cleanup function executed on unmount or before next effect cycle
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array = runs once on mount

  return <p>Window Width: {width}px</p>;
}`,
          caption: 'Event listener synchronization with mandatory cleanup function'
        },
        keyTakeaways: [
          'Effects are for synchronization with external systems, not for calculating derived state.',
          'Always declare all reactive values read inside the effect in its dependency array.',
          'The cleanup function runs before the component is removed from the screen (unmounted).'
        ],
        skills: ['React', 'Async Programming']
      },
      {
        id: 'les-05-11',
        moduleId: 'mod-05',
        number: 11,
        title: 'Custom Hooks',
        duration: '24 min',
        shortDescription: 'Extracting and sharing stateful logic across components using custom hook abstractions.',
        learningObjectives: [
          'Extract duplicated component state logic into reusable custom hooks',
          'Follow the Rules of Hooks: names starting with use, top-level execution only',
          'Compose multiple native hooks (useState, useEffect, useCallback) inside custom hooks'
        ],
        conceptExplanation: 'Custom hooks let you extract component logic into reusable functions. Unlike regular functions, custom hooks can call other React hooks. Two components calling the same custom hook do NOT share state; each component gets its own independent instance of the hook’s internal state.',
        codeExample: {
          language: 'jsx',
          code: `import { useState, useEffect } from 'react';

// Custom hook managing localStorage synchronization
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`,
          caption: 'Reusable custom hook synchronizing state with browser localStorage'
        },
        keyTakeaways: [
          'Custom hook names must start with use (e.g. useAuth, useDebounce).',
          'Custom hooks share stateful logic, not the state itself.',
          'They dramatically declutter UI components by encapsulating side-effect complexity.'
        ],
        skills: ['React']
      },
      {
        id: 'les-05-12',
        moduleId: 'mod-05',
        number: 12,
        title: 'Component Architecture',
        duration: '26 min',
        shortDescription: 'Presentational vs Container patterns, compound components, Context API, and state lifting.',
        learningObjectives: [
          'Architect scalable React applications using smart/dumb or container/presentational boundaries',
          'Lifting state up to common ancestors to synchronize sibling components',
          'Avoid prop drilling across deeply nested trees using the React Context API'
        ],
        conceptExplanation: 'As applications scale, component organization dictates developer velocity. State should live as close as possible to the components that need it. When multiple sibling components need the same data, lift state up to their closest common parent. When state is truly global (theme, authenticated user, localization), use Context or external state managers.',
        codeExample: {
          language: 'jsx',
          code: `import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: 'Arjun', role: 'Student' });
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}`,
          caption: 'Centralizing authentication state using React Context pattern'
        },
        keyTakeaways: [
          'Do not reach for global state management prematurely; local component state is best for 90% of UI.',
          'Compound components allow expressive, declarative interfaces (like Select and Option).',
          'Co-locate tests and styles next to the components that own them.'
        ],
        skills: ['React', 'Architecture']
      }
    ]
  },

  // =========================================================================
  // MODULE 06: NODE.JS
  // =========================================================================
  {
    id: 'mod-06',
    number: '06',
    title: 'Node.js',
    slug: 'nodejs',
    description: 'Server-side JavaScript runtime: V8 engine, asynchronous I/O, npm package management, file system, HTTP server, Express, and middleware.',
    primarySkill: 'Node.js',
    skills: ['Node.js', 'Backend Development'],
    status: 'locked',
    lab: {
      id: 'lab-06',
      moduleId: 'mod-06',
      title: 'Build a Node.js REST Server',
      objective: 'Create a production-grade Node.js and Express HTTP server featuring modular routing, custom logging middleware, environment configuration, and centralized error handling.',
      requirements: [
        'Initialize an Express application with JSON body parsing and security headers.',
        'Implement custom middleware logging request method, route, IP, and response time.',
        'Build CRUD endpoints for a resource (e.g. /api/students) with asynchronous handlers.',
        'Implement centralized error handling middleware capturing 404s and unhandled 500 exceptions.'
      ],
      hints: [
        'Use next(err) in asynchronous route handlers to pass exceptions directly to the error middleware.',
        'Use process.env for port configuration with a fallback to 3000.'
      ],
      expectedOutput: 'A clean Node.js server that starts cleanly on an assigned port, serves JSON payloads, and returns standard HTTP error structures.',
      skillsTested: ['Node.js', 'Backend Development'],
      submissionRequirements: 'Submit server code containing app.js, routes, middleware, and request logging output.'
    },
    practiceActivities: [
      {
        id: 'prac-06-1',
        type: 'coding',
        title: 'Create an Express endpoint',
        description: 'Implement a GET /api/health endpoint returning uptime and server memory usage.',
        task: 'Write a route returning { status: "healthy", uptime: process.uptime(), timestamp: new Date() } with a 200 OK status code.'
      },
      {
        id: 'prac-06-2',
        type: 'coding',
        title: 'Implement middleware',
        description: 'Write an authentication guard middleware that verifies the presence of an Authorization header.',
        task: 'Create authGuard(req, res, next) rejecting requests missing the Bearer token with 401 Unauthorized.'
      },
      {
        id: 'prac-06-3',
        type: 'debugging',
        title: 'Add centralized error handling',
        description: 'An unhandled promise rejection in an asynchronous route crashes the Node process.',
        task: 'Wrap route logic or implement an async-handler wrapper to forward thrown errors to Express next(err) middleware.'
      }
    ],
    lessons: [
      {
        id: 'les-06-01',
        moduleId: 'mod-06',
        number: 1,
        title: 'Node.js Fundamentals',
        duration: '18 min',
        shortDescription: 'The V8 JavaScript engine, libuv asynchronous I/O, non-blocking architecture, and event-driven model.',
        learningObjectives: [
          'Explain how Node.js executes JavaScript outside the browser environment',
          'Understand libuv thread pool and asynchronous event-driven I/O model',
          'Compare Node.js single-threaded concurrency with multi-threaded blocking architectures'
        ],
        conceptExplanation: 'Node.js is an open-source, cross-platform JavaScript runtime built on Chrome’s V8 engine. Node uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for data-intensive real-time applications running across distributed devices. Rather than spawning a heavy OS thread for every incoming connection, Node processes requests concurrently on an event loop backed by libuv.',
        codeExample: {
          language: 'javascript',
          code: `// Inspect Node.js process runtime metadata
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Process ID:', process.pid);
console.log('Memory Usage:', process.memoryUsage());`,
          caption: 'Accessing system runtime metadata using the Node.js process global'
        },
        keyTakeaways: [
          'Node.js is single-threaded for JS execution, but uses multi-threaded C++ thread pools (libuv) for disk and network I/O.',
          'CPU-heavy operations (e.g. video transcoding, heavy cryptography) block the event loop and should be offloaded to worker threads.',
          'Ideal for high-concurrency, I/O-bound web services and microservice APIs.'
        ],
        skills: ['Node.js', 'Backend Development']
      },
      {
        id: 'les-06-02',
        moduleId: 'mod-06',
        number: 2,
        title: 'npm',
        duration: '16 min',
        shortDescription: 'Node Package Manager: package.json, scripts, semantic versioning, and dependencies vs devDependencies.',
        learningObjectives: [
          'Manage external packages using npm, package.json, and package-lock.json',
          'Understand Semantic Versioning rules: Major.Minor.Patch (^caret vs ~tilde)',
          'Distinguish runtime dependencies from development-only tooling devDependencies'
        ],
        conceptExplanation: 'npm is the world’s largest software registry. The package.json manifest records metadata about your project and its dependencies. The package-lock.json file locks down exact dependency versions and cryptographic hashes, ensuring reproducible builds across development and production machines.',
        codeExample: {
          language: 'json',
          code: `{
  "name": "seva-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`,
          caption: 'Standard package.json configuration with scripts and semantic version ranges'
        },
        keyTakeaways: [
          'Always commit package-lock.json to version control for deterministic installations.',
          '^ (caret) allows compatible minor/patch updates; ~ (tilde) allows only patch updates.',
          'Use npm audit to inspect vulnerabilities in installed dependencies.'
        ],
        skills: ['Node.js']
      },
      {
        id: 'les-06-03',
        moduleId: 'mod-06',
        number: 3,
        title: 'Modules',
        duration: '18 min',
        shortDescription: 'CommonJS (require, module.exports) and ES Modules (import, export) in Node.js.',
        learningObjectives: [
          'Write and export modules using CommonJS and ES Module syntax',
          'Configure "type": "module" in package.json to enable native ESM in Node',
          'Import core built-in Node modules (fs, path, http, os, crypto)'
        ],
        conceptExplanation: 'Node historically used CommonJS (CJS) where files are loaded synchronously via require(). Modern Node.js natively supports standard ES Modules (ESM) using import and export. You can enable ESM by setting "type": "module" in package.json or using the .mjs file extension.',
        codeExample: {
          language: 'javascript',
          code: `// CommonJS syntax
// const path = require('node:path');
// module.exports = { calculateScore };

// Modern ES Module syntax (Node.js 18+)
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveDataPath(filename) {
  return path.join(process.cwd(), 'data', filename);
}`,
          caption: 'Modern ES Module export using Node.js built-in path module'
        },
        keyTakeaways: [
          'Prefix built-in modules with node: (e.g. node:path, node:fs) for clarity and security.',
          'ESM modules are evaluated asynchronously and support top-level await.',
          'Avoid mixing CommonJS require and ESM import in the same codebase.'
        ],
        skills: ['Node.js']
      },
      {
        id: 'les-06-04',
        moduleId: 'mod-06',
        number: 4,
        title: 'File System',
        duration: '22 min',
        shortDescription: 'The fs module: asynchronous file reading, writing, streams, and path utilities.',
        learningObjectives: [
          'Read and write files asynchronously using the node:fs/promises API',
          'Resolve file system paths safely across operating systems using node:path',
          'Understand stream processing for handling large files without exhausting RAM'
        ],
        conceptExplanation: 'The node:fs module provides APIs for interacting with the file system. Never use synchronous methods (like readFileSync) on active HTTP servers, as they freeze the entire event loop for all concurrent users. Use the promises-based API (fs/promises) or Streams for large files.',
        codeExample: {
          language: 'javascript',
          code: `import fs from 'node:fs/promises';
import path from 'node:path';

async function readPassportTelemetry(candidateId) {
  const filePath = path.join(process.cwd(), 'telemetry', \`\${candidateId}.json\`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null; // File not found
    throw err;
  }
}`,
          caption: 'Asynchronous file reading with fs/promises and specific error code handling'
        },
        keyTakeaways: [
          'Always use fs/promises instead of callback-based fs or blocking fsSync.',
          'Use path.join() instead of manual string concatenation to ensure Windows and Linux compatibility.',
          'Use streams (fs.createReadStream) for files larger than a few megabytes.'
        ],
        skills: ['Node.js', 'Backend Development']
      },
      {
        id: 'les-06-05',
        moduleId: 'mod-06',
        number: 5,
        title: 'Environment Variables',
        duration: '16 min',
        shortDescription: 'process.env, .env files, dotenv library, and secrets management.',
        learningObjectives: [
          'Read environment variables via process.env',
          'Manage local configuration with dotenv and .env files',
          'Prevent accidental credential leaks by adding .env to .gitignore'
        ],
        conceptExplanation: 'Environment variables allow you to configure application settings (ports, database credentials, API keys) outside of source code according to Twelve-Factor App methodology. This ensures sensitive production credentials are never committed to version control.',
        codeExample: {
          language: 'javascript',
          code: `// Load .env in development
import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET
};

if (!config.jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing.');
}`,
          caption: 'Validating and parsing environment variables at application startup'
        },
        keyTakeaways: [
          'Never commit .env files containing real secrets to GitHub or git repositories.',
          'Provide a .env.example file detailing all required configuration keys.',
          'Validate critical environment variables at server boot time (fail fast).'
        ],
        skills: ['Node.js', 'Security']
      },
      {
        id: 'les-06-06',
        moduleId: 'mod-06',
        number: 6,
        title: 'HTTP Server',
        duration: '20 min',
        shortDescription: 'Native node:http module: creating a server, parsing URLs, headers, and request streams.',
        learningObjectives: [
          'Build a basic HTTP server using the built-in node:http module without third-party frameworks',
          'Read incoming request body chunks from the readable stream',
          'Set response headers and status codes manually'
        ],
        conceptExplanation: 'Before using frameworks like Express or Fastify, understanding the native node:http module is essential. In native Node, the request object (req) is a Readable Stream, and the response object (res) is a Writable Stream. Incoming POST data must be buffered across data chunks.',
        codeExample: {
          language: 'javascript',
          code: `import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP' }));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(3000, () => console.log('Server listening on port 3000'));`,
          caption: 'Lightweight HTTP server constructed with native node:http module'
        },
        keyTakeaways: [
          'Native node:http illustrates that request bodies arrive in asynchronous byte chunks.',
          'res.end() must be called to finalize and transmit the HTTP response to the client.',
          'Higher-level frameworks like Express abstract away repetitive stream buffering and routing.'
        ],
        skills: ['Node.js', 'Web Fundamentals']
      },
      {
        id: 'les-06-07',
        moduleId: 'mod-06',
        number: 7,
        title: 'Express',
        duration: '22 min',
        shortDescription: 'The Express framework: initialization, routing, request/response helpers, and JSON body parsing.',
        learningObjectives: [
          'Initialize an Express application and register routes using app.get, app.post, etc.',
          'Parse JSON request bodies using express.json() middleware',
          'Send structured JSON responses and status codes with res.status().json()'
        ],
        conceptExplanation: 'Express is the de facto standard web framework for Node.js. It provides a minimalist, robust layer of fundamental web application features, including flexible routing, integrated middleware support, and convenient utilities for setting HTTP headers, cookies, and status codes.',
        codeExample: {
          language: 'javascript',
          code: `import express from 'express';

const app = express();
app.use(express.json()); // Built-in JSON body parser middleware

app.get('/api/skills', (req, res) => {
  res.status(200).json([
    { name: 'JavaScript', score: 91 },
    { name: 'React', score: 88 }
  ]);
});

app.listen(3000);`,
          caption: 'Basic Express server with JSON parser and REST route'
        },
        keyTakeaways: [
          'express.json() is required to populate req.body for incoming JSON requests.',
          'res.json() automatically sets Content-Type: application/json and serializes objects.',
          'Express matches routes in the order they are registered in the file.'
        ],
        skills: ['Node.js', 'REST API']
      },
      {
        id: 'les-06-08',
        moduleId: 'mod-06',
        number: 8,
        title: 'Middleware',
        duration: '24 min',
        shortDescription: 'The middleware chain, req/res modification, next() function, and third-party middleware (cors, morgan).',
        learningObjectives: [
          'Understand how the Express middleware pipeline processes requests sequentially',
          'Author custom middleware functions that inspect or augment req/res objects',
          'Prevent hanging requests by ensuring either next() or res.send() is called'
        ],
        conceptExplanation: 'Middleware functions are functions that have access to the request object (req), response object (res), and the next middleware function in the application’s request-response cycle (next). Middleware can execute any code, make changes to the request and response objects, end the request-response cycle, or call next() to pass control.',
        codeExample: {
          language: 'javascript',
          code: `// Custom Request Logger Middleware
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} - \${duration}ms\`);
  });
  next(); // Pass control to the next middleware
}`,
          caption: 'Custom performance tracking middleware using Express next() flow'
        },
        keyTakeaways: [
          'If a middleware does not call next() and does not send a response, the request hangs indefinitely.',
          'Middleware executes in the exact order passed to app.use().',
          'Common third-party middleware includes helmet (security headers) and cors (cross-origin sharing).'
        ],
        skills: ['Node.js', 'Backend Development']
      },
      {
        id: 'les-06-09',
        moduleId: 'mod-06',
        number: 9,
        title: 'Error Handling',
        duration: '22 min',
        shortDescription: 'Express error-handling middleware (4 arguments), 404 handlers, and unhandled rejections.',
        learningObjectives: [
          'Implement 4-parameter error middleware: (err, req, res, next)',
          'Catch asynchronous route errors and pass them via next(err)',
          'Return standardized JSON error envelopes avoiding stack trace leaks in production'
        ],
        conceptExplanation: 'Error-handling middleware functions are defined in the same way as other middleware functions, except they have four arguments instead of three: (err, req, res, next). Express identifies error handlers exclusively by this 4-argument signature. It should be registered after all routes.',
        codeExample: {
          language: 'javascript',
          code: `// Centralized Error Handler (must have 4 parameters)
app.use((err, req, res, next) => {
  console.error('[Error Caught]:', err.message);
  
  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status,
      // Only include stack trace in non-production environments
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});`,
          caption: 'Centralized 4-argument error handling middleware for Express'
        },
        keyTakeaways: [
          'Never expose raw internal error stack traces to clients in production environments.',
          'Always register the error handling middleware at the very end of your app.use() declarations.',
          'In Express 4, unhandled promise rejections inside async route handlers must be passed to next(err).'
        ],
        skills: ['Node.js', 'Debugging']
      },
      {
        id: 'les-06-10',
        moduleId: 'mod-06',
        number: 10,
        title: 'Project Structure',
        duration: '20 min',
        shortDescription: 'Layered architecture: controllers, services, models, routes, and config separation.',
        learningObjectives: [
          'Organize production backend projects using the MVC/Layered architecture pattern',
          'Separate HTTP route handlers (controllers) from core business logic (services)',
          'Create modular, testable, and maintainable backend repository layouts'
        ],
        conceptExplanation: 'As backends grow beyond simple scripts, adopting a layered architecture is critical. Routes define URL endpoints; Controllers handle HTTP requests and validate inputs; Services implement core business logic and calculations; Models/Data Access layers communicate with databases.',
        codeExample: {
          language: 'text',
          code: `src/
├── config/       # Environment & database configurations
├── controllers/  # HTTP request/response handlers
├── services/     # Pure business logic & algorithms
├── models/       # Database schemas & queries
├── routes/       # Express router definitions
├── middleware/   # Authentication, validation, error handlers
└── server.js     # Express app bootstrapping`,
          caption: 'Industry-standard layered directory structure for Node.js backends'
        },
        keyTakeaways: [
          'Controllers should be skinny; services should contain the heavy business rules.',
          'Separating business logic from Express req/res objects makes unit testing trivial.',
          'Keep database connection bootstrapping isolated in a dedicated config or db module.'
        ],
        skills: ['Node.js', 'Backend Development', 'Architecture']
      }
    ]
  },

  // =========================================================================
  // MODULE 07: REST APIs
  // =========================================================================
  {
    id: 'mod-07',
    number: '07',
    title: 'REST APIs',
    slug: 'rest-apis',
    description: 'Designing production-grade RESTful APIs: HTTP methods, status codes, URL route design, parameters, validation, pagination, and error envelopes.',
    primarySkill: 'REST API',
    skills: ['REST API', 'Backend Development'],
    status: 'locked',
    lab: {
      id: 'lab-07',
      moduleId: 'mod-07',
      title: 'Build a Task Management REST API',
      objective: 'Design and implement a complete RESTful API for tasks with full CRUD operations, query parameter filtering, pagination, request validation, and correct HTTP status codes.',
      requirements: [
        'Implement endpoints: GET /api/v1/tasks, POST /api/v1/tasks, GET /api/v1/tasks/:id, PUT /api/v1/tasks/:id, DELETE /api/v1/tasks/:id.',
        'Implement pagination: support ?page=1&limit=10 returning total items and page metadata.',
        'Enforce request validation: reject missing or empty task titles with 422 Unprocessable Entity.',
        'Ensure correct status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found.'
      ],
      hints: [
        'Use 204 No Content for successful DELETE operations that return no body.',
        'Nest resource sub-routes logically (e.g. /api/v1/tasks/:id/comments).'
      ],
      expectedOutput: 'A fully functional REST API passing automated HTTP assertion test suites with predictable JSON schemas.',
      skillsTested: ['REST API', 'Backend Development'],
      submissionRequirements: 'Submit Postman/Thunder Client collection or integration test results proving full CRUD and error status compliance.'
    },
    practiceActivities: [
      {
        id: 'prac-07-1',
        type: 'coding',
        title: 'Design CRUD endpoints',
        description: 'Design the URL routing schema and HTTP methods for a student evidence submission resource.',
        task: 'Map endpoints for listing evidence, submitting evidence, retrieving an evidence audit, and revoking evidence.'
      },
      {
        id: 'prac-07-2',
        type: 'coding',
        title: 'Implement request validation',
        description: 'Validate incoming POST request payloads using schema validation (Zod or Joi).',
        task: 'Reject payloads where candidateId does not match format or score is outside 0-100 range with detailed error messages.'
      },
      {
        id: 'prac-07-3',
        type: 'debugging',
        title: 'Return correct HTTP status codes',
        description: 'An API endpoint currently returns 200 OK with { error: "Not Found" } inside the body.',
        task: 'Refactor the endpoint to return proper HTTP 404 Not Found status with standard error payload.'
      }
    ],
    lessons: [
      {
        id: 'les-07-01',
        moduleId: 'mod-07',
        number: 1,
        title: 'REST Fundamentals',
        duration: '18 min',
        shortDescription: 'Representational State Transfer constraints: Statelessness, Client-Server, Uniform Interface.',
        learningObjectives: [
          'Understand Roy Fielding’s REST architectural principles',
          'Explain why statelessness enables horizontal server scaling',
          'Treat URLs as nouns (resources) rather than verbs (actions)'
        ],
        conceptExplanation: 'REST is an architectural style for distributed hypermedia systems. Key constraints include: Client-Server separation, Statelessness (each request contains all information needed to process it), Cacheability, and a Uniform Interface where resources are identified by URIs and manipulated via standard HTTP methods.',
        codeExample: {
          language: 'http',
          code: `# Anti-pattern (RPC style):
POST /getStudents
POST /deleteStudent?id=12

# RESTful pattern (Resource oriented):
GET    /api/v1/students      # Retrieve collection
GET    /api/v1/students/12   # Retrieve specific item
POST   /api/v1/students      # Create new item
DELETE /api/v1/students/12   # Delete specific item`,
          caption: 'Comparing RPC-style action URLs with RESTful resource URIs'
        },
        keyTakeaways: [
          'Use plural nouns for resource collections (e.g. /students, /courses).',
          'Never put verbs in REST URLs (e.g. avoid /create-user or /delete-user).',
          'Statelessness means the server does not store client session context between requests.'
        ],
        skills: ['REST API']
      },
      {
        id: 'les-07-02',
        moduleId: 'mod-07',
        number: 2,
        title: 'HTTP Methods',
        duration: '20 min',
        shortDescription: 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD: semantics and idempotency.',
        learningObjectives: [
          'Choose the correct HTTP method based on action semantics',
          'Differentiate between PUT (full replacement) and PATCH (partial update)',
          'Understand idempotency: methods that produce the same result regardless of execution frequency'
        ],
        conceptExplanation: 'HTTP methods define the desired action to be performed on a resource. GET retrieves data without side effects; POST creates a new subordinate resource; PUT replaces an existing resource completely; PATCH applies partial modifications; DELETE removes the resource. Safe methods do not alter state; idempotent methods can be repeated safely without unintended cumulative effects.',
        codeExample: {
          language: 'javascript',
          code: `// PUT: Full resource replacement
// Requires complete representation
router.put('/tasks/:id', (req, res) => {
  const { title, description, status, priority } = req.body;
  // Replaces entire task entity
});

// PATCH: Partial field update
router.patch('/tasks/:id', (req, res) => {
  // Only updates fields provided in req.body (e.g. just status)
});`,
          caption: 'Demonstrating behavioral distinction between PUT and PATCH'
        },
        keyTakeaways: [
          'GET, PUT, and DELETE are idempotent; POST is not idempotent.',
          'GET requests must never mutate server state.',
          'Use PATCH when clients only need to update 1 or 2 fields out of a large entity.'
        ],
        skills: ['REST API']
      },
      {
        id: 'les-07-03',
        moduleId: 'mod-07',
        number: 3,
        title: 'Status Codes',
        duration: '18 min',
        shortDescription: 'Standard HTTP response codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.',
        learningObjectives: [
          'Select the precise HTTP status code matching operation outcome',
          'Distinguish 401 Unauthorized (unauthenticated) from 403 Forbidden (authenticated but lacks role)',
          'Use 201 Created with Location header and 204 No Content for deletions'
        ],
        conceptExplanation: 'Status codes are 3-digit integers returned by the server indicating the result of the request. Using accurate status codes allows client applications, HTTP caches, and monitoring systems to react correctly without having to parse response body text.',
        codeExample: {
          language: 'javascript',
          code: `// 201 Created when a resource is successfully produced
res.status(201).location(\`/api/tasks/\${newTask.id}\`).json(newTask);

// 204 No Content when an entity is deleted
res.status(204).send();

// 409 Conflict when unique constraints are violated (e.g. duplicate email)
res.status(409).json({ error: 'Email already registered' });`,
          caption: 'Returning context-accurate HTTP status codes in Express'
        },
        keyTakeaways: [
          '200 is for general success; 201 is specifically for resource creation.',
          '401 means "Who are you?" (unauthenticated); 403 means "You are not allowed here" (unauthorized).',
          '422 Unprocessable Entity is ideal for validation rule failures.'
        ],
        skills: ['REST API']
      },
      {
        id: 'les-07-04',
        moduleId: 'mod-07',
        number: 4,
        title: 'Route Design',
        duration: '18 min',
        shortDescription: 'Nested resources, plural naming, API versioning (/v1/), and sub-resource relationships.',
        learningObjectives: [
          'Design intuitive hierarchical resource hierarchies',
          'Implement API versioning schemes (URI path versioning: /api/v1/)',
          'Model sub-resources (e.g. /students/:id/evidence)'
        ],
        conceptExplanation: 'A well-designed REST API is predictable and self-descriptive. Resources should be represented as plural nouns. Sub-resources express ownership or parent-child relationships. Limit nesting to a maximum of two levels (e.g. /courses/:courseId/modules) to prevent unmanageably deep URLs.',
        codeExample: {
          language: 'javascript',
          code: `import express from 'express';
const router = express.Router();

// Root resource
router.get('/courses/:courseId', getCourse);

// Nested sub-resource representing parent-child relationship
router.get('/courses/:courseId/modules', getCourseModules);
router.post('/courses/:courseId/modules', createCourseModule);`,
          caption: 'Express router managing nested parent-child resource relationships'
        },
        keyTakeaways: [
          'Always prefix public APIs with a version identifier (e.g. /api/v1/).',
          'Do not nest resources deeper than 2 levels; use query parameters instead.',
          'Maintain consistent kebab-case or camelCase across all route paths.'
        ],
        skills: ['REST API']
      },
      {
        id: 'les-07-05',
        moduleId: 'mod-07',
        number: 5,
        title: 'Request Parameters',
        duration: '16 min',
        shortDescription: 'Route params (req.params), Query strings (req.query), and Request headers (req.headers).',
        learningObjectives: [
          'Extract dynamic route parameters using req.params',
          'Parse search, filter, and sorting options from query strings using req.query',
          'Read client metadata and tokens from HTTP request headers'
        ],
        conceptExplanation: 'Parameters pass context to the server. Route parameters (/users/:id) identify specific entities. Query strings (/users?role=admin&sort=name) filter, sort, and paginate collections. Headers transmit metadata like authorization tokens, accepted language, and client application versions.',
        codeExample: {
          language: 'javascript',
          code: `// Route: GET /api/v1/students/:studentId/skills?category=Frontend
app.get('/api/v1/students/:studentId/skills', (req, res) => {
  const { studentId } = req.params;     // 'std-101'
  const { category } = req.query;        // 'Frontend'
  const apiKey = req.headers['x-api-key']; // Header metadata
  
  // Query database using parsed parameters
});`,
          caption: 'Extracting path parameters, query strings, and custom request headers'
        },
        keyTakeaways: [
          'Path params are for identifying specific resources; query params are for filtering/sorting.',
          'All query parameters arrive as strings; always sanitize and convert them (e.g. parseInt).',
          'Header names are case-insensitive in HTTP.'
        ],
        skills: ['REST API']
      },
      {
        id: 'les-07-06',
        moduleId: 'mod-07',
        number: 6,
        title: 'Request Body',
        duration: '16 min',
        shortDescription: 'Parsing JSON payloads, handling binary multipart form data, and payload size limits.',
        learningObjectives: [
          'Configure body parsing middleware for application/json payloads',
          'Understand multipart/form-data for image and document uploads',
          'Protect servers against Denial of Service (DoS) attacks by enforcing payload size limits'
        ],
        conceptExplanation: 'The request body transmits data payloads during POST, PUT, and PATCH operations. The Content-Type header informs the server how to decode the incoming binary stream. Express requires middleware (express.json()) to parse JSON streams into req.body.',
        codeExample: {
          language: 'javascript',
          code: `// Restricting request payload size to 1MB to prevent memory exhaustion
app.use(express.json({ limit: '1mb' }));

app.post('/api/v1/evidence', (req, res) => {
  const payload = req.body; // Parsed JavaScript object
  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'Payload body cannot be empty' });
  }
});`,
          caption: 'Safeguarding body parsing with explicit payload limits and empty checks'
        },
        keyTakeaways: [
          'Always configure a max limit on express.json() to prevent large payload attacks.',
          'Ensure the client sets Content-Type: application/json or req.body will be undefined.',
          'Use multer middleware for file upload handling (multipart/form-data).'
        ],
        skills: ['REST API', 'Security']
      },
      {
        id: 'les-07-07',
        moduleId: 'mod-07',
        number: 7,
        title: 'Response Design',
        duration: '18 min',
        shortDescription: 'Designing consistent JSON envelopes, metadata wrappers, and date/time formatting.',
        learningObjectives: [
          'Design coherent JSON response structures across all endpoints',
          'Wrap responses with metadata (pagination totals, timestamps, links)',
          'Standardize ISO-8601 UTC string formats for all timestamps'
        ],
        conceptExplanation: 'API usability relies on predictable response shapes. Standardize whether your API returns plain objects or wrapped envelopes ({ data, meta }). Always format timestamps using standard ISO-8601 strings (2026-10-07T10:00:00Z) rather than localized strings.',
        codeExample: {
          language: 'json',
          code: `{
  "data": [
    { "id": "ev-01", "skill": "React", "score": 88 }
  ],
  "meta": {
    "totalCount": 1,
    "page": 1,
    "limit": 10,
    "generatedAt": "2026-10-07T10:15:30.000Z"
  }
}`,
          caption: 'Standard JSON response envelope containing data payload and metadata'
        },
        keyTakeaways: [
          'Consistency across endpoints reduces client parsing bugs.',
          'Always use ISO-8601 UTC format for dates; let client frontends format local time.',
          'Never return top-level arrays in JSON responses if you plan to add metadata later.'
        ],
        skills: ['REST API']
      },
      {
        id: 'les-07-08',
        moduleId: 'mod-07',
        number: 8,
        title: 'Validation',
        duration: '22 min',
        shortDescription: 'Schema validation with Zod/Joi, sanitization, and structured validation error responses.',
        learningObjectives: [
          'Implement declarative schema validation on incoming request bodies',
          'Sanitize string inputs to strip malicious HTML or unwanted characters',
          'Return structured validation error arrays pinpointing invalid fields'
        ],
        conceptExplanation: 'Never trust input from clients. Schema validation libraries like Zod validate that incoming payloads conform strictly to expected data types, formats, lengths, and business constraints before your controller or database ever touches the data.',
        codeExample: {
          language: 'typescript',
          code: `import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(3).max(100),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime()
});

function validateTask(req, res, next) {
  const result = TaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: 'Validation Failed',
      details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }
  req.validatedBody = result.data;
  next();
}`,
          caption: 'Defensive request schema validation using Zod with structured 422 response'
        },
        keyTakeaways: [
          'Validation must happen before business logic or database queries execute.',
          'Return specific error messages detailing which fields failed and why.',
          'Strip unknown extra fields from the payload to prevent mass assignment vulnerabilities.'
        ],
        skills: ['REST API', 'Security']
      },
      {
        id: 'les-07-09',
        moduleId: 'mod-07',
        number: 9,
        title: 'Pagination',
        duration: '20 min',
        shortDescription: 'Offset vs Cursor-based pagination, limits, and Link headers.',
        learningObjectives: [
          'Implement Offset/Limit pagination for small to medium datasets',
          'Implement Cursor-based pagination for high-velocity real-time datasets',
          'Calculate total pages, next page tokens, and enforce safe maximum page limits'
        ],
        conceptExplanation: 'Returning thousands of database records in a single API response leads to high latency and memory bloat. Pagination breaks collections into manageable pages. Offset pagination (?page=2&limit=20) skips rows via SQL OFFSET, while Cursor pagination (?cursor=tx_998) queries records greater than the last seen ID, which remains fast even on millions of rows.',
        codeExample: {
          language: 'javascript',
          code: `// Offset-based pagination calculation
const page = Math.max(1, parseInt(req.query.page || '1', 10));
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
const offset = (page - 1) * limit;

// SQL execution: SELECT * FROM items LIMIT $1 OFFSET $2;`,
          caption: 'Sanitizing pagination query parameters with hard-capped limits'
        },
        keyTakeaways: [
          'Always cap the maximum allowable limit (e.g. max 100 items) to prevent database denial of service.',
          'Offset pagination degrades in performance on large tables; use cursor pagination for large datasets.',
          'Provide totalCount and totalPages in the response meta object.'
        ],
        skills: ['REST API', 'Database Design']
      },
      {
        id: 'les-07-10',
        moduleId: 'mod-07',
        number: 10,
        title: 'API Error Handling',
        duration: '20 min',
        shortDescription: 'RFC 7807 Problem Details for HTTP APIs, error codes, and audit logging.',
        learningObjectives: [
          'Structure error payloads according to RFC 7807 Problem Details standards',
          'Assign distinct machine-readable error codes (e.g. INVALID_CREDENTIALS)',
          'Log server-side error stacks while returning safe, clean messages to the client'
        ],
        conceptExplanation: 'RFC 7807 defines a standardized "Problem Details" JSON object for HTTP APIs to report errors. Standard fields include type (URI reference), title (short human-readable summary), status (HTTP code), and detail (explanation specific to this occurrence). This gives client developers a standardized way to parse errors.',
        codeExample: {
          language: 'json',
          code: `{
  "type": "https://api.seva.edu/errors/validation-error",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "The 'score' field must be an integer between 0 and 100.",
  "instance": "/api/v1/evidence/sub-987",
  "invalidParams": [
    { "name": "score", "reason": "Value 105 exceeds maximum permitted 100" }
  ]
}`,
          caption: 'RFC 7807 compliant standardized Problem Details error response'
        },
        keyTakeaways: [
          'Include machine-readable error codes (e.g. INSUFFICIENT_PERMISSIONS) so client code can branch cleanly.',
          'Never return generic strings like "Something went wrong" when a descriptive reason can be safely provided.',
          'Log unique correlation request IDs (x-request-id) to trace errors in production logs.'
        ],
        skills: ['REST API', 'Debugging']
      }
    ]
  },

  // =========================================================================
  // MODULE 08: DATABASES
  // =========================================================================
  {
    id: 'mod-08',
    number: '08',
    title: 'Databases',
    slug: 'databases',
    description: 'Relational database architecture, PostgreSQL, schemas, table relationships, foreign keys, SQL CRUD, joins, indexing, and ACID transactions.',
    primarySkill: 'SQL',
    skills: ['SQL', 'PostgreSQL', 'Database Design'],
    status: 'locked',
    lab: {
      id: 'lab-08',
      moduleId: 'mod-08',
      title: 'Design a Task Management Database',
      objective: 'Create a normalized relational schema for a task management application featuring users, projects, tasks, labels, and assignment tables with foreign key constraints, indexes, and queries.',
      requirements: [
        'Write DDL CREATE TABLE statements for users, projects, tasks, and task_labels.',
        'Define primary keys (UUID or BIGSERIAL), foreign key constraints with ON DELETE CASCADE rules.',
        'Write SQL queries demonstrating INNER JOIN and LEFT JOIN across tasks and users.',
        'Create B-tree indexes on frequently queried foreign key columns (project_id, user_id).',
        'Demonstrate an ACID transaction using BEGIN, COMMIT, and ROLLBACK.'
      ],
      hints: [
        'Model the many-to-many relationship between tasks and labels using a join table task_label_mappings.',
        'Enforce UNIQUE constraints on email and username.'
      ],
      expectedOutput: 'A clean SQL script executing schema migration, sample seed data insertion, and analytical queries with 0 syntax errors.',
      skillsTested: ['SQL', 'PostgreSQL', 'Database Design'],
      submissionRequirements: 'Submit .sql migration script and query execution plans (EXPLAIN) demonstrating index usage.'
    },
    practiceActivities: [
      {
        id: 'prac-08-1',
        type: 'coding',
        title: 'Write SQL queries',
        description: 'Query student competency data calculating average scores per category.',
        task: 'Write an ANSI SQL query grouping evidence records by category and returning categories with average score > 80.'
      },
      {
        id: 'prac-08-2',
        type: 'coding',
        title: 'Design relational tables',
        description: 'Design the schema for an assessment attempt tracking table.',
        task: 'Define table assessment_attempts with student_id, assessment_id, score, passed boolean, and timestamps.'
      },
      {
        id: 'prac-08-3',
        type: 'debugging',
        title: 'Optimize a query',
        description: 'A slow SQL query performs a sequential table scan on 500,000 evidence records.',
        task: 'Analyze the query with EXPLAIN ANALYZE and add a composite index on (student_id, created_at DESC) to speed lookup.'
      }
    ],
    lessons: [
      {
        id: 'les-08-01',
        moduleId: 'mod-08',
        number: 1,
        title: 'Database Fundamentals',
        duration: '18 min',
        shortDescription: 'Data persistence, DBMS concepts, SQL vs NoSQL, and ACID properties.',
        learningObjectives: [
          'Explain why applications require dedicated Database Management Systems (DBMS)',
          'Compare relational SQL databases with document/NoSQL key-value stores',
          'Understand ACID properties: Atomicity, Consistency, Isolation, Durability'
        ],
        conceptExplanation: 'Databases provide persistent, structured, and concurrent access to data. Relational databases store data in tables with predefined schemas and enforce mathematical relational integrity. ACID properties guarantee that database transactions are processed reliably, even in the event of hardware failures or sudden crashes.',
        codeExample: {
          language: 'sql',
          code: `-- Verifying PostgreSQL server connection and version
SELECT version();

-- View current active database connections
SELECT count(*), state FROM pg_stat_activity GROUP BY state;`,
          caption: 'Diagnostic queries inspecting PostgreSQL database status'
        },
        keyTakeaways: [
          'Relational databases excel at structured data with complex relationships and strong consistency requirements.',
          'ACID guarantees ensure financial and critical user data is never left in a corrupted or half-saved state.',
          'PostgreSQL is an enterprise-grade, open-source object-relational database system.'
        ],
        skills: ['SQL', 'Database Design']
      },
      {
        id: 'les-08-02',
        moduleId: 'mod-08',
        number: 2,
        title: 'Relational Databases',
        duration: '20 min',
        shortDescription: 'Tables, rows, columns, data types, constraints, and normalization (1NF, 2NF, 3NF).',
        learningObjectives: [
          'Understand database normalization principles up to Third Normal Form (3NF)',
          'Select appropriate column data types (TEXT, INT, BIGINT, BOOLEAN, TIMESTAMPTZ, UUID)',
          'Eliminate data redundancy and update anomalies through relational modeling'
        ],
        conceptExplanation: 'In a relational database, data is organized into tables consisting of rows (records) and columns (attributes). Database normalization organizes tables to reduce data redundancy and improve data integrity. 3NF ensures every non-key column depends solely on the primary key.',
        codeExample: {
          language: 'sql',
          code: `CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);`,
          caption: 'Normalized table definition with primary key, unique constraints, and timestamps'
        },
        keyTakeaways: [
          'Always use TIMESTAMPTZ (timestamp with time zone) rather than plain TIMESTAMP.',
          'Normalize to avoid update, insertion, and deletion anomalies.',
          'UUIDs prevent sequential ID enumeration attacks on public APIs.'
        ],
        skills: ['SQL', 'Database Design', 'PostgreSQL']
      },
      {
        id: 'les-08-03',
        moduleId: 'mod-08',
        number: 3,
        title: 'Tables and Relationships',
        duration: '22 min',
        shortDescription: 'One-to-One, One-to-Many, and Many-to-Many relationships and junction tables.',
        learningObjectives: [
          'Model One-to-Many relationships using foreign keys',
          'Model Many-to-Many relationships using junction (join) tables',
          'Establish One-to-One relationships using unique foreign keys'
        ],
        conceptExplanation: 'Relationships define how data in different tables connects. In a One-to-Many relationship (e.g. One Course has Many Lessons), the child table contains a foreign key pointing to the parent. In a Many-to-Many relationship (e.g. Students and Skills), a junction table stores foreign keys linking both entities.',
        codeExample: {
          language: 'sql',
          code: `-- Many-to-Many Junction Table linking Students and Skills
CREATE TABLE student_skills (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  skill_id VARCHAR(50) REFERENCES skills(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  awarded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, skill_id) -- Composite Primary Key
);`,
          caption: 'Junction table establishing a Many-to-Many relationship with composite primary key'
        },
        keyTakeaways: [
          'Many-to-Many relationships always require a junction table.',
          'Composite primary keys prevent duplicate relationship records.',
          'Foreign key references guarantee referential integrity at the engine level.'
        ],
        skills: ['Database Design', 'PostgreSQL']
      },
      {
        id: 'les-08-04',
        moduleId: 'mod-08',
        number: 4,
        title: 'Primary Keys',
        duration: '16 min',
        shortDescription: 'Natural vs Surrogate keys, Auto-incrementing integers, and UUIDs.',
        learningObjectives: [
          'Understand primary key constraints: uniqueness and non-nullability',
          'Compare auto-incrementing integers (BIGSERIAL) with random UUIDv4',
          'Select appropriate primary key strategies for distributed architectures'
        ],
        conceptExplanation: 'A primary key is a column or set of columns that uniquely identifies each row in a table. Surrogate keys (system-generated identifiers like auto-incrementing integers or UUIDs) are preferred over natural keys (like email or social security numbers) because business values can change.',
        codeExample: {
          language: 'sql',
          code: `-- UUID Primary Key using native pgcrypto / pg function
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL
);

-- Traditional BigSerial surrogate key
CREATE TABLE logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL
);`,
          caption: 'Demonstrating UUID vs BigSerial primary key strategies'
        },
        keyTakeaways: [
          'UUIDs can be generated on client or server before database insertion without collisions.',
          'Sequential integer IDs leak business metrics (e.g. guessing total customers from ID numbers).',
          'Every table must have a primary key.'
        ],
        skills: ['SQL', 'Database Design']
      },
      {
        id: 'les-08-05',
        moduleId: 'mod-08',
        number: 5,
        title: 'Foreign Keys',
        duration: '18 min',
        shortDescription: 'Referential integrity, ON DELETE CASCADE, ON DELETE SET NULL, and constraints.',
        learningObjectives: [
          'Enforce referential integrity between parent and child tables',
          'Configure deletion behaviors: CASCADE, SET NULL, RESTRICT',
          'Prevent orphan records in child tables'
        ],
        conceptExplanation: 'A foreign key is a column that refers to the primary key of another table. It enforces referential integrity: you cannot insert a row in the child table with a foreign key that does not exist in the parent table. The ON DELETE clause specifies what happens to children when the parent is deleted.',
        codeExample: {
          language: 'sql',
          code: `CREATE TABLE evidence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  score INT NOT NULL,
  CONSTRAINT fk_student
    FOREIGN KEY(student_id) 
    REFERENCES students(id)
    ON DELETE CASCADE -- Delete child evidence when student account is deleted
);`,
          caption: 'Foreign key constraint with ON DELETE CASCADE behavior'
        },
        keyTakeaways: [
          'ON DELETE CASCADE automatically cleans up child rows when the parent row is deleted.',
          'ON DELETE RESTRICT rejects deletion of the parent if any child rows exist.',
          'Always index foreign key columns to speed up joins and cascade checks.'
        ],
        skills: ['SQL', 'PostgreSQL', 'Database Design']
      },
      {
        id: 'les-08-06',
        moduleId: 'mod-08',
        number: 6,
        title: 'SQL SELECT',
        duration: '22 min',
        shortDescription: 'Querying data: WHERE filtering, ORDER BY, LIMIT, OFFSET, and aggregate functions (COUNT, AVG, SUM).',
        learningObjectives: [
          'Filter data precisely using WHERE clauses with AND, OR, IN, and BETWEEN',
          'Sort results using ORDER BY with ASC/DESC',
          'Calculate aggregate statistics using COUNT, SUM, AVG, MIN, MAX with GROUP BY'
        ],
        conceptExplanation: 'The SQL SELECT statement queries and retrieves data from one or more tables. Data can be filtered with WHERE, grouped with GROUP BY, filtered post-aggregation with HAVING, sorted with ORDER BY, and paginated with LIMIT and OFFSET.',
        codeExample: {
          language: 'sql',
          code: `SELECT 
  skill_id,
  COUNT(id) AS total_evidence,
  ROUND(AVG(score), 2) AS average_competency
FROM evidence_records
WHERE score >= 50
GROUP BY skill_id
HAVING AVG(score) >= 75
ORDER BY average_competency DESC
LIMIT 5;`,
          caption: 'Advanced SQL SELECT query with aggregation, GROUP BY, and HAVING filter'
        },
        keyTakeaways: [
          'WHERE filters individual rows before grouping; HAVING filters groups after aggregation.',
          'Only select the columns you need; avoid SELECT * in production code.',
          'Aggregation functions ignore NULL values except for COUNT(*).'
        ],
        skills: ['SQL']
      },
      {
        id: 'les-08-07',
        moduleId: 'mod-08',
        number: 7,
        title: 'INSERT',
        duration: '16 min',
        shortDescription: 'Inserting single and multiple rows, RETURNING clause, and UPSERT (ON CONFLICT).',
        learningObjectives: [
          'Insert single and batch records into database tables',
          'Utilize PostgreSQL RETURNING clause to get inserted IDs without a second query',
          'Implement UPSERT logic using ON CONFLICT DO UPDATE'
        ],
        conceptExplanation: 'The INSERT statement adds new rows to a table. PostgreSQL supports the powerful RETURNING clause to immediately get back inserted rows or generated IDs. It also features ON CONFLICT (UPSERT) allowing you to either ignore duplicates or update existing records atomically.',
        codeExample: {
          language: 'sql',
          code: `-- PostgreSQL UPSERT: Insert or update if user already exists
INSERT INTO user_preferences (user_id, theme, notifications)
VALUES ('std-101', 'dark', true)
ON CONFLICT (user_id) 
DO UPDATE SET 
  theme = EXCLUDED.theme,
  updated_at = CURRENT_TIMESTAMP
RETURNING *;`,
          caption: 'Atomic PostgreSQL UPSERT query returning the modified record'
        },
        keyTakeaways: [
          'Batch inserts (inserting multiple rows in one statement) are orders of magnitude faster than loops of single inserts.',
          'RETURNING * eliminates the need for a secondary SELECT query after insertion.',
          'ON CONFLICT handles race conditions cleanly without duplicate key errors.'
        ],
        skills: ['SQL', 'PostgreSQL']
      },
      {
        id: 'les-08-08',
        moduleId: 'mod-08',
        number: 8,
        title: 'UPDATE',
        duration: '16 min',
        shortDescription: 'Modifying table records, WHERE guards, and atomic numeric increments.',
        learningObjectives: [
          'Update specific table columns safely using targeted WHERE clauses',
          'Perform atomic numeric increments (e.g. score = score + 5)',
          'Prevent catastrophic table-wide updates caused by missing WHERE clauses'
        ],
        conceptExplanation: 'The UPDATE statement modifies existing data in a table. It is critical to always include a WHERE clause; omitting the WHERE clause will overwrite every single row in the entire table. UPDATE also supports RETURNING to inspect the modified rows.',
        codeExample: {
          language: 'sql',
          code: `UPDATE student_profiles
SET 
  target_role = 'Senior Full Stack Developer',
  progress_percent = LEAST(100, progress_percent + 10),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'usr-202'
RETURNING id, progress_percent, updated_at;`,
          caption: 'Targeted UPDATE query with safe atomic progress increment and RETURNING'
        },
        keyTakeaways: [
          'Always run a SELECT with the exact same WHERE clause first to verify which rows will be affected.',
          'Atomic increments (count = count + 1) avoid lost update race conditions in high-concurrency environments.',
          'Always track an updated_at timestamp when modifying records.'
        ],
        skills: ['SQL']
      },
      {
        id: 'les-08-09',
        moduleId: 'mod-08',
        number: 9,
        title: 'DELETE',
        duration: '16 min',
        shortDescription: 'Removing records, soft deletes (deleted_at), and TRUNCATE comparisons.',
        learningObjectives: [
          'Delete targeted records using DELETE FROM with WHERE clauses',
          'Implement soft delete patterns using a nullable deleted_at timestamp',
          'Understand TRUNCATE for fast, non-logged whole-table wipes'
        ],
        conceptExplanation: 'DELETE removes rows from a table. In production systems handling sensitive user data or audit trails, Hard Deletion (permanently deleting rows) is often avoided in favor of Soft Deletion. Soft deletion sets a deleted_at timestamp, allowing data recovery and audit compliance while filtering deleted rows out of standard queries.',
        codeExample: {
          language: 'sql',
          code: `-- Hard Delete with safety guard
DELETE FROM temporary_sessions 
WHERE expires_at < CURRENT_TIMESTAMP;

-- Soft Delete pattern
UPDATE candidate_accounts 
SET 
  is_deleted = TRUE,
  deleted_at = CURRENT_TIMESTAMP 
WHERE id = 'usr-901';`,
          caption: 'Hard delete vs soft delete query patterns'
        },
        keyTakeaways: [
          'TRUNCATE is much faster than DELETE for clearing an entire table, but cannot be rolled back in some engines and resets identity counters.',
          'Soft deletes require adding WHERE deleted_at IS NULL to all future queries or views.',
          'Hard delete is mandatory for GDPR/privacy "Right to be Forgotten" requests.'
        ],
        skills: ['SQL']
      },
      {
        id: 'les-08-10',
        moduleId: 'mod-08',
        number: 10,
        title: 'JOIN',
        duration: '24 min',
        shortDescription: 'Combining data across tables: INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.',
        learningObjectives: [
          'Master relational set operations combining records across multiple tables',
          'Select the right join type: INNER JOIN (matching rows) vs LEFT JOIN (all left rows plus matches)',
          'Avoid cartesian products (cross joins) caused by missing join conditions'
        ],
        conceptExplanation: 'A JOIN clause combines rows from two or more tables based on a related column between them. An INNER JOIN returns records that have matching values in both tables. A LEFT JOIN returns all records from the left table, and the matched records from the right table (filling with NULL if there is no match).',
        codeExample: {
          language: 'sql',
          code: `SELECT 
  students.full_name,
  students.email,
  evidence.skill_id,
  COALESCE(evidence.score, 0) AS verified_score
FROM students
LEFT JOIN evidence_records AS evidence
  ON students.id = evidence.student_id
WHERE students.is_active = TRUE
ORDER BY students.full_name ASC;`,
          caption: 'LEFT JOIN query retaining all active students even if they have no evidence yet'
        },
        keyTakeaways: [
          'Use INNER JOIN when you strictly require related data to exist in both tables.',
          'Use LEFT JOIN when you want all primary records even if secondary related records do not exist yet.',
          'Always alias tables (AS s, AS e) for readability and maintainability in multi-table queries.'
        ],
        skills: ['SQL']
      },
      {
        id: 'les-08-11',
        moduleId: 'mod-08',
        number: 11,
        title: 'Indexes',
        duration: '22 min',
        shortDescription: 'Query optimization: B-tree indexes, composite indexes, EXPLAIN ANALYZE, and indexing tradeoffs.',
        learningObjectives: [
          'Understand how B-Tree indexes speed up WHERE filtering and JOIN performance',
          'Analyze query execution plans using EXPLAIN and EXPLAIN ANALYZE',
          'Recognize indexing tradeoffs: faster reads at the expense of slower INSERT/UPDATE writes'
        ],
        conceptExplanation: 'Without an index, the database must perform a Sequential Scan (reading every single row from disk) to find matching rows. An index creates a sorted B-Tree data structure pointing to table rows, allowing the engine to locate records in logarithmic O(log N) time instead of O(N).',
        codeExample: {
          language: 'sql',
          code: `-- Create an index on foreign key
CREATE INDEX idx_evidence_student_id ON evidence_records(student_id);

-- Create a composite index for filtering + sorting
CREATE INDEX idx_evidence_skill_score ON evidence_records(skill_id, score DESC);

-- Inspect query execution plan
EXPLAIN ANALYZE 
SELECT * FROM evidence_records WHERE skill_id = 'react' ORDER BY score DESC;`,
          caption: 'Creating single and composite B-tree indexes and verifying with EXPLAIN ANALYZE'
        },
        keyTakeaways: [
          'Indexes speed up SELECT queries drastically, but slow down INSERT, UPDATE, and DELETE operations.',
          'Always index columns used frequently in WHERE clauses, JOIN conditions, and ORDER BY.',
          'EXPLAIN ANALYZE actually executes the query and reports real timing measurements.'
        ],
        skills: ['SQL', 'PostgreSQL', 'Database Design']
      },
      {
        id: 'les-08-12',
        moduleId: 'mod-08',
        number: 12,
        title: 'Transactions',
        duration: '22 min',
        shortDescription: 'ACID transactions: BEGIN, COMMIT, ROLLBACK, isolation levels, and concurrency control.',
        learningObjectives: [
          'Execute multi-step database mutations atomically inside BEGIN ... COMMIT blocks',
          'Roll back uncommitted state changes when an intermediate step throws an error',
          'Prevent race conditions (dirty reads, non-repeatable reads, phantom reads)'
        ],
        conceptExplanation: 'A database transaction is a unit of work that is performed within a database management system against a database. Transactions ensure all steps succeed or all fail together (Atomicity). If an error happens halfway through (e.g. money deducted from Account A but failing to deposit in Account B), a ROLLBACK reverts the database to its pristine prior state.',
        codeExample: {
          language: 'sql',
          code: `BEGIN; -- Start atomic transaction block

-- Step 1: Record evidence submission
INSERT INTO evidence_records (student_id, skill_id, score)
VALUES ('std-101', 'react', 92);

-- Step 2: Update candidate summary score
UPDATE candidate_summaries
SET 
  total_evidence = total_evidence + 1,
  overall_score = 88
WHERE student_id = 'std-101';

COMMIT; -- Commit both steps permanently`,
          caption: 'Atomic multi-table transaction block with BEGIN and COMMIT'
        },
        keyTakeaways: [
          'Transactions guarantee that data is never left in an incomplete or corrupted state.',
          'Any error before COMMIT should immediately trigger ROLLBACK.',
          'Keep transactions as short as possible to minimize table locking contention.'
        ],
        skills: ['SQL', 'PostgreSQL', 'Database Design']
      }
    ]
  },

  // =========================================================================
  // MODULE 09: AUTHENTICATION & SECURITY
  // =========================================================================
  {
    id: 'mod-09',
    number: '09',
    title: 'Authentication & Security',
    slug: 'authentication-security',
    description: 'Web security architecture: Authentication vs Authorization, password hashing (bcrypt), JWT tokens, Role-Based Access Control, SQL Injection, XSS, and CSRF.',
    primarySkill: 'Authentication',
    skills: ['Authentication', 'Security', 'Backend Development'],
    status: 'locked',
    lab: {
      id: 'lab-09',
      moduleId: 'mod-09',
      title: 'Build Role-Based Authentication',
      objective: 'Implement an end-to-end token-based authentication and role-based authorization system featuring password hashing with bcrypt, JWT token generation, auth middleware, and protected endpoints.',
      requirements: [
        'Build /auth/register hashing passwords with bcrypt (salt rounds >= 10).',
        'Build /auth/login verifying credentials and returning a signed JWT access token.',
        'Implement an authenticateToken middleware verifying signature and expiration.',
        'Implement requireRole("admin") middleware blocking unauthorized access with 403 Forbidden.',
        'Sanitize user inputs to prevent SQL Injection and Stored XSS.'
      ],
      hints: [
        'Store JWT secrets in process.env and never commit them to git.',
        'Never return the password hash in the user response payload.'
      ],
      expectedOutput: 'A secure authentication API where protected routes reject unauthenticated requests with 401 and role mismatches with 403.',
      skillsTested: ['Authentication', 'Security', 'Backend Development'],
      submissionRequirements: 'Submit authentication routes, middleware, and automated test cases verifying token verification and role guards.'
    },
    practiceActivities: [
      {
        id: 'prac-09-1',
        type: 'coding',
        title: 'Implement protected API route',
        description: 'Create an Express middleware that verifies Bearer JWT tokens and attaches decoded user claims.',
        task: 'Write verifyToken middleware extracting Bearer token from headers and verifying with jsonwebtoken.'
      },
      {
        id: 'prac-09-2',
        type: 'coding',
        title: 'Validate user input',
        description: 'Sanitize user registration inputs to prevent XSS payloads in name fields.',
        task: 'Sanitize strings using DOMPurify or validator to strip raw script tags.'
      },
      {
        id: 'prac-09-3',
        type: 'debugging',
        title: 'Identify security vulnerabilities',
        description: 'Audit an SQL query constructed via string concatenation: `SELECT * FROM users WHERE email = \'${email}\'`.',
        task: 'Fix the SQL Injection vulnerability by converting string concatenation to parameterized query bindings ($1).'
      }
    ],
    lessons: [
      {
        id: 'les-09-01',
        moduleId: 'mod-09',
        number: 1,
        title: 'Authentication vs Authorization',
        duration: '16 min',
        shortDescription: 'Authentication ("Who are you?") vs Authorization ("What are you permitted to do?").',
        learningObjectives: [
          'Differentiate between authentication identity verification and authorization permissions',
          'Identify the appropriate HTTP status code: 401 Unauthorized vs 403 Forbidden',
          'Model permission matrices across roles (e.g. Student, Employer, Admin)'
        ],
        conceptExplanation: 'Authentication (AuthN) is the process of verifying who a user is (e.g. username/password, OTP, biometric, OAuth). Authorization (AuthZ) is the process of verifying what specific applications, files, and data a user has access to. A user can be successfully authenticated but still be unauthorized to access an admin dashboard.',
        codeExample: {
          language: 'javascript',
          code: `// AuthN vs AuthZ Middleware Flow
function authenticateUser(req, res, next) {
  // Who are you? (Authentication)
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  req.user = verifyToken(token);
  next();
}

function authorizeRole(allowedRole) {
  return (req, res, next) => {
    // What are you allowed to do? (Authorization)
    if (req.user.role !== allowedRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}`,
          caption: 'Clean separation of authentication and authorization middleware stages'
        },
        keyTakeaways: [
          'Authentication answers identity; Authorization answers permission.',
          'Return 401 when the user has not logged in or token is expired.',
          'Return 403 when the user is logged in but does not hold the required permissions.'
        ],
        skills: ['Authentication', 'Security']
      },
      {
        id: 'les-09-02',
        moduleId: 'mod-09',
        number: 2,
        title: 'Password Security',
        duration: '20 min',
        shortDescription: 'One-way cryptographic hashing, rainbow tables, salts, bcrypt, and Argon2.',
        learningObjectives: [
          'Explain why plain-text passwords must never be stored under any circumstances',
          'Understand one-way cryptographic hashing algorithms versus reversible encryption',
          'Hash and verify passwords using bcrypt with appropriate salt rounds'
        ],
        conceptExplanation: 'Passwords must never be stored in plain text or using obsolete hash functions like MD5 or SHA-1. Modern password security uses slow, adaptive one-way hashing functions like bcrypt or Argon2 with unique cryptographic salts. The salt prevents rainbow table attacks, and the configurable work factor (salt rounds) slows down brute-force attacks.',
        codeExample: {
          language: 'javascript',
          code: `import bcrypt from 'bcrypt';

// Hashing during registration (work factor 12)
const saltRounds = 12;
const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

// Verification during login
const isMatch = await bcrypt.compare(inputPassword, storedHash);
if (!isMatch) throw new Error('Invalid credentials');`,
          caption: 'Secure password hashing and verification using bcrypt'
        },
        keyTakeaways: [
          'Never invent custom hashing schemes; use industry-standard bcrypt or Argon2.',
          'A salt is a unique random string appended before hashing to defeat precomputed rainbow tables.',
          'Always use constant-time comparison algorithms to prevent timing attacks.'
        ],
        skills: ['Authentication', 'Security']
      },
      {
        id: 'les-09-03',
        moduleId: 'mod-09',
        number: 3,
        title: 'Sessions',
        duration: '18 min',
        shortDescription: 'Server-side session management: Session IDs, session stores (Redis), and HTTP-only cookies.',
        learningObjectives: [
          'Understand stateful session architecture with server-side stores',
          'Configure secure session cookies (HttpOnly, Secure, SameSite=Strict)',
          'Compare stateful sessions with stateless JWT tokens'
        ],
        conceptExplanation: 'In stateful session authentication, after login the server generates a cryptographically random Session ID, stores session data in an in-memory database like Redis, and sends the Session ID to the browser in a cookie. The browser automatically sends this cookie on subsequent requests. Sessions allow immediate revocation by deleting the server-side entry.',
        codeExample: {
          language: 'javascript',
          code: `// Setting a secure session cookie
res.cookie('sessionId', sid, {
  httpOnly: true, // Inaccessible to client JavaScript (XSS defense)
  secure: true,   // Transmitted only over HTTPS
  sameSite: 'strict', // CSRF defense
  maxAge: 3600000 // 1 hour
});`,
          caption: 'Configuring secure HTTP-only cookies for session management'
        },
        keyTakeaways: [
          'HttpOnly cookies cannot be read by JavaScript (document.cookie), protecting them from XSS theft.',
          'SameSite=Strict prevents cookies from being attached to cross-site requests, mitigating CSRF.',
          'Stateful sessions require centralized shared storage (like Redis) when running multiple server replicas.'
        ],
        skills: ['Authentication', 'Security']
      },
      {
        id: 'les-09-04',
        moduleId: 'mod-09',
        number: 4,
        title: 'JWT',
        duration: '22 min',
        shortDescription: 'JSON Web Tokens: Header, Payload, Signature, signing algorithms (HS256, RS256).',
        learningObjectives: [
          'Dissect the three parts of a JWT: Header, Payload, and Signature',
          'Understand cryptographic digital signatures and tampering prevention',
          'Recognize that JWT payloads are Base64Url-encoded and NOT encrypted'
        ],
        conceptExplanation: 'JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. A JWT consists of three parts separated by dots (header.payload.signature). The signature verifies that the sender is who it says it is and ensures the message wasn’t changed along the way.',
        codeExample: {
          language: 'javascript',
          code: `import jwt from 'jsonwebtoken';

// Sign token with secret key
const token = jwt.sign(
  { sub: 'usr-101', role: 'student' }, // Payload claims
  process.env.JWT_SECRET,             // Secret key
  { expiresIn: '15m' }                 // Expiration
);

// Verify token signature and expiration
const decoded = jwt.verify(token, process.env.JWT_SECRET);`,
          caption: 'Signing and verifying JSON Web Tokens with expiration limits'
        },
        keyTakeaways: [
          'JWT payloads are publicly readable by anyone; NEVER put passwords or secrets in a JWT payload.',
          'The signature guarantees integrity: if anyone tampers with the payload, verification fails.',
          'Always enforce short expiration windows (e.g. 15 minutes) on access tokens.'
        ],
        skills: ['Authentication', 'Security']
      },
      {
        id: 'les-09-05',
        moduleId: 'mod-09',
        number: 5,
        title: 'Access Tokens',
        duration: '18 min',
        shortDescription: 'Short-lived bearer tokens for authorizing individual API requests.',
        learningObjectives: [
          'Implement Bearer authorization header token extraction',
          'Verify token expiration (exp claim) and reject expired credentials',
          'Minimize security blast radius with short-lived access credentials'
        ],
        conceptExplanation: 'Access tokens are bearer credentials used by an application to access an API. Because they grant immediate access to protected resources, access tokens should be short-lived (e.g. 10 to 15 minutes). If an access token is intercepted or compromised, its utility to an attacker expires rapidly.',
        codeExample: {
          language: 'http',
          code: `GET /api/v1/passport HTTP/1.1
Host: api.seva.skillpassport.in
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
          caption: 'Standard HTTP Authorization Bearer token header exchange'
        },
        keyTakeaways: [
          'Clients transmit access tokens in the HTTP Authorization header prefixed by Bearer.',
          'Short lifetimes limit the damage of token leakage.',
          'Access tokens are self-contained; servers verify them without querying the database on every call.'
        ],
        skills: ['Authentication', 'REST API']
      },
      {
        id: 'les-09-06',
        moduleId: 'mod-09',
        number: 6,
        title: 'Refresh Tokens',
        duration: '20 min',
        shortDescription: 'Long-lived tokens for renewing access tokens without user re-authentication.',
        learningObjectives: [
          'Understand the dual-token architecture (short-lived access + long-lived refresh token)',
          'Implement secure refresh token rotation to detect token theft',
          'Store refresh tokens safely in HTTP-only cookies'
        ],
        conceptExplanation: 'In a dual-token architecture, when an access token expires, the client sends a long-lived Refresh Token to a dedicated /auth/refresh endpoint to receive a new access token without forcing the user to log in again. Refresh tokens are stored in the database and can be revoked immediately if a device is lost or compromised.',
        codeExample: {
          language: 'javascript',
          code: `// Refresh token endpoint with rotation
app.post('/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).send();
  
  const tokenDoc = await db.refreshTokens.find(refreshToken);
  if (!tokenDoc || tokenDoc.isRevoked) {
    // Possible token reuse attack detected: invalidate family!
    return res.status(403).send();
  }
  
  const newAccessToken = generateAccessToken(tokenDoc.userId);
  res.json({ accessToken: newAccessToken });
});`,
          caption: 'Refresh token renewal handler with reuse detection'
        },
        keyTakeaways: [
          'Refresh tokens are stateful and tracked in a database so they can be revoked.',
          'Store refresh tokens in secure HttpOnly cookies rather than localStorage.',
          'Token rotation issues a new refresh token with every refresh call, detecting replay attacks.'
        ],
        skills: ['Authentication', 'Security']
      },
      {
        id: 'les-09-07',
        moduleId: 'mod-09',
        number: 7,
        title: 'Role-Based Access',
        duration: '22 min',
        shortDescription: 'RBAC: Roles, permissions, hierarchical authorization, and route guards.',
        learningObjectives: [
          'Implement Role-Based Access Control (RBAC) across API endpoints',
          'Map fine-grained permissions to user roles',
          'Enforce least-privilege principles across application layers'
        ],
        conceptExplanation: 'Role-Based Access Control (RBAC) assigns permissions to specific roles (e.g. Student, Verifier, Admin), and assigns users to roles. This decouples user management from individual route permission logic and ensures users only have access to what is strictly necessary to perform their duties (Principle of Least Privilege).',
        codeExample: {
          language: 'javascript',
          code: `const ROLES = {
  STUDENT: ['read:profile', 'submit:evidence'],
  EMPLOYER: ['read:profile', 'verify:passport'],
  ADMIN: ['read:profile', 'submit:evidence', 'verify:passport', 'manage:users']
};

function checkPermission(requiredPermission) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = ROLES[userRole] || [];
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
}`,
          caption: 'Declarative permission-based authorization middleware'
        },
        keyTakeaways: [
          'Authorize against specific capabilities (e.g. verify:passport) rather than hardcoded role names.',
          'Always verify resource ownership: students should only view or edit their own profile, not others.',
          'Enforce least-privilege access across all admin tools.'
        ],
        skills: ['Authentication', 'Security']
      },
      {
        id: 'les-09-08',
        moduleId: 'mod-09',
        number: 8,
        title: 'Input Validation',
        duration: '18 min',
        shortDescription: 'Preventing injection attacks: Whitelisting, sanitization, and type coercion defense.',
        learningObjectives: [
          'Apply strict input validation on all client-supplied data',
          'Differentiate between input validation (rejection) and input sanitization (cleaning)',
          'Adopt an allowlist (whitelisting) approach instead of blocklist (blacklisting)'
        ],
        conceptExplanation: 'Input validation is the primary line of defense against cyberattacks. Every piece of data entering the application from an external source (query strings, body payloads, headers, uploaded files) must be validated for type, length, format, and range. Always prefer positive allowlisting (defining acceptable patterns) over blocklisting.',
        codeExample: {
          language: 'javascript',
          code: `// Positive allowlisting regex for candidate ID
const CANDIDATE_ID_REGEX = /^GSP-[A-Z0-9]{4,10}$/;

function validateCandidateId(id) {
  if (typeof id !== 'string' || !CANDIDATE_ID_REGEX.test(id)) {
    throw new Error('Invalid candidate ID format');
  }
  return id;
}`,
          caption: 'Strict allowlist input validation using targeted regular expressions'
        },
        keyTakeaways: [
          'Never rely on client-side HTML validation alone; clients can bypass browser checks easily.',
          'Allowlisting (validating what is permitted) is far safer than blocklisting (banning known bad words).',
          'Reject invalid inputs immediately before performing any database queries.'
        ],
        skills: ['Security', 'REST API']
      },
      {
        id: 'les-09-09',
        moduleId: 'mod-09',
        number: 9,
        title: 'SQL Injection',
        duration: '22 min',
        shortDescription: 'SQLi mechanics, parameterized queries, ORM safety, and preventing database exfiltration.',
        learningObjectives: [
          'Understand how SQL injection occurs through string concatenation',
          'Eliminate SQL injection entirely using parameterized queries and prepared statements',
          'Recognize that ORMs can still be vulnerable if raw SQL fragments are used'
        ],
        conceptExplanation: 'SQL Injection (SQLi) occurs when untrusted user input is directly concatenated into a SQL statement, allowing an attacker to manipulate the query structure. This can lead to unauthorized data exposure, deletion of the entire database, or administrative takeover. Parameterized queries completely eliminate SQLi by sending query code and data separately to the database engine.',
        codeExample: {
          language: 'javascript',
          code: `// VULNERABLE TO SQL INJECTION (DO NOT DO THIS!):
// const query = \`SELECT * FROM users WHERE email = '\${req.body.email}'\`;

// SECURE: Parameterized Query using prepared statement placeholders ($1)
const query = 'SELECT id, email, full_name FROM users WHERE email = $1';
const result = await db.query(query, [req.body.email]);`,
          caption: 'Eliminating SQL injection vulnerabilities using parameterized query variables'
        },
        keyTakeaways: [
          'Never concatenate or template user input strings into SQL queries.',
          'Parameterized queries treat user input strictly as literal values, never as executable code.',
          'Grant the database application user least privilege (e.g. no DROP TABLE or ALTER permissions).'
        ],
        skills: ['Security', 'SQL', 'PostgreSQL']
      },
      {
        id: 'les-09-10',
        moduleId: 'mod-09',
        number: 10,
        title: 'XSS',
        duration: '22 min',
        shortDescription: 'Cross-Site Scripting: Stored, Reflected, DOM-based XSS, and Content Security Policy (CSP).',
        learningObjectives: [
          'Analyze the three categories of XSS: Stored, Reflected, and DOM-based',
          'Understand how React automatically escapes strings inside JSX to prevent XSS',
          'Configure Content Security Policy (CSP) headers to restrict script execution'
        ],
        conceptExplanation: 'Cross-Site Scripting (XSS) attacks occur when an attacker injects malicious scripts into trusted websites viewed by other users. The malicious script can steal session cookies, capture keystrokes, or perform actions on behalf of the victim. React mitigates XSS by automatically escaping all text inside JSX curly braces {}.',
        codeExample: {
          language: 'javascript',
          code: `// Vulnerable: dangerouslySetInnerHTML bypasses React escaping!
// <div dangerouslySetInnerHTML={{ __html: userInput }} />

// Secure: React automatically escapes HTML entities in standard JSX
function SafeProfile({ bio }) {
  return <p>{bio}</p>; // Safe: <script> rendered as harmless text
}`,
          caption: 'React automatic string escaping versus dangerous raw HTML rendering'
        },
        keyTakeaways: [
          'Avoid using dangerouslySetInnerHTML unless you have thoroughly sanitized the input with DOMPurify.',
          'Never store raw, unsanitized user HTML in databases.',
          'Use Content Security Policy (CSP) headers to disallow inline script execution.'
        ],
        skills: ['Security', 'Frontend']
      },
      {
        id: 'les-09-11',
        moduleId: 'mod-09',
        number: 11,
        title: 'CSRF',
        duration: '18 min',
        shortDescription: 'Cross-Site Request Forgery, SameSite cookie attributes, and anti-CSRF tokens.',
        learningObjectives: [
          'Understand how CSRF attacks exploit automatic browser cookie transmission',
          'Mitigate CSRF using SameSite=Strict and SameSite=Lax cookie attributes',
          'Implement Anti-CSRF Synchronizer Tokens for state-changing operations'
        ],
        conceptExplanation: 'Cross-Site Request Forgery (CSRF) is an attack that forces an end user to execute unwanted actions on a web application in which they are currently authenticated. Because browsers automatically include ambient cookies on cross-origin requests, a malicious site could trigger an unwanted POST /api/transfer-funds request. Setting SameSite=Lax or SameSite=Strict on cookies prevents this.',
        codeExample: {
          language: 'javascript',
          code: `// Mitigating CSRF with modern SameSite cookie flags
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' // Browser refuses to send cookie on cross-site requests
});`,
          caption: 'Defeating Cross-Site Request Forgery with SameSite=Strict cookie attribute'
        },
        keyTakeaways: [
          'APIs that rely solely on custom headers (like Authorization: Bearer) are naturally immune to classic CSRF.',
          'If using cookies for authentication, always set SameSite=Lax or SameSite=Strict.',
          'Use Anti-CSRF tokens for traditional server-rendered HTML forms.'
        ],
        skills: ['Security', 'Web Fundamentals']
      },
      {
        id: 'les-09-12',
        moduleId: 'mod-09',
        number: 12,
        title: 'Secure API Design',
        duration: '22 min',
        shortDescription: 'Helmet security headers, rate limiting, CORS configuration, and security audits.',
        learningObjectives: [
          'Enforce HTTP security headers using helmet (HSTS, X-Frame-Options, CSP)',
          'Implement rate limiting to defend against brute force and DDoS attacks',
          'Configure strict CORS allowlists instead of wildcards (*)'
        ],
        conceptExplanation: 'Secure API design requires defense-in-depth across multiple layers. Use helmet to set security headers that protect against clickjacking (X-Frame-Options: DENY) and force HTTPS (Strict-Transport-Security). Implement rate limiting (e.g. express-rate-limit) to block automated brute-force attacks on sensitive endpoints.',
        codeExample: {
          language: 'javascript',
          code: `import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet()); // Sets 15+ secure HTTP headers

// Limit login attempts: max 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again later.' }
});

app.use('/api/auth/login', authLimiter);`,
          caption: 'Hardening API security with helmet headers and targeted rate limiting'
        },
        keyTakeaways: [
          'Never configure Access-Control-Allow-Origin: * on authenticated APIs.',
          'Rate limit authentication and password reset endpoints to stop credential stuffing.',
          'Audit dependencies routinely with npm audit or Snyk.'
        ],
        skills: ['Security', 'REST API', 'Backend Development']
      }
    ]
  },

  // =========================================================================
  // MODULE 10: GIT & GITHUB
  // =========================================================================
  {
    id: 'mod-10',
    number: '10',
    title: 'Git & GitHub',
    slug: 'git-github',
    description: 'Distributed version control, branching strategies, commit hygiene, pull requests, merge conflict resolution, and collaborative workflows.',
    primarySkill: 'Git',
    skills: ['Git', 'Engineering'],
    status: 'locked',
    lab: {
      id: 'lab-10',
      moduleId: 'mod-10',
      title: 'Collaborative Git Workflow',
      objective: 'Execute an end-to-end collaborative Git workflow: initialize repository, create a feature branch, commit atomic changes, open a pull request, resolve a simulated merge conflict, and merge cleanly.',
      requirements: [
        'Initialize a Git repository with an appropriate .gitignore for Node/React.',
        'Create a feature branch feat/evidence-scoring from main.',
        'Craft atomic, well-formatted Conventional Commits (feat:, fix:, chore:).',
        'Simulate and resolve a conflicting edit on the same line across two branches.',
        'Perform a fast-forward or squashed merge and delete the obsolete feature branch.'
      ],
      hints: [
        'Use git status and git diff before staging changes with git add.',
        'Identify conflict markers (<<<<<<< HEAD, =======, >>>>>>>) and resolve cleanly.'
      ],
      expectedOutput: 'A clean Git commit history log verifying conflict resolution and branch cleanup.',
      skillsTested: ['Git'],
      submissionRequirements: 'Submit terminal output log of git log --oneline --graph demonstrating branching, conflict resolution, and merge.'
    },
    practiceActivities: [
      {
        id: 'prac-10-1',
        type: 'coding',
        title: 'Resolve a merge conflict',
        description: 'Resolve a simulated merge conflict where two developers edited the same function signature.',
        task: 'Manually edit the file removing conflict markers and verify test pass with git merge --continue.'
      },
      {
        id: 'prac-10-2',
        type: 'coding',
        title: 'Create a feature branch',
        description: 'Branch off the main development branch cleanly.',
        task: 'Execute git checkout -b feat/task-filtering and commit a new filter utility.'
      },
      {
        id: 'prac-10-3',
        type: 'conceptual',
        title: 'Prepare a professional pull request',
        description: 'Draft a pull request summary including problem context, technical solution, and testing evidence.',
        task: 'Write a comprehensive PR description detailing changes, screenshots, and test checklist.'
      }
    ],
    lessons: [
      {
        id: 'les-10-01',
        moduleId: 'mod-10',
        number: 1,
        title: 'Version Control',
        duration: '16 min',
        shortDescription: 'Why version control matters: History tracking, collaboration, and distributed VCS architecture.',
        learningObjectives: [
          'Understand the necessity of Version Control Systems (VCS) in professional software engineering',
          'Compare centralized VCS (SVN) with distributed VCS (Git)',
          'Explain how Git tracks snapshots rather than file difference deltas'
        ],
        conceptExplanation: 'Version control is a system that records changes to a file or set of files over time so that you can recall specific versions later. In a Distributed Version Control System (like Git), clients don’t just check out the latest snapshot of the files; they fully mirror the repository, including its entire history.',
        codeExample: {
          language: 'bash',
          code: `# Configure global user identity
git config --global user.name "Arjun Sharma"
git config --global user.email "arjun@example.com"

# Check global configuration
git config --list`,
          caption: 'Configuring author identity in Git'
        },
        keyTakeaways: [
          'Git gives every contributor a full local copy of the repository and its entire history.',
          'Enables safe experimentation without risking the working production codebase.',
          'Provides an immutable audit log of who made which change, when, and why.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-02',
        moduleId: 'mod-10',
        number: 2,
        title: 'Git Fundamentals',
        duration: '18 min',
        shortDescription: 'The three states: Working Directory, Staging Area (Index), and Git Directory (Repository).',
        learningObjectives: [
          'Trace file lifecycle across the three Git trees: Working Directory, Staging Area, and Repository',
          'Inspect status using git status and inspect line changes with git diff',
          'Stage files intentionally using git add'
        ],
        conceptExplanation: 'Git has three main states that your files can reside in: modified (you changed the file but have not committed it to your database yet), staged (you marked a modified file in its current version to go into your next commit snapshot), and committed (the data is safely stored in your local repository database).',
        codeExample: {
          language: 'bash',
          code: `# Check state of modified files
git status

# View unstaged line differences
git diff

# Stage specific file to the Index
git add src/app/learning/page.tsx`,
          caption: 'Inspecting differences and staging files into the Git index'
        },
        keyTakeaways: [
          'The staging area allows you to craft fine-grained, cohesive commits rather than committing everything at once.',
          'Files must be staged (git add) before they can be committed.',
          'git diff --staged compares staged changes against the last commit.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-03',
        moduleId: 'mod-10',
        number: 3,
        title: 'Repository',
        duration: '16 min',
        shortDescription: 'Initializing repositories (git init), cloning remote projects (git clone), and .gitignore.',
        learningObjectives: [
          'Initialize local repositories and clone remote GitHub repositories',
          'Construct robust .gitignore files excluding node_modules, build artifacts, and secrets',
          'Understand the internal .git folder directory'
        ],
        conceptExplanation: 'A Git repository contains all project files and the entire revision history stored in a hidden .git directory. A .gitignore file specifies intentionally untracked files that Git should ignore, such as dependencies (node_modules), build outputs (dist, .next), and local secret configurations (.env).',
        codeExample: {
          language: 'text',
          code: `# Standard .gitignore
node_modules/
.next/
dist/
.env
.env.local
.DS_Store
*.log`,
          caption: 'Standard .gitignore excluding dependencies, builds, and sensitive local secrets'
        },
        keyTakeaways: [
          'Never commit node_modules or secret environment files to a repository.',
          'If a file was accidentally committed before adding to .gitignore, untrack it using git rm --cached.',
          'git clone downloads the entire history and checks out the default branch.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-04',
        moduleId: 'mod-10',
        number: 4,
        title: 'Commit',
        duration: '20 min',
        shortDescription: 'Creating atomic commits, writing Conventional Commit messages, and git log.',
        learningObjectives: [
          'Craft atomic commits that encapsulate a single logical change',
          'Follow Conventional Commits specification (feat:, fix:, docs:, chore:)',
          'Review commit history using git log --oneline --graph'
        ],
        conceptExplanation: 'A commit represents a permanent snapshot of the staged changes in your repository. High-performing engineering teams adhere to Conventional Commits standards, which make history easily searchable, simplify changelog generation, and automate semantic release versioning.',
        codeExample: {
          language: 'bash',
          code: `# Creating an atomic conventional commit
git commit -m "feat(scoring): implement weighted evidence recalculation"

# Inspecting graphical commit history
git log --oneline --graph --decorate -n 10`,
          caption: 'Writing Conventional Commit messages and inspecting history logs'
        },
        keyTakeaways: [
          'Keep commits small and atomic: one commit should do one thing well.',
          'Write commit messages in the imperative mood ("add feature" not "added feature").',
          'Do not commit broken code; every commit on main should pass tests.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-05',
        moduleId: 'mod-10',
        number: 5,
        title: 'Branch',
        duration: '20 min',
        shortDescription: 'Lightweight pointers, branch creation, switching branches (git switch / checkout), and naming.',
        learningObjectives: [
          'Understand that Git branches are simply lightweight movable pointers to commits',
          'Create and switch branches using modern git switch -c or git checkout -b',
          'Adopt structured branch naming conventions (feat/..., fix/..., chore/...)'
        ],
        conceptExplanation: 'In Git, a branch is simply an inexpensive 41-byte pointer to a commit hash. Creating a branch takes virtually zero disk space and zero time. Branching allows developers to work on new features, bug fixes, or experiments in complete isolation without affecting the main production branch.',
        codeExample: {
          language: 'bash',
          code: `# Create and switch to a new feature branch
git switch -c feat/jwt-auth-guard

# List all local branches
git branch -v

# Switch back to main
git switch main`,
          caption: 'Creating, inspecting, and switching branches using modern git switch'
        },
        keyTakeaways: [
          'Branch frequently: isolate every independent feature or bugfix on its own branch.',
          'Use git switch instead of the overloaded git checkout in modern Git.',
          'Delete feature branches after they are merged to keep the repository tidy.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-06',
        moduleId: 'mod-10',
        number: 6,
        title: 'Merge',
        duration: '20 min',
        shortDescription: 'Integrating branches: Fast-forward merges, 3-way merge commits, and squash merging.',
        learningObjectives: [
          'Integrate feature branch changes into main using git merge',
          'Differentiate between fast-forward merges and 3-way merge commits',
          'Understand when to use squash merges to maintain a clean linear main history'
        ],
        conceptExplanation: 'Merging joins two or more development histories together. If the target branch has not diverged, Git performs a Fast-Forward merge by simply moving the pointer forward. If both branches have progressed independently, Git creates a 3-way merge commit with two parent commits.',
        codeExample: {
          language: 'bash',
          code: `# Switch to target branch
git switch main

# Merge feature branch
git merge feat/jwt-auth-guard

# Delete merged feature branch
git branch -d feat/jwt-auth-guard`,
          caption: 'Merging feature branch into main and cleaning up local branch pointer'
        },
        keyTakeaways: [
          'Always pull the latest changes on main before merging your feature branch.',
          'Squash merging condenses dozens of intermediate work-in-progress commits into a single clean commit.',
          'Merge commits record the historical integration point between branches.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-07',
        moduleId: 'mod-10',
        number: 7,
        title: 'Pull Request',
        duration: '20 min',
        shortDescription: 'Code review workflows on GitHub: PR descriptions, review comments, approval, and CI checks.',
        learningObjectives: [
          'Open comprehensive Pull Requests (PRs) proposing branch merges on GitHub',
          'Participate in constructive peer code reviews and addressing feedback',
          'Enforce Automated Continuous Integration (CI) test checks before merging'
        ],
        conceptExplanation: 'A Pull Request (PR) is a GitHub feature that lets developers notify team members that they’ve completed a feature. Team members review the code, discuss potential issues, run automated test suites, and suggest changes before the code is merged into the shared codebase.',
        codeExample: {
          language: 'markdown',
          code: `## Summary of Changes
- Implemented JWT token verification middleware in \`src/middleware/auth.ts\`.
- Added unit tests covering expired and malformed tokens.

## Verification
- [x] npm run test passes with 100% coverage
- [x] Tested manually with Thunder Client`,
          caption: 'Professional Pull Request description template'
        },
        keyTakeaways: [
          'PRs are the primary mechanism for code quality assurance and knowledge sharing across engineering teams.',
          'Keep PRs small (< 300 lines) so reviewers can thoroughly audit them.',
          'Never merge a PR if automated CI checks or tests are failing.'
        ],
        skills: ['Git', 'Engineering']
      },
      {
        id: 'les-10-08',
        moduleId: 'mod-10',
        number: 8,
        title: 'Conflict Resolution',
        duration: '24 min',
        shortDescription: 'Understanding merge conflicts, reading conflict markers, and manual resolution.',
        learningObjectives: [
          'Understand why merge conflicts occur when two branches alter the same lines',
          'Read Git conflict markers (<<<<<<<, =======, >>>>>>>)',
          'Resolve conflicts safely and finalize the merge commit'
        ],
        conceptExplanation: 'When Git cannot automatically determine which version of a file change to keep because two different branches modified the exact same lines of code, it pauses and flags a Merge Conflict. Developers must open the conflicting files, examine the conflicting code blocks, manually decide on the correct solution, remove the conflict markers, and commit the resolution.',
        codeExample: {
          language: 'text',
          code: `<<<<<<< HEAD (Current change on main)
const API_PORT = process.env.PORT || 8080;
=======
const API_PORT = process.env.PORT || 3000;
>>>>>>> feat/config (Incoming change from branch)

-- Resolution:
const API_PORT = process.env.PORT || 3000;`,
          caption: 'Visualizing Git conflict markers and resolving the unified line'
        },
        keyTakeaways: [
          'Merge conflicts are normal occurrences in collaborative engineering, not errors or catastrophes.',
          'Always run your test suite immediately after resolving a conflict to ensure nothing broke.',
          'Communicate with the author of the conflicting commit if you are unsure which change should prevail.'
        ],
        skills: ['Git', 'Debugging']
      },
      {
        id: 'les-10-09',
        moduleId: 'mod-10',
        number: 9,
        title: 'GitHub Workflow',
        duration: '20 min',
        shortDescription: 'Forking, remotes (origin, upstream), pushing, pulling, and branch protection rules.',
        learningObjectives: [
          'Manage remote tracking repositories with git remote and git push/pull',
          'Understand Forking workflows for contributing to open-source software',
          'Configure branch protection rules preventing direct unreviewed pushes to main'
        ],
        conceptExplanation: 'GitHub provides cloud hosting for Git repositories alongside developer collaboration tools. The GitHub Flow is a lightweight, branch-based workflow where anything in the main branch is deployable, all new work happens on feature branches, and code is merged only after passing code review and CI tests.',
        codeExample: {
          language: 'bash',
          code: `# Push local branch and set upstream tracking
git push -u origin feat/task-filtering

# Fetch updates from remote without merging
git fetch origin

# Pull updates (fetch + merge)
git pull origin main`,
          caption: 'Syncing local and remote branches using git push and pull'
        },
        keyTakeaways: [
          'Always set branch protection rules on main requiring at least 1 approving review.',
          'git fetch downloads remote changes safely without touching your working directory.',
          'git pull is shorthand for git fetch followed by git merge.'
        ],
        skills: ['Git']
      },
      {
        id: 'les-10-10',
        moduleId: 'mod-10',
        number: 10,
        title: 'Professional Repository Practices',
        duration: '18 min',
        shortDescription: 'README.md documentation, LICENSE, CONTRIBUTING guides, and release tagging.',
        learningObjectives: [
          'Structure open-source and professional enterprise repository documentation',
          'Draft clear README files with setup, run, and testing instructions',
          'Create semantic release tags (git tag v1.0.0)'
        ],
        conceptExplanation: 'A repository is more than code; it is a collaborative product. Professional repositories feature clean README.md files detailing prerequisites, environment variable configuration, and local setup commands. Semantic tags mark milestone releases and trigger automated CI/CD deployment pipelines.',
        codeExample: {
          language: 'bash',
          code: `# Create an annotated release tag
git tag -a v1.0.0 -m "Release v1.0.0: Flagship SEVA Skill Passport Engine"

# Push tag to remote GitHub repository
git push origin v1.0.0`,
          caption: 'Creating and pushing annotated semantic release tags in Git'
        },
        keyTakeaways: [
          'A repository without a README is essentially unusable to outside engineers.',
          'Annotated tags record the tagger, date, and verification message.',
          'Include a CONTRIBUTING.md guide to streamline team collaboration standards.'
        ],
        skills: ['Git', 'Engineering']
      }
    ]
  },

  // =========================================================================
  // MODULE 11: TESTING
  // =========================================================================
  {
    id: 'mod-11',
    number: '11',
    title: 'Testing',
    slug: 'testing',
    description: 'Automated testing pyramid: Unit testing, integration testing, API testing, Vitest/Jest, assertions, mocking, and debugging failed tests.',
    primarySkill: 'Testing',
    skills: ['Testing', 'Debugging'],
    status: 'locked',
    lab: {
      id: 'lab-11',
      moduleId: 'mod-11',
      title: 'Test a REST API',
      objective: 'Write comprehensive automated test suites for an Express REST API using Vitest and Supertest covering happy paths, edge cases, authentication rejection, and input validation.',
      requirements: [
        'Write unit tests for core scoring calculation algorithms with 100% branch coverage.',
        'Write integration tests using Supertest verifying GET, POST, PUT /api/v1/tasks.',
        'Mock external database calls using vi.mock() or in-memory fixtures.',
        'Verify HTTP status codes, JSON schema response structures, and 400/401/404 error branches.'
      ],
      hints: [
        'Group related tests logically using describe() blocks.',
        'Use beforeEach() to reset mock state and database fixtures.'
      ],
      expectedOutput: 'An automated test suite executing with 0 failures and comprehensive assertion reports.',
      skillsTested: ['Testing', 'Debugging'],
      submissionRequirements: 'Submit test files (*.test.ts) and terminal test execution summary showing passing assertions.'
    },
    practiceActivities: [
      {
        id: 'prac-11-1',
        type: 'coding',
        title: 'Write unit tests',
        description: 'Write unit tests for a currency formatting utility testing negative numbers, decimals, and null inputs.',
        task: 'Write 4 assertions using expect() validating output on valid and invalid boundary values.'
      },
      {
        id: 'prac-11-2',
        type: 'coding',
        title: 'Test an API endpoint',
        description: 'Test an Express authentication endpoint using supertest.',
        task: 'Assert that POST /auth/login with wrong password returns status 401 with error message.'
      },
      {
        id: 'prac-11-3',
        type: 'debugging',
        title: 'Debug failing tests',
        description: 'A test fails intermittently due to unmocked Date.now() time skew.',
        task: 'Use vi.useFakeTimers() and vi.setSystemTime() to freeze time deterministically during test execution.'
      }
    ],
    lessons: [
      {
        id: 'les-011-01',
        moduleId: 'mod-11',
        number: 1,
        title: 'Why Testing Matters',
        duration: '16 min',
        shortDescription: 'The cost of bugs in production, regression prevention, and the Testing Pyramid.',
        learningObjectives: [
          'Understand the business and engineering ROI of automated software testing',
          'Analyze the Testing Pyramid: Unit tests (broad base), Integration, and End-to-End (top)',
          'Prevent regressions when refactoring legacy codebases'
        ],
        conceptExplanation: 'Automated testing executes tests on your application to verify it functions according to expectations. Without automated tests, every new feature or refactor risks breaking existing functionality (regressions). The Testing Pyramid recommends maintaining a broad foundation of fast, inexpensive unit tests, supplemented by integration and end-to-end tests.',
        codeExample: {
          language: 'typescript',
          code: `// Simple pure function ready for automated unit testing
export function calculatePassStatus(score: number, threshold = 75): boolean {
  if (score < 0 || score > 100) throw new RangeError('Score must be 0-100');
  return score >= threshold;
}`,
          caption: 'Clean, deterministic business logic suitable for automated testing'
        },
        keyTakeaways: [
          'Tests give engineers confidence to refactor and optimize code aggressively.',
          'Unit tests run in milliseconds; manual testing takes hours and misses edge cases.',
          'Catching bugs in development is 100x cheaper than fixing them in live production.'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-02',
        moduleId: 'mod-11',
        number: 2,
        title: 'Unit Testing',
        duration: '22 min',
        shortDescription: 'Testing individual functions in isolation: Vitest/Jest, describe, test, it blocks.',
        learningObjectives: [
          'Write fast, isolated unit tests using Vitest or Jest test runners',
          'Structure test suites using describe() suites and it() test specifications',
          'Test boundary values and edge cases (empty inputs, null, zero, extremes)'
        ],
        conceptExplanation: 'Unit tests test individual units or components of software in complete isolation from the rest of the application. A unit is typically a single function, method, or class. External dependencies like databases or APIs are replaced with test doubles (mocks) to ensure tests run fast and deterministically.',
        codeExample: {
          language: 'typescript',
          code: `import { describe, it, expect } from 'vitest';
import { calculatePassStatus } from './scoring';

describe('calculatePassStatus', () => {
  it('returns true when score meets threshold', () => {
    expect(calculatePassStatus(85)).toBe(true);
  });

  it('returns false when score is below threshold', () => {
    expect(calculatePassStatus(60)).toBe(false);
  });

  it('throws RangeError when score is invalid', () => {
    expect(() => calculatePassStatus(120)).toThrow(RangeError);
  });
});`,
          caption: 'Standard Vitest unit test suite covering happy paths and boundary exceptions'
        },
        keyTakeaways: [
          'Unit tests must be fast, isolated, repeatable, and self-validating.',
          'Always test both the happy path and invalid boundary inputs.',
          'Test behavior and outcomes, not internal implementation details.'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-03',
        moduleId: 'mod-11',
        number: 3,
        title: 'Integration Testing',
        duration: '22 min',
        shortDescription: 'Testing multiple units working together: controllers + services + database.',
        learningObjectives: [
          'Test the interplay between multiple modules working together',
          'Validate database interactions using test transactions or test containers',
          'Detect interface mismatches and serialization bugs between layers'
        ],
        conceptExplanation: 'While unit tests verify individual functions in isolation, integration tests verify that multiple modules, layers, or subsystems interact correctly together. An integration test might invoke a service function that reads from a test database and produces a calculated summary.',
        codeExample: {
          language: 'typescript',
          code: `import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceService } from './evidence-service';
import { testDb } from './test-db';

describe('EvidenceService Integration', () => {
  beforeEach(async () => {
    await testDb.reset(); // Clean test database state
  });

  it('saves evidence and recalculates candidate overall score', async () => {
    const result = await EvidenceService.recordEvidence('usr-1', 'react', 90);
    expect(result.newOverallScore).toBe(90);
  });
});`,
          caption: 'Integration test verifying service layer interaction with test database'
        },
        keyTakeaways: [
          'Integration tests catch subtle bugs that unit tests miss (e.g. SQL syntax errors).',
          'Always clean or reset test databases between test runs to prevent test pollution.',
          'Balance integration tests with unit tests to keep CI build times fast.'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-04',
        moduleId: 'mod-11',
        number: 4,
        title: 'API Testing',
        duration: '22 min',
        shortDescription: 'Testing HTTP endpoints using Supertest: status codes, headers, and payload schemas.',
        learningObjectives: [
          'Test Express applications over simulated HTTP using Supertest',
          'Assert exact HTTP status codes (200, 201, 400, 401, 404)',
          'Validate response body JSON properties and content-type headers'
        ],
        conceptExplanation: 'API testing validates that your HTTP server responds correctly to incoming client requests. Supertest binds to an Express app without needing to bind to an actual network port, firing requests and allowing you to assert status codes, headers, and JSON body payloads.',
        codeExample: {
          language: 'typescript',
          code: `import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/app';

describe('GET /api/v1/health', () => {
  it('responds with 200 OK and healthy status', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('UP');
  });
});`,
          caption: 'Testing Express endpoint using Supertest and Vitest'
        },
        keyTakeaways: [
          'Supertest allows testing complete HTTP request-response cycles in memory.',
          'Test authorization guards by verifying 401 when tokens are missing.',
          'Verify validation errors return 422 with detailed field error arrays.'
        ],
        skills: ['Testing', 'REST API']
      },
      {
        id: 'les-011-05',
        moduleId: 'mod-11',
        number: 5,
        title: 'Test Cases',
        duration: '18 min',
        shortDescription: 'AAA pattern: Arrange, Act, Assert. Designing comprehensive test matrices.',
        learningObjectives: [
          'Structure test cases consistently using the Arrange, Act, Assert (AAA) pattern',
          'Identify equivalence partitions and boundary value analysis cases',
          'Write self-documenting test names describing expected behavior'
        ],
        conceptExplanation: 'The Arrange-Act-Assert (AAA) pattern is the standard structure for authoring unit tests. Arrange sets up the necessary prerequisites, inputs, and mock states. Act executes the function under test. Assert verifies that the output matches expectations and no unintended side effects occurred.',
        codeExample: {
          language: 'typescript',
          code: `it('calculates average score for valid candidate evidence', () => {
  // 1. Arrange: Setup initial test inputs
  const scores = [80, 90, 100];
  
  // 2. Act: Call the function being tested
  const average = calculateAverage(scores);
  
  // 3. Assert: Verify the result
  expect(average).toBe(90);
});`,
          caption: 'Structuring a unit test cleanly using Arrange-Act-Assert pattern'
        },
        keyTakeaways: [
          'Each test should ideally focus on asserting one logical concept.',
          'Test names should read like human specifications (e.g. "it returns 404 when user does not exist").',
          'Avoid logic (if statements, loops) inside test files; keep tests simple and linear.'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-06',
        moduleId: 'mod-11',
        number: 6,
        title: 'Assertions',
        duration: '18 min',
        shortDescription: 'Expect matchers: toBe, toEqual, toContain, toThrow, toHaveLength, toStrictEqual.',
        learningObjectives: [
          'Select the correct test matcher for primitive vs object equality',
          'Understand why toEqual/toStrictEqual is required for objects and arrays instead of toBe',
          'Assert asynchronous rejections using rejects.toThrow()'
        ],
        conceptExplanation: 'Matchers let you test values in different ways. In Vitest/Jest, expect(x).toBe(y) uses Object.is for strict reference equality (ideal for primitives). To compare the values of object properties or array elements recursively, use expect(x).toEqual(y).',
        codeExample: {
          language: 'typescript',
          code: `// Primitive equality
expect(1 + 1).toBe(2);

// Deep object property equality
expect({ a: 1 }).toEqual({ a: 1 });

// Array inspection
expect(['React', 'Node']).toContain('React');
expect(['a', 'b']).toHaveLength(2);

// Asynchronous promise rejection assertion
await expect(async () => fetchUser(null)).rejects.toThrow('User ID required');`,
          caption: 'Comprehensive Vitest assertion matchers for objects, arrays, and async errors'
        },
        keyTakeaways: [
          'Use toBe for numbers, strings, and booleans; use toEqual for objects and arrays.',
          'To test that a function throws an error, wrap the call in an anonymous arrow function: expect(() => fn()).toThrow().',
          'Use toStrictEqual to catch undefined properties in objects.'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-07',
        moduleId: 'mod-11',
        number: 7,
        title: 'Mocking',
        duration: '22 min',
        shortDescription: 'Spies, stubs, and mocks: vi.fn(), vi.spyOn(), and mocking external modules (vi.mock).',
        learningObjectives: [
          'Isolate units from external systems by stubbing dependencies',
          'Create mock functions and spy on calls using vi.fn() and vi.spyOn()',
          'Mock third-party modules (like email senders or Stripe) to prevent live side effects'
        ],
        conceptExplanation: 'Mocking is the practice of replacing a real software dependency with a simulated version (a mock or stub) that mimics its behavior. This ensures tests run fast, do not require network access, and can simulate hard-to-reproduce scenarios like network timeouts or 500 server crashes.',
        codeExample: {
          language: 'typescript',
          code: `import { vi, describe, it, expect } from 'vitest';
import * as emailService from './email-service';
import { registerUser } from './user-service';

describe('registerUser', () => {
  it('sends a welcome email upon registration', async () => {
    // Spy on email sender and replace implementation
    const sendSpy = vi.spyOn(emailService, 'sendWelcomeEmail').mockResolvedValue(true);

    await registerUser({ email: 'arjun@example.com' });

    // Assert that the mock was called with correct arguments
    expect(sendSpy).toHaveBeenCalledWith('arjun@example.com');
  });
});`,
          caption: 'Mocking an external email service using vi.spyOn'
        },
        keyTakeaways: [
          'Mocks isolate the code under test so failures pinpoint your code, not third-party services.',
          'Always restore or reset mocks (vi.restoreAllMocks()) in afterEach to avoid test leakage.',
          'Do not mock everything; mock at the boundaries of your system (APIs, DBs, timers).'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-08',
        moduleId: 'mod-11',
        number: 8,
        title: 'Test Coverage',
        duration: '18 min',
        shortDescription: 'Code coverage metrics: Line coverage, branch coverage, function coverage, and v8/c8.',
        learningObjectives: [
          'Measure test suite completeness using code coverage tools',
          'Distinguish statement coverage from branch coverage (if/else paths)',
          'Understand why 100% coverage does not guarantee bug-free software'
        ],
        conceptExplanation: 'Code coverage is a metric that measures the percentage of your source code executed when automated tests run. It tracks statement coverage, line coverage, function coverage, and branch coverage. High branch coverage ensures that both the if and else branches of your conditional logic are tested.',
        codeExample: {
          language: 'bash',
          code: `# Run Vitest with native V8 code coverage report
npx vitest run --coverage

# Coverage summary table output:
# % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s`,
          caption: 'Running automated test coverage audit using Vitest'
        },
        keyTakeaways: [
          'Branch coverage is the most meaningful coverage metric for finding edge-case bugs.',
          'Aim for ~80-90% coverage on core business logic; 100% coverage often yields diminishing returns.',
          'Do not chase coverage metrics by writing trivial tests that assert nothing.'
        ],
        skills: ['Testing']
      },
      {
        id: 'les-011-09',
        moduleId: 'mod-11',
        number: 9,
        title: 'Regression Testing',
        duration: '18 min',
        shortDescription: 'Preventing reintroduction of solved bugs, test-driven bug fixing, and CI test pipelines.',
        learningObjectives: [
          'Adopt the Test-Driven Bug Fix workflow: write a failing test reproducing the bug first',
          'Incorporate regression tests into continuous integration (CI) pipelines',
          'Protect critical user pathways from recurring defects'
        ],
        conceptExplanation: 'A regression is a bug that causes something that previously worked to stop working after a code modification. Regression testing runs your entire automated test suite to ensure that new code commits did not inadvertently break existing functionality. When a bug is discovered in production, professional engineers write a test replicating the bug before fixing it.',
        codeExample: {
          language: 'typescript',
          code: `// Regression Test for Bug #402: Negative scores causing NaN
it('[Regression #402]: handles negative penalty scores gracefully', () => {
  const result = calculateCompositeScore(-10);
  expect(result).toBe(0); // Verifies bug fix is permanently maintained
});`,
          caption: 'Documented regression test guarding against reintroduction of a known bug'
        },
        keyTakeaways: [
          'Always write a failing regression test before writing the code fix.',
          'Once a regression test passes, it stays in the test suite forever to guard the codebase.',
          'Automate regression suite runs on every GitHub pull request.'
        ],
        skills: ['Testing', 'Debugging']
      },
      {
        id: 'les-011-10',
        moduleId: 'mod-11',
        number: 10,
        title: 'Debugging Failed Tests',
        duration: '20 min',
        shortDescription: 'Diagnosing test failures: Stack trace inspection, test isolation, and debugging tools.',
        learningObjectives: [
          'Quickly diagnose test failures by reading assertion diffs and stack traces',
          'Isolate failing tests using test.only to eliminate noise',
          'Identify flaky tests caused by unhandled async promises or shared mutable state'
        ],
        conceptExplanation: 'When a test fails, test runners provide a visual diff showing the Expected value versus the Received value, along with the exact file and line number. Debugging failed tests involves isolating the test (using test.only), stepping through execution with a debugger, and identifying whether the bug is in the source code or the test assertion itself.',
        codeExample: {
          language: 'bash',
          code: `# Run a single test file in watch mode
npx vitest run src/scoring.test.ts

# Filter tests by title pattern
npx vitest -t "calculates average"`,
          caption: 'Targeted test runner execution to isolate and debug specific test failures'
        },
        keyTakeaways: [
          'Use test.only or vitest -t to focus on a single failing test while debugging.',
          'Flaky tests that pass sometimes and fail other times are usually caused by async timing issues.',
          'Read the Received vs Expected diff carefully before making assumptions.'
        ],
        skills: ['Testing', 'Debugging']
      }
    ]
  },

  // =========================================================================
  // MODULE 12: DEPLOYMENT
  // =========================================================================
  {
    id: 'mod-12',
    number: '12',
    title: 'Deployment',
    slug: 'deployment',
    description: 'Production engineering: Development vs production environments, build optimization, containerization, cloud hosting, logging, monitoring, and production readiness.',
    primarySkill: 'Deployment',
    skills: ['Deployment', 'DevOps Fundamentals', 'Production Engineering'],
    status: 'locked',
    lab: {
      id: 'lab-12',
      moduleId: 'mod-12',
      title: 'Deploy a Full Stack Application',
      objective: 'Prepare, containerize, and configure a full stack application for production hosting with environment variables, security headers, production build compilation, and health check endpoints.',
      requirements: [
        'Execute a production build (npm run build) verifying zero TypeScript or lint errors.',
        'Configure production environment variables for database URLs, ports, and origins.',
        'Write a multi-stage Dockerfile optimizing production image size.',
        'Implement /health and /metrics monitoring endpoints.',
        'Verify production asset compression (Gzip/Brotli) and caching headers.'
      ],
      hints: [
        'Use multi-stage Docker builds to avoid shipping development devDependencies into production.',
        'Ensure NODE_ENV is set to "production" to enable Express performance optimizations.'
      ],
      expectedOutput: 'A production-ready build artifact and Docker container passing health check inspection.',
      skillsTested: ['Deployment', 'Production Engineering'],
      submissionRequirements: 'Submit production Dockerfile, deployment runbook checklist, and health check response log.'
    },
    practiceActivities: [
      {
        id: 'prac-12-1',
        type: 'scenario',
        title: 'Prepare a Full Stack Application for Production',
        description: 'Audit an application prior to production launch to ensure security, performance, and monitoring readiness.',
        task: 'Execute a pre-flight deployment audit: remove console.logs, verify HTTPS enforcement, configure database connection pooling, and verify CORS rules.'
      }
    ],
    lessons: [
      {
        id: 'les-012-01',
        moduleId: 'mod-12',
        number: 1,
        title: 'Development vs Production',
        duration: '18 min',
        shortDescription: 'Differences in performance, debugging, logging, security, and environment configuration.',
        learningObjectives: [
          'Differentiate between development (hot reload, verbose errors) and production (minified, secured)',
          'Configure NODE_ENV=production to enable framework performance optimizations',
          'Suppress internal stack traces and debugging logs in production builds'
        ],
        conceptExplanation: 'Development environments prioritize developer velocity: fast incremental compilation, detailed error stack traces, and verbose logging. Production environments prioritize security, raw throughput, minimal bundle size, and uptime. Frameworks like Express and React disable internal development checks when NODE_ENV is set to production, boosting speed significantly.',
        codeExample: {
          language: 'javascript',
          code: `// Adjusting behavior based on environment
const isProduction = process.env.NODE_ENV === 'production';

app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Internal Server Error',
    // Never expose stack traces to end users in production
    ...(isProduction ? {} : { stack: err.stack, details: err.message })
  });
});`,
          caption: 'Environment-aware error handling protecting production internal details'
        },
        keyTakeaways: [
          'Always set NODE_ENV=production on production servers.',
          'Production code must be bundled, tree-shaken, and minified.',
          'Never expose development debug tooling or stack traces to end users.'
        ],
        skills: ['Deployment', 'Production Engineering']
      },
      {
        id: 'les-012-02',
        moduleId: 'mod-12',
        number: 2,
        title: 'Environment Variables',
        duration: '18 min',
        shortDescription: 'Production secrets management, Twelve-Factor App config, and cloud key vaults.',
        learningObjectives: [
          'Adhere to the Twelve-Factor App methodology for configuration',
          'Inject secrets into containers and cloud platforms at runtime without baking them into images',
          'Manage separate environment configs for Staging and Production'
        ],
        conceptExplanation: 'An application’s configuration is everything that is likely to vary between environments (database connection strings, credentials for external services, per-deploy values such as canonical hostnames). Store config in environment variables injected into the runtime process at startup.',
        codeExample: {
          language: 'bash',
          code: `# Injecting environment variables when running Docker container
docker run -d \\
  -p 80:3000 \\
  -e NODE_ENV=production \\
  -e DATABASE_URL="postgresql://user:pass@db.internal:5432/seva" \\
  --name seva-api \\
  seva-api:latest`,
          caption: 'Passing production configuration dynamically to a running container'
        },
        keyTakeaways: [
          'Never bake passwords or API keys directly into container images or code repositories.',
          'Use cloud secret managers (AWS Secrets Manager, GCP Secret Manager) in production.',
          'Validate all environment variables on boot so containers fail fast if a secret is missing.'
        ],
        skills: ['Deployment', 'Security']
      },
      {
        id: 'les-012-03',
        moduleId: 'mod-12',
        number: 3,
        title: 'Build Process',
        duration: '20 min',
        shortDescription: 'Bundling, minification, tree-shaking, source maps, and Next.js / Vite build pipelines.',
        learningObjectives: [
          'Execute production build pipelines with npm run build',
          'Understand how tree-shaking eliminates unused dead code from bundles',
          'Generate and protect production source maps for error tracking'
        ],
        conceptExplanation: 'The build process transforms modern developer-friendly code (TypeScript, JSX, Tailwind) into optimized, compressed, and backwards-compatible HTML, CSS, and JavaScript. Bundlers like Vite, Turbopack, or Webpack analyze the import dependency graph, tree-shake unreferenced code, and produce hashed chunks for long-term browser caching.',
        codeExample: {
          language: 'bash',
          code: `# Execute production Next.js build
npm run build

# Output verifies static routes, dynamic endpoints, and bundle sizes:
# Route (app)                              Size     First Load JS
# ┌ ○ /                                    5.4 kB         87 kB
# ├ ○ /learning                            12 kB          98 kB
# └ λ /api/verify                          0 B            82 kB`,
          caption: 'Next.js production build output detailing static vs dynamic route sizes'
        },
        keyTakeaways: [
          'Production builds must compile with zero TypeScript errors or linter warnings.',
          'Hashed file names (e.g. main.a8f9c1.js) enable immutable browser caching (Cache-Control: immutable).',
          'Keep client-side bundle sizes small to ensure fast mobile First Contentful Paint (FCP).'
        ],
        skills: ['Deployment', 'Production Engineering']
      },
      {
        id: 'les-012-04',
        moduleId: 'mod-12',
        number: 4,
        title: 'Deployment Fundamentals',
        duration: '20 min',
        shortDescription: 'Hosting models: Static hosting, PaaS (Vercel, Render), IaaS (AWS, GCP), and containers.',
        learningObjectives: [
          'Compare Static Site Hosting, Platform-as-a-Service (PaaS), and Infrastructure-as-a-Service (IaaS)',
          'Select the right deployment target based on architecture requirements and cost',
          'Understand zero-downtime rolling deployments'
        ],
        conceptExplanation: 'Deployment is the process of making software available to users on remote servers. Static websites and single-page apps can be hosted on globally distributed edge networks (Vercel, Cloudflare Pages, Netlify). Dynamic APIs and databases deploy to Platform-as-a-Service (PaaS) platforms or containers orchestrated across cloud compute instances.',
        codeExample: {
          language: 'bash',
          code: `# Typical PaaS deployment via Git push
git push production main

# Automated cloud webhook triggers:
# 1. Pull latest commit
# 2. npm install --production
# 3. npm run build
# 4. Zero-downtime container swap`,
          caption: 'Continuous deployment workflow triggered by Git commit push'
        },
        keyTakeaways: [
          'Static assets should live on Edge CDNs for minimal global latency.',
          'Zero-downtime deployments start the new container and verify health before stopping the old one.',
          'Automate deployments so human error is eliminated.'
        ],
        skills: ['Deployment', 'DevOps Fundamentals']
      },
      {
        id: 'les-012-05',
        moduleId: 'mod-12',
        number: 5,
        title: 'Frontend Deployment',
        duration: '18 min',
        shortDescription: 'Deploying static assets to CDNs, edge caching, cache invalidation, and custom domains.',
        learningObjectives: [
          'Deploy web frontends to high-performance Content Delivery Networks (CDNs)',
          'Configure HTTP caching headers (Cache-Control: max-age, immutable)',
          'Configure custom domains, SSL certificates, and DNS records (CNAME, ALIAS)'
        ],
        conceptExplanation: 'Deploying frontends involves serving pre-rendered HTML, JavaScript, CSS, and media files from edge servers located physically close to end users worldwide. Because assets contain content hashes in their filenames, they can be cached in user browsers for up to a year, while the root index.html is revalidated on every visit.',
        codeExample: {
          language: 'http',
          code: `# Optimal Caching Headers for Hashed Assets:
Cache-Control: public, max-age=31536000, immutable

# Optimal Caching Headers for HTML Entrypoint:
Cache-Control: public, max-age=0, must-revalidate`,
          caption: 'HTTP Cache-Control header strategy for modern single-page applications'
        },
        keyTakeaways: [
          'Index.html must revalidate immediately so users receive updates without clearing their cache.',
          'Hashed JavaScript and CSS bundles can be cached indefinitely (immutable).',
          'CDNs handle TLS certificate issuance and renewal automatically.'
        ],
        skills: ['Deployment', 'Web Fundamentals']
      },
      {
        id: 'les-012-06',
        moduleId: 'mod-12',
        number: 6,
        title: 'Backend Deployment',
        duration: '22 min',
        shortDescription: 'Running Node.js in production: Process managers (PM2), Docker containers, and reverse proxies (Nginx).',
        learningObjectives: [
          'Run Node.js applications with process managers (PM2) to automatically restart on crash',
          'Package applications into portable multi-stage Docker containers',
          'Understand reverse proxies (Nginx) for TLS termination and load balancing'
        ],
        conceptExplanation: 'Unlike development where you run node server.js manually, in production Node.js services must stay alive indefinitely. If an unhandled exception crashes the process, a process manager (like PM2 or Docker restart policies) restarts the application instantly. Reverse proxies sit in front to handle SSL encryption and route traffic.',
        codeExample: {
          language: 'dockerfile',
          code: `# Production Multi-stage Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
          caption: 'Optimized multi-stage Dockerfile producing lightweight production images'
        },
        keyTakeaways: [
          'Multi-stage Docker builds ensure development devDependencies and source code do not bloat production containers.',
          'Always run container processes as an unprivileged user (not root).',
          'Use reverse proxies (Nginx, Traefik, AWS ALB) for SSL termination and rate limiting.'
        ],
        skills: ['Deployment', 'DevOps Fundamentals']
      },
      {
        id: 'les-012-07',
        moduleId: 'mod-12',
        number: 7,
        title: 'Database Deployment',
        duration: '20 min',
        shortDescription: 'Managed database services, connection pooling, automated backups, and schema migrations.',
        learningObjectives: [
          'Deploy managed relational databases (Supabase, AWS RDS, Neon)',
          'Manage database connection pooling to prevent pool exhaustion under load',
          'Execute automated database schema migrations cleanly in CI/CD'
        ],
        conceptExplanation: 'Running production databases on raw virtual machines is discouraged for most teams. Managed database services provide automated nightly backups, point-in-time recovery, high availability failover, and automated security patches. Use connection pooling (like PgBouncer) so thousands of serverless connections do not overwhelm database memory.',
        codeExample: {
          language: 'bash',
          code: `# Applying database migrations in CI/CD deployment step
npx prisma migrate deploy
# or using Supabase CLI:
supabase db push --linked`,
          caption: 'Applying automated database schema migrations during deployment'
        },
        keyTakeaways: [
          'Never manage production database servers manually when managed DB services exist.',
          'Database migrations must be backward-compatible so old and new code versions can run concurrently during rolling updates.',
          'Test database backups regularly; an untested backup is not a backup.'
        ],
        skills: ['Deployment', 'Database Design', 'PostgreSQL']
      },
      {
        id: 'les-012-08',
        moduleId: 'mod-12',
        number: 8,
        title: 'Logging',
        duration: '18 min',
        shortDescription: 'Structured JSON logging (Pino, Winston), log levels (DEBUG, INFO, WARN, ERROR), and aggregation.',
        learningObjectives: [
          'Implement structured JSON logging instead of unstructured console.log',
          'Use standardized log levels appropriately (DEBUG, INFO, WARN, ERROR)',
          'Ship application logs to centralized log management platforms (Datadog, CloudWatch)'
        ],
        conceptExplanation: 'Unstructured console.log statements are difficult to parse, search, and filter in production across multiple server instances. Structured logging outputs machine-readable JSON lines containing timestamps, log levels, request correlation IDs, and context objects, enabling powerful log searching and alerting.',
        codeExample: {
          language: 'javascript',
          code: `import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Outputs structured JSON:
// {"level":"info","time":1775556938000,"msg":"Evidence verified","candidateId":"GSP-101"}
logger.info({ candidateId: 'GSP-101' }, 'Evidence verified');`,
          caption: 'High-performance structured JSON logging with Pino'
        },
        keyTakeaways: [
          'Structured JSON logs make debugging production issues fast and searchable.',
          'Never log sensitive user data: redact passwords, credit cards, and authentication tokens.',
          'Use correlation IDs (x-request-id) to track a single request across multiple services.'
        ],
        skills: ['Deployment', 'Production Engineering', 'Debugging']
      },
      {
        id: 'les-012-09',
        moduleId: 'mod-12',
        number: 9,
        title: 'Monitoring',
        duration: '20 min',
        shortDescription: 'Application performance monitoring (APM), health checks, uptime alerts, and Sentry error tracking.',
        learningObjectives: [
          'Expose /health endpoints for container orchestration probes (liveness and readiness)',
          'Track real-time unhandled frontend and backend errors using Sentry',
          'Set up uptime monitoring and notification alerts for API downtime'
        ],
        conceptExplanation: 'Monitoring provides visibility into the health and performance of your production applications. Uptime monitors ping your server every minute to verify availability. Error tracking tools (like Sentry) capture unhandled exceptions in real time with full stack traces, browser versions, and user actions, notifying the team before customers complain.',
        codeExample: {
          language: 'javascript',
          code: `// Production Health Check Endpoint
app.get('/health', async (req, res) => {
  const isDbConnected = await checkDatabaseConnection();
  if (!isDbConnected) {
    return res.status(503).json({ status: 'DEGRADED', db: 'DOWN' });
  }
  res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});`,
          caption: 'Health check endpoint verifying database connectivity for container probes'
        },
        keyTakeaways: [
          'Health check endpoints must verify that critical dependencies (like databases) are reachable.',
          'Real-time error tracking (Sentry) alerts engineering teams immediately when errors spike.',
          'Monitor the 4 Golden Signals: Latency, Traffic, Errors, and Saturation.'
        ],
        skills: ['Deployment', 'Production Engineering']
      },
      {
        id: 'les-012-10',
        moduleId: 'mod-12',
        number: 10,
        title: 'Production Checklist',
        duration: '22 min',
        shortDescription: 'Pre-flight launch verification: Security audits, performance benchmarking, backups, and disaster recovery.',
        learningObjectives: [
          'Execute a comprehensive pre-launch production verification checklist',
          'Verify TLS, security headers, rate limits, and secret protection',
          'Establish runbooks for emergency disaster recovery and rollback procedures'
        ],
        conceptExplanation: 'Before launching any application to production users, engineering teams run a Production Readiness Checklist. This covers infrastructure, security, performance, monitoring, and operational preparedness to ensure the system is resilient against traffic surges, malicious probes, and infrastructure hiccups.',
        codeExample: {
          language: 'markdown',
          code: `## Pre-Flight Production Launch Checklist
- [x] HTTPS enforced with valid TLS certificate & HSTS
- [x] Security headers configured via Helmet (CSP, X-Frame-Options)
- [x] Rate limiting active on authentication endpoints
- [x] Zero plain text secrets in code or git repositories
- [x] Database automated backups and point-in-time recovery active
- [x] Health check (/health) and uptime monitors configured
- [x] Error reporting (Sentry) and structured logging active
- [x] Production build passes with 0 TypeScript/lint errors`,
          caption: 'Comprehensive Production Readiness Checklist'
        },
        keyTakeaways: [
          'Never launch without automated backups and proven rollback procedures.',
          'Verify that all database indexes are active to prevent sudden query locks under load.',
          'A production checklist turns stressful deployments into predictable, routine events.'
        ],
        skills: ['Deployment', 'Production Engineering', 'DevOps Fundamentals']
      }
    ]
  },
  // =========================================================================
  // MODULE 13: ADVANCED TYPESCRIPT & APPLICATION ARCHITECTURE
  // =========================================================================
  {
    id: 'mod-13',
    number: '13',
    title: 'Advanced TypeScript & Architecture',
    slug: 'advanced-typescript-architecture',
    description: 'Enterprise TypeScript: Advanced generics, conditional types, discriminated unions, pattern matching, domain-driven value objects, and clean architectural boundaries.',
    primarySkill: 'TypeScript Architecture',
    skills: ['TypeScript', 'Software Architecture', 'Domain-Driven Design', 'Design Patterns'],
    status: 'locked',
    lab: {
      id: 'lab-13',
      moduleId: 'mod-13',
      title: 'Build a Type-Safe Event-Driven State Bus',
      objective: 'Implement an event-driven pub/sub state bus with compile-time event payload validation, discriminated action types, and strict type narrowing.',
      requirements: [
        'Define a generic EventBus interface mapping event names to strict payload interfaces.',
        'Use conditional types and keyof constraints to eliminate runtime type casting.',
        'Implement custom type guard functions (val is Type) to narrow unknown API inputs.',
        'Enforce exhaustive pattern matching with never assertions.'
      ],
      hints: [
        'Use keyof and Record to ensure listeners receive only their corresponding payload type.',
        'Declare an assertNever function that accepts an argument of type never for exhaustive switches.'
      ],
      expectedOutput: 'A zero-any-type TypeScript event bus passing strict tsconfig compilation.',
      skillsTested: ['TypeScript Architecture', 'Software Architecture'],
      submissionRequirements: 'Submit the TypeScript event bus implementation with exhaustive unit test typings.'
    },
    practiceActivities: [
      {
        id: 'prac-13-1',
        type: 'conceptual',
        title: 'Discriminated Unions vs Optional Properties',
        description: 'Refactor fragile optional-property interfaces into sound discriminated unions.',
        task: 'Transform an interface with optional fields (data?, error?, loading?) into an exhaustive Discriminated Union (LoadingState | SuccessState<T> | ErrorState).'
      }
    ],
    lessons: [
      {
        id: 'les-013-01',
        moduleId: 'mod-13',
        number: 1,
        title: 'Generics & Constraints',
        duration: '22 min',
        shortDescription: 'Generic functions, generic interfaces, extends constraints, and built-in utility types.',
        learningObjectives: [
          'Design flexible, reusable generic functions with extends constraints',
          'Leverage built-in utility types (Pick, Omit, Partial, Required, Record)',
          'Eliminate unsafe any and unknown type assertions across API boundaries'
        ],
        conceptExplanation: 'Generics allow you to write reusable code that works with a variety of types while maintaining full compile-time type safety. By adding constraints using the extends keyword, you restrict generic types to guaranteed structural shapes.',
        codeExample: {
          language: 'typescript',
          code: `interface Identifiable { id: string | number; }

export function indexEntities<T extends Identifiable>(items: T[]): Record<string, T> {
  return items.reduce((acc, item) => {
    acc[String(item.id)] = item;
    return acc;
  }, {} as Record<string, T>);
}`,
          caption: 'Type-safe entity indexer with generic extends constraint'
        },
        keyTakeaways: [
          'Use generic constraints (T extends Shape) to access properties safely.',
          'Built-in utility types like Pick and Omit prevent duplicated interface definitions.',
          'Avoid type casting (as Type) whenever generic parameters can infer the shape directly.'
        ],
        skills: ['TypeScript Architecture', 'TypeScript']
      },
      {
        id: 'les-013-02',
        moduleId: 'mod-13',
        number: 2,
        title: 'Discriminated Unions',
        duration: '24 min',
        shortDescription: 'Tagged unions, literal types, and exhaustive switch matching with the never type.',
        learningObjectives: [
          'Design robust asynchronous states using discriminated unions',
          'Implement exhaustive switch checks with the never type',
          'Eliminate impossible component states at compile time'
        ],
        conceptExplanation: 'A Discriminated Union uses a shared literal property (such as status or type) to differentiate between distinct shapes. TypeScript narrows the union automatically inside conditionals, preventing access to properties that do not exist in the active state.',
        codeExample: {
          language: 'typescript',
          code: `type AsyncResult<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderResult<T>(result: AsyncResult<T>) {
  switch (result.status) {
    case 'idle': return 'Awaiting interaction';
    case 'loading': return 'Fetching payload...';
    case 'success': return \`Received: \${JSON.stringify(result.data)}\`;
    case 'error': return \`Failed: \${result.error.message}\`;
    default: {
      const _exhaustiveCheck: never = result;
      return _exhaustiveCheck;
    }
  }
}`,
          caption: 'Exhaustive pattern matching on discriminated unions'
        },
        keyTakeaways: [
          'Discriminated unions make impossible states unrepresentable.',
          'Assigning the default branch to a variable of type never guarantees compiler errors when new union variants are added.',
          'Prefer discriminated unions over flags like isLoading, isError, and data.'
        ],
        skills: ['TypeScript Architecture', 'TypeScript']
      },
      {
        id: 'les-013-03',
        moduleId: 'mod-13',
        number: 3,
        title: 'Type Narrowing & Guards',
        duration: '20 min',
        shortDescription: 'Custom type predicates (val is Type), assertion functions, and runtime validation parsing.',
        learningObjectives: [
          'Write custom type predicate functions to narrow untrusted runtime inputs',
          'Use assertion functions (asserts val is Type) for invariant validation',
          'Integrate Zod or schema parsers for bulletproof boundary validation'
        ],
        conceptExplanation: 'When handling external JSON payloads, localStorage items, or user input, data arrives as unknown. Custom type predicates allow you to perform runtime checks that inform the TypeScript compiler about the validated shape.',
        codeExample: {
          language: 'typescript',
          code: `interface EvidencePayload {
  verificationHash: string;
  score: number;
}

export function isEvidencePayload(value: unknown): value is EvidencePayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'verificationHash' in value &&
    typeof (value as any).verificationHash === 'string' &&
    'score' in value &&
    typeof (value as any).score === 'number'
  );
}`,
          caption: 'Custom type predicate narrowing unknown to EvidencePayload'
        },
        keyTakeaways: [
          'Type predicates return boolean values and use the syntax (val is TargetType).',
          'Use unknown instead of any for all incoming network payloads.',
          'Combine type guards with runtime parsing libraries like Zod for production validation.'
        ],
        skills: ['TypeScript Architecture', 'TypeScript']
      },
      {
        id: 'les-013-04',
        moduleId: 'mod-13',
        number: 4,
        title: 'Domain-Driven Value Objects',
        duration: '25 min',
        shortDescription: 'Value objects, branded nominal types, immutability, and enterprise domain modeling.',
        learningObjectives: [
          'Implement branded nominal types to prevent primitive obsession (e.g. UserId vs OrderId)',
          'Encapsulate business validation rules directly inside immutable Value Objects',
          'Model business domains with clean domain-driven design principles'
        ],
        conceptExplanation: 'In standard TypeScript, all strings are structurally compatible, allowing bugs like passing an OrderId into a function expecting a UserId. Branded nominal types add unique brand tags that prevent accidental cross-assignment.',
        codeExample: {
          language: 'typescript',
          code: `type Brand<K, T> = K & { readonly __brand: T };
type UserId = Brand<string, 'UserId'>;
type AssessmentId = Brand<string, 'AssessmentId'>;

function startAssessment(userId: UserId, assessmentId: AssessmentId) {
  // Compiler guarantees correct identifier types
}

const user = 'usr-123' as UserId;
const exam = 'asm-456' as AssessmentId;
startAssessment(user, exam); // Safe`,
          caption: 'Nominal branded types preventing primitive obsession'
        },
        keyTakeaways: [
          'Branded types catch identifier mix-ups at compile time with zero runtime overhead.',
          'Value objects are defined by their attributes and are strictly immutable.',
          'Validate domain invariants at object instantiation.'
        ],
        skills: ['TypeScript Architecture', 'Software Architecture']
      },
      {
        id: 'les-013-05',
        moduleId: 'mod-13',
        number: 5,
        title: 'Conditional & Template Types',
        duration: '22 min',
        shortDescription: 'Conditional types (T extends U ? X : Y), infer keyword, and template literal type operations.',
        learningObjectives: [
          'Construct conditional types that transform types based on criteria',
          'Use the infer keyword to extract inner return types or promise resolutions',
          'Utilize template literal types for type-safe route paths and event names'
        ],
        conceptExplanation: 'Conditional types allow you to declare type mappings that behave like expressions. Combined with the infer keyword, you can extract constituent types from complex functions, promises, and arrays.',
        codeExample: {
          language: 'typescript',
          code: `type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type Route = \`/api/\${'users' | 'assessments' | 'evidence'}/\${string}\`;

const validRoute: Route = '/api/assessments/start'; // ✓ Valid
// const invalidRoute: Route = '/api/settings/profile'; // ✗ Compiler Error`,
          caption: 'Conditional type unpacking and template literal routes'
        },
        keyTakeaways: [
          'The infer keyword extracts types from within other types inside conditional branches.',
          'Template literal types provide compile-time string validation for routes and event names.',
          'Keep conditional types readable by breaking complex expressions into smaller helper types.'
        ],
        skills: ['TypeScript Architecture', 'TypeScript']
      },
      {
        id: 'les-013-06',
        moduleId: 'mod-13',
        number: 6,
        title: 'Clean Architecture Boundaries',
        duration: '26 min',
        shortDescription: 'Decoupling Presentation, Domain, Application, and Infrastructure layers in TypeScript.',
        learningObjectives: [
          'Establish strict dependency rules between application layers',
          'Isolate external databases, APIs, and frameworks behind domain interfaces',
          'Build scalable applications that remain testable and framework-independent'
        ],
        conceptExplanation: 'Clean Architecture enforces that core domain business logic depends on nothing external. User interfaces, database drivers, and third-party APIs reside in outer infrastructure layers that depend on inward domain abstractions.',
        codeExample: {
          language: 'typescript',
          code: `// Domain Port Interface (Pure TypeScript)
export interface EvidenceRepository {
  saveEvidence(record: EvidenceRecord): Promise<void>;
  findByCandidate(candidateId: string): Promise<EvidenceRecord[]>;
}

// Infrastructure Adapter (Implements Domain Port)
export class SupabaseEvidenceRepository implements EvidenceRepository {
  async saveEvidence(record: EvidenceRecord): Promise<void> {
    // Supabase specific implementation
  }
  async findByCandidate(candidateId: string): Promise<EvidenceRecord[]> {
    return [];
  }
}`,
          caption: 'Clean Architecture Port & Adapter in TypeScript'
        },
        keyTakeaways: [
          'Domain entities and business rules must never import database or UI libraries directly.',
          'Use repository interfaces (ports) to decouple domain logic from specific storage engines.',
          'Architectural boundaries make unit testing fast and mock-free.'
        ],
        skills: ['TypeScript Architecture', 'Software Architecture']
      }
    ]
  },

  // =========================================================================
  // MODULE 14: ADVANCED POSTGRESQL & HIGH-PERFORMANCE DATA MODELING
  // =========================================================================
  {
    id: 'mod-14',
    number: '14',
    title: 'PostgreSQL & Data Modeling',
    slug: 'advanced-postgresql-data-modeling',
    description: 'Relational database engineering: Advanced B-Tree, GIN, and composite indexing, EXPLAIN ANALYZE execution plan diagnostics, transaction isolation levels, Row Level Security, and zero-downtime migrations.',
    primarySkill: 'PostgreSQL & Data Modeling',
    skills: ['PostgreSQL', 'Database Architecture', 'Performance Tuning', 'Security'],
    status: 'locked',
    lab: {
      id: 'lab-14',
      moduleId: 'mod-14',
      title: 'Postgres Index Tuning & Query Optimization',
      objective: 'Diagnose a slow analytical query using EXPLAIN ANALYZE, eliminate sequential scans by designing multi-column indexes, and measure buffer cache improvements.',
      requirements: [
        'Analyze a multi-table join query joining assessments, attempts, and audit events.',
        'Inspect query execution plans to identify costly Seq Scans and Hash Joins.',
        'Create optimized B-Tree and GIN indexes targeting filter and join keys.',
        'Verify query execution time drops by over 80% with minimal buffer page reads.'
      ],
      hints: [
        'Check for missing indexes on foreign key columns.',
        'Use GIN indexes for JSONB columns queried with the containment operator (@>).'
      ],
      expectedOutput: 'An EXPLAIN ANALYZE comparison report documenting the transition from Seq Scan to Index Scan with verified latency reduction.',
      skillsTested: ['PostgreSQL & Data Modeling', 'Database Architecture'],
      submissionRequirements: 'Submit the SQL migration adding indexes and the before/after EXPLAIN ANALYZE execution logs.'
    },
    practiceActivities: [
      {
        id: 'prac-14-1',
        type: 'debugging',
        title: 'Optimize an Unindexed Join Query',
        description: 'Identify why a join across 100,000 evidence records causes a 1.2-second lockup.',
        task: 'Add appropriate composite indexes on (user_id, status, created_at DESC) to allow Index Only Scans.'
      }
    ],
    lessons: [
      {
        id: 'les-014-01',
        moduleId: 'mod-14',
        number: 1,
        title: 'Normalization vs Denormalization',
        duration: '22 min',
        shortDescription: 'Boyce-Codd Normal Form, read-heavy denormalization trade-offs, and materialized views.',
        learningObjectives: [
          'Apply 3NF and BCNF normalization to prevent write anomalies',
          'Identify when to strategically denormalize data for high-throughput reads',
          'Maintain data consistency across denormalized fields using triggers and views'
        ],
        conceptExplanation: 'Normalization organizes relational tables to minimize data redundancy and prevent insertion, update, and deletion anomalies. In high-throughput read systems, strategic denormalization or materialized views are used to eliminate expensive multi-table joins.',
        codeExample: {
          language: 'sql',
          code: `-- Materialized view for fast read performance
CREATE MATERIALIZED VIEW mv_candidate_evidence_summary AS
SELECT 
  user_id,
  COUNT(*) AS total_evidence_items,
  AVG(score) AS average_score,
  MAX(created_at) AS latest_submission
FROM public.evidence_timeline
GROUP BY user_id;

-- Refresh concurrently without locking read queries
CREATE UNIQUE INDEX ON mv_candidate_evidence_summary (user_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_candidate_evidence_summary;`,
          caption: 'Concurrent materialized view for fast aggregate reporting'
        },
        keyTakeaways: [
          'Normalize by default to ensure transactional consistency and eliminate anomalies.',
          'Denormalize only when verified performance profiling demonstrates unacceptable join costs.',
          'Use materialized views with concurrent refresh to cache expensive reporting queries.'
        ],
        skills: ['PostgreSQL & Data Modeling', 'Database Architecture']
      },
      {
        id: 'les-014-02',
        moduleId: 'mod-14',
        number: 2,
        title: 'Index Types & Strategies',
        duration: '24 min',
        shortDescription: 'B-Tree, GIN, GiST, partial indexes, and covering indexes with the INCLUDE clause.',
        learningObjectives: [
          'Select the correct index type for scalar, text, and JSONB data types',
          'Implement partial indexes to index only active or unverified rows',
          'Construct covering indexes with INCLUDE to enable Index-Only Scans'
        ],
        conceptExplanation: 'Indexes are specialized data structures that accelerate data retrieval. B-Trees excel at equality and range queries, while Generalized Inverted Indexes (GIN) index compound components like arrays and JSONB documents.',
        codeExample: {
          language: 'sql',
          code: `-- Partial Index: Index only active attempts to keep index size minimal
CREATE INDEX idx_active_attempts ON public.assessment_attempts (user_id, assessment_id)
WHERE status = 'in_progress';

-- GIN Index for fast JSONB metadata querying
CREATE INDEX idx_audit_metadata ON public.assessment_audit_events USING GIN (metadata);

-- Covering Index enabling Index Only Scan without visiting table heap
CREATE INDEX idx_evidence_fast_lookup ON public.evidence_timeline (user_id, created_at DESC)
INCLUDE (score, verification_hash);`,
          caption: 'Partial, GIN, and covering indexes in PostgreSQL'
        },
        keyTakeaways: [
          'B-Tree indexes support equality (=), range (<, >), and sorting operations.',
          'Partial indexes reduce index disk footprint and speed up inserts on historical data.',
          'Covering indexes (INCLUDE) prevent visiting the table heap when all queried columns are in the index.'
        ],
        skills: ['PostgreSQL & Data Modeling', 'Performance Tuning']
      },
      {
        id: 'les-014-03',
        moduleId: 'mod-14',
        number: 3,
        title: 'EXPLAIN ANALYZE Diagnostics',
        duration: '25 min',
        shortDescription: 'Interpreting Postgres execution plans, cost calculations, buffer cache hits, and join algorithms.',
        learningObjectives: [
          'Execute and interpret EXPLAIN (ANALYZE, BUFFERS) query plans',
          'Diagnose performance bottlenecks: Seq Scan vs Index Scan vs Bitmap Scan',
          'Evaluate join algorithms: Nested Loop, Hash Join, and Merge Join'
        ],
        conceptExplanation: 'EXPLAIN ANALYZE runs the query on the database engine and returns the actual execution time, plan tree nodes, row estimates, and buffer cache hits. It is the authoritative tool for relational database performance engineering.',
        codeExample: {
          language: 'sql',
          code: `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT a.id, a.user_id, a.score, p.full_name
FROM public.assessment_attempts a
JOIN public.profiles p ON p.id = a.user_id
WHERE a.status = 'evaluated' AND a.score >= 80
ORDER BY a.submitted_at DESC
LIMIT 20;`,
          caption: 'Diagnostic EXPLAIN ANALYZE query with buffer analysis'
        },
        keyTakeaways: [
          'Estimated cost (cost=0.00..42.50) shows start-up cost and total execution cost units.',
          'Buffers: shared hit indicates pages served from RAM; shared read indicates pages pulled from disk.',
          'Address high-cost Seq Scans on large tables by creating targeted indexes.'
        ],
        skills: ['PostgreSQL & Data Modeling', 'Performance Tuning']
      },
      {
        id: 'les-014-04',
        moduleId: 'mod-14',
        number: 4,
        title: 'Transaction Isolation & Locks',
        duration: '22 min',
        shortDescription: 'Concurrency anomalies (dirty reads, non-repeatable reads, phantom reads) and lock modes.',
        learningObjectives: [
          'Understand PostgreSQL Multi-Version Concurrency Control (MVCC)',
          'Select the appropriate transaction isolation level for sensitive workflows',
          'Detect and prevent deadlocks and row-level serialization conflicts'
        ],
        conceptExplanation: 'PostgreSQL uses Multi-Version Concurrency Control (MVCC) so readers never block writers, and writers never block readers. Isolation levels define how transaction concurrent state changes become visible to other operations.',
        codeExample: {
          language: 'sql',
          code: `-- High-integrity serialization transaction
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Ensure candidate does not exceed max attempts concurrently
SELECT COUNT(*) FROM public.assessment_attempts 
WHERE user_id = 'usr-123' AND assessment_id = 'asm-01' FOR UPDATE;

-- Insert attempt if within limit
INSERT INTO public.assessment_attempts (user_id, assessment_id, attempt_number)
VALUES ('usr-123', 'asm-01', 2);

COMMIT;`,
          caption: 'Serializable transaction with row-level locks'
        },
        keyTakeaways: [
          'Read Committed is the PostgreSQL default isolation level.',
          'Repeatable Read prevents non-repeatable reads by snapshotting data at transaction start.',
          'Serializable provides the highest isolation, rolling back conflicting concurrent transactions.'
        ],
        skills: ['PostgreSQL & Data Modeling', 'Database Architecture']
      },
      {
        id: 'les-014-05',
        moduleId: 'mod-14',
        number: 5,
        title: 'Row Level Security Architecture',
        duration: '24 min',
        shortDescription: 'Declarative database-level authorization policies, security definer functions, and tenant isolation.',
        learningObjectives: [
          'Configure declarative Row Level Security (RLS) policies for multi-tenant isolation',
          'Differentiate between USING clauses and WITH CHECK clauses',
          'Safely implement SECURITY DEFINER functions without privilege leakage'
        ],
        conceptExplanation: 'Row Level Security (RLS) enforces access rules directly within the database engine. Even if an API handler contains an authorization vulnerability, the PostgreSQL engine filters out rows that fail the security policy.',
        codeExample: {
          language: 'sql',
          code: `ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Learners can only inspect their own progress records
CREATE POLICY "Learner Progress Read Access"
ON public.lesson_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Learners can only insert records owned by their own identity
CREATE POLICY "Learner Progress Write Access"
ON public.lesson_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());`,
          caption: 'Declarative PostgreSQL Row Level Security policies'
        },
        keyTakeaways: [
          'USING determines which rows can be viewed or updated; WITH CHECK restricts new data shapes.',
          'Always enable RLS explicitly: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY.',
          'Security definer functions run with creator privileges; always set search_path explicitly.'
        ],
        skills: ['PostgreSQL & Data Modeling', 'Security']
      },
      {
        id: 'les-014-06',
        moduleId: 'mod-14',
        number: 6,
        title: 'Zero-Downtime Schema Evolution',
        duration: '22 min',
        shortDescription: 'Safe schema migrations: Non-blocking index creation, column additions, and rollback strategies.',
        learningObjectives: [
          'Execute non-blocking migrations using CREATE INDEX CONCURRENTLY',
          'Add columns with safe default values without locking entire tables',
          'Follow the Expand/Contract migration pattern for breaking database changes'
        ],
        conceptExplanation: 'In high-availability web services, altering a database table can lock the table and cause downtime. Safe migrations use concurrent index building, default values without rewrite, and multi-step expansion before contraction.',
        codeExample: {
          language: 'sql',
          code: `-- Safe non-blocking index creation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assessment_cooldowns_user
ON public.assessment_cooldowns (user_id, status);

-- Adding columns with non-locking defaults (Postgres 11+)
ALTER TABLE public.assessment_attempts
  ADD COLUMN IF NOT EXISTS violation_count int DEFAULT 0 NOT NULL;`,
          caption: 'Non-blocking migration operations in PostgreSQL'
        },
        keyTakeaways: [
          'Always use CREATE INDEX CONCURRENTLY in production to prevent table write locks.',
          'The Expand/Contract pattern deploys non-breaking database expansions before updating application code.',
          'Never drop columns or tables in the same release that introduces their replacement.'
        ],
        skills: ['PostgreSQL & Data Modeling', 'Database Architecture']
      }
    ]
  },

  // =========================================================================
  // MODULE 15: DEVOPS, CONTAINERS & CI/CD PIPELINES
  // =========================================================================
  {
    id: 'mod-15',
    number: '15',
    title: 'DevOps, Containers & CI/CD',
    slug: 'devops-containers-cicd',
    description: 'Production infrastructure automation: Multi-stage Docker optimization, automated GitHub Actions testing and security pipelines, environment segregation, secrets management, and observability.',
    primarySkill: 'DevOps & CI/CD',
    skills: ['Docker', 'CI/CD', 'GitHub Actions', 'Observability', 'Production Engineering'],
    status: 'locked',
    lab: {
      id: 'lab-15',
      moduleId: 'mod-15',
      title: 'Configure a Multi-Stage Container & Automated Pipeline',
      objective: 'Write an optimized multi-stage Dockerfile for a Next.js production build, configure a GitHub Actions workflow with lint, test, and security audit gates, and verify container security scanning.',
      requirements: [
        'Author a multi-stage Dockerfile using node:20-alpine producing an image under 180MB.',
        'Run container processes as a non-root user (nextjs:nodejs) for security isolation.',
        'Configure a GitHub Actions workflow that executes all automated test suites prior to build.',
        'Implement automated vulnerability scanning with Trivy or npm audit.'
      ],
      hints: [
        'Use standalone output mode in Next.js to copy only essential runtime files.',
        'Leverage Docker layer caching by copying package.json before full source code.'
      ],
      expectedOutput: 'A passing GitHub Actions YAML workflow and an executable Dockerfile image passing health verification.',
      skillsTested: ['DevOps & CI/CD', 'Docker'],
      submissionRequirements: 'Submit the GitHub Actions workflow file, Dockerfile, and container build logs.'
    },
    practiceActivities: [
      {
        id: 'prac-15-1',
        type: 'coding',
        title: 'Optimize Docker Layer Caching',
        description: 'Reorder Dockerfile instructions so dependencies are not reinstalled on minor source code edits.',
        task: 'Refactor a naive Dockerfile to cache npm install layers and utilize Alpine Linux base images.'
      }
    ],
    lessons: [
      {
        id: 'les-015-01',
        moduleId: 'mod-15',
        number: 1,
        title: 'Linux Containers & Namespaces',
        duration: '22 min',
        shortDescription: 'Cgroups, namespaces, chroot, and the container runtime engine vs traditional virtual machines.',
        learningObjectives: [
          'Understand how Linux kernel primitives (cgroups, namespaces) provide process isolation',
          'Differentiate containers from hypervisor-based virtual machines in overhead and security',
          'Inspect running container processes from the Linux host kernel'
        ],
        conceptExplanation: 'Containers are not full virtual machines; they are standard Linux processes isolated by kernel features: namespaces (which restrict what a process can see) and cgroups (which restrict how much CPU and memory a process can use).',
        codeExample: {
          language: 'bash',
          code: `# Inspect container process from host
ps aux | grep node
# View cgroup memory limits applied to a container
cat /sys/fs/cgroup/memory/docker/<container_id>/memory.limit_in_bytes`,
          caption: 'Inspecting Linux container cgroups and host process mapping'
        },
        keyTakeaways: [
          'Namespaces isolate PIDs, network interfaces, mounts, and user IDs.',
          'Control groups (cgroups) limit and monitor resource usage (CPU, memory, disk I/O).',
          'Containers share the host operating system kernel, making them lightweight and fast to start.'
        ],
        skills: ['DevOps & CI/CD', 'Docker']
      },
      {
        id: 'les-015-02',
        moduleId: 'mod-15',
        number: 2,
        title: 'Multi-Stage Dockerfile Engineering',
        duration: '24 min',
        shortDescription: 'Building lean, secure container images using multi-stage builds and non-root users.',
        learningObjectives: [
          'Construct multi-stage Dockerfiles separating build dependencies from production artifacts',
          'Minimize image attack surface by excluding compilers and package managers',
          'Run container workloads under dedicated non-root users'
        ],
        conceptExplanation: 'Multi-stage builds allow you to use intermediate images to compile TypeScript, bundle Next.js assets, and prune devDependencies. Only the compiled output is copied into the minimal runtime stage.',
        codeExample: {
          language: 'dockerfile',
          code: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
          caption: 'Production-ready non-root multi-stage Dockerfile'
        },
        keyTakeaways: [
          'Multi-stage Dockerfiles reduce image sizes from over 1GB to under 150MB.',
          'Never run containers as root in production; create a dedicated unprivileged user.',
          'Leverage layer caching by copying package files before copying application source code.'
        ],
        skills: ['DevOps & CI/CD', 'Docker']
      },
      {
        id: 'les-015-03',
        moduleId: 'mod-15',
        number: 3,
        title: 'CI/CD Pipelines with GitHub Actions',
        duration: '25 min',
        shortDescription: 'Automated continuous integration: Linting, type checks, unit testing, and deployment gates.',
        learningObjectives: [
          'Design an automated continuous integration workflow in GitHub Actions',
          'Parallelize test execution across multiple matrix runners',
          'Enforce strict pull request merge protection rules based on pipeline status'
        ],
        conceptExplanation: 'Continuous Integration (CI) automatically runs linters, TypeScript compiler checks, and automated test suites on every pull request. This ensures that broken code or regression bugs cannot be merged into main branches.',
        codeExample: {
          language: 'yaml',
          code: `name: CI Quality Gate
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:scoring
      - run: npm run test:assessment
      - run: npm run test:project
      - run: npm run build`,
          caption: 'GitHub Actions automated testing and compilation workflow'
        },
        keyTakeaways: [
          'Automated CI pipelines eliminate "it works on my machine" bugs.',
          'Cache package manager dependencies to cut pipeline run times from minutes to seconds.',
          'Require all checks to pass before allowing pull requests to merge into production branches.'
        ],
        skills: ['DevOps & CI/CD', 'CI/CD']
      },
      {
        id: 'les-015-04',
        moduleId: 'mod-15',
        number: 4,
        title: 'Secrets Management & Security Scanning',
        duration: '20 min',
        shortDescription: 'Zero plain-text credentials in Git, secret managers, and automated container vulnerability scanning.',
        learningObjectives: [
          'Prevent credential leakage using pre-commit hooks and GitGuardian/TruffleHog',
          'Inject secrets securely into CI/CD pipelines and cloud runtimes',
          'Run container vulnerability scanning (Trivy, Grype) to detect CVEs in base images'
        ],
        conceptExplanation: 'Committed secrets are permanently etched into Git history. Production systems use automated secret scanners to block commits containing keys, and inject credentials via environment variables at runtime.',
        codeExample: {
          language: 'bash',
          code: `# Scan repository for leaked credentials
npx -y @trufflehog/cli git file://. --only-verified

# Scan container image for critical CVE vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image seva-passport:latest`,
          caption: 'Automated secret detection and container CVE scanning'
        },
        keyTakeaways: [
          'Never commit credentials, private keys, or connection strings to version control.',
          'Rotate compromised credentials immediately and invalidate all associated active sessions.',
          'Scan base container images regularly to patch operating system vulnerabilities.'
        ],
        skills: ['DevOps & CI/CD', 'Security']
      },
      {
        id: 'les-015-05',
        moduleId: 'mod-15',
        number: 5,
        title: 'Observability & Metrics',
        duration: '22 min',
        shortDescription: 'Prometheus metrics, structured logging, distributed tracing (OpenTelemetry), and health probes.',
        learningObjectives: [
          'Differentiate between logs, metrics, and traces (The Three Pillars of Observability)',
          'Instrument HTTP endpoints with Prometheus metric counters and histograms',
          'Configure Kubernetes liveness and readiness probes for zero-downtime orchestration'
        ],
        conceptExplanation: 'Observability measures how well you can understand the internal state of a system based on its external outputs. Metrics aggregate quantitative trends (requests/sec, latency), logs capture discrete events, and traces follow a request across services.',
        codeExample: {
          language: 'typescript',
          code: `import { Counter, Histogram } from 'prom-client';

export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total incoming HTTP requests',
  labelNames: ['method', 'route', 'status']
});

export const httpDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5]
});`,
          caption: 'Prometheus metrics instrumentation for web APIs'
        },
        keyTakeaways: [
          'Metrics allow you to spot degradation before users report service outages.',
          'Liveness probes verify a container is still running; readiness probes verify it can accept traffic.',
          'Use histograms to measure 95th and 99th percentile response latencies.'
        ],
        skills: ['DevOps & CI/CD', 'Observability']
      },
      {
        id: 'les-015-06',
        moduleId: 'mod-15',
        number: 6,
        title: 'Zero-Downtime Deployment Strategies',
        duration: '24 min',
        shortDescription: 'Blue-Green deployments, Canary rollouts, traffic shifting, and automated health-based rollbacks.',
        learningObjectives: [
          'Implement Blue-Green deployment architecture with routing load balancers',
          'Deploy Canary releases to expose new versions to a 5% user subset',
          'Automate immediate rollbacks when error rate thresholds exceed SLA targets'
        ],
        conceptExplanation: 'Zero-downtime deployments ensure that software updates do not interrupt user sessions. Blue-Green deployments run two identical production environments, switching router traffic to the new version only after all health checks succeed.',
        codeExample: {
          language: 'markdown',
          code: `## Blue-Green Deployment Sequence
1. Current Live Traffic: -> Blue Environment (v1.4)
2. Deploy & Compile:     -> Green Environment (v1.5)
3. Run Automated Tests:  -> Green Health Probes PASS (HTTP 200)
4. Switch Load Balancer: -> 100% Traffic routed to Green (v1.5)
5. Monitor Metrics:      -> Zero error spikes observed over 10 minutes
6. Stand down:           -> Blue Environment retained as warm rollback standby`,
          caption: 'Blue-Green traffic cutover sequence'
        },
        keyTakeaways: [
          'Blue-Green deployments provide instantaneous rollback by switching load balancer targets.',
          'Canary rollouts expose a small percentage of real user traffic to catch edge-case bugs.',
          'Automated rollbacks prevent outages when deployment health metrics degrade.'
        ],
        skills: ['DevOps & CI/CD', 'Production Engineering']
      }
    ]
  },

  // =========================================================================
  // MODULE 16: APPLIED AI INTEGRATION & LLM SYSTEMS
  // =========================================================================
  {
    id: 'mod-16',
    number: '16',
    title: 'Applied AI & LLM Systems',
    slug: 'applied-ai-llm-systems',
    description: 'Engineering intelligent applications: LLM API integration, tokenization dynamics, prompt engineering, structured JSON schemas, function calling, vector embeddings, semantic search, and RAG architectures.',
    primarySkill: 'Applied AI & LLMs',
    skills: ['LLM APIs', 'Prompt Engineering', 'RAG Architecture', 'AI Safety', 'Vector Search'],
    status: 'locked',
    lab: {
      id: 'lab-16',
      moduleId: 'mod-16',
      title: 'Build a Grounded RAG Documentation Assistant',
      objective: 'Implement a server-side Retrieval-Augmented Generation (RAG) assistant that indexes curriculum documents into vector embeddings and answers student queries strictly grounded in curriculum facts.',
      requirements: [
        'Compute semantic text embeddings for curriculum lesson notes.',
        'Implement cosine similarity search to retrieve the top 3 relevant course modules.',
        'Construct a system prompt injecting retrieved documents as verified context.',
        'Enforce strict anti-hallucination rules and academic integrity guards during graded attempts.'
      ],
      hints: [
        'Normalize embeddings to unit vectors before computing dot-product cosine similarity.',
        'Instruct the model explicitly: "If the context does not answer the question, state that you do not know."'
      ],
      expectedOutput: 'A working RAG query pipeline providing curriculum-grounded responses with cited source lessons.',
      skillsTested: ['Applied AI & LLMs', 'RAG Architecture'],
      submissionRequirements: 'Submit the RAG retrieval function, prompt formatting template, and evaluation test cases.'
    },
    practiceActivities: [
      {
        id: 'prac-16-1',
        type: 'coding',
        title: 'Structured Output with JSON Schema',
        description: 'Configure an LLM API call to return valid JSON adhering strictly to a TypeScript interface.',
        task: 'Implement function calling / responseSchema to extract structured skills from a text job description.'
      }
    ],
    lessons: [
      {
        id: 'les-016-01',
        moduleId: 'mod-16',
        number: 1,
        title: 'Foundation Models & Tokens',
        duration: '20 min',
        shortDescription: 'Transformer architecture overview, tokenization mechanics (BPE), and context window constraints.',
        learningObjectives: [
          'Understand Byte-Pair Encoding (BPE) and how text maps to numeric tokens',
          'Calculate token budgets and manage input/output context window limits',
          'Differentiate between base completion models and instruction-tuned chat models'
        ],
        conceptExplanation: 'Large Language Models process text as tokens—sub-word chunks roughly equal to 4 characters or 0.75 words. Context windows represent the maximum total token capacity (input prompt plus generated response) that the model can process simultaneously.',
        codeExample: {
          language: 'typescript',
          code: `// Token Estimation Utility (1 token ≈ 4 characters of standard English)
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

const prompt = "Explain the JavaScript event loop and microtask priority.";
console.log('Estimated Tokens:', estimateTokenCount(prompt)); // ~15 tokens`,
          caption: 'Token calculation and context window budgeting'
        },
        keyTakeaways: [
          'Models do not read characters or words; they process numerical token IDs.',
          'Token consumption directly dictates API cost and latency.',
          'Always budget token limits in API generationConfig to avoid runaway billing.'
        ],
        skills: ['Applied AI & LLMs']
      },
      {
        id: 'les-016-02',
        moduleId: 'mod-16',
        number: 2,
        title: 'Prompt Engineering & Framing',
        duration: '22 min',
        shortDescription: 'System prompts, persona framing, few-shot examples, and chain-of-thought prompting.',
        learningObjectives: [
          'Structure reliable system prompts that establish persona, scope, and formatting constraints',
          'Use few-shot demonstration examples to teach complex input/output patterns',
          'Apply Chain-of-Thought (CoT) prompting to improve multi-step technical reasoning'
        ],
        conceptExplanation: 'Prompt engineering is the discipline of structuring input text to guide foundation models toward accurate, consistent, and safe outputs. Providing explicit role definitions, negative constraints, and few-shot examples dramatically reduces hallucinations.',
        codeExample: {
          language: 'typescript',
          code: `const systemPrompt = \`You are an authoritative Senior Full Stack Engineer and Mentor.
Task: Explain the given engineering concept clearly.
Rules:
1. Provide a 2-sentence summary first.
2. Provide a practical TypeScript code example.
3. List 2 common anti-patterns to avoid.
4. Do NOT hallucinate unsupported frameworks. If unsure, state uncertainty.\`;`,
          caption: 'Structured system prompt with explicit constraints'
        },
        keyTakeaways: [
          'Clear negative constraints ("Do NOT do X") prevent common model failure modes.',
          'Few-shot demonstrations yield higher consistency than verbose text instructions.',
          'Instructing the model to "Think step-by-step" improves reasoning on algorithmic problems.'
        ],
        skills: ['Applied AI & LLMs', 'Prompt Engineering']
      },
      {
        id: 'les-016-03',
        moduleId: 'mod-16',
        number: 3,
        title: 'Function Calling & Structured JSON',
        duration: '24 min',
        shortDescription: 'Tool use, declaring JSON schemas, and reliable structured outputs from LLMs.',
        learningObjectives: [
          'Configure LLM APIs to call declared application functions with structured parameters',
          'Enforce strict JSON response schemas that match TypeScript interfaces',
          'Handle model tool call requests and feed execution results back into the conversation'
        ],
        conceptExplanation: 'Function calling allows language models to connect to external systems. Instead of generating plain text, the model returns a structured JSON object containing function arguments that your application code executes (e.g. querying a database or calling a payment gateway).',
        codeExample: {
          language: 'typescript',
          code: `// Function declaration passed to Gemini / OpenAI
const tools = [{
  functionDeclarations: [{
    name: "lookupEvidenceRecord",
    description: "Look up cryptographically verified evidence for a candidate",
    parameters: {
      type: "OBJECT",
      properties: {
        candidateId: { type: "STRING", description: "The candidate's unique identifier" },
        skillDomain: { type: "STRING", description: "Skill category e.g. React, SQL" }
      },
      required: ["candidateId"]
    }
  }]
}];`,
          caption: 'LLM tool declaration with strict JSON parameter schemas'
        },
        keyTakeaways: [
          'The model does not execute code directly; it outputs the JSON arguments for your app to execute.',
          'Always validate model-generated tool arguments with Zod before executing backend operations.',
          'Structured JSON schemas eliminate brittle regex parsing of model outputs.'
        ],
        skills: ['Applied AI & LLMs']
      },
      {
        id: 'les-016-04',
        moduleId: 'mod-16',
        number: 4,
        title: 'Vector Embeddings & Semantic Search',
        duration: '24 min',
        shortDescription: 'High-dimensional vector representations, cosine similarity, and semantic document retrieval.',
        learningObjectives: [
          'Understand how embedding models map semantic concepts into high-dimensional vector spaces',
          'Calculate dot products and cosine similarity to measure conceptual distance',
          'Implement semantic search that finds relevant lessons without exact keyword matches'
        ],
        conceptExplanation: 'Vector embeddings are arrays of floating-point numbers (e.g. 768 or 1536 dimensions) generated by specialized neural networks. Concepts with similar meanings reside close together in vector space, enabling semantic search that surpasses traditional keyword matching.',
        codeExample: {
          language: 'typescript',
          code: `export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}`,
          caption: 'Mathematical cosine similarity calculation between high-dimensional vectors'
        },
        keyTakeaways: [
          'Semantic search matches ideas and intent rather than literal keyword strings.',
          'Cosine similarity values range from -1 (opposite) to 1 (identical meaning).',
          'Vector indexes (pgvector, HNSW) enable sub-millisecond similarity queries across millions of vectors.'
        ],
        skills: ['Applied AI & LLMs', 'Vector Search']
      },
      {
        id: 'les-016-05',
        moduleId: 'mod-16',
        number: 5,
        title: 'RAG Architecture & Grounding',
        duration: '26 min',
        shortDescription: 'Retrieval-Augmented Generation: Document chunking, indexing, retrieval, and contextual prompting.',
        learningObjectives: [
          'Design an end-to-end Retrieval-Augmented Generation (RAG) architecture',
          'Implement recursive character chunking with semantic overlap',
          'Ground model outputs in authoritative proprietary courseware to eliminate hallucinations'
        ],
        conceptExplanation: 'Retrieval-Augmented Generation (RAG) retrieves relevant documents from an external knowledge base and injects them into the model prompt before generation. This grounds the answer in factual, verified documents rather than model memory.',
        codeExample: {
          language: 'typescript',
          code: `async function generateGroundedResponse(userQuery: string) {
  // 1. Retrieve top matching documents
  const relevantSnippets = await searchCurriculumDocuments(userQuery, 3);
  
  // 2. Inject into prompt
  const groundedPrompt = \`Use ONLY the following verified context to answer the question:
--- CONTEXT START ---
\${relevantSnippets.join('\\n\\n')}
--- CONTEXT END ---
Question: \${userQuery}
If the context does not answer the question, state: "I do not have verified curriculum data to answer that."\`;

  return callLanguageModel(groundedPrompt);
}`,
          caption: 'Grounded RAG pipeline with anti-hallucination instruction'
        },
        keyTakeaways: [
          'RAG enables LLMs to answer questions about private, proprietary, or rapidly changing data.',
          'Chunk size and chunk overlap directly impact retrieval precision and context relevance.',
          'Instruct the model to cite sources to make answers auditable.'
        ],
        skills: ['Applied AI & LLMs', 'RAG Architecture']
      },
      {
        id: 'les-016-06',
        moduleId: 'mod-16',
        number: 6,
        title: 'AI Safety & Academic Integrity Guards',
        duration: '22 min',
        shortDescription: 'Mitigating prompt injection, jailbreaks, data leakage, and enforcing academic anti-cheat rules.',
        learningObjectives: [
          'Identify Indirect Prompt Injection and jailbreak vulnerabilities',
          'Implement server-side input sanitization and output guardrails',
          'Enforce strict anti-cheat policies that lock AI assistance during active graded assessments'
        ],
        conceptExplanation: 'As AI is integrated into enterprise applications, security boundaries must be hardened. Untrusted user inputs can attempt Prompt Injection to override system rules, leak evaluation keys, or solicit solutions during graded assessments.',
        codeExample: {
          language: 'typescript',
          code: `export function enforceAssessmentGuard(
  userPrompt: string, 
  activeAssessmentId?: string
): { isAllowed: boolean; reason?: string } {
  if (!activeAssessmentId) return { isAllowed: true };
  
  // Strict server-side anti-cheat enforcement
  const forbiddenPatterns = [/solution/i, /answer/i, /mcq/i, /select option/i, /test code/i];
  const isViolating = forbiddenPatterns.some(pattern => pattern.test(userPrompt));
  
  if (isViolating) {
    return {
      isAllowed: false,
      reason: "AI assistance is locked during active graded assessments to protect academic integrity."
    };
  }
  return { isAllowed: true };
}`,
          caption: 'Server-side academic integrity guard for active assessments'
        },
        keyTakeaways: [
          'Treat all user prompts and retrieved documents as untrusted inputs.',
          'Never place assessment answer keys or private reviewer rubrics in system prompts.',
          'Enforce anti-cheat restrictions on the server side, not just in UI components.'
        ],
        skills: ['Applied AI & LLMs', 'AI Safety']
      }
    ]
  }
];

