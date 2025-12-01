// src/pages/JobListPage.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosClient.get("/api/jobs");
        console.log("Jobs response: " , res.data);
        const wrapper = res.data;
        const jobArray = wrapper?.data || [];
        setJobs(jobArray);
      } catch (err) {
        console.error("Job fetch error, using sample data", err);
        setJobs([
          { id: 1, title: "Frontend Developer", company: "TechLabs", city: "Remote" },
          { id: 2, title: "Embedded Engineer", company: "InnovateX", city: "Bangalore" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>Browse Jobs</h1>
        <p className="subtitle">
          Smart recommendations powered by your profile (once completed 😉).
        </p>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="card-grid">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="job-card card-hover"
            >
              <h3>{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-location">{job.city}</p>
              <span className="chip">View details</span>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default JobListPage;