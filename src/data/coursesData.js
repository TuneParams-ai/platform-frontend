// Shared course data for the application
// In a real application, this would come from an API

export const coursesData = [
    {
        id: "FAAI",
        title: "Foundations to Frontiers of Artificial Intelligence",
        description: "This beginner-friendly course takes you from the mathematical foundations of AI to hands-on implementation of modern machine learning and generative AI models.",
        level: "Beginner",
        duration: "10 weeks",
        lessons: 25,
        students: 7,
        maxCapacity: 30,
        nextBatchDate: "2025-08-1",
        rating: 5,
        price: 1,
        originalPrice: 899,
        icon: "🤖",
        image: "/data/FAAI/FAAI_thumbnail.png",
        category: "Machine Learning",
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
        prerequisites: ["Basic Python knowledge"],
        outcomes: [
            "Understand core AI and ML principles",
            "Implement supervised and unsupervised models",
            "Evaluate model performance and avoid overfitting",
            "Apply ML to real-world datasets and tasks"
        ],
        downloadUrl: "/data/sample-course-info.pdf"
    },
    {
        id: "AdvML",
        title: "Advanced Machine Learning",
        description: "Deep dive into advanced ML concepts including ensemble methods, deep reinforcement learning, and cutting-edge research topics. Perfect for experienced practitioners.",
        level: "Advanced",
        duration: "Coming Soon",
        lessons: "TBD",
        students: 0,
        maxCapacity: 0,
        nextBatchDate: null,
        rating: "N/A",
        price: "TBD",
        originalPrice: null,
        icon: "🚀",
        image: "/data/AdvML/AdvML_thumbnail.png",
        category: "Machine Learning",
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
