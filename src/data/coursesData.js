// Shared course data for the application

export const coursesData = [
    // {
    //     id: "MathAI",
    //     title: "Math Fundamentals for AI",
    //     description: "Essential mathematical foundations for artificial intelligence and machine learning. Master linear algebra, calculus, probability, and statistics needed for AI success.",
    //     level: "Beginner",
    //     duration: "3 weeks",
    //     lessons: 9,
    //     students: 5,
    //     maxCapacity: 25,
    //     nextBatchDate: "2025-09-1",
    //     rating: 4.8,
    //     price: 99,
    //     originalPrice: 259,
    //     icon: "📐",
    //     image: "/data/MathAI/MathAI_thumbnail.png",
    //     category: "Mathematics",
    //     instructor: "NA",
    //     instructorBio: "NA",
    //     curriculum: [
    //         { week: 1, title: "Linear Algebra: Vectors, Matrices, and Operations", lessons: 3 },
    //         { week: 2, title: "Calculus: Derivatives, Gradients, and Optimization", lessons: 3 },
    //         { week: 3, title: "Probability & Statistics: Distributions, Bayes' Theorem, Statistical Inference", lessons: 3 }
    //     ],
    //     prerequisites: ["High school algebra", "Basic calculus knowledge helpful but not required"],
    //     outcomes: [
    //         "Master vector and matrix operations essential for ML",
    //         "Understand derivatives and gradients for optimization",
    //         "Apply probability and statistics to data analysis",
    //         "Build mathematical intuition for AI algorithms"
    //     ],
    //     downloadUrl: "/data/sample-math-course-info.pdf"
    // },
    {
        id: "FAAI",
        title: "Foundations to Frontiers of AI",
        description: "This beginner-friendly course takes you from the mathematical foundations of AI to hands-on implementation of modern machine learning and generative AI models.",
        level: "Beginner level",
        duration: "14 weeks",
        lessons: 25,
        maxCapacity: 30,
        nextBatchDate: "2025-10-1",
        price: 699,
        originalPrice: 1199,
        icon: "🤖",
        image: "/data/FAAI/FAAI_thumbnail.png",
        category: "Artificial Intelligence",
        instructor: "NA",
        instructorBio: "NA",
        // Batch information
        currentBatch: 1,
        batches: [
            {
                batchNumber: 1,
                batchName: "Alpha",
                startDate: "2025-06-01",
                endDate: "2025-08-15",
                status: "completed", // upcoming, active, completed
                maxCapacity: 30,
                enrollmentCount: 0,
                classLinks: {
                    zoom: "https://zoom.us/j/batch1-faai",
                    discord: "https://discord.gg/batch1-faai",
                    materials: "/batch1/materials"
                }
            },
            {
                batchNumber: 2,
                batchName: "Beta",
                startDate: "2025-10-1",
                endDate: "2026-01-15",
                status: "active",
                maxCapacity: 30,
                enrollmentCount: 0,
                classLinks: {
                    zoom: "https://zoom.us/j/batch2-faai",
                    discord: "https://discord.gg/batch2-faai",
                    materials: "/batch2/materials"
                }
            }
        ],
        curriculum: [
            {
                section: "Foundations",
                topics: [
                    "Introduction to Machine Learning",
                    "Vectors and Matrices for ML",
                    "Basic Python for Machine Learning"
                ]
            },
            {
                section: "Classical Machine Learning",
                topics: [
                    "Linear Regression",
                    "Closed-Form Solution for Linear Regression",
                    "Polynomial Regression",
                    "Loss Functions",
                    "Optimization Methods",
                    "Hyperparameter Tuning: Overfitting, Regularization, Model Selection",
                    "Logistic Regression & Classification",
                    "Mini Project: Regression and Classification"
                ]
            },
            {
                section: "Neural Networks",
                topics: [
                    "Introduction to Neural Networks (MLPs)",
                    "Convolutional Neural Networks (CNNs)",
                    "Applications of CNNs",
                    "Project: Application of CNNs"
                ]
            },
            {
                section: "Natural Language Processing",
                topics: [
                    "Introduction to NLP and Transformers",
                    "Recurrent Neural Networks (RNNs)",
                    "Limitations of RNNs",
                    "Attention Mechanism",
                    "Self-Attention",
                    "Transformer Architecture"
                ]
            },
            {
                section: "Large Language Models (LLMs)",
                topics: [
                    "LLM Pre-Training",
                    "Continual Pre-Training",
                    "Supervised Fine-Tuning",
                    "Alignment of LLMs",
                    "LLM Inference",
                    "Introduction to Hugging Face"
                ]
            },
            {
                section: "Advanced Topics",
                topics: [
                    "Distributed Computing for LLMs",
                    "Prompt Engineering",
                    "Retrieval-Augmented Generation (RAG)",
                    "Agentic AI"
                ]
            }
        ],
        prerequisites: ["High school mathematics", "Basic programming knowledge"],
        outcomes: [
            "Build strong foundations in machine learning by combining theory with hands-on coding, so you can confidently move from simple models to advanced architectures.",
            "Think like a practitioner by applying algorithms to real data, running experiments, tuning models, and analyzing trade-offs.",
            "Work with modern AI systems by understanding how neural networks, transformers, and large language models are trained, fine-tuned, and deployed.",
            "Develop end-to-end skills through projects that take you from problem definition to implementation, giving you practical experience you can showcase."
        ],
        downloadUrl: "/data/sample-course-info.pdf"
    },

    {
        id: "RLAI",
        title: "Reinforcement Learning",
        description: "Dive deep into the world of reinforcement learning and AI agents. Learn to build intelligent systems that can learn from their environment, make decisions, and solve complex sequential problems through trial and error.",
        level: "Advanced",
        duration: "10 weeks",
        lessons: 16,
        maxCapacity: 25,
        nextBatchDate: "TBD",
        price: 599,
        originalPrice: 1399,
        icon: "🎯",
        image: "/data/RLAI/RLAI_thumbnail.png",
        category: "Reinforcement Learning",
        instructor: "TBD",
        instructorBio: "Course will be taught by leading experts in reinforcement learning and AI agents with extensive research and industry experience.",
        // Batch information
        currentBatch: 1,
        batches: [
            {
                batchNumber: 1,
                batchName: "Pioneer RL Cohort",
                startDate: "TBD",
                endDate: "TBD",
                status: "upcoming",
                maxCapacity: 25,
                enrollmentCount: 0,
                classLinks: {
                    zoom: "TBD",
                    discord: "TBD",
                    materials: "TBD"
                }
            }
        ],
        curriculum: [
            {
                section: "Foundations of Reinforcement Learning",
                topics: [
                    "Introduction to RL: Agents, Environments, and Rewards",
                    "Markov Decision Processes (MDPs)",
                    "Bellman Equations and Dynamic Programming",
                    "Value Functions and Policy Functions",
                    "Exploration vs Exploitation Dilemma"
                ]
            },
            {
                section: "Classical RL Algorithms",
                topics: [
                    "Monte Carlo Methods",
                    "Temporal Difference Learning",
                    "Q-Learning and SARSA",
                    "Function Approximation in RL",
                    "Eligibility Traces and TD(λ)"
                ]
            },
            {
                section: "Deep Reinforcement Learning",
                topics: [
                    "Deep Q-Networks (DQN)",
                    "Policy Gradient Methods",
                    "Actor-Critic Algorithms",
                    "Proximal Policy Optimization (PPO)",
                    "Trust Region Policy Optimization (TRPO)"
                ]
            },
            {
                section: "Advanced RL Techniques",
                topics: [
                    "Model-Based Reinforcement Learning",
                    "Hierarchical Reinforcement Learning",
                    "Multi-Agent Reinforcement Learning",
                    "Inverse Reinforcement Learning",
                    "Meta-Learning in RL"
                ]
            },
            {
                section: "RL Applications & AI Agents",
                topics: [
                    "Game AI and Strategic Decision Making",
                    "Robotics and Control Systems",
                    "Financial Trading and Portfolio Management",
                    "Autonomous Systems and Self-Driving Cars",
                    "Large Language Model Agents"
                ]
            },
            {
                section: "Practical Implementation & Projects",
                topics: [
                    "RL Frameworks: Gym, Stable-Baselines3, Ray RLlib",
                    "Building Custom RL Environments",
                    "Hyperparameter Tuning for RL",
                    "RL Agent Evaluation and Benchmarking",
                    "Capstone Project: End-to-End RL Application"
                ]
            }
        ],
        prerequisites: [
            "Completion of Foundations to Frontiers of AI or equivalent ML knowledge",
            "Strong programming skills in Python",
            "Understanding of neural networks and deep learning",
            "Familiarity with NumPy, PyTorch/TensorFlow",
            "Basic knowledge of probability and statistics"
        ],
        outcomes: [
            "Master the fundamental concepts and mathematics of reinforcement learning.",
            "Implement classical RL algorithms from scratch and understand their theoretical foundations.",
            "Build and train deep reinforcement learning agents using modern frameworks.",
            "Apply RL techniques to real-world problems in games, robotics, and decision-making.",
            "Understand multi-agent systems and how agents can learn to cooperate or compete.",
            "Develop practical skills in RL environment design and agent evaluation."
        ],
        downloadUrl: null,
        comingSoon: true
    }
];

