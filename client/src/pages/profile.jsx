import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaArrowLeft,
  FaSave,
  FaSignOutAlt,
  FaEdit,
} from "react-icons/fa";

import "../styles/profile.css";

const API_URL = "http://localhost:5000/api/auth";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");

  // Redirect to login if the user is not authenticated.
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load profile information from MongoDB through the backend.
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.user;

      const userProfile = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      };

      setProfile(userProfile);

      setFormData({
        name: userProfile.name,
        phone: userProfile.phone,
        profileImage: userProfile.profileImage,
      });

      // Keep the cached user information synchronized.
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
        })
      );
    } catch (error) {
      if (error.response?.status === 401 ||
          error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setMessage(
        error.response?.data?.message ||
          "Unable to load your profile. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Enable profile editing.
  const handleEdit = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      profileImage: profile.profileImage,
    });

    setEditing(true);
    setMessage("");
  };

  // Cancel editing and restore the saved profile.
  const handleCancel = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
      profileImage: profile.profileImage,
    });

    setEditing(false);
    setMessage("");
  };

  // Save profile changes.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedImage = formData.profileImage.trim();

    if (!trimmedName) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setMessage("Enter a valid 10-digit phone number.");
      setMessageType("error");
      return;
    }

    if (trimmedImage) {
      try {
        const imageUrl = new URL(trimmedImage);

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid image URL");
        }
      } catch {
        setMessage("Enter a valid HTTP or HTTPS image URL.");
        setMessageType("error");
        return;
      }
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await axios.put(
        `${API_URL}/profile`,
        {
          name: trimmedName,
          phone: trimmedPhone,
          profileImage: trimmedImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      const updatedProfile = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage || "",
      };

      setProfile(updatedProfile);

      setFormData({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        profileImage: updatedProfile.profileImage,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setEditing(false);
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update your profile. Please try again."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // Log out.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* Navigation */}
      <header className="profile-navbar">
        <h2 className="profile-brand">🌍 EnviroAI</h2>

        <div className="profile-nav-actions">
          <button
            type="button"
            className="profile-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="profile-main">

        <div className="profile-heading">
          <h1>My Profile</h1>
          <p>Manage your EnviroAI account information.</p>
        </div>

        <section className="profile-card">

          {/* Profile image */}
          <div className="profile-avatar-section">

            <div className="profile-avatar">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <FaUserCircle />
              )}
            </div>

            <h2>{profile.name || "User"}</h2>
            <p>{profile.email}</p>

            {editing && (
              <p className="profile-image-hint">
                Update your image URL in the form below.
              </p>
            )}
          </div>

          {/* Status message */}
          {message && (
            <div
              className={`profile-message ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {/* Profile form */}
          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >

            <div className="profile-field">
              <label htmlFor="name">
                <FaUserCircle />
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={editing ? formData.name : profile.name}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your full name"
                maxLength={100}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">
                <FaEnvelope />
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                readOnly
              />

              <small>
                Your registered email address cannot be changed here.
              </small>
            </div>

            <div className="profile-field">
              <label htmlFor="phone">
                <FaPhone />
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={editing ? formData.phone : profile.phone}
                onChange={(event) => {
                  const value = event.target.value;

                  if (/^\d{0,10}$/.test(value)) {
                    handleChange(event);
                  }
                }}
                disabled={!editing}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profileImage">
                <FaCamera />
                Profile Image URL
              </label>

              <input
                id="profileImage"
                name="profileImage"
                type="url"
                value={
                  editing
                    ? formData.profileImage
                    : profile.profileImage
                }
                onChange={handleChange}
                disabled={!editing}
                placeholder="https://example.com/profile.jpg"
              />

              <small>
                Optional. Paste a publicly accessible image URL.
              </small>
            </div>

            {/* Actions */}
            <div className="profile-actions">

              {!editing ? (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleEdit}
                >
                  <FaEdit />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={saving}
                  >
                    <FaSave />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              )}

            </div>
          </form>

        </section>
      </main>
    </div>
  );
}

export default Profile;