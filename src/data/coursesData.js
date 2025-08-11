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
        title: "Foundations to Frontiers of Artificial Intelligence",
        description: "This beginner-friendly course takes you from the mathematical foundations of AI to hands-on implementation of modern machine learning and generative AI models.",
        level: "Beginner level",
        duration: "14 weeks",
        lessons: 25,
        students: 8,
        maxCapacity: 30,
        nextBatchDate: "2025-10-1",
        rating: 5,
        price: 299,
        originalPrice: 899,
        icon: "🤖",
        image: "/data/FAAI/FAAI_thumbnail.png",
        category: "Artificial Intelligence",
        instructor: "NA",
        instructorBio: "NA",
        curriculum: [
            { week: 1, title: "Introduction to Machine Learning; Math Concepts; Python Basics", lessons: 2 },
            { week: 2, title: "Linear Regression – Theory & Implementation", lessons: 2 },
            { week: 3, title: "Overfitting, Regularization, Model Selection", lessons: 3 },
            { week: 4, title: "Logistic Regression & Classification Theory", lessons: 3 },
            { week: 5, title: "Mini-Project: Regression & Classification", lessons: 2 },
            { week: 6, title: "Neural Networks, MLPs, MNIST Lab", lessons: 3 },
            { week: 7, title: "CNNs – Concepts, Architectures, Labs", lessons: 3 },
            { week: 8, title: "Applications: Transfer Learning, Autoencoders, Segmentation", lessons: 3 },
            { week: 9, title: "Final Project Development", lessons: 2 },
            { week: 10, title: "Final Presentations and Review", lessons: 1 }
        ],
        prerequisites: ["High school mathematics", "Basic programming knowledge"],
        outcomes: [
            "Understand core AI and ML principles",
            "Implement supervised and unsupervised models",
            "Evaluate model performance and avoid overfitting",
            "Apply ML to real-world datasets and tasks"
        ],
        downloadUrl: "/data/sample-course-info.pdf"
    },

    {
        id: "AdvAI",
        title: "Advanced Artificial Intelligence",
        description: "This course offers a deep dive into advanced AI concepts such as reinforcement learning, and other cutting-edge research topics. Perfect for experienced practitioners.",
        level: "Advanced",
        duration: "Coming Soon",
        lessons: "TBD",
        students: 1,
        maxCapacity: 1,
        nextBatchDate: null,
        rating: "N/A",
        price: "TBD",
        originalPrice: null,
        icon: "🚀",
        image: "/data/AdvAI/AdvAI_thumbnail.png",
        category: "Artificial Intelligence",
        instructor: "TBD",
        instructorBio: "Course curriculum and instructor details are being finalized. Stay tuned for updates!",
        curriculum: [],
        prerequisites: [
            "Details will be available soon"
        ],
        outcomes: [
            "Course learning outcomes will be published once the curriculum is finalized"
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
export const isCourseNearlyFull = (course) => {
    if (!course.students || !course.maxCapacity) return false;
    return (course.students / course.maxCapacity) >= 0.8;
};

// Helper function to check if a course is full
export const isCourseFull = (course) => {
    if (!course.students || !course.maxCapacity) return false;
    return course.students >= course.maxCapacity;
};

// Helper function to check if a course is coming soon
export const isComingSoon = (course) => {
    return course.comingSoon === true;
};

// Helper function to get available seats count
export const getAvailableSeats = (course) => {
    if (!course.students || !course.maxCapacity) return "N/A";
    return course.maxCapacity - course.students;
};
