import { Project, WeeklyUpdate, TimelineEntry } from './types';

export const projects: Project[] = [
    {
        id: 1, name: 'PixelForge',
        tagline: 'Browser-based pixel art editor with real-time collaboration',
        description: 'A full-featured pixel art editor running entirely in the browser. Supports layers, animation frames, custom palettes, and real-time multiplayer editing via WebSockets. Built to prove that web-based creative tools can match native apps in capability and performance.',
        status: 'Shipped', category: 'Tool',
        stack: ['Canvas API', 'WebSockets', 'Node.js', 'PostgreSQL'],
        startDate: '2024-08-12', shipDate: '2024-11-20',
        screenshot: 'https://picsum.photos/seed/pixelforge22/800/500.jpg',
        visitors: 12400, stars: 342,
        lessons: [
            'WebSocket connection management at scale requires careful backpressure handling — naive implementations buckle under 50+ concurrent editors.',
            'Canvas compositing operations have surprising performance characteristics across browsers. Firefox handles multiply blending differently than Chrome.',
            'Adding a guided onboarding flow reduced bounce rate by 40%. First impression matters even for developer tools.'
        ],
        updates: [
            { week: '2024-W47', changes: [
                { type: 'added', text: 'Custom palette import/export (PAL, ACT, JSON)' },
                { type: 'fixed', text: 'Undo stack corruption on rapid successive actions' },
                { type: 'added', text: 'Grid overlay with customizable cell size' }
            ]},
            { week: '2024-W48', changes: [
                { type: 'added', text: 'Layer blending modes (multiply, screen, overlay)' },
                { type: 'changed', text: 'Toolbar layout reorganized for tablet viewports' },
                { type: 'fixed', text: 'Memory leak in animation frame preview loop' }
            ]}
        ]
    },
    {
        id: 2, name: 'VaultCLI',
        tagline: 'Encrypted secret management for dev teams from the terminal',
        description: 'A command-line tool for managing encrypted secrets across environments. Integrates with CI/CD pipelines, supports team sharing via asymmetric encryption, and stores everything locally or in your own S3 bucket. Zero SaaS dependency.',
        status: 'Shipped', category: 'Tool',
        stack: ['Rust', 'AES-256-GCM', 'S3 API', 'Shell'],
        startDate: '2024-06-01', shipDate: '2024-09-15',
        screenshot: 'https://picsum.photos/seed/vaultcli44/800/500.jpg',
        visitors: 8900, stars: 567,
        lessons: [
            'Rust error handling verbosity pays off in production — caught 3 edge cases at compile time that would have been runtime panics in Go.',
            'CLI UX is massively underestimated: good help text, shell completions, and consistent flag naming made adoption 3x faster.',
            'AES-GCM with proper key rotation strategy is non-trivial. Most tutorials skip the rotation part entirely.'
        ]
    },
    {
        id: 3, name: 'NeuralSketch',
        tagline: 'Turn rough sketches into functional UI components',
        description: 'An experimental tool that uses computer vision to interpret hand-drawn wireframes and generates corresponding HTML/CSS components. Currently supports layouts, buttons, forms, and navigation patterns. Running a small closed beta with 340 waitlist signups.',
        status: 'In Progress', category: 'App',
        stack: ['Python', 'ONNX Runtime', 'React', 'FastAPI'],
        startDate: '2024-10-01', shipDate: null,
        screenshot: 'https://picsum.photos/seed/neuralsketch7/800/500.jpg',
        visitors: 5200, stars: 189,
        lessons: [
            'Users draw in wildly different styles — normalization is the hardest problem, not the recognition itself.',
            'Generating "good enough" code is easy; generating maintainable, semantic code is still a research problem.',
            'Latency under 2 seconds is the threshold where users stop treating it as a gimmick and start relying on it.'
        ]
    },
    {
        id: 4, name: 'CacheLayer',
        tagline: 'Zero-config caching layer for Node.js HTTP services',
        description: 'A drop-in middleware that adds intelligent caching to any Express or Fastify app. Uses content-based cache keys, supports stale-while-revalidate, and includes a real-time dashboard for cache hit rate monitoring.',
        status: 'Shipped', category: 'Library',
        stack: ['Node.js', 'Redis', 'Express', 'WebSocket'],
        startDate: '2024-04-10', shipDate: '2024-07-22',
        screenshot: 'https://picsum.photos/seed/cachelayer9/800/500.jpg',
        visitors: 15600, stars: 891,
        lessons: [
            'Cache invalidation is indeed one of the two hard problems. Tag-based purging saved us from key-explosion.',
            'Stale-while-revalidate pattern dramatically improves perceived performance without sacrificing consistency.',
            'Open source growth correlates with quality of README and examples, not quality of implementation code.'
        ]
    },
    {
        id: 5, name: 'DataPipe',
        tagline: 'Visual ETL pipeline builder with auto-scheduling',
        description: 'An experiment in making data transformation accessible without writing code. Drag-and-drop pipeline builder that generates optimized SQL, supports cron scheduling, and includes built-in data profiling. Still exploring product-market fit.',
        status: 'Experiment', category: 'Tool',
        stack: ['Svelte', 'DuckDB', 'Go', 'CRON'],
        startDate: '2024-11-05', shipDate: null,
        screenshot: 'https://picsum.photos/seed/datapipe3/800/500.jpg',
        visitors: 1800, stars: 45,
        lessons: [
            'No-code tools need code escape hatches — users always hit a complexity wall eventually.',
            'DuckDB in the browser is surprisingly capable for datasets under 100MB. Game changer for client-side analytics.',
            'Visual programming paradigms struggle with complex branching logic. Spaghetti diagrams are real.'
        ]
    },
    {
        id: 6, name: 'FormCraft',
        tagline: 'Schema-driven dynamic form generation with validation',
        description: 'A library that takes a JSON schema and produces fully validated, accessible forms. Supports conditional fields, custom widgets, async validation, and produces clean form state objects. Built for internal tooling at first, now being generalized.',
        status: 'In Progress', category: 'Library',
        stack: ['TypeScript', 'React', 'Zod', 'CSS Modules'],
        startDate: '2024-09-20', shipDate: null,
        screenshot: 'https://picsum.photos/seed/formcraft5/800/500.jpg',
        visitors: 3100, stars: 124,
        lessons: [
            'Zod schemas as the single source of truth eliminated 90% of form-related bugs in our internal tools.',
            'Accessibility in dynamic forms requires explicit ARIA management — React\'s implicit semantics miss edge cases with conditional fields.',
            'Array field manipulation (add/remove/reorder) is the most complex UI pattern in form builders. Budget extra time for it.'
        ]
    },
    {
        id: 7, name: 'DotGrid',
        tagline: 'Interactive CSS Grid layout visualizer and code generator',
        description: 'A visual tool for designing CSS Grid layouts. Drag to create grid areas, set properties visually, and export clean, production-ready CSS code. Includes a gallery of common layout patterns. Built entirely in a single weekend.',
        status: 'Shipped', category: 'Tool',
        stack: ['Vanilla JS', 'CSS Grid', 'LocalStorage'],
        startDate: '2024-05-18', shipDate: '2024-05-20',
        screenshot: 'https://picsum.photos/seed/dotgrid11/800/500.jpg',
        visitors: 22100, stars: 1203,
        lessons: [
            'Weekend projects can have outsized impact if they solve a real, specific pain point. DotGrid took 48 hours.',
            'No build step = faster iteration and dramatically easier community contributions.',
            'SEO for dev tools is dominated by broad head terms. Long-tail keywords like "css grid area visualizer" are the real opportunity.'
        ]
    },
    {
        id: 8, name: 'APIForge',
        tagline: 'REST API scaffolding with auto-generated docs and tests',
        description: 'A CLI tool that generates a complete REST API from a YAML spec: routes, middleware, validation, OpenAPI docs, and integration tests. Supported Express and Fastify targets. Deprecated in favor of tRPC and type-safe API patterns.',
        status: 'Archived', category: 'Tool',
        stack: ['Node.js', 'Handlebars', 'Jest', 'OpenAPI'],
        startDate: '2024-02-01', shipDate: '2024-04-15',
        screenshot: 'https://picsum.photos/seed/apiforge8/800/500.jpg',
        visitors: 6700, stars: 234,
        lessons: [
            'Code generation tools age poorly — generated code becomes legacy the moment the generator stops being maintained.',
            'The tRPC and GraphQL shift reduced demand for REST scaffolding significantly. Read the ecosystem signals earlier.',
            'Archiving a project honestly with a clear explanation is better than letting it linger with false promises of updates.'
        ]
    }
];

