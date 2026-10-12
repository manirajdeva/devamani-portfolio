/* ==========================================================================
   content.js
   Extra content for the streaming-style home page. Works alongside data.js
   (careerTimeline, travelStories, trekkingStories, lifeStories, projects,
   galleryImages). Edit anything marked [EDIT].
   ========================================================================== */

/* Top Skills row — icon tiles with a short proficiency note */
const skills = [
  { id: "snowflake", title: "Snowflake", icon: "fa-snowflake", color: "#0e7490", level: "Core · SnowPro Core certified", tags: ["Snowpipe", "Streams & Tasks", "Performance"],
    desc: "Day-to-day platform: ingestion with Snowpipe, transformation with stored procedures and Tasks, and view/query tuning. SnowPro Core certified." },
  { id: "dbt", title: "dbt", icon: "fa-diagram-project", color: "#c2410c", level: "Working · [EDIT] proficiency note", tags: ["Transformation", "Modelling"],
    desc: "SQL-first transformation and modelling. [EDIT] Add the projects where you have used dbt." },
  { id: "airflow", title: "Airflow", icon: "fa-wind", color: "#0f766e", level: "Strong · DAG monitoring & support", tags: ["DAGs", "Orchestration"],
    desc: "Supervised ETL workflows and scheduled jobs, monitored failures/retries and built job-health dashboards (Intuitive Surgicals)." },
  { id: "sql", title: "SQL", icon: "fa-database", color: "#1d4ed8", level: "Core · advanced queries & procedures", tags: ["Stored Procedures", "Views", "Tuning"],
    desc: "Stored procedures, complex transformations, view redesign for performance and data validation for banking reports." },
  { id: "python", title: "Python", icon: "fa-python", brand: true, color: "#a16207", level: "Working · [EDIT] proficiency note", tags: ["Scripting", "Automation"],
    desc: "[EDIT] Describe how you use Python — automation, data checks, utilities." },
  { id: "aws", title: "AWS", icon: "fa-aws", brand: true, color: "#b45309", level: "Working · S3 staging & integration", tags: ["S3", "Cloud"],
    desc: "S3-based staging and cloud-side data movement for Snowflake loads. [EDIT] Add other AWS services you use." }
];

/* "Top 10 in Data Engineering" — ranked tools & concepts */
const topTen = [
  { id: "t-snowflake", title: "Snowflake", icon: "fa-snowflake", color: "#0e7490", tags: ["Warehouse"], desc: "Cloud data platform — my primary tool for 5+ years." },
  { id: "t-sql", title: "SQL", icon: "fa-database", color: "#1d4ed8", tags: ["Language"], desc: "The foundation of everything I build." },
  { id: "t-snowpipe", title: "Snowpipe", icon: "fa-bolt", color: "#7c3aed", tags: ["Ingestion"], desc: "Continuous, event-driven data loading." },
  { id: "t-streams", title: "Streams & Tasks", icon: "fa-clock-rotate-left", color: "#be123c", tags: ["Automation"], desc: "Change capture and scheduled transformations inside Snowflake." },
  { id: "t-airflow", title: "Airflow", icon: "fa-wind", color: "#0f766e", tags: ["Orchestration"], desc: "Scheduling and monitoring pipelines as DAGs." },
  { id: "t-talend", title: "Talend", icon: "fa-shuffle", color: "#b91c1c", tags: ["ETL"], desc: "Jobs, joblets and mappings for dimension/fact loads." },
  { id: "t-informatica", title: "Informatica", icon: "fa-code-compare", color: "#c2410c", tags: ["ETL", "CDC"], desc: "Change Data Capture to load deltas into the warehouse." },
  { id: "t-dbt", title: "dbt", icon: "fa-diagram-project", color: "#ea580c", tags: ["Transformation"], desc: "Version-controlled, testable SQL transformations." },
  { id: "t-s3", title: "AWS S3", icon: "fa-aws", brand: true, color: "#a16207", tags: ["Storage"], desc: "Landing and staging area for upstream files." },
  { id: "t-tableau", title: "Tableau", icon: "fa-chart-column", color: "#1e40af", tags: ["BI"], desc: "Dashboards for pipeline and business reporting." }
];

