// src/pages/JobDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Layout from "../components/Layout";

const JobDetailsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axiosClient.get(`/api/jobs/${id}`);
        setJob(res.data);
      } catch {
        setJob({
          title: "Sample Job",
          company: "Sample Company",
          city: "Remote",
          description: "Job details could not be loaded from backend.",
        });
      }
    };
    fetchJob();
  }, [id]);

  if (!job) return null;

  return (
    <Layout>
      <div className="details-card">
        <h1>{job.title}</h1>
        <p className="job-company">{job.company}</p>
        <p className="job-location">{job.city}</p>
        <p className="job-desc">{job.description}</p>
      </div>
    </Layout>
  );
};

export default JobDetailsPage;