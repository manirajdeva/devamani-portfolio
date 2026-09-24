/* ==========================================================================
   data.js
   Central content data store.
   Add new travel stories, treks, life stories, projects and gallery images
   here — the pages read from these arrays and render cards automatically.
   No HTML editing required to add new content.
   ========================================================================== */

/* -----------------------------------------------------------------------
   CAREER TIMELINE
   Powers the clickable timeline on career.html. `summary` is shown on the
   timeline card; `fullDetails` (HTML string) is shown in the popup modal
   when the card is clicked. Add a new object to add a new role/education
   entry — no HTML changes needed.
   ----------------------------------------------------------------------- */
const careerTimeline = [
  {
    id: "education",
    date: "2014 – 2018",
    title: "Academic Background",
    subtitle: "SBTET &middot; Annamalai University",
    summary: "Diploma in Electronics &amp; Communication Engineering, followed by a B.Sc in Computer Science.",
    tags: [],
    fullDetails: `
      <h4>B.Sc (Computer Science)</h4>
      <p>Annamalai University &middot; 2018</p>
      <h4 style="margin-top:1rem;">Diploma in Electronics &amp; Communication Engineering</h4>
      <p>SBTET &middot; 2014</p>
    `
  },
  {
    id: "symbiosys",
    date: "Dec 2019 – Nov 2020",
    title: "Software Trainee",
    subtitle: "Symbiosys Technologies",
    summary: "Level 1 troubleshooting and network operations support for Cisco Devices, ensuring uninterrupted client service.",
    tags: ["Cisco", "Network Support", "SolarWinds"],
    fullDetails: `
      <p><strong>Project:</strong> Cisco Devices</p>
      <p>Responsible for Level 1 troubleshooting of Cisco Devices to deliver uninterrupted service on the data network — raising alerts with proper resolution steps, escalating to higher-level diagnosis, and coordinating remote or field-engineer support when required.</p>
      <ul>
        <li>Managed customer networks and provided rapid response to customer-raised incidents and problems</li>
        <li>Monitored and managed networks at various remote locations using the SolarWinds monitoring tool</li>
        <li>Performed analysis and diagnosis on complex networking problems, identifying issues and resolving faults</li>
        <li>Carried out basic troubleshooting of network routers to isolate and resolve trouble</li>
        <li>Provided support to clients for delivering uninterrupted services</li>
        <li>Worked with vendors and onsite field engineers to troubleshoot issues and coordinate dispatches</li>
        <li>Liaised with upstream service providers, peers and internet exchanges for efficient IP network operation</li>
        <li>Communicated with other Network Operations Centres and escalated internally/externally to meet SLAs</li>
        <li>Handled escalations as a focal point for IP service-related queries</li>
        <li>Maintained documentation and case history in service tickets, with timely customer follow-up</li>
      </ul>
    `
  },
  {
    id: "vizag-amogh",
    date: "Dec 2020 – 28 Dec 2023",
    title: "Snowflake Developer / Data Engineer",
    subtitle: "Vizag Amogh Project Management Pvt Ltd",
    summary: "Built and optimized Snowflake data pipelines for Western Asset Management, a globally integrated fixed-income manager.",
    tags: ["Snowflake", "Informatica", "Talend", "Service Now"],
    fullDetails: `
      <p><strong>Project:</strong> Western Asset Management</p>
      <p>Western Asset is a globally integrated fixed-income manager, sourcing ideas and investment solutions worldwide, with risk management embedded across the portfolio construction process.</p>
      <ul>
        <li>Worked on SnowSQL and Snowpipe for continuous data ingestion</li>
        <li>Converted Talend Joblets to support Snowflake functionality</li>
        <li>Created Transformer Pipelines and Data Collector Pipelines</li>
        <li>Tested, validated and deployed data pipelines</li>
        <li>Built Snowpipe for continuous data load and used COPY to bulk load data</li>
        <li>Created data sharing between two Snowflake accounts</li>
        <li>Created internal and external stages and transformed data during load</li>
        <li>Redesigned Views in Snowflake to improve query performance</li>
        <li>Created Talend mappings to populate dimension and fact tables</li>
        <li>Consulted on Snowflake Data Platform solution architecture, design, development and deployment</li>
        <li>Implemented Change Data Capture (CDC) in Informatica to load deltas into the Data Warehouse</li>
      </ul>
    `
  },
  {
    id: "atmecs",
    date: "02 Apr 2024 – 15 Aug 2024",
    title: "Sr Software Engineer (Production &amp; User Support)",
    subtitle: "ATMECS Technologies Pvt Ltd",
    summary: "Maintained and optimized Snowflake + Airflow data pipelines for Intuitive Surgicals, alongside end-user support and training.",
    tags: ["Snowflake", "Airflow DAGs", "Tableau", "Service Now"],
    fullDetails: `
      <p><strong>Project:</strong> Intuitive Surgicals</p>
      <p>Responsible for maintaining and optimizing data pipelines using Snowflake and Apache Airflow, and providing comprehensive user support.</p>
      <ul>
        <li>Worked on SnowSQL and Snowpipe</li>
        <li>Monitored performance and execution of User-Defined Functions (UDFs) in Snowflake</li>
        <li>Analyzed query performance and execution plans to identify bottlenecks and optimize UDFs</li>
        <li>Implemented logging and alerting mechanisms to proactively identify and resolve UDF issues</li>
        <li>Collaborated with the data engineering team to enhance UDF functionality and best practices</li>
        <li>Supervised execution of ETL workflows and scheduled jobs within Apache Airflow</li>
        <li>Ensured reliability and accuracy of pipelines by monitoring task failures, retries and execution times</li>
        <li>Developed and maintained dashboards for real-time monitoring of Airflow job health</li>
        <li>Automated alerting and notification systems to quickly address job failures or performance issues</li>
        <li>Provided technical support to end-users on data access, query performance and pipeline errors</li>
        <li>Assisted users in writing efficient SQL queries and using Snowflake's advanced features</li>
        <li>Conducted training sessions and created documentation for user self-troubleshooting</li>
        <li>Worked closely with stakeholders to ensure timely and accurate data delivery</li>
        <li>Performed Airflow DAG analysis</li>
      </ul>
    `
  },
  {
    id: "ibexlabs",
    date: "17 Mar 2025 – Present",
    title: "Senior Software Engineer",
    subtitle: "Ibexlabs &middot; Hyderabad",
    summary: "Current role — transforming financial data for Truist Bank's Artemis-CPE platform, serving Credit & Commercial Card and Mortgage business divisions.",
    tags: ["Snowflake", "Talend", "Stored Procedures", "Banking"],
    fullDetails: `
      <p><strong>Client:</strong> Truist (Banking &amp; Financial Services)</p>
      <p><strong>Project:</strong> Artemis-CPE</p>
      <p><strong>Department:</strong> Service Engineering &middot; <strong>Location:</strong> Hyderabad</p>
      <p>Transforming data based on business users' requirements across multiple business divisions within the bank, including Credit &amp; Commercial Card and Mortgage. The platform consolidates and reshapes data from upstream banking systems into structures each division can report and act on.</p>
      <ul>
        <li>Debugged existing stored procedures to resolve data discrepancies and logic errors</li>
        <li>Created new stored procedures to implement evolving business transformation rules</li>
        <li>Built and scheduled Snowflake Tasks to automate recurring data transformation workflows</li>
        <li>Designed and developed Talend jobs to integrate and transform data from multiple upstream source systems</li>
        <li>Translated requirements from business divisions such as Credit &amp; Commercial Card and Mortgage into technical transformation logic</li>
        <li>Worked with sensitive financial data, following data security and governance practices appropriate to the banking domain</li>
        <li>Performed data validation and quality checks to ensure accuracy for downstream reporting</li>
        <li>[Add any specific achievements, metrics or additional responsibilities here.]</li>
      </ul>
    `
  },
  {
    id: "future-goals",
    date: "Looking Ahead",
    title: "Future Goals",
    subtitle: "",
    summary: "[Describe where you want to take your Data Engineering career next.]",
    tags: [],
    fullDetails: `<p>[Describe where you want to take your Data Engineering career next — e.g., deeper cloud architecture expertise, leading a data platform team, or growing ViharaSetu alongside your engineering career.]</p>`
  }
];

