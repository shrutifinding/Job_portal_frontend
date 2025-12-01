// src/pages/ProfilePage.jsx
// Shows + edits profile for both JOB_SEEKER and EMPLOYER
// Uses your controllers:
// - /api/jobseekers/checkuser/{userId}
// - /api/jobseekers/{jobSeekerId} (PUT)
// - /api/jobseekers/{jobSeekerId}/resume (POST, multipart)
// - /api/employers/checkuser/{userId} (if name differs, adjust below)
// - /api/employers/{employerId} (PUT)
// - /api/users/{userId}/profile-image (POST, multipart)

import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const ProfilePage = () => {
  const { user, role } = useAuth(); // from AuthContext
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // job seeker data
  const [jobSeeker, setJobSeeker] = useState(null);
  const [jsSkills, setJsSkills] = useState("");
  const [jsSubscriptionType, setJsSubscriptionType] = useState("FREE");

  // employer data
  const [employer, setEmployer] = useState(null);
  const [emContactEmail, setEmContactEmail] = useState("");
  const [emContactNumber, setEmContactNumber] = useState("");
  const [emSubscriptionType, setEmSubscriptionType] = useState("FREE");

  // upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const authToken =
    localStorage.getItem("token"); // fallback in case AuthContext doesn't store token

  // ----------------- FETCH PROFILE ON LOAD -----------------
  useEffect(() => {
    if (!user || !role) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        if (role === "JOB_SEEKER") {
          // Uses JobSeekerController.checkuser(@PathVariable userId)
          const res = await axiosClient.get(
            `/api/jobseekers/checkuser/${user.userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = res.data.data; // JobSeeker or null
          if (data) {
            setJobSeeker(data);
            setJsSkills(data.skills || "");
            setJsSubscriptionType(data.subscriptionType || "FREE");
          } else {
            // first time: no row in job_seeker yet
            setJobSeeker({
              jobSeekerId: null,
              userId: user.userId,
              skills: "",
              subscriptionType: "FREE",
            });
          }
        } else if (role === "EMPLOYER") {
          // Assumes a similar endpoint to job seeker:
          // @GetMapping("/checkuser/{id}") in EmployerController
          // If your mapping is different, change the URL below.
          const res = await axiosClient.get(
            `/api/employers/checkuser/${user.userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = res.data.data; // Employer or null
          if (data) {
            setEmployer(data);
            setEmContactEmail(data.contactEmail || user.email || "");
            setEmContactNumber(data.contactNumber || "");
            setEmSubscriptionType(data.subscriptionType || "FREE");
          } else {
            setEmployer({
              employerId: null,
              userId: user.userId,
              contactEmail: user.email || "",
              contactNumber: "",
              subscriptionType: "FREE",
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, role, authToken]);

  // ----------------- SUBMIT HANDLERS -----------------

  const handleJobSeekerSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let jsId = jobSeeker?.jobSeekerId;

      // If first time (no jobSeekerId), backend might create by userId or we call create()
      // Here we call PUT on existing id; if your backend expects POST for new,
      // change this block accordingly.
      const payload = {
        ...jobSeeker,
        userId: user.userId,
        skills: jsSkills,
        subscriptionType: jsSubscriptionType || "FREE",
      };

      const putUrl = jsId
        ? `/api/jobseekers/${jsId}`
        : `/api/jobseekers/${user.userId}`; // adjust if you use create(userId)

      const res = await axiosClient.put(putUrl, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const updated = res.data.data;
      setJobSeeker(updated);

      // upload resume if chosen
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);

        const resumeUrl = `/api/jobseekers/${
          updated.jobSeekerId || jsId || user.userId
        }/resume`;

        await axiosClient.post(resumeUrl, formData, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // upload profile image if chosen
      if (profileImageFile) {
        const formData = new FormData();
        formData.append("file", profileImageFile);

        await axiosClient.post(
          `/api/users/${user.userId}/profile-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating job seeker profile", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEmployerSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let empId = employer?.employerId;

      const payload = {
        ...employer,
        userId: user.userId,
        contactEmail: emContactEmail,
        contactNumber: emContactNumber,
        subscriptionType: emSubscriptionType || "FREE",
      };

      const putUrl = empId
        ? `/api/employers/${empId}`
        : `/api/employers/${user.userId}`; // adjust if your create uses userId

      const res = await axiosClient.put(putUrl, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const updated = res.data.data;
      setEmployer(updated);

      // (If you later add employer logo upload, it can go here)

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating employer profile", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------- RENDER HELPERS -----------------

  const renderJobSeekerForm = () => (
    <form className="profile-form" onSubmit={handleJobSeekerSubmit}>
      <h2>Job Seeker Profile</h2>
      <p className="profile-subtitle">
        Complete your profile so employers can know more about you.
      </p>

      <label>
        Full name
        <input type="text" value={user?.name || ""} disabled />
      </label>

      <label>
        Email
        <input type="email" value={user?.email || ""} disabled />
      </label>

      <label>
        Skills (comma separated)
        <input
          type="text"
          value={jsSkills}
          onChange={(e) => setJsSkills(e.target.value)}
          placeholder="Java, Spring, React, SQL"
          required
        />
      </label>

      <label>
        Subscription
        <select
          value={jsSubscriptionType}
          onChange={(e) => setJsSubscriptionType(e.target.value)}
        >
          <option value="FREE">Free</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </label>

      <label>
        Resume file
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files[0])}
        />
        {jobSeeker?.resumeFile && (
          <span className="file-info">Current: {jobSeeker.resumeFile}</span>
        )}
      </label>

      <label>
        Profile photo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImageFile(e.target.files[0])}
        />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );

  const renderEmployerForm = () => (
    <form className="profile-form" onSubmit={handleEmployerSubmit}>
      <h2>Employer Profile</h2>
      <p className="profile-subtitle">
        Add your contact details so candidates can reach you.
      </p>

      <label>
        Full name
        <input type="text" value={user?.name || ""} disabled />
      </label>

      <label>
        Contact Email
        <input
          type="email"
          value={emContactEmail}
          onChange={(e) => setEmContactEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Contact Number
        <input
          type="text"
          value={emContactNumber}
          onChange={(e) => setEmContactNumber(e.target.value)}
          placeholder="+91-9876543210"
          required
        />
      </label>

      <label>
        Subscription
        <select
          value={emSubscriptionType}
          onChange={(e) => setEmSubscriptionType(e.target.value)}
        >
          <option value="FREE">Free</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );

  // ----------------- MAIN RENDER -----------------

  if (!user) {
    return (
      <Layout>
        <div className="profile-wrapper">
          <p>You must be logged in to view this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-wrapper">
        {loading ? (
          <p>Loading profile...</p>
        ) : (
          <>
            {/* left side summary card */}
            <div className="profile-summary">
              <div className="profile-avatar">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <h3>{user.name}</h3>
              <p className="role-badge">{role}</p>
              <p className="email-text">{user.email}</p>
            </div>

            {/* right side form */}
            <div className="profile-form-container">
              {error && <p className="error-text">{error}</p>}
              {success && <p className="success-text">{success}</p>}

              {role === "JOB_SEEKER" && renderJobSeekerForm()}
              {role === "EMPLOYER" && renderEmployerForm()}

              {role !== "JOB_SEEKER" && role !== "EMPLOYER" && (
                <p>No editable profile for this role.</p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