/* "Continue Watching" — what I'm working on or learning right now.  [EDIT] */
const continueWatching = [
  { id: "cw-viharasetu", title: "Growing ViharaSetu", image: "assets/images/viharasetu/viharasetu-cover.jpg", progress: 35, tags: ["Startup", "Travel"],
    desc: "Building the brand, packages and community around ViharaSetu — launched 20 Feb 2026." },
  { id: "cw-dbt", title: "Learning dbt in depth [EDIT]", image: "assets/images/profile/data-engineering.jpg", progress: 55, tags: ["dbt", "Analytics Engineering"],
    desc: "[EDIT] Add what you are studying: courses, certifications, side projects." },
  { id: "cw-trek", title: "Planning the next trek [EDIT]", image: "assets/images/profile/hero-mountains.jpg", progress: 20, tags: ["Trekking", "Himalayas"],
    desc: "[EDIT] Add the next destination and dates." },
  { id: "cw-snowflake", title: "Advanced Snowflake [EDIT]", image: "assets/images/gallery/project-artemis-cpe.jpg", progress: 70, tags: ["Snowflake", "Certification"],
    desc: "[EDIT] Next certification or deep-dive topic." }
];

/* "ViharaSetu Originals" — the founder project, one card per offering */
const viharaOriginals = [
  { id: "v-packages", title: "Travel Packages", icon: "fa-suitcase-rolling", image: "assets/images/viharasetu/viharasetu-cover1.jpg", tags: ["Packages", "Curated"],
    desc: "Curated multi-day journeys designed around destinations and experiences, not just logistics." },
  { id: "v-spiritual", title: "Spiritual Journeys", icon: "fa-hands-praying", image: "assets/images/viharasetu/viharasetu-cover2.jpg", tags: ["Spiritual", "Temples"],
    desc: "Trips centred around monasteries, temples and places of spiritual significance." },
  { id: "v-culture", title: "Cultural Experiences", icon: "fa-masks-theater", image: "assets/images/viharasetu/viharasetu-cover3.jpg", tags: ["Culture", "Community"],
    desc: "Immersive experiences with local communities, traditions and ways of life." },
  { id: "v-trekking", title: "Trekking & Adventure", icon: "fa-person-hiking", image: "assets/images/viharasetu/viharasetu-cover4.jpg", tags: ["Trekking", "Adventure"],
    desc: "Guided treks and adventure travel across mountain regions." },
  { id: "v-custom", title: "Customized Trips", icon: "fa-sliders", image: "assets/images/viharasetu/viharasetu-cover5.jpg", tags: ["Custom", "Personal"],
    desc: "Personalized itineraries built around each traveler's interests and pace." },
  { id: "v-heritage", title: "Heritage Travel", icon: "fa-landmark", image: "assets/images/viharasetu/our-story.jpg", tags: ["Heritage", "History"],
    desc: "Journeys built around history, architecture and heritage sites." },
  { id: "v-destinations", title: "Destination Experiences", icon: "fa-map-location-dot", image: "assets/images/viharasetu/why-viharasetu.jpg", tags: ["Destinations"],
    desc: "Deep-dive experiences into a single destination, rather than a rushed multi-city tour." }
];

/* "My Inspirations" — links to the story pages */
const inspirationsList = [
  { id: "insp-family", title: "My Family", image: "assets/images/inspiration/mom-sis.jpg", tags: ["Family", "Strength"], page: "inspirations/family.html",
    desc: "My mother, Vijaya, has been both mother and father to my sister and me since I was 14 days old — everything I am today, I owe to her." },
  { id: "insp-nims", title: "Nims Dai — Nirmal Purja", image: "assets/images/inspiration/nims-banner.png", tags: ["Mountaineering", "Mindset"], page: "inspirations/nims-purja.html",
    desc: "Summited all 14 eight-thousanders in 6 months and 6 days — a reminder that the biggest limits are the ones we set ourselves." }
];

/* FAQ accordion on the contact page is static HTML; hero "More Info" bio: */
const bio = {
  paragraphs: [
    "I'm T Devamani Raju — a Data Engineer with 5+ years of experience across modern data platforms, certified in Snowflake SnowPro Core.",
    "Outside of work I'm shaped by the mountains I've trekked, the places I've travelled and the cultures I've met. I'm also a co-founder of ViharaSetu, a travel venture building a bridge between travelers and meaningful destinations.",
    "This site documents all of it — the engineer, the explorer and the builder."
  ],
  resume: "assets/documents/resume.pdf"
};
