/ src/pages/JobsPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const JobsPage = ({ user }) => {
  // Right now just a mock list
  const mockJobs = [
    { id: 1, title: "Java Developer", companyId: 101, company: "TechNova" },
    { id: 2, title: "React Engineer", companyId: 102, company: "WebWorks" },
  ];

  const isPremium = user && user.subscriptionType === "PREMIUM";

  return (
    <div className="jobs-page">
      <h2>Jobs</h2>
      <div className="job-list">
        {mockJobs.map((job) => (
          <div key={job.id} className="job-card glass">
            <h3>{job.title}</h3>
            <p>
              Company:{" "}
              <Link to={`/companies/${job.companyId}`}>{job.company}</Link>
            </p>

            {isPremium ? (
              <p className="skill-label">
                Skill match: <strong>82%</strong> (demo)
              </p>
            ) : (
              <p className="upgrade-hint">
                Upgrade to Premium to see your skill match and job recommendations.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsPage;