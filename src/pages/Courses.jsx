import React, { useState } from "react";
import CourseCard from "../components/CourseCard";
import "../styles/courses.css";

const Courses = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Sample course data - this would come from an API in a real app
  const coursesData = [
    {
      id: 1,
      title: "Machine Learning Fundamentals",
      description: "Learn the core concepts of machine learning, from basic algorithms to practical implementations. Perfect for beginners starting their ML journey.",
      level: "Beginner",
      duration: "8 weeks",
      lessons: 24,
      students: 1250,
      rating: 4.8,
      price: 99,
      originalPrice: 149,
      icon: "🤖",
      category: "Machine Learning"
    },
    {
      id: 2,
      title: "Deep Learning with Neural Networks",
      description: "Master deep learning concepts and build neural networks from scratch. Covers CNNs, RNNs, and modern architectures like Transformers.",
      level: "Advanced",
      duration: "12 weeks",
      lessons: 36,
      students: 890,
      rating: 4.9,
      price: 149,
      originalPrice: 199,
      icon: "🧠",
      category: "Deep Learning"
    },
    {
      id: 3,
      title: "Python for Data Science",
      description: "Complete Python programming course focused on data science applications. Learn pandas, numpy, matplotlib, and more essential libraries.",
      level: "Beginner",
      duration: "6 weeks",
      lessons: 18,
      students: 2100,
      rating: 4.7,
      price: 79,
      originalPrice: 119,
      icon: "🐍",
      category: "Programming"
    },
    {
      id: 4,
      title: "Natural Language Processing",
      description: "Dive into NLP techniques, from text preprocessing to building chatbots and language models. Includes hands-on projects with real datasets.",
      level: "Intermediate",
      duration: "10 weeks",
      lessons: 30,
      students: 675,
      rating: 4.6,
      price: 129,
      originalPrice: 179,
      icon: "💬",
      category: "NLP"
    },
    {
      id: 5,
      title: "Computer Vision Essentials",
      description: "Learn computer vision fundamentals, image processing, object detection, and facial recognition using OpenCV and modern deep learning frameworks.",
      level: "Intermediate",
      duration: "9 weeks",
      lessons: 27,
      students: 540,
      rating: 4.8,
      price: 119,
      originalPrice: 159,
      icon: "👁️",
      category: "Computer Vision"
    },
    {
      id: 6,
      title: "Data Visualization Mastery",
      description: "Create stunning, interactive data visualizations using Python libraries like Matplotlib, Seaborn, Plotly, and D3.js. Make your data tell a story.",
      level: "Beginner",
      duration: "5 weeks",
      lessons: 15,
      students: 1320,
      rating: 4.5,
      price: 69,
      originalPrice: 99,
      icon: "📊",
      category: "Data Science"
    },
    {
      id: 7,
      title: "MLOps and Model Deployment",
      description: "Learn to deploy machine learning models in production environments. Covers Docker, Kubernetes, model monitoring, and CI/CD for ML.",
      level: "Advanced",
      duration: "8 weeks",
      lessons: 24,
      students: 425,
      rating: 4.7,
      price: 139,
      originalPrice: 189,
      icon: "🚀",
      category: "MLOps"
    },
    {
      id: 8,
      title: "Statistics for Machine Learning",
      description: "Build a strong statistical foundation for machine learning. Covers probability, hypothesis testing, and statistical modeling techniques.",
      level: "Beginner",
      duration: "7 weeks",
      lessons: 21,
      students: 980,
      rating: 4.6,
      price: 89,
      originalPrice: 129,
      icon: "📈",
      category: "Statistics"
    }
  ];

  const filterCategories = ["All", "Machine Learning", "Deep Learning", "Programming", "NLP", "Computer Vision", "Data Science", "MLOps", "Statistics"];

  const filteredCourses = activeFilter === "All"
    ? coursesData
    : coursesData.filter(course => course.category === activeFilter);

  return (
    <div className="courses-page-container">
      <div className="courses-header">
        <h1 className="courses-title">Available Courses</h1>
        <p className="courses-subtitle">
          Discover our comprehensive collection of machine learning and data science courses designed to take you from beginner to expert.
        </p>
      </div>

      <div className="courses-filters">
        {filterCategories.map(category => (
          <button
            key={category}
            className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;