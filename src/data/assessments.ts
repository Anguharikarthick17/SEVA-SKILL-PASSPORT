export interface AssessmentQuestion {
  id: string;
  type: 'conceptual' | 'scenario' | 'debugging' | 'code-reading' | 'output-prediction' | 'architecture';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOption: number;
  explanation: string;
  skill: string;
  points: number;
}

export interface ModuleAssessment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  skill: string;
  skills: string[];
  durationMinutes: number;
  passingScore: number;
  questions: AssessmentQuestion[];
}

export const MODULE_ASSESSMENTS: ModuleAssessment[] = [
  // -------------------------------------------------------------------------
  // ASSESSMENT 01: WEB FUNDAMENTALS & ARCHITECTURE
  // -------------------------------------------------------------------------
  {
    id: 'ass-mod-01',
    moduleId: 'mod-01',
    title: 'Web Fundamentals & Architecture Assessment',
    description: 'Comprehensive evaluation of networking, HTTP/HTTPS protocols, DNS resolution, and browser rendering lifecycle.',
    skill: 'Web Fundamentals',
    skills: ['Web Fundamentals', 'HTTP', 'Networking'],
    durationMinutes: 30,
    passingScore: 75,
    questions: [
      {
        id: 'q-web-01',
        type: 'conceptual',
        question: 'Which protocol layer is responsible for establishing an encrypted TLS session between client and server?',
        options: [
          'Application Layer on top of raw UDP',
          'Transport Layer security handshake running over established TCP connection',
          'Network Layer managed exclusively by local DNS resolvers',
          'Data Link Layer physical hardware encryption'
        ],
        correctOption: 1,
        explanation: 'TLS runs in the Transport/Session abstraction above TCP (Transmission Control Protocol) to negotiate cipher suites and encrypt application payloads.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-02',
        type: 'output-prediction',
        question: 'What is the exact HTTP response status code when a client performs a conditional request with If-None-Match and the server resource has not changed?',
        codeSnippet: `GET /api/v1/passport HTTP/1.1
Host: api.seva.edu
If-None-Match: "e3b0c44298fc"`,
        options: [
          '200 OK with full response body',
          '304 Not Modified with empty body',
          '204 No Content with cached body',
          '412 Precondition Failed'
        ],
        correctOption: 1,
        explanation: 'HTTP 304 Not Modified informs the client that the cached copy matching the ETag header remains fresh, saving network bandwidth by returning zero payload body.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-03',
        type: 'debugging',
        question: 'A web app exhibits poor Core Web Vitals with high Cumulative Layout Shift (CLS). What is the primary architectural cause?',
        options: [
          'Images and iframes rendered without explicit width and height aspect-ratio attributes',
          'Using HTTP/2 multiplexing instead of HTTP/1.1',
          'Enabling gzip compression on textual CSS assets',
          'Serving static HTML entrypoint via a CDN edge node'
        ],
        correctOption: 0,
        explanation: 'Omitting dimensions on images causes the browser layout engine to re-calculate surrounding DOM geometry once the image finishes downloading, shifting visible content abruptly.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-04',
        type: 'scenario',
        question: 'A user in Bangalore reports 250ms latency reaching your dynamic API in Frankfurt. What is the most effective architectural strategy to reduce latency for non-cacheable API requests?',
        options: [
          'Deploy Edge API compute points or multi-region database replicas closer to South Asia',
          'Increase the DNS TTL to 7 days',
          'Convert all POST endpoints to synchronous GET calls',
          'Remove HTTPS and revert to plain HTTP'
        ],
        correctOption: 0,
        explanation: 'Dynamic API calls are limited by the physical speed of light over fiber optic cables. Deploying edge compute runtimes (or regional database replicas) physically close to users minimizes round-trip time (RTT).',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-05',
        type: 'code-reading',
        question: 'Review the following curl command output. What does the "strict-transport-security" header enforce?',
        codeSnippet: `HTTP/2 200
content-type: text/html
strict-transport-security: max-age=63072000; includeSubDomains; preload`,
        options: [
          'It instructs browsers to automatically convert all future HTTP requests to HTTPS for the next 2 years',
          'It forces the client to download a client-side digital identity certificate',
          'It prevents cross-site script tags from executing in the DOM',
          'It limits server requests to authorized IP subnets only'
        ],
        correctOption: 0,
        explanation: 'HSTS (HTTP Strict Transport Security) forces compliant browsers to interact with the host strictly through HTTPS, preventing SSL stripping man-in-the-middle attacks.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-06',
        type: 'architecture',
        question: 'In the Critical Rendering Path, what is the precise relationship between the DOM, CSSOM, and Render Tree?',
        options: [
          'The Render Tree contains all DOM nodes regardless of display: none styling',
          'The Render Tree combines visible DOM nodes with calculated CSSOM rules, omitting elements with display: none and <head> tags',
          'The CSSOM is constructed only after the full JavaScript bundle has been executed',
          'The browser paints pixels before building the CSSOM'
        ],
        correctOption: 1,
        explanation: 'The Render Tree only captures nodes required to produce visible pixels on screen; elements styled display: none and invisible metadata elements (<meta>, <script>) are excluded.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-07',
        type: 'conceptual',
        question: 'What is the crucial difference between HTTP/1.1 pipelining and HTTP/2 multiplexing?',
        options: [
          'HTTP/1.1 suffers from Head-of-Line blocking where one slow request blocks subsequent responses on the TCP connection; HTTP/2 multiplexes interleaved binary frames over a single TCP stream',
          'HTTP/1.1 uses binary frames while HTTP/2 uses plaintext ASCII strings',
          'HTTP/2 requires opening a separate TCP connection for every single asset file',
          'HTTP/2 does not support caching or cookie headers'
        ],
        correctOption: 0,
        explanation: 'HTTP/2 breaks requests and responses into independent binary frames and interleaves them over a single persistent TCP connection, eliminating application Head-of-Line blocking.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-08',
        type: 'debugging',
        question: 'An API call made via browser fetch fails with "CORS error: No \'Access-Control-Allow-Origin\' header is present". What is the correct server-side fix?',
        options: [
          'Disable browser security flags in all user client browsers',
          'Configure the backend server to respond with Access-Control-Allow-Origin matching the client origin (or allowlist) on the response, and handle OPTIONS preflight',
          'Switch the API request method from GET to POST',
          'Rename the domain name to match the server IP'
        ],
        correctOption: 1,
        explanation: 'CORS is a browser security enforcement. The server hosting the resource must declare which origins are authorized via the Access-Control-Allow-Origin header.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-09',
        type: 'scenario',
        question: 'Why should sensitive user registration logic and password validation always be executed on the backend server even if frontend JavaScript validates it first?',
        options: [
          'Because client-side validation can be easily bypassed by disabling JavaScript, modifying client code, or sending raw HTTP requests via curl/Postman',
          'Because client browsers cannot evaluate regular expressions',
          'Because server validation is required to set CSS focus borders',
          'Because client-side validation increases server database load'
        ],
        correctOption: 0,
        explanation: 'The client environment is inherently untrusted and user-controlled. Frontend validation improves user experience, but only server-side validation guarantees security and data integrity.',
        skill: 'Web Fundamentals',
        points: 10
      },
      {
        id: 'q-web-10',
        type: 'conceptual',
        question: 'During DNS resolution, what is the role of the Authoritative Name Server?',
        options: [
          'It holds the definitive DNS records (A, CNAME) for the specific domain and provides the final IP mapping to the recursive resolver',
          'It is the local Wi-Fi router that assigns private 192.168.x.x addresses',
          'It executes SSL encryption handshakes for incoming packets',
          'It compresses images on the fly before browser download'
        ],
        correctOption: 0,
        explanation: 'The Authoritative Name Server is the ultimate source of truth for a domain’s DNS records, providing the exact IP address to the recursive resolver.',
        skill: 'Web Fundamentals',
        points: 10
      }
    ]
  },

  // -------------------------------------------------------------------------
  // ASSESSMENT 02: JAVASCRIPT & ASYNC PROGRAMMING
  // -------------------------------------------------------------------------
  {
    id: 'ass-mod-03',
    moduleId: 'mod-03',
    title: 'JavaScript & Asynchronous Programming Assessment',
    description: 'Rigorous assessment of JavaScript language semantics, lexical scopes, closures, prototype chain, Promises, Event Loop, and async error recovery.',
    skill: 'JavaScript',
    skills: ['JavaScript', 'Async Programming', 'Debugging'],
    durationMinutes: 35,
    passingScore: 75,
    questions: [
      {
        id: 'q-js-01',
        type: 'output-prediction',
        question: 'What is the exact console output order of the following JavaScript snippet?',
        codeSnippet: `console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

queueMicrotask(() => console.log('D'));

console.log('E');`,
        options: [
          'A -> B -> C -> D -> E',
          'A -> E -> C -> D -> B',
          'A -> E -> B -> C -> D',
          'C -> D -> A -> E -> B'
        ],
        correctOption: 1,
        explanation: 'Synchronous execution (A, E) runs first. Then all queued microtasks (Promise callback C, queueMicrotask callback D) execute before macrotasks (setTimeout B).',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-02',
        type: 'code-reading',
        question: 'What does the following function return when invoked with makeCounter()() twice?',
        codeSnippet: `function makeCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}
const c1 = makeCounter();
console.log(c1());
console.log(c1());`,
        options: [
          '0 then 1',
          '1 then 2',
          '1 then 1',
          'undefined then undefined'
        ],
        correctOption: 1,
        explanation: 'The returned function closes over the private variable `count`. Each call increments count in the closure lexical environment, returning 1 then 2.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-03',
        type: 'debugging',
        question: 'Identify the bug in this asynchronous retry loop:',
        codeSnippet: `async function retryOperation(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return fn(); // BUG HERE
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
}`,
        options: [
          'Missing await before fn(): returning a pending promise directly exits the try block without catching async rejections inside the loop',
          'for loops cannot be used inside async functions',
          'retries must be declared as a const variable',
          'The catch block must return null'
        ],
        correctOption: 0,
        explanation: 'Without `await fn()`, the function returns the pending promise immediately. If that promise rejects later, the catch block in the current execution frame is already gone, causing an unhandled rejection.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-04',
        type: 'conceptual',
        question: 'What is the key difference between Object.freeze() and const variable declaration?',
        options: [
          'const prevents re-assigning the variable identifier; Object.freeze prevents mutating the object’s existing properties shallowly',
          'const freezes deeply nested objects; Object.freeze only works on numbers',
          'Object.freeze causes variables to be garbage collected immediately',
          'There is no difference'
        ],
        correctOption: 0,
        explanation: 'const only makes the variable binding immutable (cannot do obj = otherObj). Object.freeze makes the properties of the object read-only.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-05',
        type: 'output-prediction',
        question: 'What will be logged to the console by the following code?',
        codeSnippet: `const numbers = [10, 20, 30];
const [a, ...rest] = numbers;
console.log(rest.map(n => n / 2));`,
        options: [
          '[5, 10, 15]',
          '[10, 15]',
          '[20, 30]',
          'NaN'
        ],
        correctOption: 1,
        explanation: 'Array destructuring assigns 10 to a, and the remaining array [20, 30] to rest. Mapping over rest dividing by 2 results in [10, 15].',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-06',
        type: 'scenario',
        question: 'You need to fetch user profiles for 50 student IDs. Running 50 sequential awaits takes 10 seconds. What is the optimal pattern?',
        options: [
          'Use Promise.all() or p-limit concurrency pooling to fetch items in parallel up to a reasonable concurrency threshold (e.g. 5 concurrent)',
          'Wrap all calls in while(true) loops',
          'Replace fetch with document.write',
          'Execute all calls synchronously on the main thread'
        ],
        correctOption: 0,
        explanation: 'Promise.all or bounded concurrency pooling executes requests in parallel, dropping total latency from the sum of all requests to the duration of the slowest batch.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-07',
        type: 'code-reading',
        question: 'What is the behavior of the nullish coalescing operator (??) in this expression?',
        codeSnippet: `const candidateScore = 0;
const finalRating = candidateScore ?? 75;
console.log(finalRating);`,
        options: [
          '75 because 0 is falsy',
          '0 because 0 is neither null nor undefined',
          'undefined',
          'NaN'
        ],
        correctOption: 1,
        explanation: 'The nullish coalescing operator (??) only falls back to the right-hand operand if the left operand is strictly `null` or `undefined`. Because 0 is a defined number, it returns 0.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-08',
        type: 'debugging',
        question: 'Why does this code cause a memory leak in a long-running web application?',
        codeSnippet: `let activeListeners = [];
function bindTelemetry() {
  const largeDataset = new Array(1000000).fill('SEVA');
  window.addEventListener('resize', () => {
    console.log(largeDataset.length);
  });
}`,
        options: [
          'The window resize event listener retains a permanent closure reference to largeDataset, preventing the garbage collector from freeing memory',
          'JavaScript arrays cannot hold more than 100 elements',
          'The arrow function throws an unhandled exception',
          'resize events automatically clear memory heaps'
        ],
        correctOption: 0,
        explanation: 'Global event listeners on `window` persist indefinitely. Because the listener callback references `largeDataset`, that entire 1,000,000 element array cannot be garbage-collected.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-09',
        type: 'conceptual',
        question: 'How does arrow function syntax (() => {}) differ from traditional function declarations regarding the `this` keyword?',
        options: [
          'Arrow functions do not bind their own `this`; they capture the `this` value of the enclosing lexical execution context',
          'Arrow functions always set `this` to undefined in strict mode',
          'Arrow functions can be used as constructors with the `new` keyword',
          'Traditional functions cannot access arguments'
        ],
        correctOption: 0,
        explanation: 'Arrow functions have lexical `this` binding. They retain the `this` value from the scope in which they were created, making them ideal for callback functions.',
        skill: 'JavaScript',
        points: 10
      },
      {
        id: 'q-js-10',
        type: 'architecture',
        question: 'When designing a module for both browser and Node.js environments, why is standard ES Modules (import/export) superior to CommonJS (require)?',
        options: [
          'ES Modules are statically analyzable at build time, enabling bundlers to eliminate unused code via tree-shaking and support asynchronous chunk loading',
          'CommonJS runs faster in Chrome browsers',
          'ES Modules cannot be compiled by Vite or Webpack',
          'CommonJS prevents cyclical dependencies while ESM does not'
        ],
        correctOption: 0,
        explanation: 'Static import syntax allows modern build tools to trace the exact abstract syntax tree (AST) and discard dead/unexported code, dramatically decreasing client bundle size.',
        skill: 'JavaScript',
        points: 10
      }
    ]
  },

  // -------------------------------------------------------------------------
  // ASSESSMENT 03: REACT COMPONENT ARCHITECTURE
  // -------------------------------------------------------------------------
  {
    id: 'ass-mod-05',
    moduleId: 'mod-05',
    title: 'React Component Architecture Assessment',
    description: 'Evaluation of component composition, hook rules, state reconciliation, performance optimization, and custom hook abstractions.',
    skill: 'React',
    skills: ['React', 'Frontend'],
    durationMinutes: 30,
    passingScore: 75,
    questions: [
      {
        id: 'q-react-01',
        type: 'conceptual',
        question: 'Why must React state never be mutated directly (e.g. state.push(item))?',
        options: [
          'Direct mutations do not create a new object reference, causing React’s shallow comparison reconciliation to miss state updates and fail to re-render',
          'Direct mutation throws a native syntax error in JavaScript',
          'Direct mutations automatically delete all child components',
          'React converts arrays to strings during mutations'
        ],
        correctOption: 0,
        explanation: 'React compares previous and next state using shallow reference equality (`Object.is`). Mutating an existing array in place leaves the reference unchanged, so React assumes nothing changed.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-02',
        type: 'debugging',
        question: 'What is the bug in this React component causing an infinite re-render loop?',
        codeSnippet: `function EvidenceCounter({ studentId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData(studentId).then(res => setData(res));
  }); // Note dependency array

  return <div>Items: {data.length}</div>;
}`,
        options: [
          'The useEffect hook lacks a dependency array, so every setData call triggers a re-render, which immediately re-executes the effect in an infinite loop',
          'fetchData cannot be called inside useEffect',
          'setData must be called synchronously',
          'Component cannot render numbers'
        ],
        correctOption: 0,
        explanation: 'Omitting the dependency array causes useEffect to run after EVERY render. Setting state inside it triggers another render, creating an infinite loop. It should be `[studentId]`.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-03',
        type: 'code-reading',
        question: 'What is the purpose of returning a function from inside a useEffect hook?',
        codeSnippet: `useEffect(() => {
  const timer = setInterval(pollServer, 5000);
  return () => clearInterval(timer);
}, []);`,
        options: [
          'It defines the cleanup function executed when the component unmounts or before the effect re-runs',
          'It triggers a synchronous child component mount',
          'It enables server-side rendering for the timer',
          'It forces the browser to garbage-collect the DOM'
        ],
        correctOption: 0,
        explanation: 'The cleanup function is called when the component is unmounted or before the effect runs again, preventing memory leaks, duplicate subscriptions, and zombie interval timers.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-04',
        type: 'scenario',
        question: 'When rendering a dynamic list that allows users to reorder, delete, and insert items, why should you avoid using the array index as the `key` prop?',
        options: [
          'Indices change when items are inserted or removed, causing React to mismatch component internal state with wrong DOM nodes during reconciliation',
          'Array indices cannot be converted to strings in JSX',
          'Using numbers as keys throws a compiler error in Vite',
          'It disables CSS flexbox styling'
        ],
        correctOption: 0,
        explanation: 'If an item at index 0 is deleted, the item originally at index 1 now has index 0. React reuses the existing DOM node associated with key 0, leading to visual bugs and corrupted form input values.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-05',
        type: 'output-prediction',
        question: 'What will happen when a user clicks the button once?',
        codeSnippet: `function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}`,
        options: [
          'The rendered count will become 1 because all three setters read the stale count value (0) from the current render closure',
          'The rendered count will become 3',
          'The component will crash with a CallStackOverflow',
          'The count will remain 0'
        ],
        correctOption: 0,
        explanation: 'Because count is 0 in the current execution closure, each call resolves to `setCount(0 + 1)`. To increment three times, use the functional updater form `setCount(prev => prev + 1)`.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-06',
        type: 'architecture',
        question: 'What architectural principle dictates when state should be "lifted up" in React?',
        options: [
          'When two or more sibling components need access to the same state, lift that state to their closest common ancestor',
          'All application state should always be stored in the root App component',
          'State should only ever exist inside custom hooks',
          'Presentational components should manage all network state'
        ],
        correctOption: 0,
        explanation: 'Lifting state up to the closest common ancestor allows multiple child components to share and coordinate state via props while maintaining clean unidirectional data flow.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-07',
        type: 'conceptual',
        question: 'What are the two fundamental Rules of Hooks in React?',
        options: [
          'Only call hooks at the top level of your component (not in loops, conditions, or nested functions), and only call hooks from React function components or custom hooks',
          'Hooks must only be called inside class components, and hooks must return promises',
          'Hooks must always have async prefixes, and hooks cannot accept arguments',
          'Hooks must be registered in package.json'
        ],
        correctOption: 0,
        explanation: 'React relies on the call order of hooks remaining identical between renders to track state and effect indices. Conditional hooks break this ordering.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-08',
        type: 'debugging',
        question: 'How can you fix this component to avoid re-calculating an expensive 100,000-element sort on unrelated prop updates?',
        codeSnippet: `function Leaderboard({ candidates, filterText }) {
  // Expensive calculation runs on every render:
  const sorted = candidates.sort((a, b) => b.score - a.score);
  return <div>...</div>;
}`,
        options: [
          'Wrap the sort computation in useMemo with `[candidates]` as dependencies, and copy the array before sorting to avoid in-place mutation',
          'Move the calculation into a setTimeout callback',
          'Replace React with jQuery',
          'Remove the candidates prop'
        ],
        correctOption: 0,
        explanation: '`useMemo(() => [...candidates].sort(...), [candidates])` caches the sorted result, only re-computing when the candidates array reference changes, while `[...candidates]` prevents mutating the original array.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-09',
        type: 'scenario',
        question: 'You want to build a reusable dropdown menu with <Menu>, <Menu.Button>, and <Menu.Items>. Which React pattern achieves this cleanly?',
        options: [
          'The Compound Components pattern using React Context to share state implicitly among children',
          'Passing 20 props manually to every single component',
          'Writing inline script tags inside the JSX body',
          'Using global document.querySelectorAll'
        ],
        correctOption: 0,
        explanation: 'Compound Components provide an expressive, declarative API where parent and child components communicate state seamlessly via internal Context.',
        skill: 'React',
        points: 10
      },
      {
        id: 'q-react-10',
        type: 'code-reading',
        question: 'What is the key benefit of custom hooks in React development?',
        options: [
          'They allow extracting and reusing stateful business logic across different components without altering component hierarchy',
          'They share identical state values across all components globally',
          'They replace the need for CSS styling',
          'They execute on the backend server automatically'
        ],
        correctOption: 0,
        explanation: 'Custom hooks package state and side-effect logic (like useLocalStorage or useAuth) into modular functions that any component can consume independently.',
        skill: 'React',
        points: 10
      }
    ]
  },

  // -------------------------------------------------------------------------
  // ASSESSMENT 04: DATABASES, REST APIS & SECURITY
  // -------------------------------------------------------------------------
  {
    id: 'ass-mod-08',
    moduleId: 'mod-08',
    title: 'Backend, Databases & Security Assessment',
    description: 'Advanced assessment covering relational schema design, SQL optimization, RESTful API contracts, JWT authentication, and cybersecurity vulnerability prevention.',
    skill: 'Backend Development',
    skills: ['SQL', 'REST API', 'Authentication', 'Security'],
    durationMinutes: 35,
    passingScore: 75,
    questions: [
      {
        id: 'q-back-01',
        type: 'debugging',
        question: 'Audit this Node.js Express route. What critical security vulnerability exists?',
        codeSnippet: `app.get('/api/users', async (req, res) => {
  const { role } = req.query;
  const sql = "SELECT * FROM users WHERE role = '" + role + "'";
  const results = await db.query(sql);
  res.json(results.rows);
});`,
        options: [
          'SQL Injection: The role query parameter is concatenated directly into the SQL string without parameterized query variables',
          'The route should use HTTP POST instead of GET',
          'res.json cannot accept rows',
          'Async/await is not supported in Express handlers'
        ],
        correctOption: 0,
        explanation: 'Direct string concatenation allows an attacker to supply a payload like `admin\' OR \'1\'=\'1`, bypassing checks and dumping the entire database. It must use parameterized placeholders: `$1`.',
        skill: 'Security',
        points: 10
      },
      {
        id: 'q-back-02',
        type: 'conceptual',
        question: 'What is the difference between an INNER JOIN and a LEFT JOIN in PostgreSQL?',
        options: [
          'INNER JOIN only returns rows where the join condition matches in both tables; LEFT JOIN returns all rows from the left table even if no matching row exists on the right',
          'LEFT JOIN deletes rows from the right table',
          'INNER JOIN only works on integer primary keys',
          'There is no functional difference'
        ],
        correctOption: 0,
        explanation: 'LEFT JOIN preserves every record from the left table, populating NULL values for right-table columns when no relationship exists.',
        skill: 'SQL',
        points: 10
      },
      {
        id: 'q-back-03',
        type: 'architecture',
        question: 'Why is an ACID transaction mandatory when transferring money between two bank accounts or awarding a verified Skill Passport with credit deduction?',
        options: [
          'Atomicity ensures that both the deduction and credit succeed together; if an error occurs mid-way, ROLLBACK restores both accounts to their original state',
          'Transactions make queries run without network encryption',
          'Transactions bypass database constraints',
          'Transactions are only required for MongoDB'
        ],
        correctOption: 0,
        explanation: 'ACID guarantees that multi-step state modifications are all-or-nothing (Atomicity), preventing partial corruptions where money is debited from one party without crediting the other.',
        skill: 'SQL',
        points: 10
      },
      {
        id: 'q-back-04',
        type: 'code-reading',
        question: 'What does the bcrypt.hash(password, 12) function do during candidate registration?',
        options: [
          'Generates a unique cryptographic salt and iteratively computes an adaptive one-way hash using a work factor of 12 (4096 rounds)',
          'Encrypts the password with a reversible AES key',
          'Stores the password in browser localStorage',
          'Sends the password in plaintext to an external authentication server'
        ],
        correctOption: 0,
        explanation: 'Bcrypt is an adaptive one-way cryptographic hash. The salt rounds (12) govern computation difficulty, rendering brute-force cracking attempts mathematically infeasible.',
        skill: 'Authentication',
        points: 10
      },
      {
        id: 'q-back-05',
        type: 'scenario',
        question: 'An e-commerce API has 10,000 requests/sec. Product queries are slowing down because PostgreSQL is scanning the entire 5,000,000 row products table. What is the immediate optimization?',
        options: [
          'Create a B-tree index on the queried columns (e.g. category_id, status) and inspect query plans using EXPLAIN ANALYZE',
          'Drop the database and recreate it',
          'Remove all foreign keys',
          'Convert the database to a flat JSON file on disk'
        ],
        correctOption: 0,
        explanation: 'A B-tree index transforms a sequential table scan of O(N) complexity into an index scan of O(log N) complexity, reducing disk reads from millions of pages to single-digit lookups.',
        skill: 'SQL',
        points: 10
      },
      {
        id: 'q-back-06',
        type: 'conceptual',
        question: 'Why should JSON Web Tokens (JWTs) have a short expiration time (e.g. 15 minutes) coupled with refresh tokens stored in HttpOnly cookies?',
        options: [
          'Because JWTs are stateless and cannot be easily revoked before expiration; short lifetimes minimize the window of vulnerability if a token is intercepted',
          'Because JWT signatures automatically delete after 15 minutes',
          'Because browsers delete JWTs when the screen sleeps',
          'Because Node.js cannot store tokens longer than 15 minutes'
        ],
        correctOption: 0,
        explanation: 'Stateless access tokens cannot be revoked without maintaining a centralized blocklist. Short lifespans limit the window of risk, while HttpOnly refresh tokens protect against XSS token theft.',
        skill: 'Security',
        points: 10
      },
      {
        id: 'q-back-07',
        type: 'output-prediction',
        question: 'What HTTP status code should be returned when a valid authenticated user attempts to delete another user’s Skill Passport record without administrative permissions?',
        options: [
          '403 Forbidden',
          '401 Unauthorized',
          '200 OK',
          '500 Internal Server Error'
        ],
        correctOption: 0,
        explanation: 'The user is successfully authenticated, but lacks permission to access the target resource. The correct status is 403 Forbidden. (401 is for unauthenticated callers).',
        skill: 'REST API',
        points: 10
      },
      {
        id: 'q-back-08',
        type: 'debugging',
        question: 'How do you prevent Cross-Site Scripting (XSS) when rendering user-submitted HTML biographies on a student profile page?',
        options: [
          'Sanitize user HTML using a trusted library like DOMPurify before rendering, or rely on React’s default text escaping in standard JSX',
          'Use document.write to output raw tags',
          'Store the HTML in cookies',
          'Disable browser cookies'
        ],
        correctOption: 0,
        explanation: 'DOMPurify strips malicious scripts, event handlers (onload, onerror), and untrusted protocols, leaving harmless semantic markup.',
        skill: 'Security',
        points: 10
      },
      {
        id: 'q-back-09',
        type: 'architecture',
        question: 'Why is Cursor-based pagination superior to Offset-based pagination (LIMIT / OFFSET) for high-velocity datasets?',
        options: [
          'Offset pagination scans and discards all preceding rows on every query, degrading to O(N) latency at high page numbers; cursor pagination jumps directly to the indexed cursor boundary in O(log N)',
          'Cursor pagination does not require SQL indexes',
          'Offset pagination is deprecated in SQL standards',
          'Cursor pagination only works on MongoDB'
        ],
        correctOption: 0,
        explanation: 'With `OFFSET 100000`, the database engine must still retrieve and discard 100,000 rows. Cursor pagination uses `WHERE id > last_seen_id ORDER BY id LIMIT 20`, leveraging indexes directly.',
        skill: 'Database Design',
        points: 10
      },
      {
        id: 'q-back-10',
        type: 'conceptual',
        question: 'What is the purpose of the ON DELETE CASCADE constraint on a foreign key relationship?',
        options: [
          'When a parent row is deleted, the database automatically deletes all referencing child rows, preventing orphaned records and foreign key constraint violations',
          'It prevents parent rows from ever being deleted',
          'It creates an automatic backup in a separate table',
          'It cascades CSS styles to child DOM nodes'
        ],
        correctOption: 0,
        explanation: 'ON DELETE CASCADE enforces referential integrity by automatically cleaning up dependent child records (such as a student’s evidence items) whenever the parent record is deleted.',
        skill: 'SQL',
        points: 10
      }
    ]
  }
];
