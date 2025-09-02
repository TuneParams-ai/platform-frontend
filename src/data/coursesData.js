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
