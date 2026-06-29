// src/data/mock-data.js

export const mockAgents = [
  {
    agentId: 'dfy-lead-enricher',
    name: 'Lead Enricher',
    description: 'Build enriched B2B lead lists with intent scoring and outreach angles.',
    source: 'dfy',
    category: 'marketing',
    basicMcpSkills: [],
    externalMcps: ['zapier', 'make'],
    maxTokens: 32000,
    estimatedCost: 0.04,
    estimatedTimeMinutes: 3,
    requiredInputs: [
      { variable: 'company_name', label: 'Company Name', type: 'text', required: true },
      { variable: 'offer_summary', label: 'Offer Summary', type: 'text', required: false }
    ],
    instruction: {
      goal: 'Research target market and produce a qualified lead list.',
      outputRequirements: 'Create CSV and JSON outputs with contact details and intent score.',
      additionalContext: 'Prioritize VP+ decision makers with active buying signals.'
    }
  },
  {
    agentId: 'dfy-landing-page-builder',
    name: 'Landing Page Builder',
    description: 'Generate conversion-focused landing page copy and responsive HTML structure.',
    source: 'dfy',
    category: 'web',
    basicMcpSkills: ['create_image'],
    externalMcps: ['fal'],
    maxTokens: 36000,
    estimatedCost: 0.06,
    estimatedTimeMinutes: 4,
    requiredInputs: [
      { variable: 'offer_name', label: 'Offer Name', type: 'text', required: true },
      { variable: 'audience', label: 'Audience', type: 'text', required: true }
    ],
    instruction: {
      goal: 'Create a complete LP draft with persuasive sections and CTA hierarchy.',
      outputRequirements: 'Generate HTML and supporting copy notes.',
      additionalContext: 'Use social proof and urgency sections naturally.'
    }
  },
  {
    agentId: 'agent_custom_vsl',
    name: 'VSL Script Writer',
    description: 'Produces full video sales letter scripts with hooks, proof stack, and close.',
    source: 'custom',
    category: 'copywriting',
    basicMcpSkills: ['text_to_voice'],
    externalMcps: ['make'],
    maxTokens: 24000,
    estimatedCost: 0.03,
    estimatedTimeMinutes: 2,
    requiredInputs: [
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true },
      { variable: 'target_persona', label: 'Target Persona', type: 'text', required: true }
    ],
    instruction: {
      goal: 'Write a direct-response VSL script based on product and avatar.',
      outputRequirements: 'Return script in clear sections with timestamps.',
      additionalContext: 'Tone: confident, clear, benefit-driven.'
    }
  },
  {
    agentId: 'agent_clone_email_forge',
    name: 'Email Sequence Forge',
    description: 'Creates 7-day nurture and conversion email flows with subject variants.',
    source: 'cloned',
    category: 'email',
    basicMcpSkills: [],
    externalMcps: ['zapier'],
    maxTokens: 18000,
    estimatedCost: 0.02,
    estimatedTimeMinutes: 2,
    requiredInputs: [
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true },
      { variable: 'target_persona', label: 'Target Persona', type: 'text', required: true }
    ],
    instruction: {
      goal: 'Build nurture + CTA email cadence.',
      outputRequirements: 'Generate plain text sequence plus subject line table.',
      additionalContext: 'Keep each email concise and specific.'
    }
  }
];

export const mockDfyChains = [
  {
    chainId: 'dfy-chain-write-emails-with-banners',
    name: 'Write Emails With Banners',
    description: 'Create three product banners, then write affiliate HTML emails that use them.',
    source: 'dfy',
    category: 'affiliate',
    estimatedCost: 0.125,
    estimatedTimeMinutes: 8,
    tags: ['affiliate', 'banners', 'email'],
    requiredInputs: [
      { variable: 'product_url', label: 'Product URL', type: 'text', required: true },
      { variable: 'banner_goal', label: 'Banner Goal', type: 'text', required: false },
      { variable: 'affiliate_angle', label: 'Affiliate Angle', type: 'text', required: false }
    ],
    steps: [
      { agentId: 'dfy-banner-ad-creator', agentName: 'Create Banner Ad', overrides: null },
      { agentId: 'dfy-affiliate-emails', agentName: 'Write Affiliate Emails', overrides: null }
    ]
  },
  {
    chainId: 'dfy-chain-mini-funnel-pack',
    name: 'Mini Funnel Pack',
    description: 'Build a compact HTML sales page, then create affiliate promo emails.',
    source: 'dfy',
    category: 'funnel',
    estimatedCost: 0.08,
    estimatedTimeMinutes: 7,
    tags: ['sales-page', 'email', 'funnel'],
    requiredInputs: [
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true },
      { variable: 'product_description', label: 'Product Description', type: 'textarea', required: true },
      { variable: 'product_url', label: 'Product URL', type: 'text', required: false }
    ],
    steps: [
      { agentId: 'dfy-sales-page', agentName: 'Create Sales Page', overrides: null },
      { agentId: 'dfy-affiliate-emails', agentName: 'Write Affiliate Emails', overrides: null }
    ]
  },
  {
    chainId: 'dfy-chain-vsl-voiceover',
    name: 'VSL And Voiceover',
    description: 'Write a short VSL script, then convert it into voiceover audio.',
    source: 'dfy',
    category: 'video',
    estimatedCost: 0.065,
    estimatedTimeMinutes: 5,
    tags: ['vsl', 'voiceover', 'audio'],
    requiredInputs: [
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true },
      { variable: 'product_description', label: 'Product Description', type: 'text', required: true },
      { variable: 'target_audience', label: 'Target Audience', type: 'text', required: false },
      { variable: 'voice_id_or_style', label: 'Voice ID or Style', type: 'text', required: false }
    ],
    steps: [
      { agentId: 'dfy-vsl-script', agentName: 'Create VSL Script', overrides: null },
      { agentId: 'dfy-voiceover', agentName: 'Create Voiceover', overrides: null }
    ]
  },
  {
    chainId: 'dfy-chain-website-media-kit',
    name: 'Website Media Kit',
    description: 'Generate transparent media assets, then build a compact HTML sales page.',
    source: 'dfy',
    category: 'creative',
    estimatedCost: 0.165,
    estimatedTimeMinutes: 10,
    tags: ['media', 'sales-page', 'creative'],
    requiredInputs: [
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true },
      { variable: 'product_description', label: 'Product Description', type: 'textarea', required: true },
      { variable: 'brand_style', label: 'Brand Style', type: 'text', required: false }
    ],
    steps: [
      { agentId: 'dfy-website-media-images', agentName: 'Create Website Media Images', overrides: null },
      { agentId: 'dfy-sales-page', agentName: 'Create Sales Page', overrides: null }
    ]
  }
];

