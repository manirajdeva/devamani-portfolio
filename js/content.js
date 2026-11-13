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
  { id: "t-snowflake", title: "Snowflake", icon: "fa-snowflake", color: "#0e7490", tags: ["Warehouse"], desc: "Cloud data platform — my primary tool for 5+ years.",
    paragraphs: ["Snowflake is the cloud data platform at the centre of my work: warehousing, loading, transforming and sharing data in one place.", "I have used it across the Western Asset Management and Truist (Artemis-CPE) projects, from continuous ingestion to performance tuning. SnowPro Core certified."],
    points: ["SnowSQL and Snowpipe for continuous data ingestion", "COPY for bulk loads from internal and external stages", "Stored procedures and Tasks to schedule transformations", "Redesigned views to improve query performance", "Data sharing between two Snowflake accounts"], related: ["Snowpipe", "Streams & Tasks", "SQL"] },
  { id: "t-sql", title: "SQL", icon: "fa-database", color: "#1d4ed8", tags: ["Language"], desc: "The foundation of everything I build.",
    paragraphs: ["SQL is the foundation under every pipeline I build, from simple validations to multi-step transformations.", "On banking projects it carries the business rules themselves: each division's logic lives in stored procedures that can be tested and reasoned about."],
    points: ["Complex transformations and stored procedures", "Advanced queries feeding downstream reports", "View redesign for faster queries", "Data validation and quality checks for banking reports"], related: ["Snowflake", "Stored Procedures", "Views"] },
  { id: "t-snowpipe", title: "Snowpipe", icon: "fa-bolt", color: "#7c3aed", tags: ["Ingestion"], desc: "Continuous, event-driven data loading.",
    paragraphs: ["Snowpipe loads files into Snowflake automatically as they land in a stage, so data arrives continuously without anyone running a manual job.", "I used it for continuous ingestion at Western Asset Management, alongside COPY for larger bulk loads."],
    points: ["Built Snowpipe for continuous data load", "Worked with internal and external stages", "Transformed data during load", "Used COPY for bulk loading when needed"], related: ["Snowflake", "AWS S3"] },
  { id: "t-streams", title: "Streams & Tasks", icon: "fa-clock-rotate-left", color: "#be123c", tags: ["Automation"], desc: "Change capture and scheduled transformations inside Snowflake.",
    paragraphs: ["Streams track changes on a table and Tasks run SQL on a schedule. Together they let Snowflake process only new or changed data, on time, without an outside scheduler.", "On Artemis-CPE I use Tasks to chain stored procedures into repeatable, scheduled pipelines."],
    points: ["Created and scheduled Snowflake Tasks", "Chained stored procedures into workflows", "Automated recurring transformation jobs", "Debugged stored procedures when results did not match"], related: ["Snowflake", "SQL"] },
  { id: "t-airflow", title: "Airflow", icon: "fa-wind", color: "#0f766e", tags: ["Orchestration"], desc: "Scheduling and monitoring pipelines as DAGs.",
    paragraphs: ["Airflow schedules and monitors workflows as DAGs: tasks, dependencies, retries and alerts in a single view.", "I have supported ETL workflows on Airflow, keeping an eye on job health and handling failures."],
    points: ["Supervised ETL workflows and scheduled jobs", "Monitored failures and retries", "Built job-health dashboards (Intuitive Surgicals)"], related: ["Orchestration", "DAGs"] },
  { id: "t-talend", title: "Talend", icon: "fa-shuffle", color: "#b91c1c", tags: ["ETL"], desc: "Jobs, joblets and mappings for dimension/fact loads.",
    paragraphs: ["Talend is an ETL tool for building data integration jobs. I have used it on both of my main projects to move data from upstream systems into Snowflake.", "Reusable joblets and mappings keep dimension and fact loads consistent."],
    points: ["Converted Talend Joblets to support Snowflake", "Created mappings to populate dimension and fact tables", "Designed Talend jobs to integrate banking source systems (Truist)"], related: ["Snowflake", "ETL"] },
  { id: "t-informatica", title: "Informatica", icon: "fa-code-compare", color: "#c2410c", tags: ["ETL", "CDC"], desc: "Change Data Capture to load deltas into the warehouse.",
    paragraphs: ["Informatica is an enterprise ETL platform. Change Data Capture (CDC) finds what changed since the last load, so only the deltas are processed.", "I implemented CDC in Informatica for Western Asset Management."],
    points: ["Implemented CDC to load deltas into the Data Warehouse", "Used alongside Snowflake and Talend on the same project"], related: ["Talend", "Snowflake"] },
  { id: "t-dbt", title: "dbt", icon: "fa-diagram-project", color: "#ea580c", tags: ["Transformation"], desc: "Version-controlled, testable SQL transformations.",
    paragraphs: ["dbt turns SQL SELECT statements into version-controlled, tested transformation models, so analytics logic is reviewed and deployed like code.", "[EDIT] Add the projects where you have used dbt."],
    points: ["SQL-first modelling", "Tests and documentation alongside the models", "Version control for transformation logic"], related: ["SQL", "Snowflake"] },
  { id: "t-s3", title: "AWS S3", icon: "fa-aws", brand: true, color: "#a16207", tags: ["Storage"], desc: "Landing and staging area for upstream files.",
    paragraphs: ["Amazon S3 is AWS object storage, widely used as the landing and staging area for data files.", "In my Snowflake pipelines, upstream files land in S3 staging before they are loaded."],
    points: ["S3-based staging for Snowflake loads", "External stages pointing at S3", "Cloud-side data movement between systems"], related: ["Snowpipe", "Snowflake"] },
  { id: "t-tableau", title: "Tableau", icon: "fa-chart-column", color: "#1e40af", tags: ["BI"], desc: "Dashboards for pipeline and business reporting.",
    paragraphs: ["Tableau is a business-intelligence tool for building interactive dashboards from warehouse data.", "[EDIT] Add the dashboards you built or used."],
    points: ["Dashboards for pipeline and business reporting"], related: ["Snowflake", "SQL"] }
];

/* "ViharaSetu Originals" — the co-founded venture, one card per offering */
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
