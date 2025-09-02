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
        price: 299,
        originalPrice: 899,
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
                startDate: "2025-10-1",
                endDate: "2026-01-15",
                status: "upcoming", // upcoming, active, completed
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
                startDate: "2026-02-1",
                endDate: "2026-05-15",
                status: "upcoming",
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
            "Master the fundamentals of machine learning — from training simple models to hyperparameter tuning and optimization — through clear, step-by-step coding exercises.",
            "Deepen your knowledge of deep learning by building and experimenting with neural networks, CNNs, RNNs, and transformers.",
            "Gain expertise in Large Language Models (LLMs) — understand how they are trained, fine-tuned, and applied in real-world scenarios.",
            "Learn by doing with hands-on coding assignments and exciting projects that bring AI concepts to life."
        ],
        downloadUrl: "/data/sample-course-info.pdf"
    },

    {
        id: "AdvAI",
        title: "Advanced Artificial Intelligence",
        description: "This advanced course dives deep into cutting-edge AI research and applications, covering reinforcement learning, advanced deep learning architectures, AI safety, and emerging technologies that are shaping the future of artificial intelligence.",
        level: "Advanced",
        duration: "12 weeks",
        lessons: 20,
        maxCapacity: 20,
        nextBatchDate: "2026-02-1",
        price: 499,
        originalPrice: 1299,
        icon: "🚀",
        image: "/data/AdvAI/AdvAI_thumbnail.png",
        category: "Artificial Intelligence",
        instructor: "TBD",
        instructorBio: "Course will be taught by industry experts and researchers with extensive experience in advanced AI systems.",
        // Batch information
        currentBatch: 1,
        batches: [
            {
                batchNumber: 1,
                startDate: "2026-02-1",
                endDate: "2026-04-30",
                status: "upcoming",
                maxCapacity: 20,
                enrollmentCount: 0,
                classLinks: {
                    zoom: "https://zoom.us/j/batch1-advai",
                    discord: "https://discord.gg/batch1-advai",
                    materials: "/batch1/materials"
                }
            }
        ],
        curriculum: [
            {
                section: "Reinforcement Learning",
                topics: [
                    "Markov Decision Processes (MDPs)",
                    "Q-Learning and Deep Q-Networks (DQN)",
                    "Policy Gradient Methods",
                    "Actor-Critic Algorithms",
                    "Multi-Agent Reinforcement Learning",
                    "Hierarchical Reinforcement Learning"
                ]
            },
            {
                section: "Advanced Deep Learning Architectures",
                topics: [
                    "Graph Neural Networks (GNNs)",
                    "Attention Mechanisms and Vision Transformers",
                    "Generative Adversarial Networks (GANs)",
                    "Variational Autoencoders (VAEs)",
                    "Diffusion Models",
                    "Neural Architecture Search (NAS)"
                ]
            },
            {
                section: "Advanced NLP and Language Models",
                topics: [
                    "Advanced Transformer Architectures",
                    "Multimodal Language Models",
                    "In-Context Learning and Few-Shot Learning",
                    "Constitutional AI and RLHF",
                    "Tool-Using Language Models",
                    "Reasoning and Chain-of-Thought"
                ]
            },
            {
                section: "Computer Vision and Multimodal AI",
                topics: [
                    "Object Detection and Segmentation",
                    "3D Computer Vision",
                    "Neural Radiance Fields (NeRF)",
                    "Vision-Language Models",
                    "Video Understanding",
                    "Medical Image Analysis"
                ]
            },
            {
                section: "AI Safety and Alignment",
                topics: [
                    "AI Safety Fundamentals",
                    "Interpretability and Explainable AI",
                    "Robustness and Adversarial Examples",
                    "AI Alignment Techniques",
                    "Value Learning and Preference Modeling",
                    "AI Governance and Ethics"
                ]
            },
            {
                section: "Emerging AI Technologies",
                topics: [
                    "Neuromorphic Computing",
                    "Quantum Machine Learning",
                    "AI for Scientific Discovery",
                    "Federated Learning",
                    "Edge AI and Model Compression",
                    "AI Systems Engineering"
                ]
            }
        ],
        prerequisites: [
            "Completion of Foundations to Frontiers of AI or equivalent",
            "Strong programming skills in Python",
            "Solid understanding of linear algebra and calculus",
            "Experience with deep learning frameworks (PyTorch/TensorFlow)",
            "Familiarity with machine learning concepts and neural networks"
        ],
        outcomes: [
            "Master advanced reinforcement learning algorithms and apply them to complex decision-making problems.",
            "Design and implement state-of-the-art deep learning architectures for various domains including vision, NLP, and multimodal tasks.",
            "Understand and apply AI safety principles to build robust and aligned AI systems.",
            "Explore cutting-edge research areas and emerging technologies in artificial intelligence.",
            "Develop expertise in advanced topics like GANs, diffusion models, and neural architecture search.",
            "Build real-world applications using advanced AI techniques and contribute to open-source AI projects."
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
