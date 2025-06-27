// Shared course data for the application
// In a real application, this would come from an API

export const coursesData = [
    {
        id: "ml-fundamentals",
        title: "Machine Learning Fundamentals",
        description: "Learn the core concepts of machine learning, from basic algorithms to practical implementations. Perfect for beginners starting their ML journey.",
        level: "Beginner",
        duration: "8 weeks",
        lessons: 18,
        students: 12,
        maxCapacity: 40,
        nextBatchDate: "2025-07-15",
        rating: 4.8,
        price: 99,
        originalPrice: 149,
        icon: "🤖",
        category: "Machine Learning",
        instructor: "Dr. AKV",
        instructorBio: "AI researcher with 10+ years experience in machine learning and data science.",
        curriculum: [
            { week: 1, title: "Introduction to Machine Learning", lessons: 1 },
            { week: 2, title: "Data Preprocessing", lessons: 2 },
            { week: 3, title: "Supervised Learning", lessons: 3 },
            { week: 4, title: "Unsupervised Learning", lessons: 4 },
            { week: 5, title: "Model Evaluation", lessons: 2 },
            { week: 6, title: "Feature Engineering", lessons: 2 },
            { week: 7, title: "Advanced Algorithms", lessons: 3 },
            { week: 8, title: "Real-world Projects", lessons: 1 }
        ],
        prerequisites: ["Basic Python knowledge", "High school mathematics"],
        outcomes: [
            "Understand machine learning fundamentals",
            "Implement common ML algorithms",
            "Evaluate model performance",
            "Work with real datasets"
        ],
        downloadUrl: "/data/sample-course-info.pdf"
    },
    {
        id: "ml-advanced",
        title: "Advanced Machine Learning",
        description: "Deep dive into advanced ML concepts including ensemble methods, deep reinforcement learning, and cutting-edge research topics. Perfect for experienced practitioners.",
        level: "Advanced",
        duration: "10 weeks",
        lessons: 30,
        students: 15,
        maxCapacity: 25,
        nextBatchDate: "2025-08-20",
        rating: 4.9,
        price: 179,
        originalPrice: 249,
        icon: "🚀",
        category: "Machine Learning",
        instructor: "Dr. Sarah Rodriguez",
        instructorBio: "Former Google AI researcher with 15+ years in advanced ML and published papers in top-tier conferences.",
        curriculum: [
            { week: 1, title: "Advanced Feature Engineering", lessons: 3 },
            { week: 2, title: "Ensemble Methods & Boosting", lessons: 3 },
            { week: 3, title: "Advanced Optimization", lessons: 3 },
            { week: 4, title: "Reinforcement Learning", lessons: 3 },
            { week: 5, title: "AutoML & Neural Architecture Search", lessons: 3 },
            { week: 6, title: "Explainable AI", lessons: 3 },
            { week: 7, title: "Advanced Time Series", lessons: 3 },
            { week: 8, title: "Graph Neural Networks", lessons: 3 },
            { week: 9, title: "Meta-Learning", lessons: 3 },
            { week: 10, title: "Research & Capstone Project", lessons: 3 }
        ],
        prerequisites: [
            "Solid understanding of basic ML algorithms",
            "Experience with Python and scikit-learn",
            "Linear algebra and calculus background",
            "Previous ML project experience"
        ],
        outcomes: [
            "Master advanced ensemble techniques and boosting algorithms",
            "Implement reinforcement learning solutions",
            "Build explainable AI systems",
            "Design and optimize neural architectures",
            "Apply meta-learning and transfer learning",
            "Conduct ML research and publish findings"
        ],
        downloadUrl: "/data/sample-course-info.pdf"
    },
    {
        id: "dl-neural-networks",
        title: "Deep Learning with Neural Networks",
        description: "Master deep learning concepts and build neural networks from scratch. Covers CNNs, RNNs, and modern architectures like Transformers.",
        level: "Advanced",
        duration: "12 weeks",
        lessons: 36,
        students: 25,
        maxCapacity: 25,
        nextBatchDate: "2025-08-01",
        rating: 4.9,
        price: 149,
        originalPrice: 199,
        icon: "🧠",
        category: "Deep Learning",
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing instructor, curriculum, prerequisites, outcomes - will show N/A
    },
    {
        id: "python-data-science",
        title: "Python for Data Science",
        description: "Complete Python programming course focused on data science applications. Learn pandas, numpy, matplotlib, and more essential libraries.",
        level: "Beginner",
        duration: "6 weeks",
        lessons: 18,
        students: 35,
        maxCapacity: 50,
        nextBatchDate: "2025-07-22",
        rating: 4.7,
        price: 79,
        originalPrice: 119,
        icon: "🐍",
        category: "Programming",
        instructor: "Prof. Mike Chen",
        prerequisites: ["Basic programming concepts"],
        outcomes: [
            "Master Python fundamentals",
            "Work with data using pandas and numpy",
            "Create visualizations with matplotlib"
        ],
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing instructorBio, curriculum - will show N/A
    },
    {
        id: "nlp-101",
        title: "Natural Language Processing",
        description: "Dive into NLP techniques, from text preprocessing to building chatbots and language models. Includes hands-on projects with real datasets.",
        level: "Intermediate",
        duration: "10 weeks",
        lessons: 30,
        students: 18,
        maxCapacity: 30,
        nextBatchDate: "2025-08-05",
        rating: 4.6,
        price: 129,
        originalPrice: 179,
        icon: "💬",
        category: "NLP",
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing most details - will show N/A
    },
    {
        id: "cv-essentials",
        title: "Computer Vision Essentials",
        description: "Learn computer vision fundamentals, image processing, object detection, and facial recognition using OpenCV and modern deep learning frameworks.",
        level: "Intermediate",
        duration: "9 weeks",
        lessons: 27,
        students: 18,
        maxCapacity: 20,
        nextBatchDate: "2025-07-28",
        rating: 4.8,
        price: 119,
        originalPrice: 159,
        icon: "👁️",
        category: "Computer Vision",
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing most details - will show N/A
    },
    {
        id: "data-viz-mastery",
        title: "Data Visualization Mastery",
        description: "Create stunning, interactive data visualizations using Python libraries like Matplotlib, Seaborn, Plotly, and D3.js. Make your data tell a story.",
        level: "Beginner",
        duration: "5 weeks",
        lessons: 15,
        students: 40,
        maxCapacity: 60,
        nextBatchDate: "2025-07-10",
        rating: 4.5,
        price: 69,
        originalPrice: 99,
        icon: "📊",
        category: "Data Science",
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing most details - will show N/A
    },
    {
        id: "mlops-deployment",
        title: "MLOps and Model Deployment",
        description: "Learn to deploy machine learning models in production environments. Covers Docker, Kubernetes, model monitoring, and CI/CD for ML.",
        level: "Advanced",
        duration: "8 weeks",
        lessons: 24,
        students: 8,
        maxCapacity: 15,
        nextBatchDate: "2025-08-12",
        rating: 4.7,
        price: 139,
        originalPrice: 189,
        icon: "🚀",
        category: "MLOps",
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing most details - will show N/A
    },
    {
        id: "stats4ml",
        title: "Statistics for Machine Learning",
        description: "Build a strong statistical foundation for machine learning. Covers probability, hypothesis testing, and statistical modeling techniques.",
        level: "Beginner",
        duration: "7 weeks",
        lessons: 21,
        students: 28,
        maxCapacity: 45,
        nextBatchDate: "2025-07-18",
        rating: 4.6,
        price: 89,
        originalPrice: 129,
        icon: "📈",
        category: "Statistics",
        downloadUrl: "/data/sample-course-info.pdf"
        // Note: Missing most details - will show N/A
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
export const isCourseNearlyFull = (course) => {
    if (!course.students || !course.maxCapacity) return false;
    return (course.students / course.maxCapacity) >= 0.8;
};

// Helper function to check if a course is full
export const isCourseFull = (course) => {
    if (!course.students || !course.maxCapacity) return false;
    return course.students >= course.maxCapacity;
};

// Helper function to get available seats count
export const getAvailableSeats = (course) => {
    if (!course.students || !course.maxCapacity) return "N/A";
    return course.maxCapacity - course.students;
};