// Helper function to find a course by ID
export const findCourseById = (courseId) => {
    return coursesData.find(course => course.id === courseId);
};

// Helper function to get all categories
export const getCategories = () => {
    const categories = [...new Set(coursesData.map(course => course.category))];
    return ["All", ...categories];
};

// Helper function to check if a course is nearly full (80% or more capacity)
export const isCourseNearlyFull = (course, dynamicEnrollmentCount = 0) => {
    const students = dynamicEnrollmentCount;
    if (!students || !course.maxCapacity) return false;
    return (students / course.maxCapacity) >= 0.8;
};

// Helper function to check if a course is full
export const isCourseFull = (course, dynamicEnrollmentCount = 0) => {
    const students = dynamicEnrollmentCount;
    if (!students || !course.maxCapacity) return false;
    return students >= course.maxCapacity;
};

// Helper function to check if a course is coming soon
export const isComingSoon = (course) => {
    return course.comingSoon === true;
};

// Helper function to get available seats count
export const getAvailableSeats = (course, dynamicEnrollmentCount = 0) => {
    const students = dynamicEnrollmentCount;
    if (!course.maxCapacity) return "N/A";
    return course.maxCapacity - students;
};

// Batch-related helper functions

// Get current active batch for a course
export const getCurrentBatch = (course) => {
    if (!course.batches || course.batches.length === 0) return null;
    return course.batches.find(batch => batch.batchNumber === course.currentBatch);
};

