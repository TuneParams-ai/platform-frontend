// Shared course data for the application

export const coursesData = [
    {
        id: "FAAI",
        title: "Foundations to Frontiers of AI",
        description: "This beginner-friendly course takes you from the mathematical foundations of AI to hands-on implementation of modern machine learning and generative AI models.",
        level: "Beginner level",
        duration: "Approximately 15 weeks",
        lessons: 25,
        maxCapacity: 30,
        nextBatchDate: "2025-10-18",
        price: 899,
        originalPrice: 1199,
        icon: "🤖",
        image: "/data/FAAI/FAAI_thumbnail.png",
        category: "Artificial Intelligence",
        instructor: "NA",
        instructorBio: "NA",
        // Weekly Schedule Information
        weeklySchedule: [
            {
                day: "Thursday",
                time: "5:30 - 6:30 PM ET",
                duration: "1 hour",
                type: "Optional TA Session",
                note: "Scheduled with 1 week prior notice based on requirement/availability"
            },
            {
                day: "Saturday",
                time: "9:30 AM - 12:00 PM ET",
                duration: "2.5 hours (with 15 min break)",
                type: "Live Session"
            },
            {
                day: "Sunday",
                time: "9:30 AM - 12:00 PM ET",
                duration: "2.5 hours (with 15 min break)",
                type: "Live Session"
            }
        ],
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
                    discord: "https://discord.gg/batch1-faai"
                },
                schedule: [],
                videos: [
                    // Simple YouTube Video Example
                    // {
                    //     title: "Week 1 - Introduction to Machine Learning",
                    //     youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
                    //     thumbnail: null // Auto-fetched from YouTube
                    // }
                ]
            },
            {
                batchNumber: 2,
                batchName: "Beta",
                startDate: "2025-10-25",
                endDate: "2026-01-15",
                status: "active",
                maxCapacity: 30,
                enrollmentCount: 0,
                classLinks: {
                    zoom: "https://zoom.us/j/batch2-faai",
                    discord: "https://discord.gg/batch2-faai"
                },
                schedule: [],
                videos: [
                    {
                        title: "Week 1 - Introduction to AI & ML Foundations",
                        youtubeUrl: "https://www.youtube.com/watch?v=qYNweeDHiyU&t=71s",
                        thumbnail: null
                    }
                ]
            }
        ],
        curriculum: [
            {
                section: "Foundation",
                description: "Build essential mathematical and programming foundations needed for AI development",
                topics: [
                    {
                        title: "Introduction to Machine Learning",
                        description: "Understand core ML concepts, types of learning (supervised, unsupervised, reinforcement), and real-world applications across industries.",
                        keyPoints: ["ML fundamentals", "Problem types", "Industry applications"]
                    },
                    {
                        title: "Vectors and Matrices for ML",
                        description: "Master linear algebra concepts essential for understanding ML algorithms, including vector operations, matrix multiplication, and eigenvalues.",
                        keyPoints: ["Vector operations", "Matrix algebra", "Eigenvalues & eigenvectors"]
                    },
                    {
                        title: "Basic Python for Machine Learning",
                        description: "Learn Python programming fundamentals with focus on NumPy, Pandas, and data manipulation techniques for ML workflows.",
                        keyPoints: ["NumPy basics", "Pandas for data", "ML libraries setup"]
                    }
                ]
            },
            {
                section: "Neural Networks",
                description: "Deep dive into neural network architectures from linear models to multi-layer perceptrons",
                topics: [
                    {
                        title: "Linear Regression",
                        description: "Understand the foundation of predictive modeling with linear regression, cost functions, and gradient descent optimization.",
                        keyPoints: ["Cost functions", "Gradient descent", "Model evaluation"]
                    },
                    {
                        title: "Closed-Form Solution for Linear Regression",
                        description: "Learn mathematical derivation of normal equation and compare analytical vs iterative solutions for linear regression.",
                        keyPoints: ["Normal equation", "Matrix calculus", "Computational complexity"]
                    },
                    {
                        title: "Polynomial Regression",
                        description: "Extend linear models to capture non-linear relationships using polynomial features and regularization techniques.",
                        keyPoints: ["Feature engineering", "Overfitting prevention", "Model complexity"]
                    },
                    {
                        title: "Loss Functions",
                        description: "Explore different loss functions for regression and classification, understanding their mathematical properties and use cases.",
                        keyPoints: ["MSE vs MAE", "Cross-entropy", "Custom loss functions"]
                    },
                    {
                        title: "Optimization Methods",
                        description: "Master gradient descent variants including SGD, Adam, and advanced optimization techniques for neural network training.",
                        keyPoints: ["SGD variants", "Adam optimizer", "Learning rate scheduling"]
                    },
                    {
                        title: "Hyperparameter Tuning: Overfitting, Regularization, Model Selection",
                        description: "Learn systematic approaches to prevent overfitting using regularization (L1/L2) and cross-validation for model selection.",
                        keyPoints: ["Cross-validation", "L1/L2 regularization", "Grid search"]
                    },
                    {
                        title: "Logistic Regression & Classification",
                        description: "Transition from regression to classification using logistic regression, sigmoid function, and classification metrics.",
                        keyPoints: ["Sigmoid function", "Classification metrics", "Decision boundaries"]
                    },
                    {
                        title: "Multi layer perceptron (MLP)",
                        description: "Build your first neural network with multiple layers, understanding forward/backward propagation and activation functions.",
                        keyPoints: ["Backpropagation", "Activation functions", "Network architecture"]
                    },
                    {
                        title: "Mini Project: Regression and Classification",
                        description: "Apply learned concepts in a hands-on project implementing both regression and classification models on real datasets.",
                        keyPoints: ["End-to-end pipeline", "Model comparison", "Performance analysis"]
                    }
                ]
            },
            {
                section: "Convolutional Neural Networks",
                description: "Master computer vision with CNNs and learn to build models that can see and understand images",
                topics: [
                    {
                        title: "Convolutional Neural Networks (CNNs)",
                        description: "Understand convolution operations, pooling layers, and CNN architectures for image processing and pattern recognition.",
                        keyPoints: ["Convolution operations", "Pooling layers", "Feature maps"]
                    },
                    {
                        title: "Applications of CNNs",
                        description: "Explore real-world CNN applications including image classification, object detection, and medical image analysis.",
                        keyPoints: ["Image classification", "Object detection", "Medical imaging"]
                    },
                    {
                        title: "Project: Application of CNNs",
                        description: "Build and train a CNN model for image classification using popular datasets and evaluate its performance.",
                        keyPoints: ["Dataset preparation", "Model training", "Performance evaluation"]
                    }
                ]
            },
            {
                section: "Natural Language Processing",
                description: "Dive into language understanding with RNNs, attention mechanisms, and transformer architectures",
                topics: [
                    {
                        title: "Introduction to NLP",
                        description: "Learn text preprocessing, tokenization, and fundamental NLP concepts for machine understanding of language.",
                        keyPoints: ["Text preprocessing", "Tokenization", "Language modeling"]
                    },
                    {
                        title: "Recurrent Neural Networks (RNNs)",
                        description: "Understand sequence modeling with RNNs and LSTMs for processing sequential data like text and time series.",
                        keyPoints: ["Sequence modeling", "LSTM architecture", "Vanishing gradients"]
                    },
                    {
                        title: "Limitations of RNNs",
                        description: "Explore computational and architectural limitations of RNNs that led to the development of attention mechanisms.",
                        keyPoints: ["Sequential bottlenecks", "Long-range dependencies", "Training difficulties"]
                    },
                    {
                        title: "Attention Mechanism",
                        description: "Learn how attention mechanisms solve RNN limitations by allowing models to focus on relevant parts of input sequences.",
                        keyPoints: ["Attention weights", "Context vectors", "Alignment models"]
                    },
                    {
                        title: "Self-Attention",
                        description: "Master self-attention mechanisms that enable parallel processing and better capture of long-range dependencies.",
                        keyPoints: ["Query-key-value", "Multi-head attention", "Positional encoding"]
                    },
                    {
                        title: "Transformer Architecture",
                        description: "Deep dive into the transformer model that revolutionized NLP, understanding encoder-decoder architecture and applications.",
                        keyPoints: ["Encoder-decoder", "Layer normalization", "Feed-forward networks"]
                    }
                ]
            },
            {
                section: "Large Language Models (LLMs)",
                description: "Explore the cutting-edge world of large language models and their training methodologies",
                topics: [
                    {
                        title: "LLM Pre-Training",
                        description: "Understand how large language models are pre-trained on vast text corpora using self-supervised learning techniques.",
                        keyPoints: ["Self-supervised learning", "Scaling laws", "Training dynamics"]
                    },
                    {
                        title: "Continual Pre-Training",
                        description: "Learn techniques for continuing pre-training of existing models on new domains or updated data while preserving knowledge.",
                        keyPoints: ["Domain adaptation", "Catastrophic forgetting", "Knowledge retention"]
                    },
                    {
                        title: "Supervised Fine-Tuning",
                        description: "Master fine-tuning techniques to adapt pre-trained models for specific tasks and domains with labeled data.",
                        keyPoints: ["Task adaptation", "Learning rates", "Evaluation metrics"]
                    },
                    {
                        title: "Alignment of LLMs",
                        description: "Explore techniques like RLHF to align language models with human preferences and improve their safety and helpfulness.",
                        keyPoints: ["RLHF", "Human feedback", "Safety alignment"]
                    },
                    {
                        title: "LLM Inference",
                        description: "Learn optimization techniques for efficient LLM inference including quantization, pruning, and serving strategies.",
                        keyPoints: ["Quantization", "Pruning", "Serving optimization"]
                    },
                    {
                        title: "Introduction to Hugging Face",
                        description: "Get hands-on experience with Hugging Face ecosystem for loading, fine-tuning, and deploying transformer models.",
                        keyPoints: ["Model hub", "Transformers library", "Fine-tuning workflows"]
                    }
                ]
            },
            {
                section: "Advanced Topics",
                description: "Cutting-edge AI topics including distributed computing, prompt engineering, and agentic systems",
                topics: [
                    {
                        title: "Distributed Computing for LLMs",
                        description: "Learn techniques for training and serving large models across multiple GPUs and machines using distributed computing.",
                        keyPoints: ["Model parallelism", "Data parallelism", "Distributed training"]
                    },
                    {
                        title: "Prompt Engineering",
                        description: "Master the art and science of crafting effective prompts to get desired outputs from large language models.",
                        keyPoints: ["Prompt design", "Chain-of-thought", "In-context learning"]
                    },
                    {
                        title: "Retrieval-Augmented Generation (RAG)",
                        description: "Build systems that combine language models with external knowledge retrieval for more accurate and up-to-date responses.",
                        keyPoints: ["Vector databases", "Retrieval systems", "Knowledge integration"]
                    },
                    {
                        title: "Agentic AI",
                        description: "Explore autonomous AI agents that can plan, reason, and take actions to accomplish complex tasks in dynamic environments.",
                        keyPoints: ["Agent architectures", "Planning algorithms", "Tool integration"]
                    }
                ]
            }
        ],
        prerequisites: ["Curious mind", "Basic programming experience (Optional)"],
        outcomes: [
            "Build strong foundations in Artificial Intelligence by combining theory with hands-on coding, so you can confidently move from simple models to advanced architectures.",
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
        // Weekly Schedule Information
        weeklySchedule: [
            {
                day: "Thursday",
                time: "5:30 - 6:30 PM ET",
                duration: "1 hour",
                type: "Live Session"
            },
            {
                day: "Saturday",
                time: "9:30 AM - 12:00 PM ET",
                duration: "2.5 hours (with 15 min break)",
                type: "Live Session"
            },
            {
                day: "Sunday",
                time: "9:30 AM - 12:00 PM ET",
                duration: "2.5 hours (with 15 min break)",
                type: "Live Session"
            }
        ],
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
                    discord: "TBD"
                },
                schedule: [], // Empty schedule for courses not yet scheduled
                videos: []
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
    // Parse dates and format them directly without timezone conversions
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const startDate = formatDate(batch.startDate);
    const endDate = formatDate(batch.endDate);
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