/* -----------------------------------------------------------------------
   TRAVEL STORIES
   Add a new object to this array for every new travel story.
   "storyPage" should point to a real HTML file inside /stories/
   ----------------------------------------------------------------------- */
const travelStories = [
  {
    id: "sikkim-journey",
    title: "Sikkim Journey",
    location: "Sikkim, India",
    date: "2026",
    category: "Travel",
    tags: ["Travel", "Mountains", "Culture"],
    image: "assets/images/travel/sikkim.jpg",
    description: "A journey through mountains, monasteries and beautiful landscapes — my first deep dive into the Eastern Himalayas.",
    storyPage: "stories/sikkim-journey.html"
  }
  // Example of how to add another story:
  // {
  //   id: "your-story-id",
  //   title: "[STORY TITLE]",
  //   location: "[LOCATION]",
  //   date: "[YEAR]",
  //   category: "Travel",
  //   tags: ["Travel", "Heritage"],
  //   image: "assets/images/travel/your-image.jpg",
  //   description: "[SHORT DESCRIPTION]",
  //   storyPage: "stories/your-story-id.html"
  // },
];

/* -----------------------------------------------------------------------
   TREKKING STORIES
   ----------------------------------------------------------------------- */
const trekkingStories = [
  {
    id: "kedarnath-trek",
    title: "Kedarnath Trek",
    location: "Kedarnath, Uttarakhand",
    date: "June 2022",
    difficulty: "Moderate",
    distance: "16 km",
    duration: "5 Days",
    altitude: "11,762 ft",
    tags: ["Trekking", "Himalayas", "Spiritual"],
    image: "assets/images/trekking/trek-kedarnath.jpg",
    description: "A 5-day Char Dham-style yatra from Haridwar via Devprayag and Guptkashi, trekking from Gaurikund to the Kedarnath Temple at 3,584 m.",
    storyPage: "stories/kedarnath-trek.html"
  },
  {
    id: "sivagange-hills-trek",
    title: "Sivagange Hills Trek",
    location: "Sivagange, near Dobbaspet, Karnataka",
    date: "2026",
    difficulty: "Easy-Moderate",
    distance: "3–6 km",
    duration: "1 Day",
    altitude: "4,488 ft",
    tags: ["Trekking", "Karnataka", "Hills"],
    image: "assets/images/trekking/sivagange-viewpoint.jpg",
    description: "A one-day pilgrimage-hill trek 50–60 km from Bengaluru, known as \"Dakshina Kashi\" — one I've returned to three times.",
    storyPage: "stories/sivagange-hills-trek.html"
  },
  {
    id: "netravathi-peak-trek",
    title: "Netravathi Peak Trek",
    location: "Samse, Chikmagaluru, Karnataka",
    date: "2026",
    difficulty: "Moderate",
    distance: "12–16 km",
    duration: "3 Days",
    altitude: "4,987 ft",
    tags: ["Trekking", "Karnataka", "Western Ghats"],
    image: "assets/images/trekking/trek-netravathi.jpg",
    description: "A 3-day trip from Bengaluru through Chikmagaluru's coffee country to Netravati Peak — forest trails opening into shola grasslands and ridge-top views.",
    storyPage: "stories/netravathi-peak-trek.html"
  },
  {
    id: "z-point-trek",
    title: "Z Point Trek",
    location: "Kudremukh, Karnataka",
    date: "2026",
    difficulty: "Moderate-Difficult",
    distance: "[DISTANCE] km",
    duration: "1 Day",
    altitude: "[MAX ALTITUDE] ft",
    tags: ["Trekking", "Karnataka", "Western Ghats"],
    image: "assets/images/trekking/trek-zpoint.jpg",
    description: "A grassy, rolling-hills trek in Kudremukh National Park leading up to one of Karnataka's most rewarding viewpoints.",
    storyPage: "stories/z-point-trek.html"
  }
  // Add more treks below following the same structure.
];