// Get batch by batch number
export const getBatchByNumber = (course, batchNumber) => {
    if (!course.batches || course.batches.length === 0) return null;
    return course.batches.find(batch => batch.batchNumber === batchNumber);
};

// Get all upcoming batches for a course
export const getUpcomingBatches = (course) => {
    if (!course.batches || course.batches.length === 0) return [];
    return course.batches.filter(batch => batch.status === 'upcoming');
};

// Get active batches for a course
export const getActiveBatches = (course) => {
    if (!course.batches || course.batches.length === 0) return [];
    return course.batches.filter(batch => batch.status === 'active');
};

// Check if a batch is nearly full (80% or more capacity)
export const isBatchNearlyFull = (batch) => {
    if (!batch.enrollmentCount || !batch.maxCapacity) return false;
    return (batch.enrollmentCount / batch.maxCapacity) >= 0.8;
};

// Check if a batch is full
export const isBatchFull = (batch) => {
    if (!batch.enrollmentCount || !batch.maxCapacity) return false;
    return batch.enrollmentCount >= batch.maxCapacity;
};

// Get available seats for a specific batch
export const getBatchAvailableSeats = (batch) => {
    if (!batch.maxCapacity) return "N/A";
    return batch.maxCapacity - (batch.enrollmentCount || 0);
};

// Get next available batch for enrollment
export const getNextAvailableBatch = (course) => {
    if (!course.batches || course.batches.length === 0) return null;

    // First, try to find upcoming batches that aren't full
    const upcomingBatches = course.batches
        .filter(batch => batch.status === 'upcoming' && !isBatchFull(batch))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (upcomingBatches.length > 0) {
        return upcomingBatches[0];
    }

    // If no upcoming batches available, try active batches
    const activeBatches = course.batches
        .filter(batch => batch.status === 'active' && !isBatchFull(batch))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return activeBatches.length > 0 ? activeBatches[0] : null;
};

// Check if course has any available batches for enrollment
export const hasAvailableBatches = (course) => {
    return getNextAvailableBatch(course) !== null;
};

// Get batch status display text
export const getBatchStatusText = (batch) => {
    const statusMap = {
        'upcoming': 'Starting Soon',
        'active': 'In Progress',
        'completed': 'Completed'
    };
    return statusMap[batch.status] || batch.status;
};

// Format batch date range for display
export const formatBatchDateRange = (batch) => {
    const startDate = new Date(batch.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const endDate = new Date(batch.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    return `${startDate} - ${endDate}`;
};

// Get batch display name (custom name or fallback to "Batch {number}")
export const getBatchDisplayName = (batch) => {
    if (batch.batchName && batch.batchName.trim()) {
        return batch.batchName;
    }
    return `Batch ${batch.batchNumber}`;
};

// Get short batch display name for compact spaces
export const getBatchShortName = (batch) => {
    if (batch.batchName && batch.batchName.trim()) {
        // If custom name is long, show first few words + batch number
        const words = batch.batchName.split(' ');
        if (batch.batchName.length > 20) {
            return `${words.slice(0, 2).join(' ')} (${batch.batchNumber})`;
        }
        return batch.batchName;
    }
    return `Batch ${batch.batchNumber}`;
};

// Get batch identifier for URLs and technical use
export const getBatchIdentifier = (batch) => {
    return `batch${batch.batchNumber}`;
};