// Schedule-related helper functions

// Check if a batch has any scheduled classes
export const hasSchedule = (batch) => {
    return batch.schedule && batch.schedule.length > 0;
};

// Get live classes for a batch
export const getLiveClasses = (batch) => {
    if (!hasSchedule(batch)) return [];
    return batch.schedule.filter(scheduleItem => scheduleItem.isLive);
};

// Get upcoming classes for a batch (non-live)
export const getUpcomingClasses = (batch) => {
    if (!hasSchedule(batch)) return [];
    return batch.schedule.filter(scheduleItem => !scheduleItem.isLive);
};

// Check if batch has live classes
export const hasLiveClasses = (batch) => {
    return getLiveClasses(batch).length > 0;
};

// Format schedule time for display
export const formatScheduleTime = (scheduleItem) => {
    if (!scheduleItem.time || scheduleItem.time === 'TBD') return 'TBD';

    // Just return the time as provided, times are already in ET format
    return scheduleItem.time;
};

// Get next live class for a batch
export const getNextLiveClass = (batch) => {
    const liveClasses = getLiveClasses(batch);
    return liveClasses.length > 0 ? liveClasses[0] : null;
};

// Check if batch has access links available
export const hasAccessLinks = (batch) => {
    if (!batch.classLinks) return false;

    const { zoom, discord } = batch.classLinks;
    return (zoom && zoom !== 'TBD') ||
        (discord && discord !== 'TBD');
};

// Get available access links for a batch
export const getAvailableAccessLinks = (batch) => {
    if (!batch.classLinks) return {};

    const links = {};
    const { zoom, discord } = batch.classLinks;

    if (zoom && zoom !== 'TBD') links.zoom = zoom;
    if (discord && discord !== 'TBD') links.discord = discord;

    return links;
};

// CommonJS export for Node.js scripts (migration)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { coursesData };
}
