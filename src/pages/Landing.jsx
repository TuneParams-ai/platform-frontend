import React from "react";
import styles from "./../styles/landing.module.css";

const Landing = () => {
  return (
    <div className={styles.landingContainer}>
      <img src="/logo192.png" alt="Logo" className={styles.logo} />
      <h1 className={styles.heading}>ML From Scratch</h1>
      <p className={styles.subheading}>
        A complete machine learning course covering everything you need to build intelligent systems.
      </p>
      <button className={styles.ctaButton}>Enroll Now</button>
      <div className={styles.features}>
        <div className={styles.featureItem}>🚀 Beginner to Pro</div>
        <div className={styles.featureItem}>📚 Multiple Lessons</div>
        <div className={styles.featureItem}>✅ Practical Challenges</div>
        <div className={styles.featureItem}>🏆 Certificates </div>
      </div>
    </div>
  );
};

export default Landing;