/* -----------------------------------------------------------------------
   LIFE STORIES
   ----------------------------------------------------------------------- */
const lifeStories = [
  {
    id: "starting-viharasetu",
    title: "Why I Started Building ViharaSetu",
    date: "2026",
    category: "Personal Growth",
    image: "assets/images/gallery/life-01.jpg",
    description: "The story of how a shared love for travel between three friends turned into the idea for ViharaSetu.",
    content: `
      <p>Every journey begins with a dream. For us, that dream began with three friends who simply loved to travel.</p>
      <p>We travelled together, explored new places, experienced different cultures, discovered beautiful destinations, and created memories that stayed with us long after we returned home.</p>
      <p>Along the way, we realised something — there are so many people who dream of travelling, but don't know where to start. Some struggle with planning. Some worry about budgets. Some don't know which places to visit. Some want to travel with family. Some dream of a spiritual journey. And some are simply waiting for the right opportunity.</p>
      <p>So we thought — why not help people turn those dreams into journeys? And that's how ViharaSetu began, on 20 February 2026.</p>
      <p>The name itself represents what we want to be — a bridge between your dreams and the destinations you've always wanted to experience. Not just selling a package, but understanding a dream, planning the journey, and being there along the way. Read the full story on the <a href="viharasetu.html">ViharaSetu page</a>.</p>
    `
  },
  {
    id: "lessons-from-the-field",
    title: "Lessons a Trek Taught Me About Data Engineering",
    date: "2026",
    category: "Career Lessons",
    image: "assets/images/gallery/life-02.jpg",
    description: "Surprising parallels between preparing for a difficult trek and designing resilient data pipelines.",
    content: `
      <p>[Write the full story here.]</p>
    `
  }
  // Add more entries: categories can be Life Experiences, Career Lessons,
  // Travel Lessons, Personal Growth, Milestones, Challenges, Achievements,
  // People Who Inspired Me, Things I Learned.
];