export const mockChains = [
  {
    chainId: 'chain_q4_launch',
    name: 'Q4 Launch Chain',
    description: 'Research -> Offer -> LP -> Email follow-up',
    estimatedCost: 0.145,
    estimatedTimeMinutes: 11,
    updatedAt: '2026-05-06T18:22:00Z',
    requiredInputs: [
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true },
      { variable: 'target_persona', label: 'Target Persona', type: 'text', required: true },
      { variable: 'offer_summary', label: 'Offer Summary', type: 'text', required: false }
    ],
    steps: [
      { agentId: 'dfy-lead-enricher', agentName: 'Lead Enricher', overrides: null },
      { agentId: 'agent_custom_vsl', agentName: 'VSL Script Writer', overrides: null },
      { agentId: 'dfy-landing-page-builder', agentName: 'Landing Page Builder', overrides: null },
      { agentId: 'agent_clone_email_forge', agentName: 'Email Sequence Forge', overrides: null }
    ]
  },
  {
    chainId: 'chain_seo_outbound',
    name: 'SEO to Outbound Sprint',
    description: 'Keyword mapping then cold outreach pack generation.',
    estimatedCost: 0.055,
    estimatedTimeMinutes: 5,
    updatedAt: '2026-05-05T15:03:00Z',
    requiredInputs: [
      { variable: 'niche', label: 'Niche', type: 'text', required: true },
      { variable: 'product_name', label: 'Product Name', type: 'text', required: true }
    ],
    steps: [
      { agentId: 'dfy-seo-keyword-mapper', agentName: 'SEO Keyword Mapper', overrides: null },
      { agentId: 'dfy-outbound-writer', agentName: 'Outbound Writer', overrides: null }
    ]
  }
];

export const mockRuns = [
  {
    runId: 'run_20260507_a1',
    type: 'chain',
    chainName: 'Q4 Launch Chain',
    status: 'running',
    startedAt: '2026-05-07T19:14:00Z',
    totalDuration: 146,
    totalCost: 0.018,
    failureSummary: null,
    finalOutputFiles: [],
    stepResults: [
      {
        stepNumber: 1,
        agentName: 'Lead Enricher',
        status: 'completed',
        responseText: 'Generated enriched lead list and intent scoring sheet.',
        durationSeconds: 74,
        outputFiles: [
          { filename: 'leads-enriched.csv', url: 'https://example.com/files/leads-enriched.csv' }
        ]
      },
      {
        stepNumber: 2,
        agentName: 'VSL Script Writer',
        status: 'running',
        responseText: '',
        durationSeconds: 72,
        outputFiles: []
      }
    ]
  },
  {
    runId: 'run_20260506_b2',
    type: 'block_test',
    agentName: 'Landing Page Builder',
    status: 'completed',
    startedAt: '2026-05-06T12:02:00Z',
    totalDuration: 198,
    totalCost: 0.041,
    failureSummary: null,
    finalOutputFiles: [
      { filename: 'landing-page.html', url: 'https://example.com/files/landing-page.html' },
      { filename: 'copy-outline.txt', url: 'https://example.com/files/copy-outline.txt' }
    ],
    stepResults: [
      {
        stepNumber: 1,
        agentName: 'Landing Page Builder',
        status: 'completed',
        responseText: 'Built LP sections and exported HTML draft.',
        durationSeconds: 198,
        outputFiles: [
          { filename: 'landing-page.html', url: 'https://example.com/files/landing-page.html' }
        ]
      }
    ]
  },
  {
    runId: 'run_20260505_c3',
    type: 'chain',
    chainName: 'SEO to Outbound Sprint',
    status: 'failed',
    startedAt: '2026-05-05T08:41:00Z',
    totalDuration: 121,
    totalCost: 0.021,
    failureSummary: 'Step 2 failed: Zapier MCP not configured',
    finalOutputFiles: [],
    stepResults: [
      {
        stepNumber: 1,
        agentName: 'SEO Keyword Mapper',
        status: 'completed',
        responseText: 'Cluster map generated.',
        durationSeconds: 58,
        outputFiles: [
          { filename: 'keyword-map.csv', url: 'https://example.com/files/keyword-map.csv' }
        ]
      },
      {
        stepNumber: 2,
        agentName: 'Outbound Writer',
        status: 'failed',
        responseText: '',
        durationSeconds: 63,
        outputFiles: []
      }
    ]
  }
];

export const mockProfile = {
  userId: 'mock_user_01',
  email: 'jordan@agentix.ai',
  createdAt: '2026-03-14T11:30:00Z',
  updatedAt: '2026-05-06T09:20:00Z',
  tier: {
    base: true,
    unlimited: true,
    dfy: true
  },
  activationCodes: ['dfy99', 'unlimited23']
};