export const weeklyUpdates: WeeklyUpdate[] = [
    { week: '2024-W50', dateRange: 'Dec 9 – Dec 15, 2024', projectId: 3, projectName: 'NeuralSketch', changes: [
        { type: 'added', text: 'Support for form element recognition (inputs, selects, textareas)' },
        { type: 'changed', text: 'Inference pipeline restructured for 40% faster processing' },
        { type: 'fixed', text: 'Canvas scaling issue on high-DPI displays' },
        { type: 'added', text: 'Beta waitlist integration — now at 340 signups' }
    ]},
    { week: '2024-W49', dateRange: 'Dec 2 – Dec 8, 2024', projectId: 6, projectName: 'FormCraft', changes: [
        { type: 'added', text: 'Conditional field visibility based on sibling values' },
        { type: 'added', text: 'Custom widget registry for extending field types' },
        { type: 'changed', text: 'Migration from Yup to Zod for schema validation' },
        { type: 'fixed', text: 'Focus trap not releasing on nested form dismissal' }
    ]},
    { week: '2024-W48', dateRange: 'Nov 25 – Dec 1, 2024', projectId: 1, projectName: 'PixelForge', changes: [
        { type: 'added', text: 'Layer blending modes (multiply, screen, overlay)' },
        { type: 'changed', text: 'Toolbar layout reorganized for tablet viewports' },
        { type: 'fixed', text: 'Memory leak in animation frame preview loop' }
    ]},
    { week: '2024-W47', dateRange: 'Nov 18 – Nov 24, 2024', projectId: 5, projectName: 'DataPipe', changes: [
        { type: 'added', text: 'Drag-and-drop node connection UI' },
        { type: 'added', text: 'Built-in data profiler showing column statistics' },
        { type: 'changed', text: 'Switched from SQLite to DuckDB for in-browser queries' },
        { type: 'fixed', text: 'Pipeline DAG validation missing cycle detection' }
    ]},
    { week: '2024-W46', dateRange: 'Nov 11 – Nov 17, 2024', projectId: 1, projectName: 'PixelForge', changes: [
        { type: 'added', text: 'Custom palette import/export (PAL, ACT, JSON formats)' },
        { type: 'fixed', text: 'Undo stack corruption on rapid successive actions' },
        { type: 'added', text: 'Grid overlay with customizable cell size' }
    ]},
    { week: '2024-W45', dateRange: 'Nov 4 – Nov 10, 2024', projectId: 3, projectName: 'NeuralSketch', changes: [
        { type: 'added', text: 'Initial model trained on 10k sketch-to-HTML pairs' },
        { type: 'added', text: 'Canvas drawing surface with pressure sensitivity' },
        { type: 'changed', text: 'Switched from TensorFlow to ONNX Runtime for 3x faster inference' }
    ]},
    { week: '2024-W44', dateRange: 'Oct 28 – Nov 3, 2024', projectId: 6, projectName: 'FormCraft', changes: [
        { type: 'added', text: 'Initial schema-to-form rendering engine' },
        { type: 'added', text: 'Built-in validators: email, url, min/max, pattern' },
        { type: 'added', text: 'Accessible form labels and error announcements via ARIA live regions' }
    ]},
    { week: '2024-W43', dateRange: 'Oct 21 – Oct 27, 2024', projectId: 1, projectName: 'PixelForge', changes: [
        { type: 'added', text: 'Multiplayer cursor presence indicators' },
        { type: 'fixed', text: 'WebSocket reconnection not restoring session state' },
        { type: 'changed', text: 'Reduced initial bundle size by 45% with code splitting' }
    ]}
];