/* -----------------------------------------------------------------------
   PROJECTS (Professional / Data Engineering)
   ----------------------------------------------------------------------- */
const projects = [
  {
    id: "artemis-cpe",
    title: "Artemis-CPE",
    client: "Truist (Banking & Financial Services)",
    role: "Senior Software Engineer",
    duration: "17 Mar 2025 – Present",
    image: "assets/images/gallery/project-artemis-cpe.jpg",
    tags: ["Snowflake", "SnowSQL", "Talend", "Stored Procedures", "Snowflake Tasks"],
    problem: "Truist's business divisions — including Credit & Commercial Card and Mortgage — each needed data transformed and shaped differently for their own reporting and reconciliation needs, but were pulling from the same upstream banking source systems.",
    solution: "Built a SQL-first Snowflake transformation layer where stored procedures encode each division's business rules, Snowflake Tasks schedule and chain those procedures into repeatable pipelines, and Talend jobs handle the integration from upstream systems.",
    architecture: "Upstream banking source systems → Talend jobs land raw data into Snowflake staging tables → SQL stored procedures cleanse, validate and transform records per business rule → Snowflake Tasks schedule and chain the stored procedures into a repeatable pipeline → division-specific target tables (Credit & Commercial Card, Mortgage, etc.) are refreshed for downstream reporting.",
    responsibilities: [
      "Debugged existing stored procedures and created new ones to implement evolving business logic",
      "Created and scheduled Snowflake Tasks to automate recurring SQL transformation workflows",
      "Designed and developed Talend jobs to integrate data from upstream banking systems",
      "Translated requirements from multiple business divisions into SQL transformation logic",
      "Followed data security and governance practices appropriate to the banking domain",
      "Performed data validation and quality checks ahead of downstream reporting"
    ],
    results: [
      "[RESULT / METRIC — add once available, e.g. number of divisions served or pipeline runtime improvements]"
    ]
  },
  {
    id: "western-asset-management",
    title: "Western Asset Management",
    client: "Western Asset (Fixed-Income Asset Manager)",
    role: "Snowflake Developer / Data Engineer",
    duration: "Dec 2020 – 28 Dec 2023",
    image: "assets/images/gallery/project-western-asset.jpg",
    tags: ["Snowflake", "SnowSQL", "Snowpipe", "Informatica", "Talend"],
    problem: "Western Asset, a globally integrated fixed-income manager, needed a reliable Snowflake data platform to support portfolio construction and risk management, fed continuously from upstream operational systems.",
    solution: "Built a Snowflake ingestion and transformation pipeline combining SnowSQL, Snowpipe, Talend and Informatica — moving data from raw landed files through staged, cleansed dimension/fact tables ready for analysis.",
    architecture: "Upstream files land in internal/external Snowflake stages → Snowpipe continuously ingests staged files into raw tables → SQL Views and Talend mappings transform raw data into dimension and fact tables → Informatica Change Data Capture (CDC) merges deltas into the warehouse → data is shared across Snowflake accounts for downstream consumption.",
    responsibilities: [
      "Worked on SnowSQL and Snowpipe for continuous data ingestion",
      "Converted Talend Joblets to support Snowflake functionality",
      "Built Snowpipe for continuous data load and used COPY to bulk load data",
      "Created internal/external stages and transformed data during load",
      "Redesigned Snowflake Views to improve query performance",
      "Created Talend mappings to populate dimension and fact tables",
      "Implemented Change Data Capture (CDC) in Informatica to load deltas into the Data Warehouse",
      "Created data sharing between two Snowflake accounts"
    ],
    results: [
      "[RESULT / METRIC — add once available, e.g. query performance improvement from the redesigned Views]"
    ]
  },
  {
    id: "viharasetu-website",
    title: "ViharaSetu Website",
    client: "Personal Project — ViharaSetu",
    role: "Web Developer / Founder",
    duration: "2026",
    image: "assets/images/viharasetu/viharasetu-cover.jpg",
    tags: ["HTML", "CSS", "JavaScript", "GitHub Pages", "Claude AI"],
    problem: "ViharaSetu needed its own live, public-facing travel website on a real domain — separate from this personal portfolio — where travelers could learn about the brand, browse trip categories and get in touch directly.",
    solution: "Designed and built a full travel website for ViharaSetu from scratch using HTML, CSS and JavaScript in VS Code, working with Claude as an AI coding assistant, then published it live on the custom domain viharasetu.co.in.",
    architecture: "Static HTML/CSS/JS site developed in VS Code with Claude as a coding assistant → version-controlled with Git and pushed to GitHub → deployed via GitHub Pages → custom domain (viharasetu.co.in) connected through DNS.",
    responsibilities: [
      "Designed and built the site end-to-end using HTML, CSS and JavaScript",
      "Built out the ViharaSetu brand story and vision — a bridge between travelers and meaningful destinations",
      "Structured trip categories: Travel Packages, Spiritual Journeys, Cultural Experiences, Trekking & Adventure, Customized Trips and Heritage Travel",
      "Built a destination/photo gallery to showcase trips visually",
      "Added a contact and inquiry section with email, phone and social details for travelers to reach out",
      "Made the site fully responsive for mobile and desktop",
      "Used Claude AI as a coding assistant within VS Code to speed up development",
      "Set up GitHub Pages hosting and connected the custom domain viharasetu.co.in"
    ],
    results: [
      "Live and publicly accessible at viharasetu.co.in",
      "Gives ViharaSetu an independent web presence for showcasing trips and receiving traveler inquiries"
    ]
  }
  // Add more projects following the same structure.
];

/* -----------------------------------------------------------------------
   GALLERY IMAGES
   category options: Travel, Trekking, Mountains, Nature, Heritage,
   ViharaSetu, Professional, Memories
   ----------------------------------------------------------------------- */
const galleryImages = [
  { src: "assets/images/gallery/insta/gallery-13.jpg", category: "Travel", caption: "Kerala Backwaters" },
  { src: "assets/images/gallery/insta/gallery-14.jpg", category: "Memories", caption: "Friends in the Hills" },
  { src: "assets/images/gallery/insta/gallery-15.jpg", category: "Trekking", caption: "Sivagange Hills Trek" },
  { src: "assets/images/gallery/insta/gallery-16.jpg", category: "Memories", caption: "Hilltop with the Crew" },
  { src: "assets/images/gallery/insta/gallery-17.jpg", category: "Mountains", caption: "Family in the Mountains" },
  { src: "assets/images/gallery/insta/gallery-18.jpg", category: "Memories", caption: "Festival Night with Friends" },
  { src: "assets/images/gallery/insta/gallery-19.jpg", category: "Memories", caption: "Chilling on the Rocks" },
  { src: "assets/images/gallery/insta/gallery-20.webp", category: "Mountains", caption: "By the Mountain River" },
  { src: "assets/images/gallery/insta/gallery-21.jpg", category: "Nature", caption: "Lost in the Forest" },
  { src: "assets/images/gallery/insta/gallery-22.jpg", category: "Heritage", caption: "Hoysala Temple Carvings" },
  { src: "assets/images/gallery/insta/gallery-23.jpg", category: "Memories", caption: "Golden Hour Portrait" },
  { src: "assets/images/gallery/insta/gallery-24.jpg", category: "Heritage", caption: "Fort Kochi Heritage Hotel" },
  { src: "assets/images/gallery/insta/gallery-25.jpg", category: "Mountains", caption: "Crossing the River, Ladakh" },
  { src: "assets/images/gallery/insta/gallery-26.jpg", category: "Memories", caption: "Cafe Stop" },
  { src: "assets/images/gallery/insta/gallery-27.jpg", category: "Nature", caption: "Chasing Waterfalls" },
  { src: "assets/images/gallery/insta/gallery-28.jpg", category: "Mountains", caption: "Sunset Ride" },
  { src: "assets/images/gallery/insta/gallery-29.jpg", category: "Heritage", caption: "Varanasi Ghats at Night" },
  { src: "assets/images/gallery/insta/gallery-30.webp", category: "Memories", caption: "Old Railway Yard" },
  { src: "assets/images/gallery/insta/gallery-31.jpg", category: "Trekking", caption: "Kedarnath Trail" },
  { src: "assets/images/gallery/insta/gallery-32.webp", category: "Heritage", caption: "Kedarnath Temple" },
  { src: "assets/images/gallery/insta/gallery-33.jpg", category: "Memories", caption: "Shopping Break" },
  { src: "assets/images/gallery/insta/gallery-34.jpg", category: "Memories", caption: "Torii Gate with Friends" },
  { src: "assets/images/gallery/insta/gallery-35.jpg", category: "Mountains", caption: "Family in the Himalayas" },
  { src: "assets/images/gallery/insta/gallery-36.jpg", category: "Nature", caption: "Tea Estate Walk" },
  { src: "assets/images/gallery/insta/gallery-37.jpg", category: "Travel", caption: "Go With All Your Heart" },
  { src: "assets/images/gallery/insta/gallery-38.jpg", category: "Memories", caption: "Blue Sky Day" },
  { src: "assets/images/gallery/insta/gallery-39.webp", category: "Mountains", caption: "Mountain River Crossing" },
  { src: "assets/images/gallery/insta/gallery-40.webp", category: "Memories", caption: "Dear 2022" },
  { src: "assets/images/gallery/insta/gallery-41.webp", category: "Memories", caption: "Rocky Shoreline with Friends" },
  { src: "assets/images/gallery/insta/gallery-42.jpg", category: "Professional", caption: "Event Appearance" },
  { src: "assets/images/gallery/insta/gallery-43.jpg", category: "Memories", caption: "Evening Walk" },
  { src: "assets/images/gallery/insta/gallery-44.jpg", category: "Trekking", caption: "Rest in Peaks" },
  { src: "assets/images/gallery/insta/gallery-45.jpg", category: "Heritage", caption: "Varanasi Mornings" },
  { src: "assets/images/gallery/insta/gallery-46.jpg", category: "Professional", caption: "Restaurant Launch Event" },
  { src: "assets/images/gallery/insta/gallery-47.jpg", category: "Nature", caption: "Chitrakoot Falls" },
  { src: "assets/images/gallery/insta/gallery-48.jpg", category: "Travel", caption: "Valley View" },
  { src: "assets/images/gallery/insta/gallery-49.jpg", category: "Heritage", caption: "Adiyogi Shiva Statue" },
  { src: "assets/images/gallery/insta/gallery-50.jpg", category: "Nature", caption: "Rock Formation" },
  { src: "assets/images/gallery/insta/gallery-51.jpg", category: "Memories", caption: "Street Portrait" },
  { src: "assets/images/gallery/insta/gallery-52.jpg", category: "Heritage", caption: "Fort Kochi Jew Town" },
  { src: "assets/images/gallery/insta/gallery-53.webp", category: "Trekking", caption: "True Friends on the Trail" },
  { src: "assets/images/gallery/insta/gallery-54.jpg", category: "Heritage", caption: "Old Fort Walls" },
  { src: "assets/images/gallery/insta/gallery-55.jpg", category: "Mountains", caption: "Windbreaker Weather" },
  { src: "assets/images/gallery/insta/gallery-56.jpg", category: "Travel", caption: "Just Travel, Find Yourself" },
  { src: "assets/images/gallery/insta/gallery-57.jpg", category: "Heritage", caption: "Hoysala Architecture" },
  { src: "assets/images/gallery/insta/gallery-58.webp", category: "Memories", caption: "Cafe Culture" },
  { src: "assets/images/gallery/insta/gallery-59.jpg", category: "Heritage", caption: "Tirumala Temple" },
  { src: "assets/images/gallery/insta/gallery-60.jpg", category: "Heritage", caption: "Chola Temple Architecture" },
  { src: "assets/images/gallery/insta/gallery-61.jpg", category: "Mountains", caption: "Misty Mountain Roads" },
  { src: "assets/images/gallery/insta/gallery-62.jpg", category: "Travel", caption: "Sunset on the Summit" },
  { src: "assets/images/gallery/insta/gallery-63.jpg", category: "Travel", caption: "Bangalore Blooms" },
  { src: "assets/images/gallery/insta/gallery-64.jpg", category: "Heritage", caption: "Ganesh Chaturthi" },
  { src: "assets/images/gallery/insta/gallery-65.jpg", category: "Heritage", caption: "Tirumala Gopuram" },
  { src: "assets/images/gallery/insta/gallery-66.jpg", category: "Memories", caption: "Night Out" },
  { src: "assets/images/gallery/insta/gallery-67.jpg", category: "Memories", caption: "Hilltop Reflection" },
  { src: "assets/images/gallery/insta/gallery-68.webp", category: "Nature", caption: "By the Sea" },
  { src: "assets/images/gallery/insta/gallery-69.jpg", category: "Heritage", caption: "Wayside Shrine" },
  { src: "assets/images/gallery/insta/gallery-70.jpg", category: "Memories", caption: "Mall Moments" },
  { src: "assets/images/gallery/insta/gallery-71.jpg", category: "Heritage", caption: "Ganesh Visarjan Prep" },
  { src: "assets/images/gallery/insta/gallery-72.jpg", category: "Mountains", caption: "Mountain Mornings" },
  { src: "assets/images/gallery/insta/gallery-73.jpg", category: "Memories", caption: "Golden Hour" },
  { src: "assets/images/gallery/insta/gallery-74.jpg", category: "Memories", caption: "New Friend at the Cafe" },
  { src: "assets/images/gallery/insta/gallery-75.jpg", category: "Heritage", caption: "Temple Visit in Whites" },

  // Photography — candid, street, macro, portrait and landscape shots.
  { src: "assets/images/gallery/photography/photo-01.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-02.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-03.jpg", category: "Photography", caption: "Candid Portrait" },
  { src: "assets/images/gallery/photography/photo-04.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-05.jpg", category: "Photography", caption: "Urban Photography" },
  { src: "assets/images/gallery/photography/photo-06.jpg", category: "Photography", caption: "Silhouette" },
  { src: "assets/images/gallery/photography/photo-07.jpg", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-08.jpg", category: "Photography", caption: "Candid Portrait" },
  { src: "assets/images/gallery/photography/photo-09.jpg", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-10.jpg", category: "Photography", caption: "Macro" },
  { src: "assets/images/gallery/photography/photo-11.jpg", category: "Photography", caption: "Macro" },
  { src: "assets/images/gallery/photography/photo-12.webp", category: "Photography", caption: "Seascape" },
  { src: "assets/images/gallery/photography/photo-13.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-14.jpg", category: "Photography", caption: "Astrophotography" },
  { src: "assets/images/gallery/photography/photo-15.jpg", category: "Photography", caption: "Landscape" },
  { src: "assets/images/gallery/photography/photo-16.jpg", category: "Photography", caption: "Animal Portrait" },
  { src: "assets/images/gallery/photography/photo-17.jpg", category: "Photography", caption: "Animal Portrait" },
  { src: "assets/images/gallery/photography/photo-18.webp", category: "Photography", caption: "Candid Portrait" },
  { src: "assets/images/gallery/photography/photo-19.webp", category: "Photography", caption: "Candid Portrait" },
  { src: "assets/images/gallery/photography/photo-20.jpg", category: "Photography", caption: "Landscape" },
  { src: "assets/images/gallery/photography/photo-21.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-22.jpg", category: "Photography", caption: "Landscape" },
  { src: "assets/images/gallery/photography/photo-23.webp", category: "Photography", caption: "Candid Portrait" },
  { src: "assets/images/gallery/photography/photo-24.jpg", category: "Photography", caption: "Animal Portrait" },
  { src: "assets/images/gallery/photography/photo-25.jpg", category: "Photography", caption: "Animal Portrait" },
  { src: "assets/images/gallery/photography/photo-26.webp", category: "Photography", caption: "Portrait" },
  { src: "assets/images/gallery/photography/photo-27.webp", category: "Photography", caption: "Nature" },
  { src: "assets/images/gallery/photography/photo-28.jpg", category: "Photography", caption: "Silhouette" },
  { src: "assets/images/gallery/photography/photo-29.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-30.webp", category: "Photography", caption: "Street Photography" },
  { src: "assets/images/gallery/photography/photo-31.webp", category: "Photography", caption: "Portrait" }
  // Add more images — just drop the file into assets/images/gallery/insta/
  // (or assets/images/gallery/) and add a matching entry here.
];

/* -----------------------------------------------------------------------
   SEARCHABLE INDEX
   Combines everything above into one flat list for the global search
   feature (see js/script.js -> initSiteSearch).
   ----------------------------------------------------------------------- */
function buildSearchIndex() {
  const index = [];

  travelStories.forEach(item => index.push({
    title: item.title,
    type: "Travel Story",
    tags: item.tags,
    url: item.storyPage
  }));

  trekkingStories.forEach(item => index.push({
    title: item.title,
    type: "Trekking Story",
    tags: item.tags,
    url: item.storyPage
  }));

  lifeStories.forEach(item => index.push({
    title: item.title,
    type: "Life Story",
    tags: [item.category],
    url: "life.html"
  }));

  projects.forEach(item => index.push({
    title: item.title,
    type: "Project",
    tags: item.tags,
    url: "projects.html"
  }));

  index.push(
    { title: "Snowflake, dbt & Airflow Experience", type: "Career", tags: ["Snowflake", "Career", "Data Engineering"], url: "career.html" },
    { title: "ViharaSetu — Travel Startup", type: "ViharaSetu", tags: ["ViharaSetu", "Startup", "Travel"], url: "viharasetu.html" }
  );

  return index;
}
