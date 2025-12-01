// src/components/JobCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="card job-card">
      <h3>{job.title}</h3>
      <p className="company">{job.companyName}</p>
      <p className="location">{job.location}</p>
      <p className="type">{job.jobType}</p>
      <p className="summary">
        {job.description?.slice(0, 120)}
        {job.description?.length > 120 && "..."}
      </p>
      <Link to={`/jobs/${job.jobId}`} className="btn btn-small">
        View Details
      </Link>
    </div>
  );
};
export default JobCard;