export const timelineEntries: TimelineEntry[] = [
    { date: '2024-12-12', type: 'milestone', title: 'NeuralSketch beta waitlist hits 340', description: 'Growing interest validates the concept. Next step: improving recognition accuracy for complex nested layouts.', projectId: 3 },
    { date: '2024-12-08', type: 'update', title: 'FormCraft adds conditional fields', description: 'Fields can now show/hide based on sibling values. The most-requested feature from early internal testers.', projectId: 6 },
    { date: '2024-12-01', type: 'update', title: 'PixelForge layer blending ships', description: 'Multiply, screen, and overlay modes are now live. Took three weekends of deep-diving into Canvas compositing.', projectId: 1 },
    { date: '2024-11-25', type: 'update', title: 'DataPipe gets visual node editor', description: 'Drag-and-drop pipeline building is functional. Rough around the edges but the core interaction model works.', projectId: 5 },
    { date: '2024-11-20', type: 'shipped', title: 'PixelForge v1.0 ships', description: 'Three months of work, 47 commits, 12 late nights. The pixel art editor is live and accepting real users.', projectId: 1 },
    { date: '2024-11-15', type: 'update', title: 'NeuralSketch first model trained', description: '10k sketch-to-HTML pairs, 6 hours on a single GPU. Results are rough but promising for simple layouts.', projectId: 3 },
    { date: '2024-11-05', type: 'started', title: 'DataPipe experiment begins', description: 'Spiking on visual ETL concepts. If this works, it could replace a lot of ad-hoc Python scripts for data teams.', projectId: 5 },
    { date: '2024-10-20', type: 'milestone', title: 'DotGrid featured in JavaScript Weekly', description: 'Traffic spike: 2,200 visitors in one day. The weekend project that keeps giving.', projectId: 7 },
    { date: '2024-10-01', type: 'started', title: 'NeuralSketch project kicks off', description: 'The sketch-to-code idea has been bouncing around for months. Time to test if it\'s actually viable.', projectId: 3 },
    { date: '2024-09-20', type: 'started', title: 'FormCraft development starts', description: 'Internal tooling need turned into a potential open source library. Schema-driven forms to eliminate boilerplate.', projectId: 6 },
    { date: '2024-09-15', type: 'shipped', title: 'VaultCLI v1.0 released', description: 'Rust rewrite of an earlier Node.js prototype. Encrypted secrets management with zero SaaS dependency.', projectId: 2 },
    { date: '2024-07-22', type: 'shipped', title: 'CacheLayer goes open source', description: 'Drop-in caching middleware for Node.js. First real open source contribution that gained meaningful traction.', projectId: 4 },
    { date: '2024-05-20', type: 'shipped', title: 'DotGrid built in a weekend', description: 'From idea to deployed in 48 hours. A CSS Grid visualizer that generates clean, usable code.', projectId: 7 },
    { date: '2024-04-15', type: 'archived', title: 'APIForge archived', description: 'REST scaffolding demand dropped as the ecosystem moved toward type-safe APIs. Better to archive honestly.', projectId: 8 }
];
