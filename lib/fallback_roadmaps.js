export const fallbackRoadmaps = {
  fullstack: {
    role: "Full Stack Developer",
    total_days: 90,
    days: Array.from({length: 90}).map((_, i) => {
      const phase = i < 20 ? "Foundations" : i < 60 ? "Production Projects" : "System Design & Interviews";
      const topics = [
        "Internet & DNS Basics", "HTML5 Semantics & Accessibility", "CSS3 Flexbox & Grid", "Responsive Design & Media Queries", 
        "JavaScript Variables & Functions", "JS Arrays & Objects", "JS DOM Manipulation", "JS Async/Await & Promises",
        "JS ES6+ Features", "Version Control & Git Basics", "React JSX & Components", "React State & Props",
        "React useEffect & Lifecycle", "React Context API", "React Router", "State Management (Redux/Zustand)",
        "Node.js Basics", "Express.js REST APIs", "Middleware & Error Handling", "PostgreSQL & Relational DBs",
        "Prisma ORM Basics", "Authentication with JWT", "OAuth & Social Login", "MongoDB & NoSQL Concepts",
        "Mongoose ODM", "Building a Blog API", "Connecting Frontend to Backend", "CORS & Security Basics",
        "File Uploads (Multer/S3)", "Pagination & Filtering", "WebSockets & Socket.io", "Real-time Chat App",
        "Redis Caching Basics", "GraphQL Fundamentals", "Apollo Server & Client", "Next.js App Router Basics",
        "Next.js SSR vs SSG", "Next.js API Routes", "Building an E-commerce App - Part 1", "Building an E-commerce App - Part 2",
        "Payment Gateway Integration (Stripe/Razorpay)", "Webhooks Handling", "Docker Basics", "Containerizing Node Apps",
        "CI/CD with GitHub Actions", "Deploying to Vercel/Render", "Deploying Backend to AWS/Render", "Nginx & Reverse Proxy",
        "Microservices Architecture Intro", "Message Queues (RabbitMQ/Kafka)", "Unit Testing with Jest", "E2E Testing with Cypress",
        "TypeScript Basics", "Advanced TypeScript Interfaces", "Migrating React to TS", "Tailwind CSS Advanced",
        "Framer Motion Animations", "System Design: Load Balancing", "System Design: Scaling DBs", "System Design: Rate Limiting",
        "System Design: URL Shortener", "System Design: Twitter Clone", "Open Source Contribution 1", "Open Source Contribution 2",
        "Resume Building & ATS Optimization", "LinkedIn Profile Overhaul", "Mock Interview: Frontend", "Mock Interview: Backend",
        "Mock Interview: System Design", "Applying to 5 Startups", "Applying to 5 Mid-size Companies", "Applying to MAANG",
        "Data Structures: Arrays & Strings", "Data Structures: Linked Lists", "Data Structures: Trees & Graphs", "Algorithms: Sorting & Searching",
        "Algorithms: Dynamic Programming", "Behavioral Interview Prep", "Negotiation Skills", "Portfolio Polish - Part 1",
        "Portfolio Polish - Part 2", "Final Project Deployment", "Writing a Tech Blog Post", "Networking on Twitter",
        "Cold Emailing Recruiters", "Interview Take-home Assignment", "Handling Rejections", "Finalizing Job Strategy",
        "Offer Evaluation", "Onboarding Prep"
      ];
      const topic = topics[i] || `Advanced Concept ${i+1}`;
      return {
        day: i + 1,
        topic: topic,
        learn_task: {
          title: `Master ${topic}`,
          description: `Deep dive into ${topic}. Focus on core principles, industry standards, and edge cases.`,
          resources: ["https://developer.mozilla.org", "https://roadmap.sh"]
        },
        build_task: {
          title: `Implement ${topic} in practice`,
          description: `Write clean, documented code applying the concepts of ${topic} to your ongoing portfolio project.`,
          expected_output: "A working, tested feature pushed to your GitHub repository."
        },
        apply_task: {
          title: i < 20 ? "Update LinkedIn Profile" : i < 60 ? "Research Target Companies" : "Submit Job Application",
          company: i < 60 ? "N/A" : "Top Tech Startup",
          role: i < 60 ? "N/A" : "Full Stack Developer",
          link: "https://linkedin.com/jobs"
        }
      }
    })
  },
  sde: {
    role: "Software Development Engineer",
    total_days: 90,
    days: Array.from({length: 90}).map((_, i) => {
      const topics = [
        "Time & Space Complexity", "Arrays & Strings", "Two Pointers Technique", "Sliding Window", "Binary Search",
        "Linked Lists", "Stacks & Queues", "Trees & Binary Search Trees", "Graphs & Traversals (BFS/DFS)", "Heaps & Priority Queues",
        "Dynamic Programming Intro", "DP: Memoization", "DP: Tabulation", "Greedy Algorithms", "Backtracking",
        "Tries & Advanced Trees", "Disjoint Set (Union Find)", "Bit Manipulation", "Math Algorithms", "Sorting Algorithms",
        "Object Oriented Programming", "Design Patterns: Singleton & Factory", "Design Patterns: Observer & Strategy", "SOLID Principles", "Clean Code Practices",
        "Operating Systems: Processes & Threads", "OS: Concurrency & Deadlocks", "OS: Memory Management", "Computer Networks: OSI Model", "Networks: TCP/UDP & HTTP",
        "DBMS: Relational Math & Normalization", "SQL: Advanced Queries & Joins", "SQL: Indexing & Transactions", "NoSQL vs SQL", "Database Scaling",
        "System Design: Load Balancers", "System Design: Caching Strategy", "System Design: Sharding & Partitioning", "System Design: Microservices", "System Design: Message Queues",
        "System Design: Designing WhatsApp", "System Design: Designing Netflix", "System Design: Designing Uber", "System Design: Rate Limiters", "System Design: Distributed Locks",
        "Java/C++ Fundamentals", "Memory Management in C++/Java", "Multithreading Implementation", "Garbage Collection", "Building a CLI Tool",
        "REST API Design Principles", "Building a Scalable Backend", "Authentication & Authorization", "Docker & Containers", "CI/CD Pipelines",
        "AWS/GCP Basics", "Serverless Architecture", "Kubernetes Overview", "Writing Unit Tests", "Integration Testing",
        "Mock Interview: Arrays/Strings", "Mock Interview: Graphs/Trees", "Mock Interview: Dynamic Programming", "Mock Interview: System Design 1", "Mock Interview: System Design 2",
        "Open Source Contribution", "Resume ATS Optimization", "LinkedIn Networking", "Cold Email Strategies", "Applying to 10 Unicorns",
        "Applying to MAANG", "Behavioral Interview (STAR Method)", "Handling Ambiguity in Interviews", "Take-home Project Guidelines", "Code Review Practices",
        "Agile & Scrum Methodologies", "Debugging Techniques", "Performance Profiling", "Writing Technical Documentation", "System Architecture Polish",
        "Interview Soft Skills", "Salary Negotiation", "Offer Evaluation", "Onboarding Strategies"
      ];
      const topic = topics[i] || `SDE Concept ${i+1}`;
      return {
        day: i + 1,
        topic: topic,
        learn_task: {
          title: `Master ${topic}`,
          description: `Study the theoretical and practical aspects of ${topic}. Focus on optimization and edge cases.`,
          resources: ["https://leetcode.com", "https://neetcode.io"]
        },
        build_task: {
          title: `Solve 3 Hard Problems on ${topic}`,
          description: `Implement the optimal solution for ${topic} related problems. Focus on writing clean, O(1) space code where possible.`,
          expected_output: "Accepted solutions on LeetCode/Codeforces with optimal complexity."
        },
        apply_task: {
          title: i < 30 ? "Update Resume" : i < 60 ? "Research Tech Giants" : "Apply via Referrals",
          company: i < 60 ? "N/A" : "Top Tier Tech Firm",
          role: i < 60 ? "N/A" : "SDE 1",
          link: "https://careers.google.com"
        }
      }
    })
  }
};

export const getFallbackRoadmap = (role) => {
  const normalizedRole = role?.toLowerCase() === 'sde' ? 'sde' : 'fullstack';
  return fallbackRoadmaps[normalizedRole];
}